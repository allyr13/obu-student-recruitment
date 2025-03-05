import React, { useState, useEffect } from 'react';
import '../css/InformUser.css';

interface TransformedData {
  [studentId: string]: { [key: string]: string | number };
}

const InformUser: React.FC = () => {
  const [data, setData] = useState<TransformedData>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedRows, setExpandedRows] = useState<{ [studentId: string]: boolean }>({});
  const [defaultDisplayColumns, setDefaultDisplayColumns] = useState<string[]>([]);
  const primary_key_string = 'studentIDs';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: Remove this route call when batch input is connected to 'upload_form'
        const responseT = await fetch('/api/test');
        const resultT = await responseT.json();

        const storedData = localStorage.getItem('tableData');
        const tableData = storedData ? JSON.parse(storedData) : {};

        const response = await fetch('/api/get_table_data');
        const result = await response.json();
        tableData['Prediction'] = result.data['Prediction'];

        if (result.status === 200) {
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
        } else {
          console.error('Error: Invalid data format or status');
        }
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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div id="tableContainer">
      <h3>Student Prediction Data</h3>
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
            // Get the other data to show in the expanded rows
            const otherData = Object.entries(details).filter(
              ([key]) => key !== "Prediction" && !defaultDisplayColumns.includes(key)
            );

            return (
              <React.Fragment key={studentId}>
                <tr 
                  id="mainRow" 
                  onClick={() => toggleRow(studentId)} 
                  style={{
                    cursor: 'pointer', 
                    backgroundColor: expandedRows[studentId] ? 'rgba(48, 139, 51, 0.482)' : 'transparent',
                    boxShadow: expandedRows[studentId]
                    ? 'inset 0 2px 5px rgba(0, 0, 0, 0.5), inset 0 -2px 5px rgba(0, 0, 0, 0.5)'
                    : 'none',
                  }}
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
                  <tr id="subHeader" key={`${studentId}-header`} className="expanded-row-header">
                    <td>Category</td>
                    <td colSpan={defaultDisplayColumns.length + 1}>Value</td>
                  </tr>

                  {/* Existing expanded rows */}
                  {otherData.map(([key, value]) => (
                    <tr id="subRows" key={`${studentId}-${key}`} className="expanded-row">
                      <td>{key}</td>
                      <td colSpan={defaultDisplayColumns.length + 1}>{value}</td>
                    </tr>
                  ))}
                </>
              )}

              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InformUser;
