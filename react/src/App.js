import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './pages/Header.tsx';  
import StudentForm from './pages/StudentForm.tsx';  
import CSVUpload from './pages/CSVUpload.tsx'; 
import InformUser from './pages/InformUser.tsx';  
import S3 from './pages/S3.tsx';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <>
                <Header /> 
                <StudentForm /> 
                <CSVUpload /> 
              </>
            } 
          />
          <Route path="/table" element={<InformUser />} />
          <Route path="/S3" element={<S3 />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

