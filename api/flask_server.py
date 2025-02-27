from flask import Flask, request, jsonify, Response
from flask_cors import CORS, cross_origin
from json_loader import get_config
import pandas as pd
from processing.pass_data_and_recieve_prediction import pass_data_and_recieve_prediction

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/api/batch_job', methods=['POST'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def batch_job_api():
    print(request)
    response = jsonify({"message": "File successfully uploaded", "status": 200})
    return response

@app.route('/api/upload_form', methods=['POST'])
def upload_csv_file():
    if 'file' not in request.files:
        return jsonify({"error": "No File Part", "status": 500})
    
    file = request.files['file']

    # Ensure the file has a name and is a CSV
    if file.filename == '':
        return jsonify({"error": "No Selected File", "status": 500})
    
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Invalid File Format", "status": 500})
    
    try:
        df = pd.read_csv(file)
        results = pass_data_and_recieve_prediction(df)
        print("results: ")
        print(results.head())

        return jsonify({"message": "CSV file received and saved successfully", "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})
    
@app.route('/api/test_model', methods=['GET'])
def upload_default_form():
    try:
        df = pd.read_csv('default_copy.csv')
        results = pass_data_and_recieve_prediction(df)
        print("results: ")
        print(results.head())

        return jsonify({"message": "Data was successfully one-hot-encoded", "status": 200})
    except Exception as e:
        return jsonify({"error": str(e), "status": 500})
    
@app.route('/api/test_batch', methods=['GET'])
def test_batch_job():
    try:
        df = pd.read_csv('default_batch.csv')
        results = pass_data_and_recieve_prediction(df)
        print("results: ")
        print(results.head())

        return jsonify({"message": "Data was successfully one-hot-encoded", "status": 200})
    except Exception as e:
        return jsonify({"error": str(e), "status": 500})


if __name__ == '__main__':
    host = get_config("host")
    port = get_config("port")
    app.run(debug=True, host=host, port=int(port))
