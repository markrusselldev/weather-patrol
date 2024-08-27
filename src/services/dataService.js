import axios from "axios";
import log from "../utils/logger";

// Define a common log context for this file
const logContext = { page: "dataService.js" };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const SSE_URL = `${API_BASE_URL}/sse`;

/**
 * Fetch all weather data from the backend
 * @returns {Promise<Object>} - The fetched weather data.
 */
export const fetchWeatherData = async () => {
  const fetchStartTime = new Date().toISOString();
  log.info({ ...logContext, func: "fetchWeatherData" }, `Starting data fetch at: ${fetchStartTime}`);

  try {
    const response = await axios.get(`${API_BASE_URL}/data`);
    
    const fetchEndTime = new Date().toISOString();
    log.info(
      { ...logContext, func: "fetchWeatherData" },
      `Fetched all weather data successfully at: ${fetchEndTime}`,
      {
        status: response.status,
        statusText: response.statusText,
        duration: `${new Date(fetchEndTime) - new Date(fetchStartTime)}ms`,
      }
    );

    // Log the structure of response data for debugging purposes
    log.debug(
      { ...logContext, func: "fetchWeatherData" },
      "Weather data structure:",
      JSON.stringify(response.data, null, 2)
    );

    return response.data; // Ensure the return structure is correct
  } catch (error) {
    log.error(
      { ...logContext, func: "fetchWeatherData" },
      `Error fetching weather data at: ${new Date().toISOString()}`,
      {
        errorMessage: error.message,
        errorResponse: error.response ? error.response.data : null,
      }
    );
    throw error;
  }
};

/**
 * Subscribe to Server-Sent Events (SSE) for real-time updates.
 * @param {function} onMessage - Callback to handle incoming messages.
 * @param {function} onError - Callback to handle errors.
 * @returns {EventSource} - The EventSource object for the SSE connection.
 */
export const subscribeToSSE = (onMessage, onError) => {
  let eventSource;

  try {
    log.debug({ ...logContext, func: "subscribeToSSE" }, "Attempting to open SSE connection at:", new Date().toISOString());
    eventSource = new EventSource(SSE_URL);

    if (!eventSource) {
      throw new Error("Failed to create EventSource instance");
    }

    eventSource.onopen = () => {
      log.info({ ...logContext, func: "subscribeToSSE" }, "SSE connection opened successfully at:", new Date().toISOString());
    };

    eventSource.onmessage = event => {
      try {
        const newData = JSON.parse(event.data);
        log.debug({ ...logContext, func: "subscribeToSSE" }, "Received new data via SSE at:", new Date().toISOString(), "Data:", newData);
        onMessage(newData);
      } catch (error) {
        log.error({ ...logContext, func: "subscribeToSSE" }, "Error parsing SSE data at:", new Date().toISOString(), {
          errorMessage: error.message,
          eventData: event.data
        });
      }
    };

    eventSource.onerror = error => {
      log.warn({ ...logContext, func: "subscribeToSSE" }, "SSE error encountered at:", new Date().toISOString(), {
        errorMessage: error.message,
        readyState: eventSource.readyState
      });

      if (eventSource.readyState === EventSource.CLOSED) {
        log.info({ ...logContext, func: "subscribeToSSE" }, "SSE connection closed.");
        onError();
      }
    };

    eventSource.onclose = () => {
      log.info({ ...logContext, func: "subscribeToSSE" }, "SSE connection closed at:", new Date().toISOString());
    };
  } catch (err) {
    log.error({ ...logContext, func: "subscribeToSSE" }, "Exception caught during SSE initialization:", err);
    onError();
  }

  return eventSource;
};
