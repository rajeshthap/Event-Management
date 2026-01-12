import React, { useState } from 'react'; // 1. Import useState
import "../../assets/css/mainstyle.css"
import { Link } from 'react-router-dom';

function NavBar() {
  // 2. State to control the main mobile navigation menu
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 3. State to control each dropdown submenu individually
  const [openDropdowns, setOpenDropdowns] = useState({});

  // 4. Function to toggle the main menu
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // 5. Function to toggle a specific dropdown by its key
  const toggleDropdown = (key) => {
    setOpenDropdowns(prevState => ({
      ...prevState,
      [key]: !prevState[key]
    }));
  };

  return (
    <div>
      <header id="header" className={`header d-flex align-items-center sticky-top ${isMenuOpen ? 'mobile-nav-active' : ''}`}>
        <div className="header-container container-fluid container-xl position-relative d-flex align-items-center justify-content-end">

          <Link to="/" className="logo d-flex align-items-center me-auto">
            {/* <img src="assets/img/logo.webp" alt="" /> */}
            <h1 className="sitename">Info Entertainment</h1>
          </Link>

          <nav id="navmenu" className={`navmenu ${isMenuOpen ? 'navmenu-active' : ''}`}>
            <ul>
              <li><Link to="/" className="active">Home</Link></li>
              
              {/* 6. Add onClick to the dropdown trigger */}
              <li className={`dropdown ${openDropdowns['about'] ? 'dropdown-active' : ''}`}>
                <Link to="#about" onClick={(e) => { e.preventDefault(); toggleDropdown('about'); }}>
                  <span>About</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['about'] ? 'rotate-icon' : ''}`}></i>
                </Link>
                <ul>
                  <li><Link to="/AboutUs">About Us</Link></li>
                  <li><Link to="/Admissions">Admissions</Link></li>
                  <li><Link to="academics.html">Academics</Link></li>
                  <li><Link to="/Faculty">Faculty &amp; Staff</Link></li>
                  <li><Link to="campus-facilities.html">Campus &amp; Facilities</Link></li>
                </ul>
              </li>

              <li><Link to="students-life.html">Schedules</Link></li>
              <li><Link to="events.html">Speakers</Link></li>
              <li><Link to="alumni.html">Gallery</Link></li>

              <li className={`dropdown ${openDropdowns['sponsors'] ? 'dropdown-active' : ''}`}>
                <Link to="#sponsors" onClick={(e) => { e.preventDefault(); toggleDropdown('sponsors'); }}>
                  <span>Sponsors</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['sponsors'] ? 'rotate-icon' : ''}`}></i>
                </Link>
                <ul>
                  <li><Link to="news-details.html">Speakers</Link></li>
                  <li><Link to="event-details.html">Event Details</Link></li>
                  <li><Link to="privacy.html">Gallery</Link></li>
                  <li><Link to="terms-of-service.html">Sponsors</Link></li>
                  <li><Link to="404.html">Error 404</Link></li>
                  <li><Link to="starter-page.html">Contact</Link></li>
                </ul>
              </li>

              <li className={`dropdown ${openDropdowns['pricing'] ? 'dropdown-active' : ''}`}>
                <Link to="#pricing" onClick={(e) => { e.preventDefault(); toggleDropdown('pricing'); }}>
                  <span>pricing</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['pricing'] ? 'rotate-icon' : ''}`}></i>
                </Link>
                <ul>
                  <li><Link to="#">Dropdown 1</Link></li>
                  <li className="dropdown">
                    <Link to="#deep-dropdown" onClick={(e) => { e.preventDefault(); toggleDropdown('deep-dropdown'); }}>
                      <span>Deep Dropdown</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['deep-dropdown'] ? 'rotate-icon' : ''}`}></i>
                    </Link>
                    <ul className={openDropdowns['deep-dropdown'] ? 'dropdown-active' : ''}>
                      <li><Link to="#">Deep Dropdown 1</Link></li>
                      <li><Link to="#">Deep Dropdown 2</Link></li>
                      <li><Link to="#">Deep Dropdown 3</Link></li>
                      <li><Link to="#">Deep Dropdown 4</Link></li>
                      <li><Link to="#">Deep Dropdown 5</Link></li>
                    </ul>
                  </li>
                  <li><Link to="#">Dropdown 2</Link></li>
                  <li><Link to="#">Dropdown 3</Link></li>
                  <li><Link to="#">Dropdown 4</Link></li>
                </ul>
              </li>
              <li><Link to="contact.html">Contact</Link></li>
            </ul>
            {/* 7. Add onClick to the mobile toggle button and change icon dynamically */}
            <i 
              className={`mobile-nav-toggle d-xl-none bi ${isMenuOpen ? 'bi-x' : 'bi-list'}`} 
              onClick={toggleMenu}
            ></i>
          </nav>
        </div>
      </header>
    </div>
  )
}

export default NavBar;