const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");

// Conditionally require the appropriate health check controller based on the environment
const healthController = process.env.NODE_ENV === "production" ? require("../controllers/healthController.prod") : require("../controllers/healthController");

// Route to get the latest weather data
router.get("/latest", dataController.getLatestWeatherData);

// Route to get all weather data
router.get("/data", dataController.getAllWeatherData);

// Route to set up Server-Sent Events (SSE) endpoint
router.get("/sse", dataController.sseEndpoint);

// Health check endpoint
router.get("/health", healthController.getHealthCheck);

module.exports = router;
