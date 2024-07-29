import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { getAllWeatherData } from "../api";
import { debounce } from "lodash";
import { formatTimestamp } from "../utils/utils";

// Create a context for sharing data
const DataContext = createContext();

const DataProvider = ({ children }) => {
  // State variables for storing column definitions, row data, environment info, and error states
  const [columnDefs, setColumnDefs] = useState([]);
  const [rowData, setRowData] = useState([]);
  const [environmentInfo, setEnvironmentInfo] = useState("Default environment info");
  const [latestTimestamp, setLatestTimestamp] = useState(null); // State for the latest timestamp
  const [error, setError] = useState(null);
  const [sseError, setSseError] = useState(false);

  // Ref to ensure SSE is only initialized once
  const sseInitialized = useRef(false);

  // Function to fetch initial data from the API
  const fetchData = useCallback(async () => {
    try {
      console.log("Fetching initial data from API...");
      const response = await getAllWeatherData();
      console.log("API response:", response);

      // Extract environment info and data rows from the response
      const { environmentInfo, data } = response;
      const { headers, rows } = data;

      console.log("Extracted environmentInfo:", environmentInfo);
      console.log("Headers:", headers); // Log headers
      console.log("Rows:", rows); // Log rows

      // Update environment info state
      if (environmentInfo) {
        setEnvironmentInfo(environmentInfo);
      } else {
        console.log("No environmentInfo in the response");
      }

      // Check if headers and rows exist and update state accordingly
      if (Array.isArray(headers) && headers.length > 0 && Array.isArray(rows) && rows.length > 0) {
        console.log("Initial data fetched:", rows);
        const columns = headers.map(key => ({
          headerName: key,
          field: key,
          sortable: true,
          filter: true,
          valueFormatter: key === "TIMESTAMP" ? ({ value }) => formatTimestamp(value) : undefined
        }));
        console.log("Generated columnDefs:", columns); // Log the generated column definitions
        setColumnDefs(columns);
        setRowData(rows);

        // Set the latest timestamp
        const latestRow = rows[0];
        if (latestRow && latestRow.TIMESTAMP) {
          setLatestTimestamp(formatTimestamp(latestRow.TIMESTAMP));
        }
      } else {
        console.error("No data available or headers missing from API");
        setError("No data available or headers missing from API");
      }
    } catch (error) {
      console.error("Error fetching data from API:", error);
      setError("Error fetching data");
    }
  }, []);

  // Function to set up Server-Sent Events (SSE) for real-time updates
  const setupSSE = useCallback(() => {
    if (sseInitialized.current) {
      console.log("SSE already initialized, skipping setup.");
      return; // Prevent duplicate SSE setup
    }
    sseInitialized.current = true; // Mark SSE as initialized

    console.log("Setting up SSE connection...");
    const eventSource = new EventSource("https://localhost:3000/api/sse", { withCredentials: true });

    // Handle incoming SSE messages with a debounce to limit update frequency
    const handleMessage = debounce(event => {
      const newData = JSON.parse(event.data);
      console.log("New data received from SSE:", newData);
      setRowData(prevData => {
        if (!prevData.some(row => row.TIMESTAMP === newData.TIMESTAMP)) {
          console.log("Updating weather data with new record:", newData);
          return [newData, ...prevData];
        }
        console.log("New data is identical to an existing record, not updating state");
        return prevData;
      });

      // Update the latest timestamp
      if (newData && newData.TIMESTAMP) {
        setLatestTimestamp(formatTimestamp(newData.TIMESTAMP));
      }
    }, 300);

    eventSource.onmessage = handleMessage;

    eventSource.onerror = function () {
      console.error("Error connecting to the server via SSE");
      setSseError(true);
      eventSource.close();
      setTimeout(() => {
        console.log("Reconnecting SSE after error...");
        setupSSE();
      }, 5000);
    };

    eventSource.onopen = function () {
      console.log("SSE connection opened");
      setSseError(false);
    };

    return () => {
      console.log("Closing SSE connection...");
      eventSource.close();
      handleMessage.cancel();
    };
  }, [setRowData, setSseError]);

  // Fetch initial data and set up SSE on component mount
  useEffect(() => {
    fetchData();
    setupSSE();
  }, [fetchData, setupSSE]);

  return <DataContext.Provider value={{ columnDefs, rowData, environmentInfo, latestTimestamp, error, sseError }}>{children}</DataContext.Provider>;
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { DataContext, DataProvider };
