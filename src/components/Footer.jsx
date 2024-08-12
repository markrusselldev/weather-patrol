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
    <footer className="w-full bg-footerBg text-footerText p-4 text-xs h-footer flex sm:justify-around sm:items-center">
      <div className="flex items-center sm:flex-1 overflow-hidden"></div>
      <div className="flex items-center justify-end sm:ml-auto">
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
