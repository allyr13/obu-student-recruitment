import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AWS-S3.css';
import { FaClipboard, FaDownload, FaTrash } from 'react-icons/fa';
import AuthForm from '../components/AuthForm.tsx';

const S3FileManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [filesList, setFilesList] = useState<string[]>([]);
  const [userPrefix, setUserPrefix] = useState('');
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  const [userID, setUserID] = useState('');
  const [folderList, setFolderList] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  
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

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileSelect = (globalFlag: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.globalFlag = globalFlag;
      fileInputRef.current.click();
    }
  };
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const globalFlag = e.target.dataset.globalFlag || "False";
      uploadFilesToS3(e.target.files, globalFlag);
    }
  };
  
  const uploadFilesToS3 = async (files: FileList, globalFlag: string) => {
    if (!files || files.length === 0) {
      setMessage("Please select files to upload.");
      return;
    }

    const formData = new FormData();

    //Get folder structure and file
    Array.from(files).forEach((file) => {
      const relativePath = (file as any).webkitRelativePath || file.name;
      formData.append("file", file);
      formData.append(`path_${file.name}`, relativePath);
    });

    let prefix = userPrefix;
    if (selectedFolder) {
      prefix += `/${selectedFolder}`;
    }
    if (selectedFolder == "global") {
      prefix = "/global";
      globalFlag = "True";
    }
    formData.append('prefix', userPrefix);
    formData.append('global', globalFlag);
    console.log("Uploading files to S3 Bucket. Is global upload: ", globalFlag)

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

  useEffect(() => {
    if (userPrefix) {
      axios.get(`/api/list_s3_files?prefix=${userPrefix}`)
        .then((response) => {
          const files: string[] = response.data.files;
          // Extract unique folders from the S3 keys.
          const folders = Array.from(new Set(
            files
              .map(key => {
                let cleanKey = key;
                if (cleanKey.startsWith("/root/")) {
                  cleanKey = cleanKey.replace("/root/", "");
                }
                const parts = cleanKey.split("/");
                // Return folder path if file is within a folder.
                return parts.length > 1 ? parts.slice(0, parts.length - 1).join("/") : "";
              })
              .filter(folder => folder !== "")
          ));
          setFolderList(folders);
          if (folders.length > 0 && !selectedFolder) {
            setSelectedFolder(folders[0]);
          }
        })
        .catch((error) => {
          setMessage("Error fetching folders: " + error.message);
        });
    }
  }, [userPrefix, selectedFolder]);

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
              <div>
                <label htmlFor="folderSelect">Choose target folder:</label>
                <select
                  id="folderSelect"
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                >
                  {folderList.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>
              
              <input
                type="file"
                multiple
                {...({ webkitdirectory: "true" } as any)}
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <button onClick={() => triggerFileSelect("False")}>
                Upload Folder/File
              </button>
              <div>{message}</div>
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