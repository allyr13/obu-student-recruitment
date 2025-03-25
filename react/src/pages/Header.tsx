import React from 'react';
import '../css/Header.css'; // Import CSS for the header if needed

const Header: React.FC = () => {
  return (
    <header className="header">
      <h1 className='main-title'>Student Data Form</h1>
      <p>Please fill in the information below to submit student data.</p>
    </header>
  );
};

export default Header;
