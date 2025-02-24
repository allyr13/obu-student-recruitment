import { useState } from "react";
import '../css/FileUpload.css';
import UploadService from "../services/FileUploadService.ts";
import React from "react";
import Papa from "papaparse";
import all_expected_cols from "../all_expected_cols.json";

const FileUpload: React.FC = () => {

    const [currentFile, setCurrentFile] = useState<File>();
    const [message, setMessage] = useState<string>("");

    const validateFile = (file: File): boolean => {
        const validTypes = ["text/csv"];
        const maxSize = 100 * 1024 * 1024; // 100 MB, can be changed easily if need be

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
        console.log("TESTTESTTEST")
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true, // Ensure the first row is treated as headers
                complete: (result) => {
                    const { data, errors } = result;
                    if (errors.length > 0) {
                        setMessage("Error parsing CSV file.");
                        reject(false);
                    }
                    
                    const requiredColumns = all_expected_cols;
                    const headers = Object.keys(data[0]); // Get the headers from the first row
                    console.log("Headers:", headers);

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

                    let skip_cols = ["incoming_text_count", "outgoing_text_count", "phone_successful_count", "phone_unsuccessful_count", "phone_voicemail_count"]
                    
                    let num_cols = ["Financial Aid Offered Amount", "Events Attended Count"]
                    for(const row of data) {
                        for(const header of headers){
                            if(row[header] === undefined || row[header] === null){
                                setMessage(`Invalid value in column ${header} for row ${data.indexOf(row) + 1}`);
                                reject(false);
                                return;
                            }
                            else if(num_cols.includes(header)){
                                if(isNaN(parseFloat(row[header]))){
                                    setMessage(`Invalid value in column ${header} for row ${data.indexOf(row) + 1}`);
                                    reject(false);
                                    return;
                                }
                            }
                            else if(!skip_cols.includes(header)){
                                if(row[header] != 1 || row[header] != 0){
                                    setMessage(`Invalid value in column ${header} for row ${data.indexOf(row) + 1}`);
                                    reject(false);
                                    return;
                                }
                            }
                        }
                    }
                    
                    resolve(true);
                }
            });
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

            UploadService.upload(currentFile, (event: any) => {
            }).then((response) => {
                setMessage(response.data.message);
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
                <p>Upload CSV file of multiple students </p>
            </header>
            <div className="fileUpload">
                <div>
                    <label>
                        <input type="file" accept=".csv" onChange={selectFile} />
                    </label>

                    <button disabled={!currentFile} onClick={upload}>Upload</button>
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