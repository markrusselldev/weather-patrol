const log = require("../utils/logger"); // Import the custom logger
const dataService = require("../services/dataService");

// Controller function for health check endpoint
const getHealthCheck = async (req, res) => {
  const logContext = { page: "healthCheckController.js", func: "getHealthCheck" };

  try {
    // Construct health check response with minimal information for production
    const healthCheck = {
      status: "UP",
      version: process.env.npm_package_version || "unknown",
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || "production",
      databaseConnection: await checkDatabaseConnection() // Check database connection status
    };

    // Send the health check response with pretty-printed JSON
    res.status(200).set("Content-Type", "application/json").send(JSON.stringify(healthCheck, null, 2));
  } catch (error) {
    log.error(`Health check error: ${error.message}`, { ...logContext });
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// Helper function to check database connection by fetching cached data
const checkDatabaseConnection = async () => {
  const logContext = { page: "healthCheckController.js", func: "checkDatabaseConnection" };

  try {
    const data = dataService.getCachedData(); // Get cached data
    if (data && data.rows.length > 0) {
      return "Connected"; // Return "Connected" if data is available
    }
    return "No data available"; // Return "No data available" if no data is found
  } catch (error) {
    log.error(`Database connection check error: ${error.message}`, { ...logContext });
    return `Error: ${error.message}`; // Return error message if an exception occurs
  }
};

module.exports = { getHealthCheck };
