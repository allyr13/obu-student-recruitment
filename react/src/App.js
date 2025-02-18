import './App.css';
import StudentInformationForm from './pages/StudentForm.tsx';
import Header from './pages/Header.tsx';
import CSVUpload from './pages/CSVUpload.tsx'


function App() {
  return (
    <div className="App">
      <Header />
      <StudentInformationForm />
      <CSVUpload />
    </div>
  );
}

export default App;
