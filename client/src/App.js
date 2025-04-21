import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './pages/Header.tsx';
import StudentForm from './pages/StudentForm.tsx';
import CSVUpload from './pages/CSVUpload.tsx';
import InformUser from './pages/InformUser.tsx';
import UserManagement from './pages/UserManagement.tsx';
import S3 from './pages/S3.tsx';

const UploadFormPage = () => {
  return (
    <div>
      <Header />
      <StudentForm /> 
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<S3/>} />
          <Route path="/table" element={<InformUser />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/upload-form" element={<UploadFormPage />}/>
          <Route path="/csv-upload" element={<CSVUpload />
          } /> {/* This url is for development purposes at this time*/}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

