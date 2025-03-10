# Data Flow and System Interaction

## Overview
This system consists of three main components: the **S3 Bucket**, the **User Management Table in DynamoDB**, and the **User Interface** that allows file upload/download actions based on the user's prefix. Below is a conceptual breakdown of how these components interact with each other:

---

## Components:

1. **S3 Bucket**: 
   - The bucket stores files and organizes them under specific prefixes that are assigned to individual users.
   - Each file in the bucket can be accessed, uploaded, or deleted by a user, but only under their designated prefix.

2. **User Management Table in DynamoDB**:
   - This table manages the **User_ID**, **User_Password**, and **User_Prefix** for each user.
   - It stores which prefix each user has access to, ensuring that each user can only access files within their own designated prefix in the S3 bucket.
   - The User_ID and password are used for authentication to allow access to the system.

3. **User Interface (React App)**:
   - The frontend allows users to **log in**, **upload files**, **download files**, and **list files** based on their designated prefix.
   - Upon successful authentication, the system stores the **User_ID** and **User_Prefix** in `localStorage` to remember the user's session.
   - The system uses the prefix stored in `localStorage` to determine which files the user can upload or download, restricting access to only files under that prefix.

---

## Data Flow:

1. **User Authentication**:
   - When a user logs in with their **User_ID** and **password**, the system verifies the credentials against the **User Management Table in DynamoDB**.
   - If the credentials match, the system retrieves the **User_Prefix** for that user from the table.
   - Upon successful authentication, the **User_ID** and **User_Prefix** are stored in the browser's `localStorage` for session management, allowing the user to perform file operations under their specific prefix.

2. **Upload File to S3**:
   - When a user uploads a file, the **User_Prefix** is appended to the file upload request.
   - The file is uploaded to the S3 bucket under the directory corresponding to the user's **User_Prefix**.
   - The S3 Bucket organizes files based on the prefix, ensuring that each user can only access files under their specific prefix.

3. **Download File from S3**:
   - When a user requests to download a file, the **User_Prefix** is used to determine which files are available for download.
   - The system ensures that users can only download files that are under their assigned prefix in the S3 bucket.
   - If the requested file exists under the user's prefix, it is fetched and sent to the user for download.

4. **List Files**:
   - The system queries the **S3 Bucket** to list files based on the **User_Prefix**.
   - Only the files under the specific prefix assigned to the user are displayed, ensuring that users can only see their own files.
   - If a user tries to access or list files outside of their designated prefix, they will be restricted.

5. **Sign Out**:
   - When a user logs out, the system clears the **User_ID** and **User_Prefix** from `localStorage`.
   - The session ends, and the user is redirected to the login screen to authenticate again.

---

## S3 Bucket Structure:

```bash
BUCKET
"/root" ("./*" accesable to admin)
 |_ "/root/user1"
     |_ ("./*" accesable to user1)
 |_ "/root/user2"
     |_ ("./*" accesable to user2)
 |_ "/root/user3"
     |_ ("./*" accesable to user3)
 |_ "/root/user4"
     |_ ("./*" accesable to user4)
 ...

```
