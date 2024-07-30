import axiosInstance from "./utils/axiosInstance";
import logger from "./utils/logger";
import errorHandler from "./utils/errorHandler";

// Function to get the latest weather data from the API
export const getLatestWeatherData = async () => {
  try {
    // Make a GET request to the /latest endpoint
    const response = await axiosInstance.get("/latest");
    logger.info("Fetched latest weather data:", response.data);
    return response.data;
  } catch (error) {
    // Log and handle errors
    logger.error("Error fetching latest weather data:", error);
    throw errorHandler(error);
  }
};

// Function to get all weather data from the API
export const getAllWeatherData = async () => {
  try {
    // Make a GET request to the /data endpoint
    const response = await axiosInstance.get("/data");
    const data = response.data;

    // Extract headers from the second row of headers in the API response
    if (data.data && data.data.rows.length > 0) {
      const headers = data.data.headers && data.data.headers.length > 1 ? data.data.headers[1] : Object.keys(data.data.rows[0]);
      data.data.headers = headers;
      logger.info("Extracted headers from the API response:", headers);
    }

    logger.info("Fetched all weather data:", data);
    return data;
  } catch (error) {
    // Log and handle errors
    logger.error("Error fetching all weather data:", error);
    throw errorHandler(error);
  }
};
