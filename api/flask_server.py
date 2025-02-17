from flask import Flask, request, jsonify, Response
from flask_cors import CORS, cross_origin
from json_loader import get_config, edit_json_data
import pandas as pd
from sklearn.preprocessing import OneHotEncoder
import json

app = Flask(__name__)
cors = CORS(app, resources={r"/*": {"origins": "*"}})

test_data_string = '{}'
## Processing for Encoding
df = pd.read_csv("prepared_data.csv")
df = df.drop(columns=['ID', 'Enrolled'])
categorical_columns = ['Country', 'State', 'Gender', 'Ethnicity', 'Origin Source',
       'Student Type', 'Major', 'Athlete',
       'Sport', 'Raley College Tag Exists', 'Recruiting Territory',
       'Counselor']

encoded_columns = []
df_encoded = pd.get_dummies(df, columns=categorical_columns, drop_first=True)
encoder = OneHotEncoder(sparse_output=False, handle_unknown="ignore", drop="first")
encoder.fit(df[categorical_columns])


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

## One-Hot Enode Route
## Requires form-data input: "file": filename.csv
@app.route('/api/one_hot_encode', methods=['POST'])
def one_hot_encode_api():
    # Check if a file was uploaded
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['file']

    # Ensure the file has a name and is a CSV
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Invalid file format"}), 400
    
    try:
        input = pd.read_csv(file)
        # Encode new data
        encoded_input = encoder.transform(input[categorical_columns])
        # Convert to DataFrame
        encoded_columns = encoder.get_feature_names_out(categorical_columns)
        encoded_df = pd.DataFrame(encoded_input, columns=encoded_columns)
        encoded_df = encoded_df.fillna(0)
        encoded_df = encoded_df.astype(int)
        encoded_df_final = pd.concat([input.drop(columns=categorical_columns, axis=1), encoded_df], axis=1)
        encoded_df_final = encoded_df_final.fillna(0)

        output = encoded_df_final.to_csv(index=False)
        # Return File
        return Response(
        output,
        mimetype="text/csv",
        headers={"Content-Disposition": "attachment;filename=data.csv"}
    )
    except Exception as e:
        return jsonify({"error": e}, 400)


if __name__ == '__main__':
    host = get_config("host")
    port = get_config("port")
    app.run(debug=True, host=host, port=int(port))
