import { useContext } from "react";
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
      {/* Denim Theme Circle */}
      <div
        className={`w-6 h-6 rounded-full border-4 cursor-pointer ${theme === 'denim' ? 'ring-4 ring-blue-500' : ''}`}
        style={{ backgroundColor: "hsl(210, 30%, 20%)", borderColor: "hsl(210, 30%, 30%)" }}
        title="Denim"
        onClick={() => handleThemeChange('denim')}
      ></div>

      {/* Dark Theme Circle */}
      <div
        className={`w-6 h-6 rounded-full border-4 cursor-pointer ${theme === 'dark' ? 'ring-4 ring-blue-500' : ''}`}
        style={{ backgroundColor: "hsl(0, 0%, 25%)", borderColor: "hsl(0, 0%, 30%)" }}
        title="Dark"
        onClick={() => handleThemeChange('dark')}
      ></div>

      {/* Light Theme Circle */}
      <div
        className={`w-6 h-6 rounded-full border-4 cursor-pointer ${theme === 'light' ? 'ring-4 ring-blue-500' : ''}`}
        style={{ backgroundColor: "hsl(53, 100%, 85%)", borderColor: "hsl(53, 98%, 65%)" }}
        title="Light"
        onClick={() => handleThemeChange('light')}
      ></div>
    </div>
  );
};

export default ThemeSelector;
