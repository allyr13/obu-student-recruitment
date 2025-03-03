// import React, { useState } from 'react';
// import Header from './pages/Header.tsx';  // Default export
// import StudentInformationForm from './pages/StudentForm.tsx';  // Default export
// import CSVUpload from './pages/CSVUpload.tsx';  // Default export
// import TableComponent from './pages/InformUser.tsx';  // Default export

// function App() {
//   const [currentComponent, setCurrentComponent] = useState('form');  // State to track current component

//   // Function to handle form submission
//   const handleFormSubmit = () => {
//     setCurrentComponent('table'); // After form is submitted, change to 'table' component
//   };

//   return (
//     <div className="App">
//       {/* Header will always be visible */}
//       <Header />

//       <div className="content">
//         {/* Conditional rendering based on the current component */}
//         {currentComponent === 'form' && (
//           <div>
//             {/* Render the form */}
//             <StudentInformationForm onSubmit={handleFormSubmit} />
//             <CSVUpload />
//           </div>
//         )}
        
//         {currentComponent === 'table' && (
//           <TableComponent />
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './pages/Header.tsx';  // Assuming you have a Header component
import StudentForm from './pages/StudentForm.tsx';  // Assuming you have a StudentForm component
import CSVUpload from './pages/CSVUpload.tsx';  // Assuming you have a CSVUpload component
import InformUser from './pages/InformUser.tsx';  // Assuming you have an InformUser (Table) component

function App() {
  return (
    <Router> {/* Ensure the Router is wrapping the entire app */}
      <div className="App">
        <Routes>
          {/* Route for the main page */}
          <Route 
            path="/" 
            element={
              <>
                <Header /> {/* Header component */}
                <StudentForm /> {/* Student Form component */}
                <CSVUpload /> {/* CSV Upload component */}
              </>
            } 
          />

          {/* Route for the table page */}
          <Route path="/table" element={<InformUser />} /> {/* Table route */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;

