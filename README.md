# obu-student-recruitment

# Getting Started
## Backend
In order to run the project, Conda must first be installed. Once Conda is installed, run one of the following commands to create an environment and install dependencies:
- `bash setup-env-unix.sh`
- TODO: Create Powershell script for Powershell users
This creates an environment named 'stu-rec' that contains all the necessary dependencies for the backend API.

# Flask Server
## Activate The Server
Activate the conda envirnment using:
```bash
conda activate stu-rec
```
From the api folder, run this command in the terminal to activate the flask server:
```bash
python flask_server.py
```
The flask server currently runs on host 0.0.0.0 and port 6000, but these can be changed by editing the `config.json` file. 

## Running Tests
From the api folder, run this command in a seperate terminal to test the flask server:
```bash
pytest -v tests/test_flask_server.py
```