from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from json_loader import get_config, edit_json_data
import json

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


if __name__ == '__main__':
    host = get_config("host")
    port = get_config("port")
    app.run(debug=True, host=host, port=int(port))
