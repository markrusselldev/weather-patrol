// src/services/weatherService.js
import axios from "axios";
import errorHandler from "../utils/errorHandler";

const API_URL = "http://localhost:3000/api/latest"; // Ensure this URL is correct

export const fetchLatestWeather = async () => {
  try {
    const response = await axios.get(API_URL, {
      headers: {
        "x-api-key": "secret_api_key" // Ensure this matches your backend setup
      }
    });
    return response.data;
  } catch (error) {
    const errorMsg = errorHandler(error);
    throw new Error(errorMsg);
  }
};
