// Frontend - axiosInstance.js
import axios from "axios";
import logger from "./logger";
import errorHandler from "./errorHandler";

// Create an Axios instance with a base URL and default headers
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
    // Retrieve CSRF token from cookies
    const csrfToken = document.cookie
      .split("; ")
      .find(row => row.startsWith("XSRF-TOKEN"))
      ?.split("=")[1];

    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken;
      logger.info("CSRF token added to headers.");
    } else {
      logger.error("CSRF token not found in cookies.");
    }
    return config;
  },
  error => {
    // Log request error and use errorHandler
    logger.error("Request error:", error);
    return Promise.reject(errorHandler(error));
  }
);

// Add a response interceptor to log errors and handle them using errorHandler
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    // Log response error and use errorHandler
    logger.error("Axios response error:", error);
    return Promise.reject(errorHandler(error));
  }
);

export default axiosInstance;
