/**
 * This script is used to test the rate limiting functionality of the TOA5 File Server.
 *
 * In order to effectively test the rate limiter, it is necessary to temporarily lower
 * the `max` value of the rate limiter in the `server.js` file from its normal setting
 * (e.g., 100 requests per 15 minutes) to a much lower value (e.g., 5 requests per
 * 15 minutes). This change allows us to quickly reach the rate limit and verify that
 * the server responds with a 429 status code ("Too many requests from this IP,
 * please try again later.") once the limit is exceeded.
 *
 * Steps to test the rate limiting:
 * 1. In `server.js`, update the rate limiter configuration to:
 *
 *    const limiter = rateLimit({
 *      windowMs: 15 * 60 * 1000, // 15 minutes
 *      max: 5, // limit each IP to 5 requests per windowMs
 *      message: "Too many requests from this IP, please try again later."
 *    });
 *
 * 2. Run the server with the updated rate limiter configuration.
 * 3. Execute this script to make multiple requests to the server: $ node testRateLimit.js
 * 4. Observe the console output for the expected responses, including successful
 *    responses and 429 status code responses once the limit is exceeded.
 *
 * After testing, remember to revert the rate limiter configuration in `server.js`
 * to its original value (e.g., 100 requests per 15 minutes).
 */

const axios = require("axios");
const https = require("https");
const log = require("./utils/logger"); // Include the custom logger

const logContext = { page: "testRateLimit.js", func: "makeRequests" };

// Custom HTTPS agent to accept self-signed certificates
const httpsAgent = new https.Agent({
  rejectUnauthorized: false // Accept self-signed certificates
});

// Function to make multiple requests to the server
const makeRequests = async () => {
  for (let i = 0; i < 20; i++) {
    // Adjust the number of requests as needed
    try {
      const response = await axios.get("https://localhost:3000/api/latest", {
        headers: {
          "x-api-key": "secret_api_key" // Use the correct header name and actual API key
        },
        httpsAgent // Use the custom HTTPS agent
      });
      log.info(`Response data: ${JSON.stringify(response.data)}`, logContext);
    } catch (error) {
      if (error.response) {
        log.error(`Status: ${error.response.status}, Message: ${JSON.stringify(error.response.data)}`, { ...logContext });
      } else {
        log.error(error.message, { ...logContext });
      }
    }
  }
};

// Execute the function to make requests
makeRequests();
