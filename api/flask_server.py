from flask import Flask, request, jsonify
from flask_cors import CORS
from json_loader import get_config, edit_json_data
import json
from process_csv import convertCSVToDataFrame

app = Flask(__name__)
CORS(app)

test_data_string = '{}'

@app.route('/')
def home():
    return "Hello, Flask!"

@app.route('/get_example', methods=['GET'])
def get_example():
    return jsonify({"data": json.loads(test_data_string), "status": 200})

@app.route('/post_example', methods=['POST'])
def post_example():
    data = request.get_json()
    if not data or data == None:
        return jsonify({"error": "No JSON data received", "status": 400})
    
    key = "message"
    value = data.get(key)

    if not key or value is None:
        return jsonify({"error": "Incorrect or missing body key", "status": 400})

    global test_data_string
    test_data_string = edit_json_data(test_data_string, key, value)

    return jsonify({"message": "Data received and added", "data": json.loads(test_data_string), "status": 200})

@app.route('/delete_example', methods=['DELETE'])
def delete_example():
    global test_data_string
    test_data_string = '{}'
    return jsonify({"data": json.loads(test_data_string), "message": "Test data cleared", "status": 200})


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
