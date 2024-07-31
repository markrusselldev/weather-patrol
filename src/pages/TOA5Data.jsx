import { useContext, memo } from "react";
import MemoizedBreadcrumb from "../components/Breadcrumb";
import ErrorMessages from "../components/ErrorMessages";
import WeatherGrid from "../components/WeatherGrid";
import { DataContext } from "../contexts/DataContext";
import logger from "../utils/logger";
import errorHandler from "../utils/errorHandler";

const TOA5Data = () => {
  // Use DataContext to get weather data and error state
  const { columnDefs, rowData, error, sseError } = useContext(DataContext);

  // Log the current state for debugging
  logger.info("TOA5Data columnDefs:", columnDefs);
  logger.info("TOA5Data rowData:", rowData);
  logger.info("TOA5Data error:", error);
  logger.info("TOA5Data sseError:", sseError);

  // Process the error using errorHandler
  const processedError = error ? errorHandler(error) : null;

  // Function to refresh the page
  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <section className="toa5-data">
      {/* Breadcrumb with refresh button */}
      <MemoizedBreadcrumb
        title="/ TOA5 Data"
        rightContent={
          <button className="text-blue-500 hover:underline" onClick={handleRefresh}>
            Refresh
          </button>
        }
      />
      {/* Display error messages if any */}
      {processedError || sseError ? <ErrorMessages error={processedError} sseError={sseError} /> : null}
      {/* Display weather data in a grid */}
      <div className="overflow-x-auto">{rowData && columnDefs ? <WeatherGrid columnDefs={columnDefs} rowData={rowData} /> : <div>No data available</div>}</div>
    </section>
  );
};

// Memoize the component to avoid unnecessary re-renders
const MemoizedTOA5Data = memo(TOA5Data);
export default MemoizedTOA5Data;
