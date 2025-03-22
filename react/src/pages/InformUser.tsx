import React, { useState, useEffect, ChangeEvent } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/InformUser.css';
import rowVals from './data';

import {
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";

interface TransformedData {
    [studentId: string]: { [key: string]: string | number };
}

type Option = {
    label: string;
    value: string;
};

const TableCell = ({ getValue, row, column, table }) => {
    const initialValue = getValue()
    const columnMeta = column.columnDef.meta
    const tableMeta = table.options.meta
    const [value, setValue] = useState(initialValue)

    useEffect(() => {
        setValue(initialValue)
    }, [initialValue])

    const onBlur = () => {
        tableMeta?.updateData(row.index, column.id, value)
    }

    const onSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        setValue(e.target.value)
        tableMeta?.updateData(row.index, column.id, e.target.value)
    }

    if (tableMeta?.editedRows[row.id]) {
        return columnMeta?.type === "select" ? (
            <select onChange={onSelectChange} value={initialValue}>
                {columnMeta?.options?.map((option: Option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
        ) : (
            <input
                value={value}
                onChange={e => setValue(e.target.value)}
                onBlur={onBlur}
                type={columnMeta?.type || "text"}
            />
        )
    }
    return <span>{value}</span>
}

const EditCell = ({ row, table }) => {
    const meta = table.options.meta;

    const setEditedRows = (e) => {
        const elName = e.currentTarget.name;
        meta?.setEditedRows((old: []) => ({
            ...old,
            [row.id]: !old[row.id],
        }));
        if (elName !== "edit") {
            meta?.revertData(row.index, e.currentTarget.name === "cancel");
        }
    };

    return (
        <div className="edit-cell-container">
            {meta?.editedRows[row.id] ? (
                <div className="edit-cell">
                    <button onClick={setEditedRows} name="cancel">
                        X
                    </button>
                    <button onClick={setEditedRows} name="done">
                        ✔
                    </button>
                </div>
            ) : (
                <button onClick={setEditedRows} name="edit">
                    ✐
                </button>
            )}
        </div>
    );
};

const columnHelper = createColumnHelper<rowVals>();

const columns = [
    columnHelper.accessor("category", {
        header: "Category",
    }),
    columnHelper.accessor("value", {
        header: "Value",
        cell: TableCell,
    }),
    columnHelper.display({
        id: "edit",
        cell: EditCell,
    }),
];




const InformUser: React.FC = () => {
    const [data, setData] = useState<TransformedData>({});
    const [newFormatData, setFormatData] = useState<Object>([]);
    const [originalData, setOriginalData] = useState<TransformedData>({});
    const [editedRows, setEditedRows] = useState({});
    const [loading, setLoading] = useState<boolean>(true);
    const [predictionMessage, setPredictionMessage] = useState<string>('');
    const [expandedRows, setExpandedRows] = useState<{ [studentId: string]: boolean }>({});
    const [defaultDisplayColumns, setDefaultDisplayColumns] = useState<string[]>([]);
    const primary_key_string = 'studentIDs';

    const location = useLocation();
    useEffect(() => {
        const fetchData = async () => {
            try {
                const tableData = location.state.data;
                const predictions = location.state.prediction;

                if (predictions === undefined) {
                    setPredictionMessage('Prediction(s) not recieved');
                } else {
                    tableData['Prediction'] = predictions;
                }

                const transformedData: TransformedData = {};
                const newDataFormat: Object[] = [];
                let tempObject = {};

                const studentIds = tableData[primary_key_string] || {};

                Object.entries(studentIds as Record<string, string>).forEach(([index, studentId]) => {
                    if (!transformedData[studentId]) {
                        transformedData[studentId] = {};
                    }
                    tempObject["studentId"] = studentId;

                    for (const [key, values] of Object.entries(tableData as Record<string, Record<string, string | number>>)) {
                        if (key !== primary_key_string && values[index] !== undefined) {
                            transformedData[studentId][key] = values[index];
                            tempObject[key] = values[index];
                        }
                    }
                    newDataFormat.push(tempObject);
                    tempObject = {};
                });

                setData(transformedData);
                setFormatData(newDataFormat);
                setOriginalData(transformedData);

                const rows = Object.entries(transformedData).map(([studentId, details]) => [
                    studentId,
                    ...Object.values(details),
                ]);
                console.log(rows);

            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Fetch config to set default display columns
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

        // Get Headers from first row
        const headers = ["Student ID", ...Object.keys(data[Object.keys(data)[0]])];

        // Convert data to rows
        const rows = Object.entries(data).map(([studentId, details]) => [
            studentId,
            ...Object.values(details),
        ]);

        // Convert to CSV format
        const csvContent =
            "data:text/csv;charset=utf-8,\ufeff" +
            [headers.join(","),
            ...rows.map(row =>
                row.map(field => `"${(field ?? "").toString().replace(/"/g, '""')}"`).join(","))
            ].join("\n");

        // Create a download link
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "student_data.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    const Table = (studentID: string) => {

        const table = useReactTable({
            newFormatData,
            columns,
            getCoreRowModel: getCoreRowModel(),
            meta: {
                editedRows,
                setEditedRows,
                revertData: (rowIndex: number, revert: boolean) => {
                    if (revert) {
                        setData((old) =>
                            old.map((row, index) =>
                                index === rowIndex ? originalData[rowIndex] : row
                            )
                        );
                    } else {
                        setOriginalData((old) =>
                            old.map((row, index) => (index === rowIndex ? data[rowIndex] : row))
                        );
                    }
                },
                updateData: (rowIndex: number, columnId: string, value: string) => {
                    setData((old) =>
                        old.map((row, index) => {
                            if (index === rowIndex) {
                                return {
                                    ...old[rowIndex],
                                    [columnId]: value,
                                };
                            }
                            return row;
                        })
                    );
                },
            },
        });

        return (
            <>
                <table>
                    <thead>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <th key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map((row) => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map((cell) => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <pre>{JSON.stringify(data, null, "\t")}</pre>
            </>
        );
    };

    if (loading) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div id="tableContainer">
            <h3>Student Prediction Data</h3>
            <h4 id='prediction-err-message'>{predictionMessage}</h4>
            <table id="mainTable">
                <thead>
                    <tr>
                        <th>Student ID</th>
                        <th>Prediction</th>
                        {/* Display other columns from config's default_display */}
                        {defaultDisplayColumns.map((col) => (
                            <th key={col}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data).map(([studentId, details]) => {
                        const prediction = details["Prediction"] ?? "N/A";
                        const otherData = Object.entries(details).filter(
                            /* 
                            This is chosen to make the option to copy data include all relevent data.
                            Otherwise, add the extra condition to NOT show default cols on dropdown.
                            */
                            ([key]) => key !== "Prediction" // && !defaultDisplayColumns.includes(key)
                        );

                        return (
                            <React.Fragment key={studentId}>
                                <tr
                                    id="mainRow"
                                    onClick={() => toggleRow(studentId)}
                                    className={expandedRows[studentId] ? 'expanded-row-origin' : ''}
                                >
                                    <td>{(expandedRows[studentId] ? '▼' : '▶') + " " + studentId}</td>
                                    <td>{prediction}</td>
                                    {/* Render values for the columns in the additional_default_columns */}
                                    {defaultDisplayColumns.map((col) => (
                                        <td key={`${studentId}-${col}`}>{details[col]}</td>
                                    ))}
                                </tr>


                                {/* Render the expanded data */}


                                {expandedRows[studentId] && (
                                    <>
                                        {/* New row at the top of expanded rows */}
                                        <tr>
                                            <td id="bufferRow" colSpan={defaultDisplayColumns.length + 2}></td>
                                        </tr>
                                        <tr id="subHeader" key={`${studentId}-header`} className="expanded-row-header">
                                            <td>Category</td>
                                            <td colSpan={defaultDisplayColumns.length + 1}>Value</td>
                                        </tr>

                                        {/* Existing expanded rows */}
                                        {otherData.map(([key, value]) => (
                                            <tr id="subRows" key={`${studentId}-${key}`} className="expanded-row">
                                                <td>{key}</td>
                                                <td colSpan={defaultDisplayColumns.length + 1}>
                                                    {value}</td>
                                            </tr>
                                        ))}
                                    </>
                                )}

                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
            <button onClick={downloadCSV}>Download CSV</button>
        </div>
    );
};

export default InformUser;
