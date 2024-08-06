import { memo, useContext, useEffect, useState } from "react"; // Import necessary hooks and libraries
import PropTypes from "prop-types"; // Import PropTypes for type checking
import { DataContext } from "../contexts/DataContext"; // Import DataContext to access global state
import log from "../utils/logger"; // Import logger for logging messages
import { formatTimestamp } from "../utils/utils"; // Import utility function to format timestamps
import { FaClock, FaCalendarAlt } from "react-icons/fa"; // Import icons from react-icons library

// Breadcrumb component with title and latest timestamp
const Breadcrumb = ({ title, icon: Icon, timeframeSelector }) => {
  const { latestTimestamp } = useContext(DataContext); // Access latestTimestamp from DataContext
  const [isTimestampSet, setIsTimestampSet] = useState(false); // State to track if timestamp is set

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

  // Render the component only if the timestamp is set
  if (!isTimestampSet) {
    return null; // Do not render the component until latestTimestamp is set
  }

  return (
    <div className="breadcrumb flex justify-between items-center pt-4 px-4 text-sm text-breadcrumbText w-full h-12">
      <div className="flex items-center">
        {/* Conditionally render the icon */}
        {Icon && <Icon className="mr-2 text-svg text-xl md:text-base" />}
        {title}
      </div>
      <div className="flex grow justify-end items-center">
        <FaClock className="mr-2 text-svg text-xl md:text-base" />
        <span className="hidden sm:inline">Last Update:</span> {/* Hide on small screens */}
        {formattedTimestamp}
        {timeframeSelector && <FaCalendarAlt className="mx-2 text-svg text-xl md:text-base" />}
      </div>
      {timeframeSelector && <div className="flex shrink items-center">{timeframeSelector}</div>}
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
