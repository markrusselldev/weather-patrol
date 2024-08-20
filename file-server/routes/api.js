const express = require("express");
const router = express.Router();
const log = require("../utils/logger");
const dataController = require("../controllers/dataController");

// Conditionally require the appropriate health check controller based on the environment
const healthController = process.env.NODE_ENV === "production" ? require("../controllers/healthController.prod") : require("../controllers/healthController");

// Route to get the latest weather data
router.get("/latest", async (req, res) => {
  log.debug("Request received for /latest", { func: "getLatestWeatherData", route: "/latest" });
  try {
    const data = await dataController.getLatestWeatherData(req, res);
    log.debug("Response sent for /latest", { func: "getLatestWeatherData", route: "/latest", data });
  } catch (error) {
    log.error("Error in /latest route", { func: "getLatestWeatherData", route: "/latest", error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to get all weather data
router.get("/data", async (req, res) => {
  log.debug("Request received for /data", { func: "getAllWeatherData", route: "/data" });
  try {
    const data = await dataController.getAllWeatherData(req, res);
    log.debug("Response sent for /data", { func: "getAllWeatherData", route: "/data", data });
  } catch (error) {
    log.error("Error in /data route", { func: "getAllWeatherData", route: "/data", error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Route to set up Server-Sent Events (SSE) endpoint
router.get("/sse", async (req, res) => {
  log.debug("Request received for /sse", { func: "sseEndpoint", route: "/sse" });
  try {
    await dataController.sseEndpoint(req, res);
    log.debug("SSE connection established", { func: "sseEndpoint", route: "/sse" });
  } catch (error) {
    log.error("Error in /sse route", { func: "sseEndpoint", route: "/sse", error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Health check endpoint
router.get("/health", async (req, res) => {
  log.debug("Request received for /health", { func: "getHealthCheck", route: "/health" });
  try {
    const healthStatus = await healthController.getHealthCheck(req, res);
    log.debug("Health check status", { func: "getHealthCheck", route: "/health", healthStatus });
  } catch (error) {
    log.error("Error in /health route", { func: "getHealthCheck", route: "/health", error });
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
