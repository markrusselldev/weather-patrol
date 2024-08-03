import { useState, useCallback, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import { FaThermometerHalf, FaChartLine, FaTable } from "react-icons/fa";
import log from "../utils/logger"; // Importing the logger
import { getCssVariable } from "../utils/utils"; // Importing the helper function

const Header = ({ navigationItems }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();
  const [activeStyles, setActiveStyles] = useState({
    backgroundColor: "",
    color: ""
  });

  useEffect(() => {
    // Fetch the active styles from CSS variables
    const activeBgColor = getCssVariable("--button-active-bg-color", "hsl(355, 85%, 45%)");
    const activeTextColor = getCssVariable("--button-active-text-color", "hsl(53, 98%, 65%)");

    log.debug({ function: "useEffect" }, `Active background color: ${activeBgColor}`);
    log.debug({ function: "useEffect" }, `Active text color: ${activeTextColor}`);

    setActiveStyles({
      backgroundColor: activeBgColor,
      color: activeTextColor
    });
  }, [location]);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    log.info({ page: "Header", component: "Header", func: "toggleNav" }, `Navigation menu ${isNavOpen ? "closed" : "opened"}`); // Log nav state change
  };

  const navLinkClass = useCallback(({ isActive }) => {
    // Fetch the styles from CSS variables
    const activeBgColor = getCssVariable("--button-active-bg-color", "hsl(355, 85%, 45%)");
    const activeTextColor = getCssVariable("--button-active-text-color", "hsl(53, 98%, 65%)");
    const inactiveBgColor = getCssVariable("--button-bg-color", "hsl(0, 0%, 90%)");
    const inactiveTextColor = getCssVariable("--button-text-color", "hsl(0, 0%, 20%)");
    const borderColor = getCssVariable("--button-border-color", "hsl(0, 0%, 80%)");

    log.debug({ page: "Header", component: "Header", func: "navLinkClass" }, `Active state: ${isActive}`);

    // Apply styles based on active state
    return `block md:inline-block no-underline m-1.5 p-4 rounded-lg text-center transition-all ${isActive ? `bg-[${activeBgColor}] text-[${activeTextColor}] border-[${borderColor}]` : `bg-[${inactiveBgColor}] text-[${inactiveTextColor}] border-[${borderColor}]`} hover:bg-buttonHoverBg focus:bg-buttonActiveBg active:bg-buttonActiveBg`;
  }, []);

  // Log the navigation items loading
  log.info({ page: "Header", component: "Header", func: "render" }, "Navigation items loaded:", navigationItems);

  // Function to get the corresponding icon based on the label or path
  const getIcon = label => {
    switch (label) {
      case "Current Conditions":
        return <FaThermometerHalf className="mr-2 inline" />;
      case "Weather Trends":
        return <FaChartLine className="mr-2 inline" />;
      case "TOA5 Data":
        return <FaTable className="mr-2 inline" />;
      default:
        return null;
    }
  };

  return (
    <header className="w-full bg-headerBg text-headerText p-4 flex justify-between items-center sticky top-0 z-20 h-header">
      <div className="flex items-center min-w-[11rem] flex-grow">
        <img src="/images/weather-patrol-80s-bear.png" alt="Logo" className="w-10 h-10.5 mr-4" />
        <div className="text-lg whitespace-nowrap">
          <img src="/images/weather-patrol-80s-text.gif" alt="Weather Patrol" className="w-15 h-12 mr-4" />
        </div>
      </div>
      <button className="block md:hidden text-2xl cursor-pointer" onClick={toggleNav}>
        ☰
      </button>
      <nav className={`flex-col md:flex-row md:flex ${isNavOpen ? "flex" : "hidden"} md:flex`}>
        {navigationItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={navLinkClass}
            isActive={() => location.pathname === item.path}
            style={({ isActive }) =>
              isActive
                ? {
                    color: activeStyles.color,
                    backgroundColor: activeStyles.backgroundColor
                  }
                : {}
            }
          >
            {getIcon(item.label)}
            {item.label}
          </NavLink>
        ))}
      </nav>
    </header>
  );
};

Header.propTypes = {
  navigationItems: PropTypes.arrayOf(
    PropTypes.shape({
      path: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired
    })
  ).isRequired
};

export default Header;
