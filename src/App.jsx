import { useState } from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { FaThermometerHalf, FaChartLine, FaTable } from "react-icons/fa";
import MemoizedCurrentConditions from "./pages/CurrentConditions";
import MemoizedWeatherTrends from "./pages/WeatherTrends";
import MemoizedTOA5Data from "./pages/TOA5Data";
import Header from "./components/Header";
import Footer from "./components/Footer";
import MemoizedBreadcrumb from "./components/Breadcrumb";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import log from "./utils/logger";

// Mapping of routes to titles and icons
const routeConfig = {
  "/": { title: "Current Conditions", icon: FaThermometerHalf },
  "/trends": { title: "Weather Trends", icon: FaChartLine, timeframeSelector: true },
  "/data": { title: "TOA5 Data", icon: FaTable }
};

// Custom hook to get the title and icon based on the current route
const useBreadcrumbConfig = () => {
  const location = useLocation();
  const config = routeConfig[location.pathname];
  return config || { title: "Unknown", icon: null, timeframeSelector: false };
};

const App = () => {
  const [timeframe, setTimeframe] = useState("3hr");

  // Handle timeframe change
  const handleTimeframeChange = event => {
    setTimeframe(event.target.value);
  };

  // Define navigation items for the header
  const navigationItems = [
    { path: "/", label: "Current Conditions" },
    { path: "/trends", label: "Weather Trends" },
    { path: "/data", label: "TOA5 Data" }
  ];

  log.info({ page: "App", component: "App", func: "render" }, "App component rendered");

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Header component with navigation items */}
            <Header navigationItems={navigationItems} />
            {/* Breadcrumb component */}
            <BreadcrumbWrapper timeframe={timeframe} handleTimeframeChange={handleTimeframeChange} />
            {/* Main content area */}
            <main className="flex-grow px-4 pb-8 bg-background">
              <Routes>
                <Route path="/" element={<MemoizedCurrentConditions />} />
                <Route path="/trends" element={<MemoizedWeatherTrends timeframe={timeframe} onTimeframeChange={handleTimeframeChange} />} />
                <Route path="/data" element={<MemoizedTOA5Data />} />
              </Routes>
            </main>
            {/* Footer component with theme selector */}
            <Footer />
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

// Wrapper component to handle breadcrumb logic
const BreadcrumbWrapper = ({ timeframe, handleTimeframeChange }) => {
  const { title, icon, timeframeSelector } = useBreadcrumbConfig();

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

  return <MemoizedBreadcrumb title={title} icon={icon} timeframeSelector={timeframeSelectorComponent} />;
};

// Add prop types validation
BreadcrumbWrapper.propTypes = {
  timeframe: PropTypes.string.isRequired,
  handleTimeframeChange: PropTypes.func.isRequired
};

export default App;
