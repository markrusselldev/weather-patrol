const dataService = require("../services/dataService");
const log = require("../utils/logger"); // Import the custom logger

const logContext = { page: "dataController.js" };

// Controller to get the latest weather data
const getLatestWeatherData = (req, res) => {
  try {
    log.info("Request received for latest weather data", {
      ...logContext,
      func: "getLatestWeatherData",
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    // Retrieve the latest weather record from the data service
    const latestRecord = dataService.getLatestRecord();

    // Check if the latest record is available
    if (latestRecord) {
      log.info("Latest weather data retrieved successfully", {
        ...logContext,
        func: "getLatestWeatherData",
        latestRecord,
      });

      // Respond with the environment info and latest data
      res.json({
        environmentInfo: dataService.getEnvironmentInfo(),
        latestData: latestRecord,
      });
    } else {
      log.warn("No data available for the latest weather data request", {
        ...logContext,
        func: "getLatestWeatherData",
      });

      // If no data is available, respond with a 500 status and error message
      res.status(500).json({ error: "No data available." });
    }
  } catch (error) {
    log.error(`Error retrieving latest weather data: ${error.message}`, {
      ...logContext,
      func: "getLatestWeatherData",
      error,
    });
    res.status(500).json({ error: "An error occurred while fetching the latest weather data" });
  }
};

// Controller to get all cached weather data
const getAllWeatherData = (req, res) => {
  try {
    log.info("Request received for all weather data", {
      ...logContext,
      func: "getAllWeatherData",
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    // Retrieve all cached weather data from the data service
    const data = dataService.getCachedData();

    // Check if there are any data rows available
    if (data.rows.length > 0) {
      log.info("All weather data retrieved successfully", {
        ...logContext,
        func: "getAllWeatherData",
        data: data.rows.slice(0, 10), // Log first 10 rows to avoid log flooding
      });

      // Respond with the environment info and all data
      res.json({
        environmentInfo: dataService.getEnvironmentInfo(),
        data,
      });
    } else {
      log.warn("No data available for the all weather data request", {
        ...logContext,
        func: "getAllWeatherData",
      });

      // If no data is available, respond with a 500 status and error message
      res.status(500).json({ error: "No data available" });
    }
  } catch (error) {
    log.error(`Error retrieving all weather data: ${error.message}`, {
      ...logContext,
      func: "getAllWeatherData",
      error,
    });
    res.status(500).json({ error: "An error occurred while fetching all weather data" });
  }
};

// Controller to handle Server-Sent Events (SSE)
const sseEndpoint = (req, res) => {
  try {
    log.debug("SSE endpoint hit", {
      ...logContext,
      func: "sseEndpoint",
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
    });

    dataService.addSSEClient(req, res);

    log.info("SSE client added successfully", {
      ...logContext,
      func: "sseEndpoint",
    });
  } catch (error) {
    log.error(`Error adding SSE client: ${error.message}`, {
      ...logContext,
      func: "sseEndpoint",
      error,
    });
    res.status(500).json({ error: "An error occurred while adding SSE client" });
  }
};

module.exports = {
  getLatestWeatherData,
  getAllWeatherData,
  sseEndpoint,
};
