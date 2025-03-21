import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../css/AWS-S3.css';

interface AuthFormProps {
  onLoginSuccess: (userID: string, userPrefix: string) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onLoginSuccess }) => {
  const [userID, setUserID] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedUserID = localStorage.getItem("User_ID");
    const storedPrefix = localStorage.getItem("User_Prefix");
    const storedAuth = localStorage.getItem("isAuthenticated") === "true";

    if (storedAuth && storedUserID && storedPrefix) {
      onLoginSuccess(storedUserID, storedPrefix);
    }
  }, [onLoginSuccess]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await axios.post('/api/authenticate_user', { User_ID: userID, password });

      if (response.data['status'] === 200) {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("User_ID", userID);
        localStorage.setItem("User_Prefix", response.data.User_Prefix);

        onLoginSuccess(userID, response.data.User_Prefix);
        setMessage('Login successful');
      } else {
        setMessage('Invalid User ID or password');
      }
    } catch (error) {
      setMessage('Invalid User ID or password');
    }
  };

  return (
    <div className="login-container">
      <h2 className='Sign-In'>Sign In</h2>
      <form className="user-management-form" onSubmit={handleLogin}>
        <label>
          User ID:
          <input className="login-input" type="text" value={userID} onChange={(e) => setUserID(e.target.value)} required />
        </label>
        <label>
          Password:
          <input className="login-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </label>
        <button className="action-button" type="submit">Login</button>
      </form>
      {message && <p className="error-message">{message}</p>}
    </div>
  );
};

export default AuthForm;