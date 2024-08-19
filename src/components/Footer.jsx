import { useContext, useEffect } from "react";
import PropTypes from "prop-types";
import ThemeSelector from "./ThemeSelector";
import { DataContext } from "../contexts/DataContext";
import logger from "../utils/logger";
import { FaHeart } from "react-icons/fa";

const Footer = () => {
  const { environmentInfo } = useContext(DataContext);

  // Log the environment info
  useEffect(() => {
    logger.info({ page: "Footer", component: "Footer", func: "useEffect" }, "Received Environment Info in Footer:", environmentInfo);
  }, [environmentInfo]);

  return (
    <footer className="w-full bg-footerBg text-footerText p-4 text-xs h-footer flex justify-between">
      <div className="flex items-center ml-2">
        &copy; 2024{" "}
        <a href="https://markrussell.io" className="mx-1 hover:underline">
          markrussell.io
        </a>{" "}
        <span className="hidden sm:inline ml-1">Built with</span>
        <FaHeart className="text-red-500 mx-1" />
        <span className="hidden sm:inline ml-1">for</span>{" "}
        <a href="https://skisantafe.com" className="mx-1 hover:underline">
          Ski Santa Fe
        </a>{" "}
        <span className="hidden sm:inline ml-1">License</span>{" "}
        <a href="https://snyk.io/learn/what-is-mit-license/" className="mx-1 hover:underline">
          MIT
        </a>
      </div>
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
