import React, { useState } from 'react'; // 1. Import useState
import "../../assets/css/mainstyle.css"

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

          <a href="/" className="logo d-flex align-items-center me-auto">
            {/* <img src="assets/img/logo.webp" alt="" /> */}
            <h1 className="sitename">Info Entertainment</h1>
          </a>

          <nav id="navmenu" className={`navmenu ${isMenuOpen ? 'navmenu-active' : ''}`}>
            <ul>
              <li><a href="index.html" className="active">Home</a></li>
              
              {/* 6. Add onClick to the dropdown trigger */}
              <li className={`dropdown ${openDropdowns['about'] ? 'dropdown-active' : ''}`}>
                <a href="#about" onClick={(e) => { e.preventDefault(); toggleDropdown('about'); }}>
                  <span>About</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['about'] ? 'rotate-icon' : ''}`}></i>
                </a>
                <ul>
                  <li><a href="about.html">About Us</a></li>
                  <li><a href="admissions.html">Admissions</a></li>
                  <li><a href="academics.html">Academics</a></li>
                  <li><a href="faculty-staff.html">Faculty &amp; Staff</a></li>
                  <li><a href="campus-facilities.html">Campus &amp; Facilities</a></li>
                </ul>
              </li>

              <li><a href="students-life.html">Schedules</a></li>
              <li><a href="events.html">Speakers</a></li>
              <li><a href="alumni.html">Gallery</a></li>

              <li className={`dropdown ${openDropdowns['sponsors'] ? 'dropdown-active' : ''}`}>
                <a href="#sponsors" onClick={(e) => { e.preventDefault(); toggleDropdown('sponsors'); }}>
                  <span>Sponsors</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['sponsors'] ? 'rotate-icon' : ''}`}></i>
                </a>
                <ul>
                  <li><a href="news-details.html">Speakers</a></li>
                  <li><a href="event-details.html">Event Details</a></li>
                  <li><a href="privacy.html">Gallery</a></li>
                  <li><a href="terms-of-service.html">Sponsors</a></li>
                  <li><a href="404.html">Error 404</a></li>
                  <li><a href="starter-page.html">Contact</a></li>
                </ul>
              </li>

              <li className={`dropdown ${openDropdowns['pricing'] ? 'dropdown-active' : ''}`}>
                <a href="#pricing" onClick={(e) => { e.preventDefault(); toggleDropdown('pricing'); }}>
                  <span>pricing</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['pricing'] ? 'rotate-icon' : ''}`}></i>
                </a>
                <ul>
                  <li><a href="#">Dropdown 1</a></li>
                  <li className="dropdown">
                    <a href="#deep-dropdown" onClick={(e) => { e.preventDefault(); toggleDropdown('deep-dropdown'); }}>
                      <span>Deep Dropdown</span> <i className={`bi bi-chevron-down toggle-dropdown ${openDropdowns['deep-dropdown'] ? 'rotate-icon' : ''}`}></i>
                    </a>
                    <ul className={openDropdowns['deep-dropdown'] ? 'dropdown-active' : ''}>
                      <li><a href="#">Deep Dropdown 1</a></li>
                      <li><a href="#">Deep Dropdown 2</a></li>
                      <li><a href="#">Deep Dropdown 3</a></li>
                      <li><a href="#">Deep Dropdown 4</a></li>
                      <li><a href="#">Deep Dropdown 5</a></li>
                    </ul>
                  </li>
                  <li><a href="#">Dropdown 2</a></li>
                  <li><a href="#">Dropdown 3</a></li>
                  <li><a href="#">Dropdown 4</a></li>
                </ul>
              </li>
              <li><a href="contact.html">Contact</a></li>
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