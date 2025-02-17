from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from json_loader import get_config, edit_json_data
import json
from process_csv import convertCSVToDataFrame

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

test_data_string = '{}'

@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/get_example', methods=['GET'])
def get_example():
    response = jsonify({"data": json.loads(test_data_string), "status": 200, "headers": []})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    return response

@app.route('/api/batch_job', methods=['POST'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def batch_job_api():
    print(request)
    response = jsonify({"message": "File successfully uploaded", "status": 200})
    return response


@app.route('/api/upload_csv', methods=['POST'])
def upload_csv():
    try:
        csv_data = request.data.decode('utf-8')
        if not csv_data or csv_data == None:
            return jsonify({"error": "No CSV data received", "status": 400})
        
        df = convertCSVToDataFrame(csv_data)
        print(df)

        return jsonify({"message": "CSV file received and saved successfully", "status": 200})
    except Exception as e:
        return jsonify({"error": str(e), "status": 500})


if __name__ == '__main__':
    host = get_config("host")
    port = get_config("port")
    app.run(debug=True, host=host, port=int(port))
