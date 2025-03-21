from flask import Blueprint, jsonify, request
import boto3
from json_loader import get_config
from botocore.exceptions import ClientError

s3_bp = Blueprint("s3", __name__)

S3_BUCKET_NAME = "stu-rec-bucket"
S3_REGION = "us-east-2"
s3_client = boto3.client("s3", region_name=S3_REGION)

DYNAMO_DB = boto3.resource('dynamodb', region_name="us-east-2")
table = DYNAMO_DB.Table(get_config("table_name"))

@s3_bp.route('/api/add_user', methods=['POST'])
def add_user():
    try:
        data = request.json
        user_id = data['User_ID']
        user_prefix = data['User_Prefix']
        user_password = data['User_Password']

        response = table.put_item(
            Item={
                'User_ID': user_id,
                'User_Prefix': user_prefix,
                'User_Password': user_password
            }
        )

        return jsonify({'message': 'User added successfully', 'status': 'success'}), 200

    except ClientError as e:
        return jsonify({'message': str(e), 'status': 'error'}), 500


@s3_bp.route('/api/delete_user', methods=['DELETE'])
def delete_user():
    try:
        data = request.json
        user_id = data['User_ID']
        user_prefix = data['User_Prefix']

        response = table.delete_item(
            Key={
                'User_ID': user_id,
                'User_Prefix': user_prefix
            }
        )

        if response.get('ResponseMetadata', {}).get('HTTPStatusCode') == 200:
            return jsonify({'message': 'User deleted successfully', 'status': 'success'}), 200
        else:
            return jsonify({'message': 'User not found or could not be deleted', 'status': 'error'}), 400

    except ClientError as e:
        return jsonify({'message': str(e), 'status': 'error'}), 500


@s3_bp.route('/api/verify_password', methods=['POST'])
def verify_password():
    password = request.json.get('password')
    print(password)
    print(get_config("admin_password"))
    
    if password == get_config("admin_password"):
        return jsonify({"message": "Password valid", "status": 200})
    else:
        return jsonify({"error": "Invalid password", "status": 401})

@s3_bp.route('/api/authenticate_user', methods=['POST'])
def authenticate_user():
    data = request.json
    user_id = data.get('User_ID')
    password = data.get('password')
    print(user_id)
    print(password)

    if not user_id or not password:
        return jsonify({"error": "User_ID and password are required", "status": 400})

    try:
        table_name = get_config("table_name")
        table = DYNAMO_DB.Table(table_name)
        
        response = table.scan()
        items = response.get('Items', [])
        user = next((item for item in items if item.get("User_ID") == user_id), None)

        if user['User_Password'] != password:
            return jsonify({"error": "Invalid credentials", "status": 401})
        
        print(user['User_Prefix'])

        return jsonify({
            "message": "Authentication successful",
            "User_Prefix": user["User_Prefix"],
            "status": 200
        })

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})

@s3_bp.route('/api/get_table_data', methods=['GET'])
def get_table_data():
    try:
        table_name = get_config("table_name")
        table = DYNAMO_DB.Table(table_name)
        
        response = table.scan()
        items = response.get('Items', [])
        
        return jsonify({"data": items, "status": 200})
    
    except Exception as e:
        return jsonify({"error": str(e), "status": 500})



@s3_bp.route('/api/upload_to_s3', methods=['POST'])
def upload_to_s3():
    if 'file' not in request.files:
        return jsonify({"error": "No file part", "status": 500})

    files = request.files.getlist('file')
    prefix = request.form.get('prefix', '')
    global_upload = request.form.get('global', 'None')
    print(global_upload)

    if not files:
        return jsonify({"error": "No selected file", "status": 500})

    if prefix != '':
        if prefix == "/root":
            prefix = '' # Avoid double referencing root prefix
        else:
            prefix = prefix + "/"

    uploaded_files = []

    try:
        for file in files:
            if file.filename =='':
                continue
            relative_path = request.form.get(f'path_{file.filename}', file.filename)
            s3_key = f"{get_config('root_dir')}/{prefix}{relative_path}"
            if (global_upload == "True"):
                s3_key = f"{get_config('root_dir')}/global/{relative_path}"

            s3_client.upload_fileobj(file, S3_BUCKET_NAME, s3_key)
            uploaded_files.append(s3_key)

            return jsonify({"message": "File uploaded successfully", "filename": uploaded_files, "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})

    
@s3_bp.route('/api/list_s3_files', methods=['GET'])
def list_s3_files():
    try:
        user_prefix = request.args.get("prefix")

        if user_prefix != "/root":
            if user_prefix != '':
                user_prefix = "/root/" + user_prefix

        response_user_prefix = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=user_prefix)
        files_user_prefix = [obj["Key"] for obj in response_user_prefix.get("Contents", [])]

        response_other = s3_client.list_objects_v2(Bucket=S3_BUCKET_NAME, Prefix=f"{get_config("root_dir")}/global")
        files_other = [obj["Key"] for obj in response_other.get("Contents", [])]

        combined_files = list(set(files_user_prefix + files_other))

        return jsonify({"files": combined_files, "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})




@s3_bp.route('/api/download_from_s3', methods=['GET'])
def get_download_url():
    file_name = request.args.get('filename')

    if not file_name:
        return jsonify({"error": "Filename is required", "status": 500})

    try:
        presigned_url = use_pre_signed_url('get_object', file_name)
        return jsonify({"url": presigned_url, "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})



@s3_bp.route('/api/delete_from_s3', methods=['DELETE'])
def delete_from_s3():
    file_name = request.args.get('filename')

    if not file_name:
        return jsonify({"error": "Filename is required", "status": 500})

    try:
        s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=file_name)
        return jsonify({"message": f"File {file_name} deleted successfully", "status": 200})

    except Exception as e:
        return jsonify({"error": str(e), "status": 500})


def use_pre_signed_url(action_type, file_name, exp_time=3600):
    presigned_url = s3_client.generate_presigned_url(
        action_type,
        Params={"Bucket": S3_BUCKET_NAME, "Key": file_name},
        ExpiresIn=exp_time  # Default 1 hour expiration
    )
    return presigned_url

@s3_bp.route('/api/create_folder_in_s3', methods=['POST'])
def create_folder_in_s3():
    try:
        data = request.get_json()
        folder_key = "/root"
        folder_key += data.get('folderKey')
        if not folder_key:
            return jsonify({"error": "folderKey not provided", "status": 500})
        if not folder_key.endswith('/'):
            folder_key += '/'
        s3_client.put_object(Bucket=S3_BUCKET_NAME, Key=folder_key, Body=b'')
        print(folder_key)
        return jsonify({"message": f"Folder '{folder_key}' created successfully.", "status": 200})
    except Exception as e:
        return jsonify({"error": str(e), "status": 500})