import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "casual");

  useEffect(() => {
    const applyTheme = newTheme => {
      // console.log(`Applying theme: ${newTheme}`);

      // Remove previous theme class and CSS link
      const previousTheme = localStorage.getItem("theme");
      if (previousTheme && previousTheme !== newTheme) {
        document.documentElement.classList.remove(previousTheme);
        // console.log(`Removed previous theme class: ${previousTheme}`);

        // Remove the previous theme's CSS link element
        const link = document.querySelector(`link[href*="${previousTheme}.css"]`);
        if (link) {
          link.remove();
          // console.log(`Removed previous theme CSS: ${previousTheme}.css`);
        } else {
          // console.log(`Previous theme CSS not found: ${previousTheme}.css`);
        }
      }

      // Check if the new theme's CSS is already added to avoid duplicates
      if (!document.querySelector(`link[href*="${newTheme}.css"]`)) {
        // Add new theme class and CSS link
        document.documentElement.classList.add(newTheme);
        // console.log(`Added new theme class: ${newTheme}`);

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `/themes/${newTheme}.css`;
        document.head.appendChild(link);
        // console.log(`Added new theme CSS: ${newTheme}.css`);
      }

      // Save new theme to local storage
      localStorage.setItem("theme", newTheme);
    };

    applyTheme(theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export { ThemeProvider, ThemeContext };
