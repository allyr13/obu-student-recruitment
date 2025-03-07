from flask import jsonify, request
import boto3

# Initialize S3 client
S3_BUCKET_NAME = "stu-rec-bucket"
S3_REGION = "us-east-2"
s3_client = boto3.client("s3", region_name=S3_REGION)

# **UPLOAD FILE TO S3**
def upload_to_s3():
    if 'file' not in request.files:
        return jsonify({"error": "No file part", "status": 500})

    file = request.files['file']

    if file.filename == '':
        return jsonify({"error": "No selected file", "status": 500})

    try:
        s3_client.upload_fileobj(file, S3_BUCKET_NAME, file.filename)
        return jsonify({"message": "File uploaded successfully", "filename": file.filename, "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})

# **LIST FILES IN S3 BUCKET**
def list_s3_files():
    try:
        response = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME)
        files = [obj["Key"] for obj in response.get("Contents", [])]
        return jsonify({"files": files, "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})

# **DOWNLOAD FILE FROM S3**
def download_from_s3():
    file_name = request.args.get('filename')

    if not file_name:
        return jsonify({"error": "Filename is required", "status": 500})

    try:
        s3_client.download_file(S3_BUCKET_NAME, file_name, file_name)
        return jsonify({"message": f"File {file_name} downloaded successfully", "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})

# **DELETE FILE FROM S3**
def delete_from_s3():
    file_name = request.args.get('filename')

    if not file_name:
        return jsonify({"error": "Filename is required", "status": 500})

    try:
        s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=file_name)
        return jsonify({"message": f"File {file_name} deleted successfully", "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})
