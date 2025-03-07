import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/InformUser.css';

interface TransformedData {
  [studentId: string]: { [key: string]: string | number };
}

const InformUser: React.FC = () => {
  const [data, setData] = useState<TransformedData>({});
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
