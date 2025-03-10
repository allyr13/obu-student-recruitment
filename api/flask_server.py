from flask import Flask, request, jsonify, Response
from flask_cors import CORS, cross_origin
from json_loader import get_config
from processing.data_processing import get_prediction, get_results_json, get_table_data_results
import pandas as pd
import json
from flask import render_template


app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

class tableSave:
    table_data = None

    def getData(self):
        print("Getting table data")
        return self.table_data

    def setData(self, data):
        print("Setting table data")
        self.table_data = data

TableClass = tableSave()

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
        df = get_prediction(file)

        TableClass.setData(json.loads(get_table_data_results()))

        return jsonify({"data": TableClass.getData()["Prediction"], "message": "CSV file received and saved successfully", "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})
    
@app.route('/api/test_model', methods=['GET'])
def upload_default_form():
    try:
        df = get_prediction('default_copy.csv')

        return jsonify({"message": "Data was successfully one-hot-encoded", "status": 200})
    except Exception as e:
        return jsonify({"error": str(e), "status": 500})

@app.route('/api/test_batch', methods=['GET'])
def test_batch_job():
    try:
        df = get_prediction('default_batch.csv')
        
        return jsonify({"message": "Data was successfully one-hot-encoded", "status": 200})
    except Exception as e:
        return jsonify({"error": str(e), "status": 500})


@app.route('/api/get_table_data', methods=['GET'])
def get_table_data():
    table_data = TableClass.getData()

    if table_data == None:
        return jsonify({"error": "No data available", "status": 404})

    return jsonify({"data": table_data, "status": 200})


@app.route('/api/test', methods=['GET'])
def test():
    df = get_prediction('default_batch.csv')
    
    TableClass.setData(json.loads(get_table_data_results()))

    return jsonify({"status": 200})


if __name__ == '__main__':
    host = get_config("host")
    port = get_config("port")
    app.run(debug=True, host=host, port=int(port))
