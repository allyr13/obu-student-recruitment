import { useState } from "react";
import '../css/FileUpload.css';
import UploadService from "../services/FileUploadService.ts";
import React from "react";
import Papa from "papaparse";

const FileUpload: React.FC = () => {

    const [currentFile, setCurrentFile] = useState<File>();
    const [message, setMessage] = useState<string>("");

    const validateFile = (file: File): boolean => {
        const validTypes = ["text/csv"];
        const maxSize = 100 * 1024 * 1024;

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
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                complete: (result) => {
                    const { data, errors } = result;
                    if (errors.length > 0) {
                        setMessage("Error parsing CSV file.");
                        reject(false);
                    }

                    /*
                    const requiredColumns = ["Name", "Email", "Age"];
                    const headers = data[0];
                    const hasRequiredColumns = requiredColumns.every(col => headers.includes(col));

                    if (!hasRequiredColumns) {
                        setMessage("CSV file is missing required columns.");
                        reject(false);
                    }
                    */

                    resolve(true);
                },
                header: true
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