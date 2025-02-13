// Filename - App.js

import React, { Component } from "react";
import axios from "axios";
import "./css/StudentForm.css"

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
        formData.append("myFile", this.state.selectedFile, this.state.selectedFile.name);

        // Details of the uploaded file
        console.log(formData);

        // Request made to the backend api
        // Send formData object

        fetch("http://127.0.0.1:6000/api/batch_job", {
            "method": "POST",
            "mode": 'cors',
            body: formData
        }).then((res) => {
            console.log("SUCCESS");
        });

        /*
        axios.post("http://127.0.0.1:6000/api/batch_job"//, formData
        ).then((res) => {
            //TODO: Display results of predictions
            console.log(res.status);
        }).catch((err) => {
            //TODO: Catch error
            console.log(err);
        })*/

    };

    // File content to be displayed after
    // file upload is complete
    fileData = () => {
        if (this.state.selectedFile) {
            return (
                <div>
                    <h2>File Details:</h2>
                    <p>File Name: {this.state.selectedFile.name}</p>
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
