import { createContext, useState, useEffect, useCallback, useRef } from "react";
import PropTypes from "prop-types";
import { getAllWeatherData } from "../api";
import { debounce } from "lodash";
import { formatTimestamp } from "../utils/utils";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

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

  // Function to fetch initial data from the API with retry logic
  const fetchDataWithRetry = useCallback(async (retries = 3, delay = 5000) => {
    for (let i = 0; i < retries; i++) {
      try {
        log.info("Fetching initial data from API...");
        const response = await getAllWeatherData();
        log.info("API response:", response);

        // Ensure response structure is as expected
        if (response && typeof response === "object" && response.environmentInfo && response.data && (Array.isArray(response.data.headers) || typeof response.data.headers === "string") && Array.isArray(response.data.rows)) {
          log.info("API response structure is valid");

          // Extract environment info and data rows from the response
          const { environmentInfo, data } = response;
          let { headers, rows } = data;

          // Convert headers to array if it's a string
          if (typeof headers === "string") {
            headers = headers.split(",");
          }

          log.info("Extracted environmentInfo:", environmentInfo);
          log.info("Extracted headers:", headers);
          log.info("Extracted rows:", rows);

          // Update environment info state
          setEnvironmentInfo(environmentInfo || "Default environment info");

          // Validate headers and rows
          if (headers.length > 0 && rows.length > 0) {
            log.info("Valid headers and rows found");

            const columns = headers.map(key => ({
              headerName: key,
              field: key,
              sortable: true,
              filter: true,
              valueFormatter: key === "TIMESTAMP" ? ({ value }) => formatTimestamp(value) : undefined
            }));

            log.info("Generated columnDefs:", columns);
            setColumnDefs(columns);

            // Transform rows to match headers
            const transformedRows = rows.map(row => {
              const rowObj = {};
              headers.forEach((header, index) => {
                rowObj[header] = row[index];
              });
              return rowObj;
            });

            log.info("Transformed rows:", transformedRows);
            setRowData(transformedRows);

            // Set the latest timestamp
            const latestRow = transformedRows[0];
            if (latestRow && latestRow.TIMESTAMP) {
              setLatestTimestamp(formatTimestamp(latestRow.TIMESTAMP));
            }
            return; // Exit if fetchData is successful
          } else {
            log.error("No valid headers or rows in API response", response);
            setError("No valid headers or rows in API response");
            break;
          }
        } else {
          log.error("API response does not contain expected structure", response);
          setError("API response does not contain expected structure");
          break;
        }
      } catch (error) {
        log.error("Error fetching data from API:", errorHandler(error));
        if (i < retries - 1) {
          log.warn(`Retrying fetchData (${i + 1}/${retries})...`);
          await new Promise(res => setTimeout(res, delay)); // Wait before retrying
        } else {
          log.error("Error fetching data after retries");
          setError("Error fetching data after retries");
        }
      }
    }
  }, []);

  // Function to set up Server-Sent Events (SSE) for real-time updates
  const setupSSE = useCallback(() => {
    if (sseInitialized.current) {
      log.info("SSE already initialized, skipping setup.");
      return; // Prevent duplicate SSE setup
    }
    sseInitialized.current = true; // Mark SSE as initialized

    log.info("Setting up SSE connection...");
    const eventSource = new EventSource("/api/sse", { withCredentials: true });

    // Handle incoming SSE messages with a debounce to limit update frequency
    const handleMessage = debounce(event => {
      const newData = JSON.parse(event.data);
      log.info("New data received from SSE:", newData);

      // Validate newData structure
      if (newData && typeof newData === "object" && newData.TIMESTAMP) {
        setRowData(prevData => {
          if (!prevData.some(row => row.TIMESTAMP === newData.TIMESTAMP)) {
            log.info("Updating weather data with new record:", newData);
            const updatedData = [newData, ...prevData];
            log.info("RowData after SSE update:", updatedData);
            return updatedData;
          }
          log.info("New data is identical to an existing record, not updating state");
          return prevData;
        });

        // Update the latest timestamp
        setLatestTimestamp(formatTimestamp(newData.TIMESTAMP));
      } else {
        log.error("Invalid data structure received from SSE", newData);
      }
    }, 300);

    eventSource.onmessage = handleMessage;

    eventSource.onerror = function () {
      log.error("Error connecting to the server via SSE");
      setSseError(true);
      eventSource.close();
      setTimeout(() => {
        log.info("Reconnecting SSE after error...");
        setupSSE();
      }, 5000);
    };

    eventSource.onopen = function () {
      log.info("SSE connection opened");
      setSseError(false);
    };

    return () => {
      log.info("Closing SSE connection...");
      eventSource.close();
      handleMessage.cancel();
    };
  }, [setRowData, setSseError]);

  // Fetch initial data and set up SSE on component mount
  useEffect(() => {
    fetchDataWithRetry();
    setupSSE();
  }, [fetchDataWithRetry, setupSSE]);

  return <DataContext.Provider value={{ columnDefs, rowData, environmentInfo, latestTimestamp, error, sseError }}>{children}</DataContext.Provider>;
};

DataProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { DataContext, DataProvider };
