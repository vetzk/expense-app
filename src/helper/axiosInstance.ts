import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:2500",
});

export default axiosInstance;
