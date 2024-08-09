// src/hooks/useBreadcrumbConfig.js

import { useLocation } from "react-router-dom";
import routeConfig from "../config/routeConfig"; // Import the centralized route config

const useBreadcrumbConfig = () => {
  const location = useLocation();
  const config = routeConfig[location.pathname];
  return config || { title: "Unknown", icon: null, timeframeSelector: false };
};

export default useBreadcrumbConfig;
