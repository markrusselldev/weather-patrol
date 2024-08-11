const log = require("./logger"); // Ensure you have the correct path to your logger module

const errorHandler = (err, req, res, next) => {
  // Enhanced logging with more detailed error context
  log.error(`Error occurred in ${req.method} ${req.url} from IP: ${req.ip}`, {
    page: "errorHandler.js",
    func: "errorHandler",
    errorName: err.name || "UnknownError",
    errorMessage: err.message || "No specific error message provided",
    stack: err.stack,
    statusCode: err.statusCode || 500,
  });

  // Set the status code to the error status code if it exists, otherwise default to 500
  const statusCode = err.statusCode || 500;

  // Determine the error message to display based on the environment
  const errorMessage =
    process.env.NODE_ENV === "production"
      ? "Something went wrong!"
      : err.message || "An unexpected error occurred";

  // Avoid sending multiple responses
  if (res.headersSent) {
    return next(err);
  }

  // Send the error response with additional details in non-production environments
  res.status(statusCode).json({
    error: errorMessage,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }), // Include stack trace in non-production environments
  });
};

module.exports = errorHandler;
