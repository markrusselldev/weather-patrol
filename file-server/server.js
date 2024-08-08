require("dotenv").config(); // Load environment variables from .env file
const https = require("https"); // HTTPS module for creating secure server
const fs = require("fs"); // File system module for reading SSL files
const path = require("path"); // Path module for handling file paths
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

const app = express();
const PORT = process.env.PORT || 3000; // Define the port to run the server

// SSL Options
let sslOptions;
try {
  sslOptions = {
    key: fs.readFileSync(path.join(__dirname, "ssl", "localhost-key.pem")), // Read SSL key
    cert: fs.readFileSync(path.join(__dirname, "ssl", "localhost.pem")) // Read SSL certificate
  };
} catch (error) {
  log.error("Error reading SSL files:", { page: "server.js", func: "sslOptions", error });
  process.exit(1); // Exit the process if SSL files cannot be read
}

// Middleware setup
app.use(express.json()); // Parse incoming JSON requests
app.use(helmet()); // Set security-related HTTP headers
app.use(cookieParser()); // Parse cookies

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "https://localhost:5173", // Allow CORS from specified origin
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "x-api-key", "X-CSRF-TOKEN"], // Allowed headers
    exposedHeaders: "Content-Length,X-Content-Type-Options,X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset", // Exposed headers
    preflightContinue: false, // Do not continue with preflight request
    optionsSuccessStatus: 204 // Status code for successful preflight request
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.", // Message to display when limit is reached
  handler: (req, res, next) => {
    log.warn(`Rate limit exceeded for IP: ${req.ip}`, { page: "server.js", func: "rateLimit" });
    res.status(429).json({ error: "Too many requests from this IP, please try again later." });
  }
});

app.use(limiter); // Apply rate limiting middleware

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

// Start the HTTPS server
https.createServer(sslOptions, app).listen(PORT, () => {
  log.info(`Server is running on port ${PORT} with HTTPS`, { page: "server.js", func: "startServer" });
});
