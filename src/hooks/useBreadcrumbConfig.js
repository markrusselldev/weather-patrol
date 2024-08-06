import { useLocation } from "react-router-dom";
import { FaThermometerHalf, FaChartLine, FaTable } from "react-icons/fa";

// Mapping of routes to titles and icons
const routeConfig = {
  "/": { title: "Conditions", icon: FaThermometerHalf },
  "/trends": { title: "Trends", icon: FaChartLine, timeframeSelector: true },
  "/data": { title: "TOA5 Data", icon: FaTable }
};

// Custom hook to get the title and icon based on the current route
const useBreadcrumbConfig = () => {
  const location = useLocation();
  const config = routeConfig[location.pathname];
  return config || { title: "Unknown", icon: null, timeframeSelector: false };
};

export default useBreadcrumbConfig;
