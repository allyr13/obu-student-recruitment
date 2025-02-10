// Filename - App.js

import React, { Component } from "react";

class FileSelect extends Component {
    state = {
        selectedFile: null
    };

    // On file select (from the pop up)
    onFileChange = (event) => {
        // Update the state
        this.setState({
            selectedFile: event.target.files[0]
        });
    };

    // On file upload (click the upload button)
    onFileUpload = () => {
        // Create an object of formData
        const formData = new FormData();

        // Update the formData object
        formData.append(
            "myFile",
            this.state.selectedFile,
            this.state.selectedFile.name
        );

        // Details of the uploaded file
        console.log(formData);

        // Request made to the backend api
        // Send formData object

        /* let response = fetch("localhost:3000/api/batch_job", { TODO: Make this an environment var
            method: "post",
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },

            //make sure to serialize your JSON body
            body: {}
        });
        console.log(response.status);*/
        //axios.post("api/uploadfile", formData);
    };

    // File content to be displayed after
    // file upload is complete
    fileData = () => {
        if (this.state.selectedFile) {
            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.selectedFile.name}</p>

                    <p>File Type: {this.state.selectedFile.type}</p>

                    <p>
                        Last Modified:
                        {this.state.selectedFile.lastModified}
                    </p>
                </div>
            );
        } else {
            return (
                <div>
                    <br />
                    <h4>Choose before pressing Submit button</h4>
                </div>
            );
        }
    };

    render() {
        return (
            <div>
                <h1>Student Recruitment Prediction!</h1>
                <h3>Upload CSV file of potential new students</h3>
                <div>
                    <input type="file" onChange={this.onFileChange} accept={".csv"} />
                    <button onClick={this.onFileUpload}>Submit</button>
                </div>
                {this.fileData()}
            </div>
        );
    }
}

export default FileSelect;
