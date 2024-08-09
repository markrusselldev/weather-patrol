// src/config/routeConfig.js

import { GiWindsock } from "react-icons/gi";
import { FaChartLine, FaTable } from "react-icons/fa";

const routeConfig = {
  "/": { title: "Home", icon: GiWindsock }, // Use GiWindsock for the home route
  "/trends": { title: "Trends", icon: FaChartLine, timeframeSelector: true },
  "/data": { title: "TOA5 Data", icon: FaTable }
};

export default routeConfig;
