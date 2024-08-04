import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";
import log from "../utils/logger";

const ThemeSelector = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const handleThemeChange = event => {
    const newTheme = event.target.value;
    log.info({ page: "ThemeSelector", component: "ThemeSelector", func: "handleThemeChange" }, "Theme changed to:", newTheme);
    setTheme(newTheme);
  };

  return (
    <select value={theme} onChange={handleThemeChange} className="p-2 bg-dropdownBg text-dropdownText border border-dropdownBorder rounded hover:bg-dropdownHoverBg active:bg-dropdownActiveBg">
      <option value="denim">Denim</option>
      <option value="dark">Dark</option>
      <option value="light">Light</option>
    </select>
  );
};

export default ThemeSelector;
