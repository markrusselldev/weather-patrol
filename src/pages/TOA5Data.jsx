import React, { useContext, memo } from "react";
import MemoizedBreadcrumb from "../components/Breadcrumb";
import ErrorMessages from "../components/ErrorMessages";
import WeatherGrid from "../components/WeatherGrid";
import { DataContext } from "../contexts/DataContext";

const TOA5Data = () => {
  const { columnDefs, rowData, error, sseError } = useContext(DataContext);

  console.log("TOA5Data columnDefs:", columnDefs);
  console.log("TOA5Data rowData:", rowData);
  console.log("TOA5Data error:", error);
  console.log("TOA5Data sseError:", sseError);

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <section className="toa5-data">
      <MemoizedBreadcrumb
        title="/ TOA5 Data"
        rightContent={
          <button className="text-blue-500 hover:underline" onClick={handleRefresh}>
            Refresh
          </button>
        }
      />
      <ErrorMessages error={error} sseError={sseError} />
      <div className="overflow-x-auto">
        <WeatherGrid columnDefs={columnDefs} rowData={rowData} />
      </div>
    </section>
  );
};

// Named export
const MemoizedTOA5Data = memo(TOA5Data);
export default MemoizedTOA5Data;
