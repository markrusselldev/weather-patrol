require("dotenv").config(); // Load environment variables from .env file
const http = require("http"); // HTTP module for creating a server
const express = require("express"); // Express framework for building web applications
const helmet = require("helmet"); // Helmet for securing Express apps by setting various HTTP headers
const cors = require("cors"); // CORS middleware for enabling Cross-Origin Resource Sharing
const log = require("./utils/logger"); // Custom logger setup
const errorHandler = require("./utils/errorHandler"); // Custom error handler
const rateLimit = require("express-rate-limit"); // Rate limiting middleware to prevent abuse
const apiRoutes = require("./routes/api"); // Import API routes
const { addSSEClient } = require("./services/dataService"); // Import addSSEClient function
const dataService = require("./services/dataService"); // Import dataService
const serveFrontend = require("./serve-frontend"); // Import the frontend serving file
const path = require("path"); // For resolving file paths
const { exec } = require("child_process"); // For running the update script
const net = require("net"); // Import the net module for checking port availability

const app = express();

const DEPLOYMENT_ENV = process.env.DEPLOYMENT_ENV || "development"; // Default to 'development' if not set

// Set trust proxy and HOST based on deployment environment
if (DEPLOYMENT_ENV === "render") {
  app.set("trust proxy", 1); // Trust the first proxy, for Render.com
}

const HOST = DEPLOYMENT_ENV === "development" ? "127.0.0.1" : "0.0.0.0"; // Use '127.0.0.1' for development, '0.0.0.0' for production-like environments
const PORT = process.env.PORT || 3000; // Define the port to run the server

// Function to check if the port is occupied
const checkPortOccupied = (port) => {
  return new Promise((resolve, reject) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        reject(new Error(`Port ${port} is already in use`));
      } else {
        reject(err);
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(false);
    });

    server.listen(port);
  });
};

// Middleware setup
app.use(express.json()); // Parse incoming JSON requests

// Updated Helmet middleware configuration for v7.x
app.use(
  helmet({
    // You can customize Helmet options here
    contentSecurityPolicy: false, // Example: disabling CSP, which is enabled by default
  })
); // Set security-related HTTP headers

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // Allow CORS from specified origin
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
    allowedHeaders: ["Content-Type"], // Allowed headers
    exposedHeaders: "Content-Length,X-Content-Type-Options,X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset", // Exposed headers
    preflightContinue: false, // Do not continue with preflight request
    optionsSuccessStatus: 204, // Status code for successful preflight request
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
  },
});

// Increased rate limiter for the data update route
const updateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased limit for the update route
  message: "Too many requests from this IP, please try again later.",
  handler: (req, res) => {
    log.warn(`Rate limit exceeded for IP: ${req.ip}`, { page: "server.js", func: "rateLimit" });
    res.status(429).json({ error: "Too many requests from this IP, please try again later." });
  },
});

// Apply the general rate limiter to all API routes
app.use("/api", apiLimiter);

// Apply the specific rate limiter to the data update route
app.use("/data/update_toa5_data", updateLimiter);

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
const interval = 15 * 60 * 1000; // 15 minutes
// const interval = 1 * 60 * 1000; // 1 minute for testing

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

// Function to start the server
const startServer = async () => {
  try {
    // Check port availability only in development
    if (DEPLOYMENT_ENV === "development") {
      await checkPortOccupied(PORT);
    }

    // Start the server
    http.createServer(app).listen(PORT, HOST, () => {
      log.info(`Server is running on http://${HOST}:${PORT}`, { page: "server.js", func: "startServer" });
    });

    // Log server startup
    log.info(`Server started successfully at ${new Date().toISOString()}`, { page: "server.js", func: "startServer" });
  } catch (error) {
    log.error(`Failed to start server: ${error.message}`, { page: "server.js", func: "startServer" });
    process.exit(1); // Exit the process with an error code
  }
};

// Graceful shutdown handling
process.on('SIGTERM', () => {
  log.info(`Received SIGTERM, shutting down at ${new Date().toISOString()}`, { page: "server.js", func: "shutdown" });
  process.exit(0);
});

process.on('SIGINT', () => {
  log.info(`Received SIGINT, shutting down at ${new Date().toISOString()}`, { page: "server.js", func: "shutdown" });
  process.exit(0);
});

process.on('uncaughtException', (error) => {
  log.error(`Uncaught Exception: ${error.message}`, { page: "server.js", func: "uncaughtException", error });
  process.exit(1); // Optional: Shut down the server or continue running
});

process.on('unhandledRejection', (reason, promise) => {
  log.error(`Unhandled Rejection: ${reason}`, { page: "server.js", func: "unhandledRejection", reason });
  // Optional: Handle promise rejections globally
});

// Start the server
startServer();
