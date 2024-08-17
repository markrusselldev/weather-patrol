require("dotenv").config(); // Load environment variables from .env file
const http = require("http"); // HTTP module for creating a server
const express = require("express"); // Express framework for building web applications
const helmet = require("helmet"); // Helmet for securing Express apps by setting various HTTP headers
const cors = require("cors"); // CORS middleware for enabling Cross-Origin Resource Sharing
const log = require("./utils/logger"); // Custom logger setup
const errorHandler = require("./utils/errorHandler"); // Custom error handler
const rateLimit = require("express-rate-limit"); // Rate limiting middleware to prevent abuse
const csrf = require("csurf"); // CSRF protection middleware
const cookieParser = require("cookie-parser"); // Middleware for parsing cookies
const apiRoutes = require("./routes/api"); // Import API routes
const { addSSEClient } = require("./services/dataService"); // Import addSSEClient function
const dataService = require("./services/dataService"); // Import dataService
const serveFrontend = require("./serve-frontend"); // Import the frontend serving file
const path = require("path"); // For resolving file paths
const { exec } = require("child_process"); // For running the update script

const app = express();
app.set('trust proxy', true); // Trust the proxy headers - necessary when behind a reverse proxy like Render
const PORT = process.env.PORT || 3000; // Define the port to run the server

// Middleware setup
app.use(express.json()); // Parse incoming JSON requests
app.use(helmet()); // Set security-related HTTP headers
app.use(cookieParser()); // Parse cookies

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow CORS from specified origin
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "x-api-key", "X-CSRF-TOKEN"], // Allowed headers
    exposedHeaders: "Content-Length,X-Content-Type-Options,X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset", // Exposed headers
    preflightContinue: false, // Do not continue with preflight request
    optionsSuccessStatus: 204 // Status code for successful preflight request
  })
);

// General rate limiter for most API routes
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // General limit for most API routes
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res) => {
    log.warn(`Rate limit exceeded for IP: ${req.ip}`, { page: "server.js", func: "rateLimit" });
    res.status(429).json({ error: "Too many requests from this IP, please try again later." });
  }
});

// Increased rate limiter for the data update route
const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for the update route
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res) => {
    log.warn(`Rate limit exceeded for IP: ${req.ip}`, { page: "server.js", func: "rateLimit" });
    res.status(429).json({ error: "Too many requests from this IP, please try again later." });
  }
});

// Apply the general rate limiter to all API routes
app.use("/api", apiLimiter);

// Apply the specific rate limiter to the data update route
app.use("/data/update_toa5_data", updateLimiter);

const csrfProtection = csrf({ cookie: true }); // Enable CSRF protection with cookies
app.use(csrfProtection); // Apply CSRF protection middleware

// Middleware to set CSRF token cookie
app.use((req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken()); // Set CSRF token cookie
  next(); // Proceed to the next middleware
});

// Log incoming requests
app.use((req, res, next) => {
  log.info(`Received request: ${req.method} ${req.url} from IP: ${req.ip}`, { page: "server.js", func: "logRequests" });
  next();
});

// Load data on server start
dataService.loadData();

// Set up API routes
app.use("/api", apiRoutes); // Use API routes from apiRoutes module

// SSE endpoint to subscribe to real-time updates
app.get("/api/sse", (req, res) => {
  log.debug("Request object received.", { page: "server.js", func: "sseEndpoint", req });
  log.debug("Response object received.", { page: "server.js", func: "sseEndpoint", res });
  addSSEClient(req, res);
});

// Serve static frontend files
app.use(serveFrontend);

// Error handler middleware
app.use((err, req, res, next) => {
  log.error(`Error occurred in ${req.method} ${req.url} from IP: ${req.ip}`, { page: "server.js", func: "errorHandler", err });
  errorHandler(err, req, res, next);
});

// Background worker to update TOA5 data every 15 minutes
// const interval = 15 * 60 * 1000; // 15 minutes
const interval = 1 * 60 * 1000; // 1 minute

setInterval(() => {
  log.info("Running scheduled TOA5 data update");
  exec(`node ${path.resolve(__dirname, "./data/update_toa5_data.js")}`, (error, stdout, stderr) => {
    if (error) {
      log.error(`Error executing update_toa5_data.js: ${error.message || error}`, { error });
      return;
    }
    log.info(`update_toa5_data.js output: ${stdout}`);
    if (stderr) {
      log.warn(`update_toa5_data.js stderr: ${stderr}`);
    }
  });
}, interval);

// Start the server
http.createServer(app).listen(PORT, () => {
  log.info(`Server is running on http://localhost:${PORT}`, { page: "server.js", func: "startServer" });
});
