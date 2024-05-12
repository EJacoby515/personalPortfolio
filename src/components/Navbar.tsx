import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Navbar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleDropdown = () => {
    setIsVisible(!isVisible);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <Link to="/">Your Logo</Link>
        </div>
        <div className="navbar-toggle" onClick={toggleDropdown}>
          <i className="fas fa-bars"></i>
        </div>
      </div>
      {isVisible && (
        <div className="navbar-menu">
          <ul>
            <li>
              <Link to="/" onClick={toggleDropdown}>Home</Link>
            </li>
            <li>
              <Link to="/projects" onClick={toggleDropdown}>Projects</Link>
            </li>
            <li>
              <Link to="/about" onClick={toggleDropdown}>About</Link>
            </li>
            <li>
              <Link to="/contact" onClick={toggleDropdown}>Contact</Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;