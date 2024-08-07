const log = require("./logger"); // Ensure you have the correct path to your logger module

const errorHandler = (err, req, res, next) => {
  // Adjusted the log format to ensure proper context handling
  log.error(`Error occurred in ${req.method} ${req.url} from IP: ${req.ip}`, {
    page: "errorHandler.js",
    func: "errorHandler",
    stack: err.stack
  });

  // Set the status code to the error status code if it exists, otherwise default to 500
  const statusCode = err.statusCode || 500;

  // Determine the error message to display based on the environment
  const errorMessage = process.env.NODE_ENV === "production" ? "Something went wrong!" : err.message;

  // Avoid sending multiple responses
  if (res.headersSent) {
    return next(err);
  }

  // Send the error response
  res.status(statusCode).json({ error: errorMessage });
};

module.exports = errorHandler;
