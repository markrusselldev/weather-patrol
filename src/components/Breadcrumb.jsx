import { memo, useContext, useEffect } from "react";
import PropTypes from "prop-types";
import { DataContext } from "../contexts/DataContext";
import log from "../utils/logger";
import { formatTimestamp } from "../utils/utils";
import { FaClock, FaCalendarAlt } from "react-icons/fa";

// Breadcrumb component with title and latest timestamp
const Breadcrumb = ({ title, icon: Icon, timeframeSelector }) => {
  const { latestTimestamp } = useContext(DataContext);

  // Log the latest timestamp
  useEffect(() => {
    log.info({ page: "Breadcrumb", component: "Breadcrumb", func: "useEffect" }, "Latest Timestamp in Breadcrumb:", latestTimestamp);
  }, [latestTimestamp]);

  // Format the latest timestamp
  const formattedTimestamp = formatTimestamp(latestTimestamp, { showTime: true, showDate: true, page: "Breadcrumb", component: "Breadcrumb", func: "formatTimestamp" });

  return (
    <div className="breadcrumb flex justify-between items-center pt-4 px-4 text-sm text-breadcrumbText w-full h-12">
      <div className="flex items-center">
        {/* Conditionally render the icon */}
        {Icon && <Icon className="mr-2" />}
        {title}
      </div>
      <div className="flex grow justify-end items-center">
        <FaClock className="mr-2" />
        Last Update: {formattedTimestamp || "Loading..."}
        {timeframeSelector && <FaCalendarAlt className="mx-2" />}
      </div>
      {timeframeSelector && <div className="flex shrink items-center">{timeframeSelector}</div>}
    </div>
  );
};

// PropTypes validation
Breadcrumb.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.elementType,
  timeframeSelector: PropTypes.node
};

// Memoize the component to avoid unnecessary re-renders
const MemoizedBreadcrumb = memo(Breadcrumb);
export default MemoizedBreadcrumb;
