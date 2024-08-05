import { useState } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { FaThermometerHalf, FaChartLine, FaTable } from "react-icons/fa";
import log from "../utils/logger";

const Header = ({ navigationItems }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    log.info({ page: "Header", component: "Header", func: "toggleNav" }, `Navigation menu ${isNavOpen ? "closed" : "opened"}`);
  };

  const navLinkStyle = ({ isActive }) =>
    `block md:inline-flex items-center justify-center no-underline m-1.5 rounded-full text-center transition-all h-button px-4 box-border 
    ${isActive ? "bg-buttonActiveBg text-buttonActiveText border-buttonBorder" : "bg-buttonBg text-buttonText border-buttonBorder"}
    ${!isActive && "hover:bg-buttonHoverBg hover:border-buttonBorderHover"}`;

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
    <header className="w-full bg-headerBg text-headerText p-4 flex justify-between items-center sticky top-0 z-20 h-header shadow-md">
      <div className="flex items-center min-w-[11rem] flex-grow">
        <img src="/images/weather-patrol-80s-bear.svg" alt="Logo" className="w-10 h-10.5 mr-1" />
        <div className="text-lg whitespace-nowrap">
          <img src="/images/weather-patrol-80s-text.gif" alt="Weather Patrol" className="w-15 h-10" />
        </div>
      </div>
      <button className="block md:hidden text-2xl cursor-pointer" onClick={toggleNav}>
        ☰
      </button>
      <nav className={`flex-col md:flex-row md:flex ${isNavOpen ? "flex" : "hidden"} rounded-full bg-navBg border-navBorder hover:bg-navHoverBg hover:border-navHoverBorder h-nav md:h-nav items-center w-full md:w-auto`}>
        <ul className="flex flex-col md:flex-row items-center w-full md:w-auto box-border">
          {navigationItems.map(item => (
            <li key={item.path} className="list-none">
              <NavLink to={item.path} className={navLinkStyle}>
                {getIcon(item.label)}
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
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
