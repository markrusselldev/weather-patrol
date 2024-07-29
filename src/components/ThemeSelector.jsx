import React, { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

const ThemeSelector = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  const handleThemeChange = event => {
    setTheme(event.target.value);
  };

  return (
    <select value={theme} onChange={handleThemeChange} className="p-2 bg-white border rounded text-black">
      <option value="casual">Casual</option>
      <option value="dark">Dark</option>
      <option value="darkblue">Dark Blue</option>
      <option value="greyscale">Greyscale</option>
      <option value="light">Light</option>
      <option value="red">Red</option>
    </select>
  );
};

export default ThemeSelector;
