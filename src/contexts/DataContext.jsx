import { createContext, useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { fetchWeatherData, subscribeToSSE } from "../services/dataService";
import log from "../utils/logger";

// Create the DataContext
export const DataContext = createContext();

/**
 * Fetches initial weather data and sets the state accordingly.
 * @param {function} setWeatherData - Function to update weather data state.
 * @param {function} setColumnDefs - Function to update column definitions state.
 * @param {function} setLatestTimestamp - Function to update latest timestamp state.
 * @param {function} setEnvironmentInfo - Function to update environment info state.
 * @param {object} processedTimestampsRef - Ref to store processed timestamps.
 * @param {function} setError - Function to update error state.
 */
const fetchInitialData = async (setWeatherData, setColumnDefs, setLatestTimestamp, setEnvironmentInfo, processedTimestampsRef, setError) => {
  try {
    const data = await fetchWeatherData();
    if (data?.data?.rows) {
      const headers = data.data.rows.length > 1 ? Object.keys(data.data.rows[1]) : [];
      const columnDefs = headers.map(header => ({ headerName: header, field: header }));
      setWeatherData(data.data.rows);
      setColumnDefs(columnDefs);
      const initialTimestamp = data.data.rows[0]?.TIMESTAMP || null;
      setLatestTimestamp(initialTimestamp);
      setEnvironmentInfo(data.environmentInfo || "Unknown");

      // Track initial timestamps to avoid duplicates
      data.data.rows.forEach(row => processedTimestampsRef.current.add(row.TIMESTAMP));

      log.info({ page: "DataContext", component: "DataProvider", func: "fetchInitialData" }, "Initial weather data fetched:", data.data.rows);
      log.info({ page: "DataContext", component: "DataProvider", func: "fetchInitialData" }, "Initial latest timestamp set:", initialTimestamp);
    } else {
      log.warn({ page: "DataContext", component: "DataProvider", func: "fetchInitialData" }, "No data found in the initial fetch");
    }
  } catch (err) {
    setError(err);
    log.error({ page: "DataContext", component: "DataProvider", func: "fetchInitialData" }, "Error fetching initial weather data:", err);
  }
};

/**
 * Initializes SSE connection and updates state with real-time data.
 * @param {function} setWeatherData - Function to update weather data state.
 * @param {function} setLatestTimestamp - Function to update latest timestamp state.
 * @param {object} processedTimestampsRef - Ref to store processed timestamps.
 * @param {function} setError - Function to update error state.
 */
const initializeSSE = (setWeatherData, setLatestTimestamp, processedTimestampsRef, setError) => {
  const eventSource = subscribeToSSE(newData => {
    if (!newData.TIMESTAMP) {
      log.warn({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Malformed data received via SSE:", newData);
      return;
    }

    if (processedTimestampsRef.current.has(newData.TIMESTAMP)) {
      log.warn({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Duplicate data received via SSE:", newData);
      return;
    }

    log.debug({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Processing new data via SSE:", newData);

    setWeatherData(prevData => {
      const updatedData = [newData, ...prevData];
      setLatestTimestamp(newData.TIMESTAMP);
      processedTimestampsRef.current.add(newData.TIMESTAMP);

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

  return eventSource;
};

export const DataProvider = ({ children }) => {
  const [weatherData, setWeatherData] = useState([]);
  const [columnDefs, setColumnDefs] = useState([]);
  const [error, setError] = useState(null);
  const [latestTimestamp, setLatestTimestamp] = useState(null);
  const [environmentInfo, setEnvironmentInfo] = useState("Unknown");
  const eventSourceRef = useRef(null);
  const processedTimestampsRef = useRef(new Set());

  // Fetch initial weather data on mount
  useEffect(() => {
    fetchInitialData(setWeatherData, setColumnDefs, setLatestTimestamp, setEnvironmentInfo, processedTimestampsRef, setError);
  }, []);

  // Subscribe to SSE for real-time updates
  useEffect(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    eventSourceRef.current = initializeSSE(setWeatherData, setLatestTimestamp, processedTimestampsRef, setError);

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      weatherData,
      columnDefs,
      error,
      latestTimestamp,
      environmentInfo
    }),
    [weatherData, columnDefs, error, latestTimestamp, environmentInfo]
  );

  // Log updates to latestTimestamp
  useEffect(() => {
    if (latestTimestamp) {
      log.info({ page: "DataContext", component: "DataProvider", func: "useEffect" }, "latestTimestamp updated:", latestTimestamp);
    }
  }, [latestTimestamp]);

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

// Define prop types for the component
DataProvider.propTypes = {
  children: PropTypes.node.isRequired
};
