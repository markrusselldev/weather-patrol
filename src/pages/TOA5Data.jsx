// src/pages/TOA5Data.jsx

import { memo } from "react";
import ErrorMessages from "../components/ErrorMessages";
import WeatherGrid from "../components/WeatherGrid";
import useTOA5Data from "../hooks/useTOA5Data";
import log from "../utils/logger";

const TOA5Data = () => {
  const { weatherData, columnDefs, processedError } = useTOA5Data();

  if (processedError) {
    log.error({ page: "src/pages/TOA5Data.jsx", component: "TOA5Data", func: "render" }, "Error in TOA5Data component:", processedError);
    return <ErrorMessages message={processedError} />;
  }

  return (
    <section className="toa5-data">
      {weatherData && columnDefs.length > 0 ? (
        <div className="overflow-x-auto">
          <WeatherGrid columnDefs={columnDefs} rowData={weatherData} />
        </div>
      ) : (
        <div>No data available</div>
      )}
    </section>
  );
};

// Memoize the component to avoid unnecessary re-renders
const MemoizedTOA5Data = memo(TOA5Data);
export default MemoizedTOA5Data;
