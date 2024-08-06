import { memo, useState, useEffect } from "react";
import ErrorMessages from "../components/ErrorMessages";
import WeatherGrid from "../components/WeatherGrid";
import useTOA5Data from "../hooks/useTOA5Data";
import log from "../utils/logger";
import { FaSpinner } from "react-icons/fa"; // Import the loading spinner icon

const TOA5Data = () => {
  const { weatherData, columnDefs, processedError } = useTOA5Data();
  const [loading, setLoading] = useState(true); // Add loading state

  // Update loading state based on data fetching
  useEffect(() => {
    if ((weatherData && weatherData.length > 0) || processedError) {
      setLoading(false);
    }
  }, [weatherData, processedError]);

  if (processedError) {
    log.error({ page: "src/pages/TOA5Data.jsx", component: "TOA5Data", func: "render" }, "Error in TOA5Data component:", processedError);
    return <ErrorMessages message={processedError} />;
  }

  return (
    <section className="toa5-data">
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <div className="absolute top-1/2 transform -translate-y-1/2">
            <FaSpinner className="animate-spin text-8xl text-gray-300" />
          </div>
        </div>
      ) : weatherData && columnDefs.length > 0 ? (
        <div className="overflow-x-auto">
          <WeatherGrid columnDefs={columnDefs} rowData={weatherData} />
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
