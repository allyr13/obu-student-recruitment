import React, { useState, useEffect, useReducer } from "react";
import axios from "axios";
import '../css/AWS-S3.css';
import { FaTrash } from "react-icons/fa";
import LoginForm from "../components/AdminLoginForm.tsx";
import { Link } from 'react-router-dom';
import { AxiosResponse } from "axios";

interface TableItem {
    User_ID: string;
    User_Prefix: string;
    User_Password: string;
    Classification: string;
}

const UserManagement = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [error, setError] = useState("");
    const [idError, setIdError] = useState("");
    const [prefixError, setPrefixError] = useState("");
    const [tableData, setTableData] = useState<TableItem[]>([]);
    const [message, setMessage] = useState('');
    const [newUser, setNewUser] = useState<TableItem>({ User_ID: "", User_Prefix: "", User_Password: "", Classification: "User" });

    const [, forceUpdate] = useReducer(x => x + 1, 0);

    useEffect(() => {
        const isAuth = localStorage.getItem("isAuthenticated") === "true";
        setIsAuthenticated(isAuth);
        if (isAuth) {
            fetchTableData();
        }
    }, []);

    const handlePasswordSubmit = async (password: string) => {
        try {
            const response = await axios.post("/api/verify_password", { password });
            if (response.data.status === 200) {
                setIsAuthenticated(true);
                localStorage.setItem("isAuthenticated", "true");
                fetchTableData();
                setError("");
            } else {
                setError("Invalid admin password");
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
            setIdError("")
            setPrefixError("")
            if (response.data.tatus === 200) {
                setNewUser({ User_ID: "", User_Prefix: "", User_Password: "", Classification: "User" });
                fetchTableData();
                setMessage('Successfully added a user.');
                setError("");
            } else if (response.data.status === 409) {
                parseTypeInputError(response);
            } else {
                setError("Error adding user");
            }
        } catch (err) {
            setError("Error adding user");
        }
    };

    const parseTypeInputError = (response: AxiosResponse) => {
        if (response.data['type'] == "ID") {
            setIdError("This User ID Already Exists")
        } else if (response.data['type'] == "Prefix") {
            setPrefixError("This User Prefix Already Exists")
        } else {
            setError("Unknown Error");
        }
        setMessage('Adding user denied. Cannot have duplicate User ID or Prefix.');
    }

    const handleDeleteUser = async (User_ID: string, User_Prefix: string) => {
        const confirmDelete = window.confirm("Are you sure you want to delete this user?");
        if (confirmDelete) {
            try {
                const response = await axios.delete("/api/delete_user", {
                    data: { User_ID, User_Prefix }
                });
                if (response.status === 200) {
                    fetchTableData();
                    setMessage('Successfully deleted a user.');
                    setError("");
                }
                if (User_ID === localStorage.getItem("User_ID")) {
                    localStorage.removeItem("isAuthenticated");
                    localStorage.removeItem("User_ID");
                    localStorage.removeItem("User_Prefix");
                    setIsAuthenticated(false);
                    forceUpdate();
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
                {Object.keys(item).map((key) => (
                    <td key={key} className="user-management-td">{item[key]}</td>
                ))}
                <td className="user-management-delete-icon">
                    <FaTrash
                        className="icon-button"
                        onClick={() => handleDeleteUser(item.User_ID, item.User_Prefix)}
                    />
                </td>
            </tr>
        ));
    };

    return (
        <div /* className="old-color-scheme" */>
            <div className="user-management-container">
                {!isAuthenticated ? (
                    <LoginForm onSubmit={handlePasswordSubmit} error={error} />
                ) : (
                    <div>
                        <div className="header-div">
                            <Link to="/">
                                <img src="OBU-Green.png" alt="OBU Logo" className="obu-logo-green" />
                            </Link>
                        </div>
                        <h2 className="main-title">Manage User Access Credentials</h2>
                        <button className="logout-button" onClick={handleLogout}>Sign Out</button>
                        {message && <p className="message">{message}</p>}
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
                                {error && <p className="error-message">{idError}</p>}
                                <input
                                    type="text"
                                    placeholder="User ID"
                                    value={newUser.User_ID}
                                    className="user-management-field-input"
                                    onChange={(e) => setNewUser({ ...newUser, User_ID: e.target.value })}
                                />
                                {error && <p className="error-message">{prefixError}</p>}
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
                                <select
                                    value={newUser.Classification}
                                    className="user-management-field-input"
                                    onChange={(e) => setNewUser({ ...newUser, Classification: e.target.value })}
                                >
                                    <option value="User">User</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <button type="submit" className="action-button">Add User</button>
                            </form>
                        </div>
                        {error && <p className="error-message">{error}</p>}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserManagement;
