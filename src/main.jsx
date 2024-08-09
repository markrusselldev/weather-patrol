// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { ThemeProvider } from "./contexts/ThemeContext";
import { DataProvider } from "./contexts/DataContext";

// Import third-party styles first
import "ag-grid-community/styles/ag-grid.css"; // Core grid CSS
import "ag-grid-community/styles/ag-theme-alpine.css"; // Alpine theme CSS

// Import global styles
import "./index.css";

// Create a root element for the React application
const root = ReactDOM.createRoot(document.getElementById("root"));

// Render the React application
root.render(
  <React.StrictMode>
    {/* Provide theme context to the app */}
    <ThemeProvider>
      {/* Provide data context to the app */}
      <DataProvider>
        {/* Main application component */}
        <App />
      </DataProvider>
    </ThemeProvider>
  </React.StrictMode>
);
