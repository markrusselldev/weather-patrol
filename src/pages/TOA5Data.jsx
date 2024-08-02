import { useContext, memo } from "react";
import ErrorMessages from "../components/ErrorMessages";
import WeatherGrid from "../components/WeatherGrid";
import { DataContext } from "../contexts/DataContext";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

const TOA5Data = () => {
  // Use DataContext to get weather data and error state
  const { weatherData, error, columnDefs } = useContext(DataContext);

  // Log the current state for debugging
  log.info({ page: "TOA5Data", component: "TOA5Data", func: "useContext" }, "TOA5Data weatherData:", weatherData);
  log.info({ page: "TOA5Data", component: "TOA5Data", func: "useContext" }, "TOA5Data columnDefs:", columnDefs);
  log.info({ page: "TOA5Data", component: "TOA5Data", func: "useContext" }, "TOA5Data error:", error);

  // Process the error using errorHandler
  const processedError = error ? errorHandler(error) : null;

  return (
    <section className="toa5-data">
      {/* Display error messages if any */}
      {processedError ? <ErrorMessages message={processedError} /> : null}
      {/* Display weather data in a grid */}
      <div className="overflow-x-auto">{weatherData && columnDefs ? <WeatherGrid columnDefs={columnDefs} rowData={weatherData} /> : <div>No data available</div>}</div>
    </section>
  );
};

// Memoize the component to avoid unnecessary re-renders
const MemoizedTOA5Data = memo(TOA5Data);
export default MemoizedTOA5Data;
