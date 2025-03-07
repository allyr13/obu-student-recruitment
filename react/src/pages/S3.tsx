import React, { useState } from 'react';
import axios from 'axios';
import '../css/S3.css';
import { FaClipboard, FaDownload, FaTrash } from 'react-icons/fa'; 

const S3FileManager = () => {
  const [file, setFile] = useState<File | null>(null);
  const [message, setMessage] = useState('');
  const [filesList, setFilesList] = useState<string[]>([]);

  const uploadFileToS3 = async () => {
    if (!file) {
      setMessage("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/upload_to_s3', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage(`File uploaded successfully: ${response.data.message}`);
    } catch (error) {
      setMessage('Error uploading file: ' + error.message);
    }
  };

  const listS3Files = async () => {
    try {
      const response = await axios.get('/api/list_s3_files');
      setFilesList(response.data.files);
      setMessage('Files fetched successfully.');
    } catch (error) {
      setMessage('Error fetching files: ' + error.message);
    }
  };

  const downloadFileFromS3 = async (fileName: string) => {
    try {
      const response = await axios.get(`/api/download_from_s3?filename=${fileName}`, {
        responseType: 'blob'
      });
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
        const response = await axios.delete(`/api/delete_from_s3?filename=${fileName}`);
        setMessage(`File deleted successfully: ${fileName}`);
      } catch (error) {
        setMessage('Error deleting file: ' + error.message);
      }
    } else {
      setMessage('File deletion canceled.');
    }
  };

  const copyToClipboard = (fileName: string) => {
    navigator.clipboard.writeText(fileName).then(() => {
      setMessage(`File name "${fileName}" copied to clipboard!`);
    }).catch((error) => {
      setMessage('Error copying to clipboard: ' + error.message);
    });
  };

  return (
    <div className="s3-file-manager">
      <h1>S3 File Manager</h1>

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
              <li key={index} className="file-item">
                <span className="file-name">{file}</span>
                <button className="icon-button" onClick={() => copyToClipboard(file)}>
                  <FaClipboard />
                </button>
                <button className="icon-button" onClick={() => downloadFileFromS3(file)}>
                  <FaDownload />
                </button>
                <button className="icon-button" onClick={() => deleteFileFromS3(file)}>
                  <FaTrash />
                </button>
              </li>
            ))
          ) : (
            <li>No files found. List files or add new files</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default S3FileManager;
