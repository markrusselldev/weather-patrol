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
    <div className="custom-select up-arrow">
      <select value={theme} onChange={handleThemeChange} className="block appearance-none w-full bg-buttonBg text-buttonText border border-buttonBorderColor hover:bg-buttonHoverBg hover:border-buttonBorderHover rounded-xl rounded-t-none leading-tight focus:outline-none focus:shadow-outline">
        <option value="denim">Denim</option>
        <option value="dark">Dark</option>
        <option value="light">Light</option>
      </select>
    </div>
  );
};

export default ThemeSelector;
