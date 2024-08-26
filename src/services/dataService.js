// dataService.js
import axios from "axios";
import log from "../utils/logger";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";
const SSE_URL = `${API_BASE_URL}/sse`;

let eventSource = null;

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
      duration: `${new Date(fetchEndTime) - new Date(fetchStartTime)}ms`,
    });

    // Add detailed logs to inspect the structure of response.data
    log.debug("Weather data structure:", JSON.stringify(response.data, null, 2));

    return response.data; // Ensure the return structure is correct
  } catch (error) {
    log.error(`Error fetching weather data at: ${new Date().toISOString()}`, {
      errorMessage: error.message,
      errorResponse: error.response,
    });
    throw error;
  }
};

// Subscribe to Server-Sent Events for real-time updates
export const subscribeToSSE = (onMessage) => {
  const attemptReconnection = () => {
    log.warn("SSE connection lost, attempting to reconnect in 5 seconds...");
    setTimeout(() => {
      if (eventSource.readyState === EventSource.CLOSED) {
        log.info("Reconnecting to SSE...");
        eventSource = new EventSource(SSE_URL);
        setEventSourceHandlers(onMessage);
      }
    }, 5000); // Reconnect after 5 seconds
  };

  const setEventSourceHandlers = (onMessage) => {
    eventSource.onopen = () => {
      log.info("SSE connection opened successfully at:", new Date().toISOString());
    };

    eventSource.onmessage = (event) => {
      try {
        const newData = JSON.parse(event.data);
        log.info("Received new data via SSE at:", new Date().toISOString(), "Data:", newData);
        onMessage(newData);
      } catch (error) {
        log.error("Error parsing SSE data at:", new Date().toISOString(), {
          errorMessage: error.message,
          eventData: event.data,
        });
      }
    };

    eventSource.onerror = (error) => {
      log.error("Error with SSE at:", new Date().toISOString(), {
        errorMessage: error.message,
        readyState: eventSource.readyState,
      });

      if (eventSource.readyState === EventSource.CLOSED) {
        attemptReconnection();
      }
    };
  };

  if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
    eventSource = new EventSource(SSE_URL);
    setEventSourceHandlers(onMessage);
  }

  return eventSource;
};
