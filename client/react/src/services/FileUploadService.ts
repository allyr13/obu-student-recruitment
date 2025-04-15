import http from "../http-common.ts";

const BASE_API = (window as any)._env_.API_BASE_URL;

const upload = (file: File, onUploadProgress: any): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);

    return http.post(`${BASE_API}/api/upload_data`, formData, {
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