import axios from "axios";
import log from "../utils/logger";

const API_BASE_URL = "https://localhost:3000/api"; // Ensure this matches your backend URL
const SSE_URL = `${API_BASE_URL}/sse`;

// Fetch all weather data from the backend
export const fetchWeatherData = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/data`, {
      headers: {
        "x-api-key": import.meta.env.VITE_API_KEY // Use Vite's way to access environment variables
      },
      withCredentials: true // Ensure cookies are included
    });
    log.info("Fetched all weather data:", response.data);

    // Add detailed logs to inspect the structure of response.data
    log.debug("Weather data structure:", JSON.stringify(response.data, null, 2));

    return response.data; // Ensure the return structure is correct
  } catch (error) {
    log.error("Error fetching weather data:", error);
    throw error;
  }
};

// Subscribe to Server-Sent Events for real-time updates
export const subscribeToSSE = onMessage => {
  const eventSource = new EventSource(SSE_URL, { withCredentials: true });
  eventSource.onopen = () => {
    log.info("SSE connection opened");
  };
  eventSource.onmessage = event => {
    try {
      const newData = JSON.parse(event.data);
      log.info("Received new data via SSE:", newData);
      onMessage(newData);
    } catch (error) {
      log.error("Error parsing SSE data:", error);
    }
  };
  eventSource.onerror = error => {
    log.error("Error with SSE:", error);
  };
  return eventSource;
};
