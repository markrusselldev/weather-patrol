import { useContext, useMemo } from "react";
import { DataContext } from "../contexts/DataContext";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

const useTOA5Data = () => {
  const { weatherData, error, columnDefs } = useContext(DataContext);

  // Log the current state for debugging
  useMemo(() => {
    log.info({ page: "src/hooks/useTOA5Data.js", func: "useContext" }, "TOA5Data weatherData:", weatherData);
    log.info({ page: "src/hooks/useTOA5Data.js", func: "useContext" }, "TOA5Data columnDefs:", columnDefs);
    if (error) {
      log.error({ page: "src/hooks/useTOA5Data.js", func: "useContext" }, "TOA5Data error:", error);
    }
  }, [weatherData, columnDefs, error]);

  // Process the error using errorHandler
  const processedError = error ? errorHandler(error) : null;

  return { weatherData, columnDefs, processedError };
};

export default useTOA5Data;
