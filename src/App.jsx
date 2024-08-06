import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MemoizedCurrentConditions from "./pages/CurrentConditions";
import MemoizedWeatherTrends from "./pages/WeatherTrends";
import MemoizedTOA5Data from "./pages/TOA5Data";
import Header from "./components/Header";
import Footer from "./components/Footer";
import BreadcrumbWrapper from "./components/BreadcrumbWrapper";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import log from "./utils/logger";

const App = () => {
  const [timeframe, setTimeframe] = useState("3hr");

  // Handle timeframe change
  const handleTimeframeChange = event => {
    setTimeframe(event.target.value);
  };

  // Define navigation items for the header
  const navigationItems = [
    { path: "/", label: "Home" },
    { path: "/trends", label: "Trends" },
    { path: "/data", label: "Data" }
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

export default App;
