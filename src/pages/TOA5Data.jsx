import { memo } from "react";
import ErrorMessages from "../components/ErrorMessages";
import LazyWeatherGrid from "../components/LazyWeatherGrid";
import useTOA5Data from "../hooks/useTOA5Data";
import log from "../utils/logger";
import { FaSpinner } from "react-icons/fa";

const TOA5Data = () => {
  const { weatherData, columnDefs, processedError } = useTOA5Data();

  // Define log context
  const logContext = { page: "TOA5Data.jsx", component: "TOA5Data", func: "render" };

  // Determine loading state directly from the hook values
  const loading = !(weatherData && weatherData.length > 0) && !processedError;

  // Log the initial state of weatherData and processedError
  log.debug({ ...logContext }, "Initial weatherData:", weatherData);
  log.debug({ ...logContext }, "Initial processedError:", processedError);

  // Handle errors
  if (processedError) {
    log.error({ ...logContext }, "Error in TOA5Data component:", processedError);
    log.debug({ ...logContext }, "weatherData at error:", weatherData);
    log.debug({ ...logContext }, "columnDefs at error:", columnDefs);
    return <ErrorMessages message={processedError} />;
  }

  log.info({ ...logContext }, "TOA5Data component rendered successfully.", {
    weatherDataLength: weatherData ? weatherData.length : 0,
    columnDefsLength: columnDefs.length,
  });

  return (
    <section className="toa5-data">
      {/* Main content area */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="absolute top-1/2 transform -translate-y-1/2">
            <FaSpinner className="animate-spin text-8xl text-gray-300" />
          </div>
        </div>
      ) : weatherData && columnDefs.length > 0 ? (
        <div className="overflow-x-auto">
          <LazyWeatherGrid columnDefs={columnDefs} rowData={weatherData} />
        </div>
      ) : (
        <div className="flex justify-center items-center h-screen">
          <div className="absolute top-1/2 transform -translate-y-1/2">
            <FaSpinner className="animate-spin text-8xl text-gray-300" />
          </div>
        </div>
      )}
    </section>
  );
};

// Memoize the component to avoid unnecessary re-renders
const MemoizedTOA5Data = memo(TOA5Data);
export default MemoizedTOA5Data;
