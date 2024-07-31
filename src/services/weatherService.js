// src/services/weatherService.js
import axios from "axios";
import errorHandler from "../utils/errorHandler";
import logger from "../utils/logger"; // Assuming you have a logger utility

const API_URL = "http://localhost:3000/api/latest"; // Ensure this URL is correct

export const fetchLatestWeather = async () => {
  try {
    logger.info("Starting request to fetch latest weather data from API");
    const response = await axios.get(API_URL, {
      headers: {
        "x-api-key": "secret_api_key" // Ensure this matches your backend setup
      }
    });
    logger.info("API response received:", response.data);
    return response.data;
  } catch (error) {
    const errorMsg = errorHandler(error);
    logger.error("Error occurred while fetching weather data:", errorMsg);
    throw new Error(errorMsg);
  }
};
