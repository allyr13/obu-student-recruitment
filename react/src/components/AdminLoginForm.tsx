import React, { useState } from "react";

interface LoginFormProps {
  onSubmit: (password: string) => void;
  error: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSubmit, error }) => {
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(password);
  };

  return (
    <div className="login-container">
      <h2 className="Sign-In">Enter Admin Password to Continue</h2>
      <form className="user-management-form" onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password"
          value={password}
          className="login-input"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="action-button">Submit</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default LoginForm;
