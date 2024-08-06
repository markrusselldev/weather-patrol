import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { FaThermometerHalf, FaChartLine, FaTable } from "react-icons/fa";
import log from "../utils/logger";

const Header = ({ navigationItems }) => {
  // Define styles for navigation links
  const navLinkStyle = ({ isActive }) =>
    `flex items-center justify-center no-underline m-1 rounded-full text-center transition-all h-button px-3 box-border 
    ${isActive ? "bg-buttonActiveBg text-buttonActiveText border-buttonBorder" : "bg-buttonBg text-buttonText border-buttonBorder"}
    ${!isActive && "hover:bg-buttonHoverBg hover:border-buttonBorderHover"}`;

  // Get the appropriate icon based on the label
  const getIcon = label => {
    switch (label) {
      case "Home":
        return <FaThermometerHalf className="text-2xl md:text-base" />;
      case "Trends":
        return <FaChartLine className="text-2xl md:text-base" />;
      case "Data":
        return <FaTable className="text-2xl md:text-base" />;
      default:
        return null;
    }
  };

  // Log navigation items on render
  log.info({ page: "Header.jsx", component: "Header", func: "render" }, "Rendering navigation items:", navigationItems);

  return (
    <header className="w-full bg-headerBg text-headerText p-4 flex justify-between items-center sticky top-0 z-20 h-header shadow-md">
      <div className="flex items-center min-w-[11rem]">
        <img src="/images/weather-patrol-80s-bear.svg" alt="Logo" className="w-10 h-10.5 mr-1" />
        <div className="text-lg whitespace-nowrap hidden md:block">
          <img src="/images/weather-patrol-80s-text.gif" alt="Weather Patrol" className="w-15 h-10" />
        </div>
      </div>
      <nav className="flex flex-row items-center w-auto rounded-full bg-navBg border-navBorder h-nav md:h-nav justify-center md:justify-start">
        <ul className="flex flex-row items-center box-border">
          {navigationItems.map(item => (
            <li key={item.path} className="list-none">
              <NavLink to={item.path} className={navLinkStyle}>
                {getIcon(item.label)}
                <span className="hidden md:inline ml-2">{item.label}</span>
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
