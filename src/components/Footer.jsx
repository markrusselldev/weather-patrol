// src/components/Footer.jsx
import { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import ThemeSelector from "./ThemeSelector";
import { DataContext } from "../contexts/DataContext";
import logger from "../utils/logger";

const Footer = ({ theme, onThemeChange }) => {
  const { environmentInfo } = useContext(DataContext);

  // Log the environment info
  useEffect(() => {
    logger.info({ page: "Footer", component: "Footer", func: "useEffect" }, "Received Environment Info in Footer:", environmentInfo);
  }, [environmentInfo]);

  // Format the environment info
  const formattedEnvironmentInfo = environmentInfo.split(",").join(", ");

  return (
    <footer className="w-full bg-footerBg text-footerText flex justify-between p-4 text-xs h-footer">
      <div className="flex items-center p-2">Environment: {formattedEnvironmentInfo}</div>
      <div className="flex items-center justify-end text-right">
        <ThemeSelector theme={theme} onThemeChange={onThemeChange} />
      </div>
    </footer>
  );
};

Footer.propTypes = {
  theme: PropTypes.string.isRequired,
  onThemeChange: PropTypes.func.isRequired
};

export default Footer;
