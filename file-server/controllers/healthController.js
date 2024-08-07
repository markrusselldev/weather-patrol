const os = require("os");
const dataService = require("../services/dataService");
const log = require("../utils/logger"); // Import the custom logger

// Controller function for health check endpoint
const getHealthCheck = async (req, res) => {
  const logContext = { page: "healthCheckController.js", func: "getHealthCheck" };

  try {
    // Construct health check response with various system metrics and database connection status
    const healthCheck = {
      status: "UP",
      version: process.env.npm_package_version || "unknown",
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      platform: os.platform(),
      cpuCount: os.cpus().length,
      environment: process.env.NODE_ENV || "development",
      databaseConnection: await checkDatabaseConnection(), // Check database connection status
      cacheStatus: getCacheStatus(), // Get cache status
      sseClientCount: dataService.getSSEClientCount(), // Include SSE client count
      description: {
        status: "The overall status of the server.",
        version: "The version of the application.",
        uptime: "The amount of time the server has been running (in seconds).",
        memoryUsage: "Memory usage statistics of the Node.js process.",
        platform: "Operating system platform on which the server is running.",
        cpuCount: "Number of CPU cores available.",
        environment: "The current environment (development or production).",
        databaseConnection: "Status of the connection to the database.",
        cacheStatus: "Status of the in-memory cache and its contents.",
        sseClientCount: "Number of clients connected via Server-Sent Events (SSE)."
      }
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

// Helper function to get cache status
const getCacheStatus = () => {
  const keys = dataService.cache.keys();
  const stats = dataService.cache.getStats();
  return {
    keys,
    stats
  };
};

module.exports = { getHealthCheck };
