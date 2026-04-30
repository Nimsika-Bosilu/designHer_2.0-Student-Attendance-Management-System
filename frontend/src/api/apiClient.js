import axios from "axios";

// Create a reusable Axios instance with our backend's base URL
const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Automatically attach the JWT token to EVERY request
apiClient.interceptors.request.use(function (config) {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = "Bearer " + token;
  }
  return config;
});

export default apiClient;
