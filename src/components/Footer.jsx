import { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import ThemeSelector from "./ThemeSelector";
import { DataContext } from "../contexts/DataContext";
import logger from "../utils/logger";

const Footer = () => {
  const { environmentInfo } = useContext(DataContext);

  // Log the environment info
  useEffect(() => {
    logger.info({ page: "Footer", component: "Footer", func: "useEffect" }, "Received Environment Info in Footer:", environmentInfo);
  }, [environmentInfo]);

  return (
    <footer className="w-full bg-footerBg text-footerText p-4 text-xs h-footer flex justify-between">
      <div className="flex items-center ml-2">Made with &#10084; for Ski Santa Fe &copy; 2024 All Rights Reserved markrussell.io</div>
      <div className="flex items-center mr-2">
        <ThemeSelector />
      </div>
    </footer>
  );
};

Footer.propTypes = {
  theme: PropTypes.string,
  onThemeChange: PropTypes.func
};

export default Footer;
