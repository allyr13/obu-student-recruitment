import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AWS-S3.css';
import { FaClipboard, FaDownload, FaTrash, FaTable } from 'react-icons/fa';
import AuthForm from '../components/AuthForm.tsx';
import DeleteConfirmation from "../components/DeleteConfirmation.tsx";
import { useNavigate } from 'react-router-dom';
import reference_dict from "../validation_reference.json";
import Papa from "papaparse";
import { Tooltip } from 'react-tooltip';


const S3FileManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [csvErrorMessage, setCsvErrorMessage] = useState('');
  const [filesList, setFilesList] = useState<{ displayName: string, rawFileName: string }[]>([]);
  const [userPrefix, setUserPrefix] = useState('');
  const [deletedFiles, setDeletedFiles] = useState<string[]>([]);
  const [userID, setUserID] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [folderList, setFolderList] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>("");
  const [newFolderName, setNewFolderName] = useState<string>("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  
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

  const uploadFormData = () => {
    navigate('/upload-form')
  }

  const triggerFileSelect = (globalFlag: string) => {
    if (fileInputRef.current) {
      fileInputRef.current.dataset.globalFlag = globalFlag;
      fileInputRef.current.click();
    }
  };

  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const globalFlag = e.target.dataset.globalFlag || "False";
      const csvIsValid = await validateCSVContent(e.target.files[0]);
      if (csvIsValid) {
        uploadFilesToS3(e.target.files, globalFlag);
      }
    }
  };

  const validateCSVContent = (file: File): Promise<boolean> => {

    return new Promise((resolve) => {
        Papa.parse(file, {
            header: true, 
            complete: (result) => {
                const { data, errors } = result;

                if (file.type !== "text/csv" && !file.name.endsWith(".csv")) {
                  setCsvErrorMessage("Invalid file type. Please upload a CSV file.");
                  resolve(false);
                  return;
                }

                if (!Array.isArray(data) || data.length === 0) {
                    setCsvErrorMessage("Invalid CSV format.");
                    resolve(false);
                    return;
                }

                const requiredColumns = Object.keys(reference_dict);
                const headers = Object.keys(data[0] || {});

                if (!headers.length) {
                    setCsvErrorMessage("CSV file has no headers.");
                    resolve(false);
                    return;
                }

                const hasRequiredColumns = requiredColumns.every(col => headers.includes(col));

                if (!hasRequiredColumns) {
                    setCsvErrorMessage("CSV file is missing required columns.");
                    resolve(false);
                    return;
                }

                // Validate row values
                for (let idx = 1; idx < data.length - 1; idx++) { 
                  const row = data[idx];
                  for (const [key, value] of Object.entries(row)) {
                      if (reference_dict[key] && !reference_dict[key].includes(value)) {
                          setCsvErrorMessage(`Invalid value "${value}" for column "${key}" on row ${idx + 2} in file ${file.name}.`); // + 2 to offset for headers and 0 index
                          resolve(false);
                          return;
                      }
                  }
                }
                resolve(true);
            }
        });
    });
  };

  
  const uploadFilesToS3 = async (files: FileList, globalFlag: string) => {
    if (!files || files.length === 0) {
      setMessage("Please select files to upload.");
      return;
    }

    console.log(files)

    const formData = new FormData();

    Array.from(files).forEach((file) => {
      const relativePath = (file as any).webkitRelativePath || file.name;
      formData.append("file", file);
      formData.append(`path_${file.name}`, relativePath);
      formData.append(`folder`, selectedFolder);
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

  const showTable = async (fileName: string): Promise<File | null> => {
  try {

    const type = fileName.split('.')[1]
    if (type != "csv") {
      setErrorMessage('Error: File type must be csv');
      return null;
    }
    setErrorMessage('');

    console.log(type);
    const response = await axios.get(`/api/get_file?filename=${fileName}`, {
      responseType: 'json',  
    });

    console.log('File fetched successfully:', response);

    if (!response.data || !response.data.file) {
      console.error('No CSV data returned from the API');
      setMessage('No CSV data returned from the API');
      return null;
    }

    const csvContent = response.data.file;
    console.log('Extracted CSV content:', csvContent); 

    processDataAndSendFile(csvContent);

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const file = new File([blob], fileName, { type: 'text/csv' });

    return file;
  } catch (error) {
    console.error('Error fetching file from S3:', error);
    return null; 
  }
};

const processDataAndSendFile = async (tableData: string) => {
    const jsonData = csv_to_json(tableData);
    const csvBlob = new Blob([tableData], { type: 'text/csv' });
    const formData = new FormData();
    formData.append('file', csvBlob, 'data.csv');  

    const response = await fetch('/api/load_data', {
      method: 'POST',
      body: formData,  
    });

    const result = await response.json();
    console.log('Data fetch status:', result.status)
    const predictionsObj = result.data; 

    if (!response.ok) {
      console.error('Error:', result.error);
      alert(`Error: ${result.error}`);
      return;
    }

    console.log('Predictions:', predictionsObj);
    navigate('/table', { state: { data: jsonData, prediction: predictionsObj } });

}

const csv_to_json = (csvString: string): object[] | null => {
  try{
    const lines = csvString.split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length === 0) {
      throw new Error('CSV content is empty');
    }

    const headers = lines[0].split(',').map(header => header.trim());

    const regex = new RegExp(
      `"([^"]*)"|([^",]+)`, 
      'g'
    );

    const jsonResult = lines.slice(1).map(line => {
      const values: string[] = [];
      let match;

      while ((match = regex.exec(line)) !== null) {
        values.push(match[1] || match[2]);
      }

      if (values.length !== headers.length) {
        console.warn('Row has different number of columns than the header:', line);
      }

      const jsonObject: { [key: string]: string } = {};

      headers.forEach((header, index) => {
        jsonObject[header] = values[index] || ''; 
      });

      return jsonObject;
    });

    return jsonResult;
  } catch (error) {
    setMessage('Error parsing csv: ' + error.message);
    return null;
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

  const handleDelete = async () => {
    if (selectedFolder == userPrefix) {
      setCsvErrorMessage(`Cannot delete base "${selectedFolder}" folder.`);
      console.log(`Cannot delete base folder:`, selectedFolder);
      return;
    }

    if (selectedFolder == 'global') {
      setCsvErrorMessage(`Cannot delete ${selectedFolder} folder.`);
      console.log(`Cannot delete folder:`, selectedFolder);
      return;
    }
    setCsvErrorMessage('');
    setShowModal(true);
  }

  const deleteFolderInS3 = async () => {
    console.log(selectedFolder);

    if (!selectedFolder.trim()) {
      setErrorMessage("Folder name cannot be empty.");
      return;
    }

    const folderKey = `/${selectedFolder}/`;
    console.log("Deleting folder with key:", folderKey);
    try {
      const response = await axios.post(
        '/api/delete_folder',
        { folderKey },
        { headers: { 'Content-Type': 'application/json' } }
      );
      setNewFolderName('');
      setShowModal(false);
      if (response.status == 200) {
        setErrorMessage('');
        setMessage(`Folder "${selectedFolder}" deleted successfully.`);
        console.log("Delete status", response.status)
        refreshListedFiles();
      }
    } catch (error: any) {
      setMessage('Error creating folder: ' + error.message);
    }
  }

  const refreshListedFiles = async () => {
    try {
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
  };

  const cancelDeletion = () => {
    setMessage("Deletion canceled.");
    setShowModal(false);
  };

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
    <div className={showModal ? "blur-background" : ""}>
    <div className="s3-file-manager">
      {!isAuthenticated ? (
        <AuthForm onLoginSuccess={handleLoginSuccess} />
      ) : (
        <>
          <div>
            <h1 className="header">OBU Student Recruitment Tool</h1>
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
                <button className="action-button" onClick={handleDelete}>Delete Folder</button>
              </div>

              <div className="folder-select-form" style={{ marginTop: "1rem" }}>
                <h3 className="header">Create New Folder</h3>
                <input
                  type="text"
                  placeholder="Enter folder name"
                  value={newFolderName}
                  className='folder-name-input'
                  onChange={(e) => setNewFolderName(e.target.value)}
                />
                <button className="action-button" onClick={createFolderInS3}>Create Folder</button>
              </div>
              </div>
              </div>
              
              {csvErrorMessage && <p className="error-message">{csvErrorMessage}</p>}
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
            <h2>Submit Form Data</h2>
            <div className='upload-div'>
                <button className="action-button" onClick={uploadFormData}>Submit Form Data</button>
            </div>
          </div>

          <div>
            <h2 className="list-header">List Files in S3</h2>
            <button className="action-button" onClick={listS3Files}>List Files</button>
            {errorMessage && <p className="error-message">{errorMessage}</p>}

            {isLoading ? (
              <p className="loading-text">
                {generateLoadingBar(progress)}
              </p>
            ) : (
              <ul>
                {filesList.length > 0 ? (
                  filesList.map((file, index) => (
                    <li key={index} className={`file-item ${deletedFiles.includes(file.rawFileName) ? 'deleted' : ''}`}>
                      <span 
                        data-tooltip-id="file-name-tooltip" 
                        className="file-name"
                        data-tooltip-content={file.rawFileName}
                      >{file.displayName}</span>
                      <Tooltip id="file-name-tooltip" />

                      <div className='file-icons'>
                        <button className="icon-button" onClick={() => showTable(file.rawFileName)} disabled={deletedFiles.includes(file.rawFileName)}>
                          <FaTable />
                        </button>
                        <button className="icon-button" onClick={() => copyToClipboard(file.rawFileName)} disabled={deletedFiles.includes(file.rawFileName)}>
                          <FaClipboard />
                        </button>
                        <button className="icon-button" onClick={() => downloadFileFromS3(file.rawFileName)} disabled={deletedFiles.includes(file.rawFileName)}>
                          <FaDownload />
                        </button>
                        <button className="icon-button" onClick={() => deleteFileFromS3(file.rawFileName)} disabled={deletedFiles.includes(file.rawFileName)}>
                          <FaTrash />
                        </button>
                      </div>
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
    {showModal && <DeleteConfirmation onConfirm={deleteFolderInS3} onCancel={cancelDeletion} />}
    </div>
  );
};

export default S3FileManager;
