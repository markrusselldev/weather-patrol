import { memo, useContext } from "react";
import PropTypes from "prop-types";
import { DataContext } from "../contexts/DataContext";

// Breadcrumb component with title and latest timestamp
const Breadcrumb = ({ title, timeframeSelector }) => {
  const { latestTimestamp } = useContext(DataContext);
  return (
    <div className="breadcrumb flex justify-between p-4 text-sm text-breadcrumbText w-full h-12">
      <div className="flex items-center">{title}</div>
      <div className="flex grow justify-end items-center">Last Update: {latestTimestamp || "Loading..."}</div>
      <div className="flex shrink items-center pl-2">{timeframeSelector}</div>
    </div>
  );
};

Breadcrumb.propTypes = {
  title: PropTypes.string.isRequired,
  timeframeSelector: PropTypes.node
};

const MemoizedBreadcrumb = memo(Breadcrumb);
export default MemoizedBreadcrumb;
