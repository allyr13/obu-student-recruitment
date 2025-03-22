import React, { useRef, useState, useEffect } from 'react';
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
  const [folderList, setFolderList] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState<string>("");
  
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

  const handleFolderSelect = (e) => {
    const folder = e.target.value;
    setSelectedFolder(folder)
    setMessage(`folder selected ${folder}`)
  }

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
        console.log(file_names)
        let actualFileName = file_names[file_names.length - 1];
        let displayName = actualFileName;

        if (actualFileName !== "") {
          if (file_names[2] == 'global') {
            let globalFile = "(Global) " + file_names.slice(3).join("/");
            global_list.push({ displayName: globalFile, rawFileName: file });
          } else {
            displayName = file_names.slice(3).join("/");
            console.log(displayName)
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

  useEffect(() => {
    if (userPrefix) {
      axios.get(`/api/list_s3_files?prefix=${userPrefix}`)
        .then((response) => {
          const files: string[] = response.data.files;
          const folders = Array.from(new Set(
            files
              .map(key => {
                let cleanKey = key;
                if (cleanKey.startsWith("/root/")) {
                  cleanKey = cleanKey.replace("/root/", "");
                }
                const parts = cleanKey.split("/");
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

  const createFolderInS3 = async () => {
    if (!newFolderName.trim()) {
      setMessage("Folder name cannot be empty.");
      return;
    }
    let prefix = userPrefix;
    if (selectedFolder) {
      prefix = `/${selectedFolder}`;
    }
    const folderKey = `${prefix}/${newFolderName}/`;
    console.log("Creating folder with key:", folderKey);
    try {
      const response = await axios.post(
        '/api/create_folder_in_s3',
        { folderKey },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setMessage(`Folder "${newFolderName}" created successfully.`);
      setNewFolderName('');
      // Refresh the folder list after creation.
      axios.get(`/api/list_s3_files?prefix=${userPrefix}`)
        .then((response) => {
          const files: string[] = response.data.files;
          const folders = Array.from(new Set(
            files
              .map(key => {
                let cleanKey = key;
                if (cleanKey.startsWith("/root/")) {
                  cleanKey = cleanKey.replace("/root/", "");
                }
                const parts = cleanKey.split("/");
                return parts.length > 1 ? parts.slice(0, parts.length - 1).join("/") : "";
              })
              .filter(folder => folder !== "")
          ));
          setFolderList(folders);
        })
        .catch((error) => {
          setMessage("Error refreshing folders: " + error.message);
        });
    } catch (error: any) {
      setMessage('Error creating folder: ' + error.message);
    }
  }

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
            <div className="folder-select-container">
            <div className="folder-select">
              <div className="folder-select-form"> 
              <h3 className="header">Choose Target Folder</h3>
                <select
                  id="folderSelect"
                  value={selectedFolder}
                  onChange={handleFolderSelect}
                  size={5}
                  className='folderSelect'
                >
                  {folderList.map((folder) => (
                    <option key={folder} value={folder}>
                      {folder}
                    </option>
                  ))}
                </select>
              </div>

              <div className="folder-select-form" style={{ marginTop: "1rem" }}>
                <h3 className="header">Create New Folder</h3>
                <input
                  type="text"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button className="action-button" onClick={createFolderInS3}>Create Folder</button>
              </div>
              </div>
              </div>
              
              <input
                type="file"
                multiple
                {...({ webkitdirectory: "true" } as any)}
                ref={fileInputRef}
                style={{ display: "none" }}
                onChange={handleFileUpload}
              />
              <button className="action-button" onClick={() => triggerFileSelect("False")}>
                Upload File
              </button>
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
