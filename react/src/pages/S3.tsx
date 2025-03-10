import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/S3.css';
import { FaClipboard, FaDownload, FaTrash } from 'react-icons/fa';

const S3FileManager = () => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [filesList, setFilesList] = useState<string[]>([]);
  const [userPrefix, setUserPrefix] = useState('');
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedPrefix = localStorage.getItem("User_Prefix");

    if (storedAuth === "true" && storedPrefix) {
      setIsAuthenticated(true);
      setUserPrefix(storedPrefix);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
  
    try {
      const response = await axios.post('/api/authenticate_user', { User_ID: userID, password });
  
      if (response.data['status'] === 200) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("User_ID", userID);
        localStorage.setItem("User_Prefix", response.data.User_Prefix);
        
        setUserID(userID);
        setUserPrefix(response.data.User_Prefix);
        setIsAuthenticated(true);
        setMessage('Login successful');
      } else {
        setMessage('Invalid User ID or password');
      }
    } catch (error) {
      setMessage('Invalid User ID or password');
    }
  };
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("User_ID");
    localStorage.removeItem("User_Prefix");
    setIsAuthenticated(false);
    setUserID('');
    setUserPrefix('');
    setMessage('Logged out successfully.');
  };
  
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedUserID = localStorage.getItem("User_ID");
    const storedPrefix = localStorage.getItem("User_Prefix");
  
    if (storedAuth === "true" && storedUserID && storedPrefix) {
      setIsAuthenticated(true);
      setUserID(storedUserID);
      setUserPrefix(storedPrefix);
    }
  }, []);
  

  const uploadFileToS3 = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', userPrefix);

    try {
      const response = await axios.post('/api/upload_to_s3', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage(`File uploaded successfully: ${response.data.message}`);
    } catch (error) {
      setMessage('Error uploading file: ' + error.message);
    }
  };

  const listS3Files = async () => {
    try {
      const userPrefix = localStorage.getItem("User_Prefix");
      const response = await axios.get(`/api/list_s3_files?prefix=${userPrefix}`);
      setFilesList(response.data.files);
      setMessage('Files fetched successfully.');
    } catch (error) {
      setMessage('Error fetching files: ' + error.message);
    }
  };  

  const downloadFileFromS3 = async (fileName: string) => {
    try {
      const response = await axios.get(`/api/download_from_s3?filename=${fileName}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      setMessage(`File downloaded successfully: ${fileName}`);
    } catch (error) {
      setMessage('Error downloading file: ' + error.message);
    }
  };

  const deleteFileFromS3 = async (fileName: string) => {
    const confirmed = window.confirm(`Are you sure you want to delete the file: ${fileName}?`);
    if (confirmed) {
      try {
        await axios.delete(`/api/delete_from_s3?filename=${fileName}`);
        setDeletedFiles((prev) => [...prev, fileName]);
        setMessage(`File deleted successfully: ${fileName}`);
      } catch (error) {
        setMessage('Error deleting file: ' + error.message);
      }
    }
  };

  const copyToClipboard = (fileName: string) => {
    navigator.clipboard.writeText(fileName)
      .then(() => setMessage(`File name "${fileName}" copied to clipboard!`))
      .catch((error) => setMessage('Error copying to clipboard: ' + error.message));
  };

  return (
    <div className="s3-file-manager">
      {!isAuthenticated ? (
        <div className="login-container">
          <h2 className='Sign-In'>Sign In</h2>
          <form onSubmit={handleLogin}>
            <label>
              User ID:
              <input className="login-input" type="text" value={userID} onChange={(e) => setUserID(e.target.value)} required />
            </label>
            <label>
              Password:
              <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button className="action-button" type="submit">Login</button>
          </form>
          {message && <p className="error-message">{message}</p>}
        </div>
      ) : (
        <>
          <div>
            <h1 className="header">S3 File Manager</h1>
            <div className='sign-out-div'>
                <h3 className="header">Signed in as: {userID}</h3>
                <button className="logout-button" onClick={handleLogout}>Sign Out</button>
            </div>
            </div>


          {/* Message */}
          {message}

          {/* Upload File */}
          <div>
            <h2>Upload File</h2>
            <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            <button className="action-button" onClick={uploadFileToS3}>Upload</button>
          </div>

          {/* List Files */}
          <div>
            <h2 className="list-header">List Files in S3</h2>
            <button className="action-button" onClick={listS3Files}>List Files</button>
            <ul>
              {filesList.length > 0 ? (
                filesList.map((file, index) => (
                  <li key={index} className={`file-item ${deletedFiles.includes(file) ? 'deleted' : ''}`}>
                    <span className="file-name">{file}</span>

                    {/* Disable actions for deleted files */}
                    <button className="icon-button" onClick={() => copyToClipboard(file)} disabled={deletedFiles.includes(file)}>
                      <FaClipboard />
                    </button>
                    <button className="icon-button" onClick={() => downloadFileFromS3(file)} disabled={deletedFiles.includes(file)}>
                      <FaDownload />
                    </button>
                    <button className="icon-button" onClick={() => deleteFileFromS3(file)} disabled={deletedFiles.includes(file)}>
                      <FaTrash />
                    </button>
                  </li>
                ))
              ) : (
                <li>No files found. List files or add new files</li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default S3FileManager;
