import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:6000",
  headers: {
    "Content-type": "application/json",
  },
});
