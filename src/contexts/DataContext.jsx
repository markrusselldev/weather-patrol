import { createContext, useState, useEffect, useRef, useMemo } from "react";
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
  const [environmentInfo, setEnvironmentInfo] = useState("Unknown");
  const eventSourceRef = useRef(null);
  const timestampsRef = useRef(new Set()); // Set to track existing timestamps
  const initialFetchRef = useRef(true); // Flag to indicate initial fetch

  // Fetch initial weather data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchWeatherData();
        if (data?.data?.rows) {
          const headers = data.data.rows.length > 1 ? Object.keys(data.data.rows[1]) : [];
          const columnDefs = headers.map(header => ({ headerName: header, field: header }));
          setWeatherData(data.data.rows);
          setColumnDefs(columnDefs);

          const initialTimestamp = data.data.rows[0]?.TIMESTAMP || null;
          setLatestTimestamp(initialTimestamp);

          // Reset and populate the timestamps Set with initial data
          timestampsRef.current.clear();
          data.data.rows.forEach(row => {
            timestampsRef.current.add(row.TIMESTAMP);
          });

          setEnvironmentInfo(data.environmentInfo || "Unknown");
          log.info({ page: "DataContext", component: "DataProvider", func: "fetchData" }, "Initial weather data fetched:", data.data.rows);
          log.info({ page: "DataContext", component: "DataProvider", func: "fetchData" }, "Initial latest timestamp set:", initialTimestamp);
        } else {
          log.warn({ page: "DataContext", component: "DataProvider", func: "fetchData" }, "No data found in the initial fetch");
        }
      } catch (err) {
        setError(err);
        log.error({ page: "DataContext", component: "DataProvider", func: "fetchData" }, "Error fetching initial weather data:", err);
      } finally {
        initialFetchRef.current = false; // Indicate that initial fetch is complete
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
        if (!newData.TIMESTAMP) {
          log.warn({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Malformed data received via SSE:", newData);
          return prevData;
        }

        // Skip processing if initial fetch is still ongoing
        if (initialFetchRef.current) {
          return prevData;
        }

        if (timestampsRef.current.has(newData.TIMESTAMP)) {
          log.warn({ page: "DataContext", component: "DataProvider", func: "subscribeToSSE" }, "Duplicate data received via SSE:", newData);
          return prevData;
        }

        timestampsRef.current.add(newData.TIMESTAMP);
        setLatestTimestamp(newData.TIMESTAMP);
        const updatedData = [newData, ...prevData];

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
  }, []); // Remove latestTimestamp dependency

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
