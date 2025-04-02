import React, { useState, useEffect, useReducer, MouseEvent } from 'react';
import { useLocation, Link } from 'react-router-dom';
import '../css/InformUser.css';
import { FaCheck, FaTimes, FaPencilAlt } from "react-icons/fa";
import { Tooltip } from 'react-tooltip';

interface TransformedData {
    [studentId: string]: { [key: string]: string | number };
}

const InformUser: React.FC = () => {
    const [data, setData] = useState<TransformedData>({});
    const [originalData, setOriginalData] = useState<TransformedData>({});
    const [editedRows, setEditedRows] = useState({});
    const [loading, setLoading] = useState<boolean>(true);
    const [predictionMessage, setPredictionMessage] = useState<string>('');
    const [expandedRows, setExpandedRows] = useState<{ [studentId: string]: boolean }>({});
    const [defaultDisplayColumns, setDefaultDisplayColumns] = useState<string[]>([]);
    const primary_key_string = 'studentIDs';
    const [, forceUpdate] = useReducer(x => x + 1, 0);

    const updateData = async (studentId: string, key: string, value: string | number) => {
        data[studentId][key] = value;

        const csvHeader = Object.keys(data[studentId]).join(',') + ",studentIDs";
        const csvRow = Object.values(data[studentId]).join(',') + "," + studentId;
        const csvData = `${csvHeader}\n${csvRow}`;
        const csvBlob = new Blob([csvData], { type: 'text/csv' });
        const formDataToSend = new FormData();
        formDataToSend.append('file', csvBlob, `student_form_data_whatIf.csv`);
        const response = await fetch('/api/upload_form', {
            method: 'POST',
            body: formDataToSend,
        });
        const result = await response.json();
        const predictionsObj = result.data;
        if (predictionsObj !== undefined) {
            predictionsObj[0] == 0 ? data[studentId]["Prediction"] = "No" : data[studentId]["Prediction"] = "Yes";
        } else {
            alert(`Invalid value for field ${key}: ${value}`);
        }
        forceUpdate();
    }

    const TableCell = (studentId: string, key: string, theValue: string | number) => {
        let value: string | number = theValue;
        let number: boolean = typeof theValue == "number";


        const setValue = (newValue: string | number) => {
            number ? value = parseInt(newValue as string) : value = newValue as string;
        }

        const onBlur = () => {
            updateData(studentId, key, value);
        }

        if (editedRows[studentId + key]) {
            return (
                <input
                    defaultValue={value}
                    onBlur={onBlur}
                    onChange={e => setValue(e.target.value)}
                    type={"text"}
                    className="edit-input"
                />
            );
        } else {
            return <span>{value}</span>;
        }
    }

    const EditCell = (studentId: string, key: string) => {

        const setEditRows = (e: MouseEvent<HTMLButtonElement>) => {
            const elName = e.currentTarget.name;
            setEditedRows((prev) => ({
                ...prev,
                [studentId + key]: !prev[studentId + key],
            }));
            if (elName !== "edit") {
                if (elName === "cancel") {
                    data[studentId][key] = originalData[studentId][key];
                } else {
                    originalData[studentId][key] = data[studentId][key];
                }
            }
        };

        return (
            <div className="edit-cell-container">
                {editedRows[studentId + key] ? (
                    <div className="edit-cell">
                        <button className="edit-icon cancel" onClick={setEditRows} name="cancel"
                            data-tooltip-id="cancel-edit"
                            data-tooltip-content="cancel edit">
                            <FaTimes />
                        </button>
                        <Tooltip className="cancel-edit" id="cancel-edit" />
                        <button className="edit-icon confirm" onClick={setEditRows} name="done"
                            data-tooltip-id="confirm-edit"
                            data-tooltip-content="confirm edit">
                            <FaCheck />
                        </button>
                        <Tooltip id="confirm-edit" />
                    </div>
                ) : (
                    <div className="edit-cell">
                        <button className="edit-icon" onClick={setEditRows} name="edit"
                            data-tooltip-id="edit"
                            data-tooltip-content="edit">
                            <FaPencilAlt />
                        </button>
                        <Tooltip id="edit" />
                    </div>
                )}
            </div>
        );
    };

    const location = useLocation();
    useEffect(() => {
        const tableData = location.state.data;
        if (Array.isArray(tableData)) {
            arrayDataFetch();
        }
        else {
            jsonDataFetch();
        }
    }, []);

    const jsonDataFetch = async () => {
        try {
            const tableData = location.state.data;
            const predictions = location.state.prediction;

            if (predictions === undefined) {
                setPredictionMessage('Prediction(s) not recieved');
            } else {
                tableData['Prediction'] = predictions;
            }

            const transformedData: TransformedData = {};

            const studentIds = tableData[primary_key_string] || {};

            Object.entries(studentIds as Record<string, string>).forEach(([index, studentId]) => {
                if (!transformedData[studentId]) {
                    transformedData[studentId] = {};
                }

                for (const [key, values] of Object.entries(tableData as Record<string, Record<string, string | number>>)) {
                    if (key !== primary_key_string && values[index] !== undefined) {
                        transformedData[studentId][key] = values[index];
                    }
                }
            });

            setData(transformedData);
            setOriginalData(transformedData);

        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }

    const arrayDataFetch = async () => {
        try {
            const tableData = location.state.data;
            const predictions = location.state.prediction;

            if (predictions === undefined || Object.keys(predictions).length === 0) {
                setPredictionMessage('Prediction(s) not received');
            } else {
                tableData.forEach((studentData, index) => {
                    if (predictions[index] !== undefined) {
                        const intVal = Number.parseInt(predictions[index]);
                        if (intVal == 0) {
                            studentData['Prediction'] = "No";
                        } else {
                            studentData['Prediction'] = "Yes";
                        }
                    }
                });
            }

            const transformedData: TransformedData = {};

            tableData.forEach((student) => {
                const studentId = student.studentIDs;
                if (studentId) {
                    transformedData[studentId] = {};

                    Object.entries(student).forEach(([key, value]) => {
                        if (key !== "studentIDs") {
                            transformedData[studentId][key] = value as string | number;
                        }
                    });
                }
            });

            setData(transformedData);
            setOriginalData(transformedData);
        } catch (err) {
            console.error('Error fetching data:', err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('/config.json');
                const config = await response.json();
                setDefaultDisplayColumns(config.additional_default_columns || []);
            } catch (err) {
                console.error('Error fetching config:', err);
            }
        };

        fetchConfig();
    }, []);

    const toggleRow = (studentId: string) => {
        setExpandedRows((prev) => ({ ...prev, [studentId]: !prev[studentId] }));
    };

    const downloadCSV = () => {
        if (!data || Object.keys(data).length === 0) return;

        const headers = ["Student ID", ...Object.keys(data[Object.keys(data)[0]])];

        const rows = Object.entries(data).map(([studentId, details]) => [
            studentId,
            ...Object.values(details),
        ]);

        const csvContent =
            "data:text/csv;charset=utf-8,\ufeff" +
            [headers.join(","),
            ...rows.map(row =>
                row.map(field => `"${(field ?? "").toString().replace(/"/g, '""')}"`).join(","))
            ].join("\n");

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div id="tableContainer">
            <div className='header-div'>
              <Link to="/">
                <img src="OBU-Green.png" alt="OBU Logo" className="obu-logo-green" />
              </Link>
            </div>
            <h3 className='main-title'>Student Prediction Data</h3>
            <h4 id='prediction-err-message'>{predictionMessage}</h4>
            <table id="mainTable">
                <thead>
                    <tr>
                        <th className="user-management-th">Student ID</th>
                        <th className="user-management-th">Prediction</th>
                        {defaultDisplayColumns.map((col) => (
                            <th className="user-management-th" key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data).map(([studentId, details]) => {
                        const otherData = Object.entries(details).filter(
                            ([key]) => key !== "Prediction"
                        );

                        return (
                            <React.Fragment key={studentId}>
                                <tr
                                    id="mainRow"
                                    onClick={() => toggleRow(studentId)}
                                    className={expandedRows[studentId] ? 'expanded-row-origin' : ''}
                                >
                                    <td>{(expandedRows[studentId] ? '▼' : '▶') + " " + studentId}</td>
                                    <td>{details["Prediction"] ?? "N/A"}</td>
                                    {defaultDisplayColumns.map((col) => (
                                        <td key={`${studentId}-${col}`}>{details[col]}</td>
                                    ))}
                                </tr>

                                {expandedRows[studentId] && (
                                    <>
                                        <tr>
                                            <td id="bufferRow" colSpan={defaultDisplayColumns.length + 2}></td>
                                        </tr>
                                        <tr id="subHeader" key={`${studentId}-header`} className="expanded-row-header">
                                            <td>Category</td>
                                            <td>Value</td>
                                            <td colSpan={defaultDisplayColumns.length}></td>
                                        </tr>

                                        {otherData.map(([key, value]) => (
                                            <tr id="subRows" key={`${studentId}-${key}`} className="expanded-row">
                                                <td>{key}</td>
                                                <td>{TableCell(studentId, key, value)}</td>
                                                <td colSpan={defaultDisplayColumns.length}>{EditCell(studentId, key)}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
            <div className='download-csv-button-div'>
                <button className='action-button' onClick={downloadCSV}>Download CSV</button>
            </div>
        </div>
    );
};

export default InformUser;