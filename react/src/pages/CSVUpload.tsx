import { useState } from "react";
import '../css/FileUpload.css';
import UploadService from "../services/FileUploadService.ts";
import React from "react";

const FileUpload: React.FC = () => {

    const [currentFile, setCurrentFile] = useState<File>();
    const [message, setMessage] = useState<string>("");

    const selectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { files } = event.target;
        const selectedFiles = files as FileList;
        setCurrentFile(selectedFiles?.[0]);
    };

    const upload = () => {
        if (!currentFile) return;

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