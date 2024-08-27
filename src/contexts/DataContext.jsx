import { createContext, useState, useEffect, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { fetchWeatherData, subscribeToSSE } from "../services/dataService";
import log from "../utils/logger";

// Create the DataContext
export const DataContext = createContext();

// Common log context for all log messages
const logContext = { page: "DataContext.js", component: "DataProvider" };

/**
 * Fetches initial weather data and sets the state accordingly.
 * @param {function} setWeatherData - Function to update weather data state.
 * @param {function} setColumnDefs - Function to update column definitions state.
 * @param {function} setLatestTimestamp - Function to update latest timestamp state.
 * @param {function} setEnvironmentInfo - Function to update environment info state.
 * @param {object} processedTimestampsRef - Ref to store processed timestamps.
 * @param {function} setError - Function to update error state.
 */
const fetchInitialData = async (
  setWeatherData,
  setColumnDefs,
  setLatestTimestamp,
  setEnvironmentInfo,
  processedTimestampsRef,
  setError
) => {
  try {
    const data = await fetchWeatherData();
    if (data?.data?.rows) {
      // Set column definitions based on the headers from the fetched data
      const headers = data.data.rows.length > 1 ? Object.keys(data.data.rows[1]) : [];
      const columnDefs = headers.map(header => ({ headerName: header, field: header }));
      setWeatherData(data.data.rows);
      setColumnDefs(columnDefs);
      const initialTimestamp = data.data.rows[0]?.TIMESTAMP || null;
      setLatestTimestamp(initialTimestamp);
      setEnvironmentInfo(data.environmentInfo || "Unknown");

      // Track initial timestamps to avoid duplicates
      data.data.rows.forEach(row => processedTimestampsRef.current.add(row.TIMESTAMP));

      log.info({ ...logContext, func: "fetchInitialData" }, "Initial weather data fetched:", data.data.rows);
      log.info({ ...logContext, func: "fetchInitialData" }, "Initial latest timestamp set:", initialTimestamp);
    } else {
      log.warn({ ...logContext, func: "fetchInitialData" }, "No data found in the initial fetch");
    }
  } catch (err) {
    setError(err);
    log.error({ ...logContext, func: "fetchInitialData" }, "Error fetching initial weather data:", err);
    throw err; // Propagate the error to ensure the SSE is not started if fetching fails
  }
};

/**
 * Initializes SSE connection and updates state with real-time data.
 * @param {function} setWeatherData - Function to update weather data state.
 * @param {function} setLatestTimestamp - Function to update latest timestamp state.
 * @param {object} processedTimestampsRef - Ref to store processed timestamps.
 * @param {function} setError - Function to update error state.
 * @returns {EventSource} - The EventSource object for SSE connection.
 */
const initializeSSE = (
  setWeatherData,
  setLatestTimestamp,
  processedTimestampsRef,
  setError
) => {
  let eventSource = subscribeToSSE(
    newData => {
      // Validate the incoming data from SSE
      if (!newData.TIMESTAMP) {
        log.warn({ ...logContext, func: "subscribeToSSE" }, "Malformed data received via SSE:", newData);
        return;
      }

      // Check for duplicate data based on timestamp
      if (processedTimestampsRef.current.has(newData.TIMESTAMP)) {
        log.warn({ ...logContext, func: "subscribeToSSE" }, "Duplicate data received via SSE:", newData);
        return;
      }

      log.debug({ ...logContext, func: "subscribeToSSE" }, "Processing new data via SSE:", newData);

      setWeatherData(prevData => {
        const updatedData = [newData, ...prevData];
        setLatestTimestamp(newData.TIMESTAMP);
        processedTimestampsRef.current.add(newData.TIMESTAMP);

        log.info({ ...logContext, func: "subscribeToSSE" }, "Updated weather data with SSE:", newData);
        return updatedData;
      });
    },
    () => {
      log.warn({ ...logContext, func: "subscribeToSSE" }, "SSE connection encountered an issue.");
      setError(new Error("SSE connection failed"));
    }
  );

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
  const [dataLoaded, setDataLoaded] = useState(false);

  // Fetch initial weather data on mount
  useEffect(() => {
    (async () => {
      try {
        await fetchInitialData(
          setWeatherData,
          setColumnDefs,
          setLatestTimestamp,
          setEnvironmentInfo,
          processedTimestampsRef,
          setError
        );
        setDataLoaded(true); // Set the flag to true once data is successfully loaded
      } catch (error) {
        log.error({ ...logContext, func: "useEffect" }, "Failed to load initial data. SSE will not be started.", error);
      }
    })();
  }, []);

  // Establish SSE connection only after data is loaded
  useEffect(() => {
    if (dataLoaded && !eventSourceRef.current) {
      if (shouldEstablishSSEConnection()) {
        eventSourceRef.current = initializeSSE(
          setWeatherData,
          setLatestTimestamp,
          processedTimestampsRef,
          setError
        );
      } else {
        log.info({ ...logContext, func: "useEffect" }, "Skipping SSE connection due to fresh cache.");
      }
    }

    // Cleanup eventSource on unmount
    return () => {
      if (eventSourceRef.current) {
        log.info({ ...logContext, func: "useEffect cleanup" }, "Closing SSE connection at:", new Date().toISOString());
        eventSourceRef.current.close();
        eventSourceRef.current = null; // Ensure it is nullified
      }
    };
  }, [dataLoaded]); // Ensures useEffect only re-runs if dataLoaded changes

  // Placeholder for your caching logic
  const shouldEstablishSSEConnection = () => {
    // Implement your caching check here
    return true;
  };

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      weatherData,
      columnDefs,
      error,
      latestTimestamp,
      environmentInfo,
      dataLoaded, // Expose dataLoaded so other components can use it
    }),
    [weatherData, columnDefs, error, latestTimestamp, environmentInfo, dataLoaded]
  );

  // Log updates to latestTimestamp
  useEffect(() => {
    if (latestTimestamp) {
      log.info({ ...logContext, func: "useEffect" }, "latestTimestamp updated:", latestTimestamp);
    }
  }, [latestTimestamp]);

  return <DataContext.Provider value={contextValue}>{children}</DataContext.Provider>;
};

// Define prop types for the component
DataProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
