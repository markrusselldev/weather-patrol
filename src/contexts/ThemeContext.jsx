import { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

// Define a constant for the default theme
const DEFAULT_THEME = "denim";

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || DEFAULT_THEME);

  useEffect(() => {
    const applyTheme = (newTheme) => {
      try {
        log.info(
          { page: "ThemeContext", component: "ThemeProvider", func: "applyTheme" },
          `Applying theme: ${newTheme}`
        );

        // Remove previous theme class and CSS link
        const previousTheme = localStorage.getItem("theme");
        if (previousTheme && previousTheme !== newTheme) {
          document.documentElement.classList.remove(previousTheme);
          log.info(
            { page: "ThemeContext", component: "ThemeProvider", func: "applyTheme" },
            `Removed previous theme class: ${previousTheme}`
          );

          // Remove the previous theme's CSS link element
          const link = document.querySelector(`link[href*="${previousTheme}.css"]`);
          if (link) {
            link.remove();
            log.info(
              { page: "ThemeContext", component: "ThemeProvider", func: "applyTheme" },
              `Removed previous theme CSS: ${previousTheme}.css`
            );
          } else {
            log.warn(
              { page: "ThemeContext", component: "ThemeProvider", func: "applyTheme" },
              `Previous theme CSS not found: ${previousTheme}.css`
            );
          }
        }

        // Add new theme class and CSS link, including the default theme
        if (!document.querySelector(`link[href*="${newTheme}.css"]`)) {
          if (newTheme !== DEFAULT_THEME || !document.documentElement.classList.contains(DEFAULT_THEME)) {
            document.documentElement.classList.add(newTheme);
            log.info(
              { page: "ThemeContext", component: "ThemeProvider", func: "applyTheme" },
              `Added new theme class: ${newTheme}`
            );

            const link = document.createElement("link");
            link.rel = "stylesheet";
            link.href = `/themes/${newTheme}.css`;
            link.onload = () =>
              log.info(
                { page: "ThemeContext", component: "ThemeProvider", func: "applyTheme" },
                `Theme CSS loaded: ${newTheme}.css`
              );
            link.onerror = () =>
              log.error(
                { page: "ThemeContext", component: "ThemeProvider", func: "applyTheme" },
                `Error loading theme CSS: ${newTheme}.css`
              );
            document.head.appendChild(link);
          }
        }

        // Save new theme to local storage
        localStorage.setItem("theme", newTheme);
      } catch (error) {
        const errorMessage = errorHandler(error);
        log.error({ page: "ThemeContext", component: "ThemeProvider", func: "applyTheme" }, errorMessage);
      }
    };

    applyTheme(theme);
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { ThemeProvider, ThemeContext };
