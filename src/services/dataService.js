import axios from "axios";
import log from "../utils/logger";

// Define a common log context for this file
const logContext = { page: "dataService.js" };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const SSE_URL = `${API_BASE_URL}/sse`;

// Fetch all weather data from the backend
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
        duration: `${new Date(fetchEndTime) - new Date(fetchStartTime)}ms`
      }
    );

    // Add detailed logs to inspect the structure of response.data
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
        errorResponse: error.response
      }
    );
    throw error;
  }
};

// Subscribe to Server-Sent Events for real-time updates with exponential backoff
export const subscribeToSSE = (onMessage, onError, maxRetries = 5, baseDelay = 1000) => {
  let retryCount = 0;
  let eventSource;

  const connect = () => {
    log.info({ ...logContext, func: "subscribeToSSE" }, "Opening SSE connection at:", new Date().toISOString());
    eventSource = new EventSource(SSE_URL);

    eventSource.onopen = () => {
      log.info({ ...logContext, func: "subscribeToSSE" }, "SSE connection opened successfully at:", new Date().toISOString());
      retryCount = 0; // Reset retry count on successful connection
    };

    eventSource.onmessage = event => {
      try {
        const newData = JSON.parse(event.data);
        log.info({ ...logContext, func: "subscribeToSSE" }, "Received new data via SSE at:", new Date().toISOString(), "Data:", newData);
        onMessage(newData);
      } catch (error) {
        log.error({ ...logContext, func: "subscribeToSSE" }, "Error parsing SSE data at:", new Date().toISOString(), {
          errorMessage: error.message,
          eventData: event.data
        });
      }
    };

    eventSource.onerror = error => {
      log.error({ ...logContext, func: "subscribeToSSE" }, "Error with SSE at:", new Date().toISOString(), {
        errorMessage: error.message,
        readyState: eventSource.readyState
      });

      if (eventSource.readyState === EventSource.CLOSED) {
        retryCount += 1;

        if (retryCount <= maxRetries) {
          const delay = baseDelay * 2 ** (retryCount - 1); // Exponential backoff
          log.info({ ...logContext, func: "subscribeToSSE" }, `Retrying SSE connection in ${delay}ms (attempt ${retryCount} of ${maxRetries})`);
          setTimeout(connect, delay);
        } else {
          log.error({ ...logContext, func: "subscribeToSSE" }, "Max SSE retries reached. Falling back to polling.");
          onError();
        }
      }
    };

    return eventSource;
  };

  // Introduce a small delay before first connect
  setTimeout(() => {
    eventSource = connect();
  }, 500); // 500ms delay before attempting initial SSE connection

  return eventSource;
};
