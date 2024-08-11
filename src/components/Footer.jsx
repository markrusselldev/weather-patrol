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

  // Format the environment info
  const formattedEnvironmentInfo = environmentInfo.split(",").join(", ");

  return (
    <footer className="w-full bg-footerBg text-footerText p-4 text-xs h-auto flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
      <div className="flex-1 sm:pr-4 break-words">
        Environment: {formattedEnvironmentInfo}
      </div>
      <div className="flex items-center justify-end sm:flex-shrink-0">
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
