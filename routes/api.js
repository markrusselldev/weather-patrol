const express = require("express");
const router = express.Router();
const dataController = require("../controllers/dataController");
const auth = require("../middleware/auth");

// Conditionally require the appropriate health check controller based on the environment
const healthController = process.env.NODE_ENV === "production" ? require("../controllers/healthController.prod") : require("../controllers/healthController");

// Route to get the latest weather data, protected by authentication middleware
router.get("/latest", auth, dataController.getLatestWeatherData);

// Route to get all weather data, protected by authentication middleware
router.get("/data", auth, dataController.getAllWeatherData);

// Route to set up Server-Sent Events (SSE) endpoint
router.get("/sse", dataController.sseEndpoint);

// Health check endpoint
router.get("/health", healthController.getHealthCheck);

module.exports = router;
