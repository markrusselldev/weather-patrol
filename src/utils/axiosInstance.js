// Frontend - axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://localhost:3000/api",
  headers: {
    "x-api-key": import.meta.env.VITE_API_KEY
  },
  withCredentials: true // This ensures cookies and other credentials are sent with requests
});

// Add a request interceptor to include the CSRF token
axiosInstance.interceptors.request.use(
  config => {
    const csrfToken = document.cookie
      .split("; ")
      .find(row => row.startsWith("XSRF-TOKEN"))
      ?.split("=")[1];

    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
    } else {
      console.error("CSRF token not found in cookies.");
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    console.error("Axios error:", error);
    return Promise.reject(error);
  }
);

export default axiosInstance;
