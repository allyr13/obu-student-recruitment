from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from json_loader import get_config, edit_json_data
import json

app = Flask(__name__)
cors = CORS(app)

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
@cross_origin
def batch_job_api():
    print(request)
    response = jsonify({"message": "request.files", "status": 200})
    return response
    ##data = request.get_json()
    #if not data or data == None:
    #    return jsonify({"error": "No JSON data received", "status": 400})
    
    #key = "message"
    #value = data.get(key)

    #if not key or value is None:
    #    return jsonify({"error": "Incorrect or missing body key", "status": 400})

    #global test_data_string
    #test_data_string = edit_json_data(test_data_string, key, value)

    #return jsonify({"message": "Data received and added", "data": json.loads(test_data_string), "status": 200})


if __name__ == '__main__':
    host = get_config("host")
    port = get_config("port")
    app.run(debug=True, host=host, port=int(port))
