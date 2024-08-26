// dataService.js
import axios from "axios";
import log from "../utils/logger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const SSE_URL = `${API_BASE_URL}/sse`;

// Fetch all weather data from the backend
export const fetchWeatherData = async () => {
  const fetchStartTime = new Date().toISOString();
  log.info(`Starting data fetch at: ${fetchStartTime}`);

  try {
    const response = await axios.get(`${API_BASE_URL}/data`);

    const fetchEndTime = new Date().toISOString();
    log.info(`Fetched all weather data successfully at: ${fetchEndTime}`, {
      status: response.status,
      statusText: response.statusText,
      duration: `${new Date(fetchEndTime) - new Date(fetchStartTime)}ms`
    });

    // Add detailed logs to inspect the structure of response.data
    log.debug("Weather data structure:", JSON.stringify(response.data, null, 2));

    return response.data; // Ensure the return structure is correct
  } catch (error) {
    log.error(`Error fetching weather data at: ${new Date().toISOString()}`, {
      errorMessage: error.message,
      errorResponse: error.response
    });
    throw error;
  }
};

// Subscribe to Server-Sent Events for real-time updates with exponential backoff
export const subscribeToSSE = (onMessage, onError, maxRetries = 5, baseDelay = 1000) => {
  let retryCount = 0;
  let eventSource;

  const connect = () => {
    log.info("Opening SSE connection at:", new Date().toISOString());
    eventSource = new EventSource(SSE_URL);

    eventSource.onopen = () => {
      log.info("SSE connection opened successfully at:", new Date().toISOString());
      retryCount = 0; // Reset retry count on successful connection
    };

    eventSource.onmessage = event => {
      try {
        const newData = JSON.parse(event.data);
        log.info("Received new data via SSE at:", new Date().toISOString(), "Data:", newData);
        onMessage(newData);
      } catch (error) {
        log.error("Error parsing SSE data at:", new Date().toISOString(), {
          errorMessage: error.message,
          eventData: event.data
        });
      }
    };

    eventSource.onerror = error => {
      log.error("Error with SSE at:", new Date().toISOString(), {
        errorMessage: error.message,
        readyState: eventSource.readyState
      });

      if (eventSource.readyState === EventSource.CLOSED) {
        retryCount += 1;

        if (retryCount <= maxRetries) {
          const delay = baseDelay * 2 ** (retryCount - 1); // Exponential backoff
          log.info(`Retrying SSE connection in ${delay}ms (attempt ${retryCount} of ${maxRetries})`);
          setTimeout(connect, delay);
        } else {
          log.error("Max SSE retries reached. Falling back to polling.", {
            page: "dataService.js",
            func: "subscribeToSSE"
          });
          onError();
        }
      }
    };

    return eventSource;
  };

  return connect();
};
