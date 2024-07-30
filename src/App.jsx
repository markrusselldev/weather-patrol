import { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import MemoizedCurrentConditions from "./pages/CurrentConditions";
import MemoizedWeatherTrends from "./pages/WeatherTrends";
import MemoizedTOA5Data from "./pages/TOA5Data";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { ThemeProvider } from "./contexts/ThemeContext";
import ErrorBoundary from "./components/ErrorBoundary";
import logger from "./utils/logger";

const App = () => {
  // State to manage the theme
  const [theme, setTheme] = useState("casual");

  // Handle theme change
  const handleThemeChange = event => {
    const newTheme = event.target.value;
    logger.info("Theme changed to:", newTheme);
    setTheme(newTheme);
  };

  // Define navigation items for the header
  const navigationItems = [
    { path: "/", label: "Current Conditions" },
    { path: "/trends", label: "Weather Trends" },
    { path: "/data", label: "TOA5 Data" }
  ];

  return (
    <ThemeProvider>
      <ErrorBoundary>
        <Router>
          <div className="flex flex-col min-h-screen">
            {/* Header component with navigation items */}
            <Header navigationItems={navigationItems} />
            {/* Main content area */}
            <main className="flex-grow p-4 bg-background">
              <Routes>
                <Route path="/" element={<MemoizedCurrentConditions />} />
                <Route path="/trends" element={<MemoizedWeatherTrends />} />
                <Route path="/data" element={<MemoizedTOA5Data />} />
              </Routes>
            </main>
            {/* Footer component with theme selector */}
            <Footer theme={theme} onThemeChange={handleThemeChange} />
          </div>
        </Router>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

export default App;
