import { memo, useState, useEffect, useContext } from "react";
import ErrorMessages from "../components/ErrorMessages";
import LazyWeatherGrid from "../components/LazyWeatherGrid";
import useTOA5Data from "../hooks/useTOA5Data";
import log from "../utils/logger";
import { FaSpinner } from "react-icons/fa";
import { DataContext } from "../contexts/DataContext";
import { FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import icons for the accordion

const TOA5Data = () => {
  const { weatherData, columnDefs, processedError } = useTOA5Data();
  const { environmentInfo } = useContext(DataContext);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // State to control the accordion

  // Update loading state based on data fetching
  useEffect(() => {
    if ((weatherData && weatherData.length > 0) || processedError) {
      setLoading(false);
    }
  }, [weatherData, processedError]);

  // Split the environmentInfo string into an array
  const environmentData = environmentInfo.split(",");

  // Array of corresponding labels for the environment data
  const environmentLabels = ["Format", "Station", "Logger Model", "Serial Number", "OS Version", "Program Name", "Program Signature", "Table Name"];

  // Function to toggle the accordion
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  // Handle errors
  if (processedError) {
    log.error({ page: "src/pages/TOA5Data.jsx", component: "TOA5Data", func: "render" }, "Error in TOA5Data component:", processedError);
    return <ErrorMessages message={processedError} />;
  }

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

      {/* Environment Info Accordion */}
      <div className="my-4">
        <div
          className="bg-footerBg text-footerText p-4 text-xs flex justify-between items-center cursor-pointer border border-buttonBorderColor hover:bg-buttonHoverBg transition-colors duration-200 ease-in-out"
          onClick={toggleAccordion}
        >
          <span className="font-bold flex items-center">
            {isExpanded ? <FaChevronUp className="mr-2" /> : <FaChevronDown className="mr-2" />}
            Environment Info
          </span>
        </div>
        <div className={`overflow-hidden transition-max-height duration-300 ease-in-out ${isExpanded ? "max-h-screen" : "max-h-0"}`}>
          <ul className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 bg-tableThBg text-xs p-4">
            {environmentData.map((value, index) => (
              <li key={index} className="flex flex-col text-tableTdText">
                <span className="font-bold">{environmentLabels[index]}:</span>
                <span>{value.trim()}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

// Memoize the component to avoid unnecessary re-renders
const MemoizedTOA5Data = memo(TOA5Data);
export default MemoizedTOA5Data;
