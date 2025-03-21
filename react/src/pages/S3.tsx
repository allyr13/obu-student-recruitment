import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AWS-S3.css';
import { FaClipboard, FaDownload, FaTrash } from 'react-icons/fa';
import AuthForm from '../components/AuthForm.tsx';
import { useNavigate } from 'react-router-dom';

const S3FileManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [filesList, setFilesList] = useState<string[]>([]);
  const [userPrefix, setUserPrefix] = useState('');
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  const [userID, setUserID] = useState('');
  
  useEffect(() => {
    const storedAuth = localStorage.getItem("isAuthenticated");
    const storedPrefix = localStorage.getItem("User_Prefix");
    const storedUserID = localStorage.getItem("User_ID");
    
    if (storedAuth === "true" && storedPrefix && storedUserID) {
      setIsAuthenticated(true);
      setUserPrefix(storedPrefix);
      setUserID(storedUserID);
    }
  }, []);
  
  const handleLoginSuccess = (userID: string, userPrefix: string) => {
    setIsAuthenticated(true);
    setUserID(userID);
    setUserPrefix(userPrefix);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("User_ID");
    localStorage.removeItem("User_Prefix");
    setIsAuthenticated(false);
    setUserID('');
    setUserPrefix('');
  };

  const navigate = useNavigate();

  const handleFolderUpload = () => {
    // TODO: Decide how to specify what folder to upload to
    uploadFileToS3('False');
    };

  const handlePrefixUpload = () => {
    uploadFileToS3('False');
    };

  const handleGlobalUpload = () => {
        uploadFileToS3('True');
    };

  const uploadFormData = () => {
    navigate('/upload-form')
  }
  
  const uploadFileToS3 = async (globalFlag: string) => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', userPrefix);
    formData.append('global', globalFlag);
    console.log("Uploading file to S3 Bucket. Is global upload: ", globalFlag)

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
      const response = await axios.get(`/api/list_s3_files?prefix=${userPrefix}`);
      setFilesList(response.data.files);
      setMessage('Files fetched successfully.');
    } catch (error) {
      setMessage('Error fetching files: ' + error.message);
    }
  };  

  const downloadFileFromS3 = async (fileName: string) => {
    try {
      const response = await axios.get(`/api/download_from_s3?filename=${fileName}`);
      
      if (response.data?.url) {
        const link = document.createElement('a');
        link.href = response.data.url;
        link.setAttribute('download', fileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setMessage(`File downloaded successfully: ${fileName}`);
      } else {
        throw new Error("Failed to get download URL");
      }
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
    <div /* className="old-color-scheme" */>
    <div className="s3-file-manager">
      {!isAuthenticated ? (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <div>
            <h1 className="header">S3 File Manager</h1>
            <div className='sign-out-div'>
                <h3 className="header">Signed in as: {userID}</h3>
                <button className="logout-button" onClick={handleLogout}>Sign Out</button>
            </div>
          </div>

          {message && <p className="message">{message}</p>}

          <div>
            <h2>Upload File</h2>
            <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
            <div className='upload-folder'>
                {/* TODO: These folders should be gotten dynamically depending on what folders exist */}
                <button className="small-upload" onClick={handleFolderUpload}>Base Dir</button>
                <button className="small-upload" onClick={handleFolderUpload}>Folder1</button>
                <button className="small-upload" onClick={handleFolderUpload}>Folder2</button>
                <button className="global-upload" onClick={handleGlobalUpload}>Global Upload</button>
                {/* TODO: Add an option to create and delete folders */}
            </div>
            <div className='upload-div'>
                <button className="action-button" onClick={handlePrefixUpload}>Upload</button>
            </div>
          </div>

          <div>
            <h2>Submit Form Data</h2>
            <div className='upload-div'>
                <button className="action-button" onClick={uploadFormData}>Submit Form Data</button>
            </div>
          </div>

          <div>
            <h2 className="list-header">List Files in S3</h2>
            <button className="action-button" onClick={listS3Files}>List Files</button>
            <ul>
              {filesList.length > 0 ? (
                filesList.map((file, index) => (
                  <li key={index} className={`file-item ${deletedFiles.includes(file) ? 'deleted' : ''}`}>
                    <span className="file-name">{file}</span>
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
    </div>
  );
};

export default S3FileManager;