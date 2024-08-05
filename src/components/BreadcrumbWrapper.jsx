import useBreadcrumbConfig from "../hooks/useBreadcrumbConfig"; // Import custom hook to get breadcrumb configuration
import PropTypes from "prop-types"; // Import PropTypes for type checking
import MemoizedBreadcrumb from "./Breadcrumb"; // Import memoized Breadcrumb component

// Wrapper component to handle breadcrumb logic
const BreadcrumbWrapper = ({ timeframe, handleTimeframeChange }) => {
  const { title, icon, timeframeSelector } = useBreadcrumbConfig(); // Get breadcrumb configuration based on the current route

  // Define the timeframe selector component if applicable
  const timeframeSelectorComponent = timeframeSelector ? (
    <div className="timeframe-container flex items-center">
      <label htmlFor="timeframe" className="mr-2">
        Timeframe:
      </label>
      <select id="timeframe" className="timeframe-dropdown bg-dropdownBg text-dropdownText p-1 rounded border border-dropdownBorder" onChange={handleTimeframeChange} value={timeframe}>
        <option value="3hr">3h</option>
        <option value="6hr">6h</option>
        <option value="12hr">12h</option>
        <option value="1D">1d</option>
        <option value="7D">7d</option>
        <option value="14D">14d</option>
      </select>
    </div>
  ) : null;

  // Render the Breadcrumb component with the provided title, icon, and timeframe selector
  return <MemoizedBreadcrumb title={title} icon={icon} timeframeSelector={timeframeSelectorComponent} />;
};

// Add prop types validation
BreadcrumbWrapper.propTypes = {
  timeframe: PropTypes.string.isRequired, // Timeframe string for the selector
  handleTimeframeChange: PropTypes.func.isRequired // Function to handle timeframe changes
};

export default BreadcrumbWrapper;
