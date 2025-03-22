import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AWS-S3.css';
import { FaClipboard, FaDownload, FaTrash } from 'react-icons/fa';
import AuthForm from '../components/AuthForm.tsx';

const S3FileManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [filesList, setFilesList] = useState<{ displayName: string, rawFileName: string }[]>([]);
  const [userPrefix, setUserPrefix] = useState('');
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  const [userID, setUserID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const handleFolderUpload = () => {
    uploadFileToS3('False');
  };

  const handlePrefixUpload = () => {
    uploadFileToS3('False');
  };

  const handleGlobalUpload = () => {
    uploadFileToS3('True');
  };

  const uploadFileToS3 = async (globalFlag: string) => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', userPrefix);
    formData.append('global', globalFlag);
    console.log("Uploading file to S3 Bucket. Is global upload: ", globalFlag);

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
    setIsLoading(true);
    setProgress(0);
    try {
      const global_list: { displayName: string, rawFileName: string }[] = [];
      const fileList: { displayName: string, rawFileName: string }[] = [];
      const response = await axios.get(`/api/list_s3_files?prefix=${userPrefix}`);

      const totalFiles = response.data.files.length;
      let filesProcessed = 0;

      for (let file of response.data.files) {
        let file_names = file.split('/');
        let actualFileName = file_names[file_names.length - 1];
        let displayName = actualFileName;

        if (actualFileName !== "") {
          if (file_names[2] == 'global') {
            let globalFile = "(Global) " + file_names.slice(3).join("/");
            global_list.push({ displayName: globalFile, rawFileName: file });
          } else {
            displayName = file_names.slice(3).join("/");
            fileList.push({ displayName, rawFileName: file });
          }
        }

        filesProcessed += 1;
        setProgress(Math.floor((filesProcessed / totalFiles) * 100));
      }

      for (let global_file of global_list) {
        fileList.push(global_file);
      }

      setFilesList(fileList);
      setMessage('Files fetched successfully.');
    } catch (error) {
      setMessage('Error fetching files: ' + error.message);
    } finally {
      setIsLoading(false);
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
    const fileToDelete = filesList.find(file => file.rawFileName === fileName);
    
    if (!fileToDelete) {
      setMessage("File not found for deletion.");
      return;
    }
    
    const confirmed = window.confirm(`Are you sure you want to delete the file: ${fileToDelete.rawFileName}?`);
    if (confirmed) {
      try {
        await axios.delete(`/api/delete_from_s3?filename=${fileToDelete.rawFileName}`);
        setDeletedFiles((prev) => [...prev, fileToDelete.rawFileName]);
        setMessage(`File deleted successfully: ${fileToDelete.rawFileName}`);
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

  const generateLoadingBar = (percentage: number) => {
    const totalBars = 100;
    const filledBars = Math.floor((percentage / 100) * totalBars);
    const loadingText = 'Loading |' + '|'.repeat(filledBars) + '.'.repeat(totalBars - filledBars) + '|';
    return loadingText;
  };

  return (
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
                <button className="small-upload" onClick={handleFolderUpload}>Base Dir</button>
                <button className="small-upload" onClick={handleFolderUpload}>Folder1</button>
                <button className="small-upload" onClick={handleFolderUpload}>Folder2</button>
                <button className="global-upload" onClick={handleGlobalUpload}>Global Upload</button>
            </div>
          </div>

          <div>
            <h2 className="list-header">List Files in S3</h2>
            <button className="action-button" onClick={listS3Files}>List Files</button>
            {isLoading ? (
              <p className="loading-text">
                {generateLoadingBar(progress)}
              </p>
            ) : (
              <ul>
                {filesList.length > 0 ? (
                  filesList.map((file, index) => (
                    <li key={index} className={`file-item ${deletedFiles.includes(file.rawFileName) ? 'deleted' : ''}`}>
                      <span className="file-name">{file.displayName}</span>
                      <button className="icon-button" onClick={() => copyToClipboard(file.displayName)} disabled={deletedFiles.includes(file.rawFileName)}>
                        <FaClipboard />
                      </button>
                      <button className="icon-button" onClick={() => downloadFileFromS3(file.rawFileName)} disabled={deletedFiles.includes(file.rawFileName)}>
                        <FaDownload />
                      </button>
                      <button className="icon-button" onClick={() => deleteFileFromS3(file.rawFileName)} disabled={deletedFiles.includes(file.rawFileName)}>
                        <FaTrash />
                      </button>
                    </li>
                  ))
                ) : (
                  <li>No files found. List files or add new files</li>
                )}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default S3FileManager;
