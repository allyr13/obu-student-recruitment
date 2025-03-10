import React, { useState, useEffect } from "react";
import axios from "axios";
import "../css/UserManagement.css";
import { FaTrash } from "react-icons/fa";

interface TableItem {
  User_ID: string;
  User_Prefix: string;
  User_Password: string;
}

const UserManagement = () => {
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");
  const [tableData, setTableData] = useState<TableItem[]>([]);
  const [newUser, setNewUser] = useState<TableItem>({ User_ID: "", User_Prefix: "", User_Password: "" });

  useEffect(() => {
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    setIsAuthenticated(isAuth);
    if (isAuth) {
      fetchTableData();
    }
  }, []);

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post("/api/verify_password", { password });
      if (response.data['status'] === 200) {
        setIsAuthenticated(true);
        localStorage.setItem("isAuthenticated", "true");
        fetchTableData();
        setError('');
      } else {
        setError('Invalid admin password');
      }
    } catch (err) {
      setError("Invalid password");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("User_ID");
    localStorage.removeItem("User_Prefix");
    setIsAuthenticated(false);
  };

  const fetchTableData = async () => {
    try {
      const response = await axios.get("/api/get_table_data");
      if (response.status === 200) {
        setTableData(response.data.data);
      }
    } catch (err) {
      setError("Error fetching table data");
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post("/api/add_user", newUser);
      if (response.status === 200) {
        setNewUser({ User_ID: "", User_Prefix: "", User_Password: "" });
        fetchTableData();
      }
    } catch (err) {
      setError("Error adding user");
    }
  };

  const handleDeleteUser = async (User_ID: string, User_Prefix: string) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
      try {
        const response = await axios.delete("/api/delete_user", {
          data: { User_ID, User_Prefix }
        });
        if (response.status === 200) {
          fetchTableData();
        }
      } catch (err) {
        setError("Error deleting user");
      }
    }
  };

  const renderTableHeaders = () => {
    if (tableData.length > 0) {
      return Object.keys(tableData[0]).map((key) => (
        <th key={key} className="user-management-th">{key}</th>
      ));
    }
    return null;
  };

  const renderTableRows = () => {
    return tableData.map((item, index) => (
      <tr key={index} className={`user-management-tr ${index % 2 === 0 ? "even-row" : ""}`}>
        {Object.keys(item).map((key, idx) => (
          <td key={key} className="user-management-td">{item[key]}</td>
        ))}
        <td className="user-management-delete-icon">
          <FaTrash
            className="user-management-icon-button"
            onClick={() => handleDeleteUser(item.User_ID, item.User_Prefix)}
          />
        </td>
      </tr>
    ));
  };

  return (
    <div className="user-management-container">
      {!isAuthenticated ? (
        <div className="login-container">
          <h2 className="Sign-In">Enter Admin Password to Continue</h2>
          <form className="user-management-form" onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              placeholder="Password"
              value={password}
              className="user-management-password-input"
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="user-management-submit-btn">Submit</button>
          </form>
          {error && <p className="user-management-error">{error}</p>}
        </div>
      ) : (
        <div>
          <h2 className="user-management-main-title">Manage User Access Credentials</h2>
          <button className="logout-button" onClick={handleLogout}>Sign Out</button>
          <table className="user-management-table">
            <thead>
              <tr className="user-management-thead">
                {renderTableHeaders()}
                <th className="user-management-th"></th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>

          <div className="user-management-controls">
            <form onSubmit={handleAddUser} className="user-management-add-form">
              <h3 className="user-management-add-title">Add New User</h3>
              <input
                type="text"
                placeholder="User ID"
                value={newUser.User_ID}
                className="user-management-field-input"
                onChange={(e) => setNewUser({ ...newUser, User_ID: e.target.value })}
              />
              <input
                type="text"
                placeholder="User Prefix"
                value={newUser.User_Prefix}
                className="user-management-field-input"
                onChange={(e) => setNewUser({ ...newUser, User_Prefix: e.target.value })}
              />
              <input
                type="password"
                placeholder="User Password"
                value={newUser.User_Password}
                className="user-management-field-input"
                onChange={(e) => setNewUser({ ...newUser, User_Password: e.target.value })}
              />
              <button type="submit" className="user-management-submit-btn">Add User</button>
            </form>
          </div>
          {error && <p className="user-management-error">{error}</p>}
        </div>
      )}
    </div>
  );
};

export default UserManagement;
