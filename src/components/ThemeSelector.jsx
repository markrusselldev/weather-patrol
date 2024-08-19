import { useContext } from "react";
import PropTypes from "prop-types"; // Import PropTypes for type checking
import { ThemeContext } from "../contexts/ThemeContext";
import log from "../utils/logger";

const ThemeSelector = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const handleThemeChange = (newTheme) => {
    log.info({ page: "ThemeSelector", component: "ThemeSelector", func: "handleThemeChange" }, "Theme changed to:", newTheme);
    setTheme(newTheme);
  };

  return (
    <div className="flex justify-center space-x-6 my-4">
      {/* Conditional rendering based on the current theme */}
      {theme === 'light' ? (
        <div
          className={`w-6 h-6 rounded-full border-4 cursor-pointer ${theme === 'dark' ? 'ring-4 ring-blue-500' : ''}`}
          style={{ backgroundColor: "hsl(0, 0%, 25%)", borderColor: "hsl(0, 0%, 30%)" }}
          title="Dark"
          onClick={() => handleThemeChange('dark')}
        ></div>
      ) : (
        <div
          className={`w-6 h-6 rounded-full border-4 cursor-pointer ${theme === 'light' ? 'ring-4 ring-blue-500' : ''}`}
          style={{ backgroundColor: "hsl(53, 100%, 85%)", borderColor: "hsl(53, 98%, 65%)" }}
          title="Light"
          onClick={() => handleThemeChange('light')}
        ></div>
      )}
    </div>
  );
};

// Add PropTypes validation
ThemeSelector.propTypes = {
  chartInstanceRef: PropTypes.shape({
    current: PropTypes.any,
  }),
};

export default ThemeSelector;
