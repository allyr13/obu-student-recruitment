import axios from "axios";

const BASE_API = process.env.REACT_APP_API_BASE_URL;

export default axios.create({
    baseURL: BASE_API,
    headers: {
        "Content-type": "application/json",
    },
});
