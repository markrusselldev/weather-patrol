import { memo, useContext, useEffect, useState } from "react"; // Import necessary hooks and libraries
import PropTypes from "prop-types"; // Import PropTypes for type checking
import { DataContext } from "../contexts/DataContext"; // Import DataContext to access global state
import log from "../utils/logger"; // Import logger for logging messages
import { formatTimestamp } from "../utils/utils"; // Import utility function to format timestamps
import { FaClock, FaCalendarAlt, FaChevronDown, FaChevronUp } from "react-icons/fa"; // Import icons from react-icons library

// Breadcrumb component with title, environment info, latest timestamp, and timeframe selector
const Breadcrumb = ({ title, icon: Icon, timeframeSelector }) => {
  const { latestTimestamp, environmentInfo } = useContext(DataContext); // Access latestTimestamp and environmentInfo from DataContext
  const [isTimestampSet, setIsTimestampSet] = useState(false); // State to track if timestamp is set
  const [isExpanded, setIsExpanded] = useState(false); // State to control the accordion

  // Log the latest timestamp and set isTimestampSet state
  useEffect(() => {
    if (latestTimestamp) {
      log.info({ page: "Breadcrumb.jsx", component: "Breadcrumb", func: "useEffect" }, "Latest Timestamp in Breadcrumb:", latestTimestamp);
      setIsTimestampSet(true);
    } else {
      setIsTimestampSet(false);
    }
  }, [latestTimestamp]);

  // Format the latest timestamp
  const formattedTimestamp = latestTimestamp ? formatTimestamp(latestTimestamp, { showTime: true, showDate: true }) : "Loading...";

  // Function to toggle the accordion
  const toggleAccordion = () => {
    setIsExpanded(!isExpanded);
  };

  // Split the environmentInfo string into an array
  const environmentData = environmentInfo.split(",");
  const environmentLabels = ["Format", "Station", "Logger Model", "Serial Number", "OS Version", "Program Name", "Program Signature", "Table Name"];

  // Render the component only if the timestamp is set
  if (!isTimestampSet) {
    return null; // Do not render the component until latestTimestamp is set
  }

  return (
    <div className="breadcrumb flex flex-col pt-4 px-4 pb-0 text-sm bg-background text-breadcrumbText w-full">
      <div className="flex justify-between items-center h-12">
        <div className="flex items-center">
          {/* Conditionally render the icon */}
          {Icon && <Icon className="mr-2 text-svg text-xl md:text-base" />}
          {title}
        </div>
        <div className="relative flex items-center cursor-pointer ml-4" onClick={toggleAccordion}>
          <span className="flex items-center text-sm text-breadcrumbText">
            {isExpanded ? <FaChevronUp className="mx-2 text-svg text-xl md:text-base" /> : <FaChevronDown className="mx-2 text-svg text-xl md:text-base" />}
            <span className="hidden sm:inline">Environment</span> {/* Hide on small screens */}
          </span>
        </div>
        <div className="flex grow justify-end items-center">
          <FaClock className="mr-2 text-svg text-xl md:text-base" />
          <span className="hidden sm:inline">Last Update:&nbsp;</span> {/* Hide on small screens */}
          {formattedTimestamp}
          {timeframeSelector && <FaCalendarAlt className="mx-2 text-svg text-xl md:text-base" />}
        </div>
        {timeframeSelector && <div className="flex shrink items-center">{timeframeSelector}</div>}
      </div>
      <div
        className={`w-full bg-footerBg border border-buttonBorderColor shadow-lg transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0 overflow-hidden"
        }`}
      >
        <ul className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-footerText">
          {environmentData.map((value, index) => (
            <li key={index} className="text-sm">
              <span className="block font-semibold">{environmentLabels[index]}:</span>
              <span className="block">{value.trim()}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

// PropTypes validation
Breadcrumb.propTypes = {
  title: PropTypes.string.isRequired, // Title of the breadcrumb
  icon: PropTypes.elementType, // Icon component to be displayed
  timeframeSelector: PropTypes.node // Optional timeframe selector component
};

// Memoize the component to avoid unnecessary re-renders
const MemoizedBreadcrumb = memo(Breadcrumb);
export default MemoizedBreadcrumb;
