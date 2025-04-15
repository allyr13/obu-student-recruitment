import { useState } from "react";
import UploadService from "../services/FileUploadService.ts";
import React from "react";
import Papa from "papaparse";
import reference_dict from "../validation_reference.json";
import { useNavigate } from 'react-router-dom';


const processCSV = async (file: File) => {
    const text = await file.text();
  
    const parsedData = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
    });
  
    if (parsedData.errors.length > 0) {
      console.error("Error parsing CSV:", parsedData.errors);
      return;
    }
  
    const transformedData: { [key: string]: { [index: string]: any } } = {};
  
    parsedData.data.forEach((row, index) => {
      Object.keys(row).forEach((key) => {
        if (!transformedData[key]) {
          transformedData[key] = {};
        }
        transformedData[key][index] = row[key];
      });
    });
  
    console.log("Transformed Data:", transformedData);
    return transformedData;
  };

const FileUpload: React.FC = () => {
    const navigate = useNavigate();

    const [currentFile, setCurrentFile] = useState<File>();
    const [message, setMessage] = useState<string>("");

    const validateFile = (file: File): boolean => {
        const validTypes = ["text/csv"];
        const maxSize = 1000 * 1024 * 1024; // 1 GB, can be changed easily if need be

        if (!validTypes.includes(file.type)) {
            setMessage("Invalid file type. Please upload a CSV file.");
            return false;
        }

        if (file.size > maxSize) {
            setMessage("File is too large.");
            return false;
        }

        return true;
    };

    const validateCSVContent = (file: File): Promise<boolean> => {
        console.log("Entered validation");
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true, // Ensure the first row is treated as headers
                complete: (result) => {
                    const { data, errors } = result;
                    if (errors.length - 1 > 0) {
                        setMessage("Error parsing CSV file.");
                        reject(false);
                    }
                    
                    const requiredColumns = Object.keys(reference_dict);
                    const headers = Object.keys(data[0]);

                    if (!Array.isArray(headers)) {
                        setMessage("Invalid CSV format.");
                        reject(false);
                        return;
                    }

                    const hasRequiredColumns = requiredColumns.every(col => headers.includes(col));

                    if (!hasRequiredColumns) {
                        setMessage("CSV file is missing required columns.");
                        reject(false);
                        return;
                    }

                    let idx = 0;
                    for (const row of data.slice(0, -1)) {
                        idx++;
                        for (const [key, value] of Object.entries(row)) {
                            if (reference_dict[key] && !reference_dict[key].includes(value)) {
                                setMessage(`Invalid value "${value}" for column "${key}" on row ${idx}.`);
                                reject(false);
                                return;
                            }
                        }
                    }
                    resolve(true);
                }
            });
            console.log("Exit validation");
        });
    };

    const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;
        const selectedFiles = files as FileList;
        const file = selectedFiles?.[0];

        if (file && validateFile(file)) {
            setCurrentFile(file);
            setMessage("");
        } else {
            setCurrentFile(undefined);
        }
    };

    const upload = async () => {
        if (!currentFile) return;

        try {
            const isValidCSV = await validateCSVContent(currentFile);
            if (!isValidCSV) return;
            console.log("CSV Validation Successful", isValidCSV)

            const transformedData = await processCSV(currentFile);
            localStorage.setItem('tableData', JSON.stringify(transformedData));
            
            UploadService.upload(currentFile, (event: any) => {
            }).then((response) => {
                try {
                    const predictionsObj = response.data.data;

                    setMessage(response.data.message);
                    navigate('/table', {state: {data: transformedData, prediction: predictionsObj}});

                } catch (error) {
                    console.error('Error parsing the response:', error);
                }
            }).catch((err) => {
                console.log(err);

                if (err.response && err.response.data && err.response.data.message) {
                    setMessage(err.response.data.message);
                } else {
                    setMessage("Could not upload the File!");
                }

                setCurrentFile(undefined);
            });
        } catch (error) {
            console.log("CSV validation failed:", error);
        }
    };

    return (
        <div>
            <header className="header">
                <p className="main-title">Upload CSV file of multiple students </p>
            </header>
            <div className="fileUpload">
                <div>
                    <label>
                        <input className="upload-input" type="file" accept=".csv" onChange={selectFile} />
                    </label>

                    <button className='action-button' disabled={!currentFile} onClick={upload}>Upload</button>
                </div>

                {message && (
                    <div role="alert">
                        {message}
                    </div>
                )}
            </div></div>
    );
};

export default FileUpload;