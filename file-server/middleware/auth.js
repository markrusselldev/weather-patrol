const log = require("../utils/logger"); // Import the custom logger

// Middleware for API key authentication
const auth = (req, res, next) => {
  // Retrieve the API key from the request headers
  const apiKey = req.headers["x-api-key"];
  const logContext = { page: "auth.js", func: "auth" };

  // Check if the API key is present and matches the expected key
  if (!apiKey || apiKey !== process.env.API_KEY) {
    // Log unauthorized access attempt
    log.warn(`Unauthorized access attempt with IP: ${req.ip}, API Key: ${apiKey}`, { ...logContext });
    // If the API key is missing or incorrect, respond with a 403 Forbidden status
    return res.status(403).json({ error: "Forbidden" });
  }

  // Log successful authentication
  log.info(`Authenticated request from IP: ${req.ip}`, { ...logContext });
  // If the API key is correct, proceed to the next middleware or route handler
  next();
};

module.exports = auth;
