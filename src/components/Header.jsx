import { useState } from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import log from "../utils/logger"; // Importing the logger

const Header = ({ navigationItems }) => {
  const [isNavOpen, setIsNavOpen] = useState(false);

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
    log.info(`Navigation menu ${isNavOpen ? "closed" : "opened"}`); // Log nav state change
  };

  const navLinkClass = ({ isActive }) => `block md:inline-block no-underline m-1.5 p-4 rounded-lg text-center transition-all ${isActive ? "bg-buttonActiveBg text-buttonText" : "bg-buttonBg text-buttonText"} hover:bg-buttonHoverBg focus:bg-buttonActiveBg active:bg-buttonActiveBg`;

  // Log the navigation items loading
  log.info("Navigation items loaded:", navigationItems);

  return (
    <header className="w-full bg-headerBg text-headerText p-4 flex justify-between items-center sticky top-0 z-20 h-header">
      <div className="flex items-center min-w-[11rem] flex-grow">
        <img src="/images/yellow-bear.png" alt="Logo Placeholder" className="w-10 h-10 mr-4" />
        <h1 className="text-lg whitespace-nowrap">Weather Patrol</h1>
      </div>
      <button className="block md:hidden text-2xl cursor-pointer" onClick={toggleNav}>
        ☰
      </button>
      <nav className={`flex-col md:flex-row md:flex ${isNavOpen ? "flex" : "hidden"} md:flex`}>
        {navigationItems.map(item => (
          <NavLink key={item.path} to={item.path} className={navLinkClass}>
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
