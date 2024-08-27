import { useContext, useEffect, useMemo } from "react";
import { DataContext } from "../contexts/DataContext";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

const useTOA5Data = () => {
  const { weatherData, error, columnDefs, dataLoaded } = useContext(DataContext); // Access dataLoaded from context

  // Memoize log context to avoid unnecessary re-renders
  const logContext = useMemo(() => ({ page: "src/hooks/useTOA5Data.js", func: "useContext" }), []);

  // Log the current state for debugging
  useEffect(() => {
    if (!dataLoaded) {
      log.info(logContext, "Data is not yet loaded. Hook execution paused.");
      return;
    }

    const startTime = new Date().toISOString();
    log.info({ ...logContext, startTime }, "TOA5Data weatherData:", weatherData);
    log.info({ ...logContext, startTime }, "TOA5Data columnDefs:", columnDefs);
    if (error) {
      log.error({ ...logContext, startTime }, "TOA5Data error:", error);
    }
  }, [weatherData, columnDefs, error, logContext, dataLoaded]);

  // Process the error using errorHandler
  const processedError = error ? errorHandler(error) : null;

  return { weatherData, columnDefs, processedError };
};

export default useTOA5Data;
