import { createContext, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { fetchWeatherData, subscribeToSSE } from "../services/dataService";
import log from "../utils/logger";

// Create the DataContext
export const DataContext = createContext();

export const DataProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [error, setError] = useState(null);
  const [latestTimestamp, setLatestTimestamp] = useState(null);
  const [environmentInfo, setEnvironmentInfo] = useState("Unknown"); // Add environmentInfo state
  const eventSourceRef = useRef(null);

  // Fetch initial weather data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchWeatherData();
        if (data && data.data && data.data.rows) {
          const headers = data.data.rows.length > 1 ? Object.keys(data.data.rows[1]) : [];
          const columnDefs = headers.map(header => ({ headerName: header, field: header }));
          setWeatherData(data.data.rows);
          setColumnDefs(columnDefs);
          const initialTimestamp = data.data.rows[0]?.TIMESTAMP || null;
          setLatestTimestamp(initialTimestamp);
          setEnvironmentInfo(data.environmentInfo || "Unknown"); // Set environment info from response
          log.info({ page: "DataContext", component: "DataProvider", func: "fetchData" }, "Initial weather data fetched:", data.data.rows);
          log.info({ page: "DataContext", component: "DataProvider", func: "fetchData" }, "Initial latest timestamp set:", initialTimestamp);
        } else {
          log.warn({ page: "DataContext", component: "DataProvider", func: "fetchData" }, "No data found in the initial fetch");
        }
      } catch (err) {
        setError(err);
        log.error({ page: "DataContext", component: "DataProvider", func: "fetchData" }, "Error fetching initial weather data:", err);
      }
    };
    fetchData();
  }, []);

  // Subscribe to SSE for real-time updates
  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    const eventSource = subscribeToSSE(newData => {
      setWeatherData(prevData => {
        // Ensure the data has a TIMESTAMP to avoid malformed data
        if (!newData.TIMESTAMP) {
          log.warn({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Malformed data received via SSE:", newData);
          return prevData;
        }

        // Check if the new data is already in the list to avoid duplicates
        const isDuplicate = prevData.some(data => data.TIMESTAMP === newData.TIMESTAMP);
        if (isDuplicate) {
          log.warn({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Duplicate data received via SSE:", newData);
          return prevData;
        }

        const updatedData = [newData, ...prevData];
        setLatestTimestamp(newData.TIMESTAMP);
        log.info({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Updated weather data with SSE:", newData);
        log.info({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Updated latest timestamp with SSE:", newData.TIMESTAMP);
        log.debug({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "New weatherData array:", updatedData);
        return updatedData;
      });
    });

    eventSource.onerror = err => {
      setError(err);
      log.error({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "SSE error:", err);
    };

    eventSourceRef.current = eventSource;

    return () => {
      eventSource.close();
    };
  }, []);

  // Log updates to latestTimestamp
  useEffect(() => {
    if (latestTimestamp) {
      log.info({ page: "DataContext", component: "DataProvider", func: "useEffect" }, "latestTimestamp updated:", latestTimestamp);
    }
  }, [latestTimestamp]);

  return <DataContext.Provider value={{ weatherData, columnDefs, error, latestTimestamp, environmentInfo }}>{children}</DataContext.Provider>;
};

// Define prop types for the component
DataProvider.propTypes = {
  children: PropTypes.node.isRequired
};
