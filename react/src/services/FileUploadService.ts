import http from "../http-common.ts";

const upload = (file: File, onUploadProgress: any): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    return http.post("/api/upload_data", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
    });
};



const FileUploadService = {
    upload,
};

export default FileUploadService;