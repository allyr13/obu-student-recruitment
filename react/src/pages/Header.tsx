import React from 'react';
import '../css/Header.css'; // Import CSS for the header if needed
import {Link} from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
      <div className='header-div'>
              <Link to="/">
                <img src="OBU-Green.png" alt="OBU Logo" className="obu-logo-green" />
              </Link>
      </div>
      <h1 className='main-title'>Student Data Form</h1>
      <p>Please fill in the information below to submit student data.</p>
    </header>
  );
};

export default Header;
