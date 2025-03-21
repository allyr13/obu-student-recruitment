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
    const tableData = location.state.data;
    if (Array.isArray(tableData)) {
        arrayDataFetch();
    }
    else{
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
  
        } catch (err) {
          console.error('Error fetching data:', err);
        } finally {
          setLoading(false);
        }
  }

  const arrayDataFetch  = async () => {
    try {
        const tableData = location.state.data;
        const predictions = location.state.prediction;
    
        console.log('table data in inform user: ' + JSON.stringify(tableData));
        console.log('prediction in inform user: ' + JSON.stringify(predictions));
    
        if (predictions === undefined || Object.keys(predictions).length === 0) {
          setPredictionMessage('Prediction(s) not received');
        } else {
          // Assign predictions to each student in the tableData
          tableData.forEach((studentData, index) => {
            const studentId = studentData.studentIDs;  // Assuming studentId is unique per student
            if (predictions[index] !== undefined) {
              studentData['Prediction'] = predictions[index];  // Assign prediction
            }
          });
        }
    
        // Initialize transformedData object
        const transformedData: TransformedData = {};
    
        // Iterate over each student in tableData
        tableData.forEach((student) => {
          const studentId = student.studentIDs;  // Get student ID
          if (studentId) {
            transformedData[studentId] = {};
    
            // Iterate over each key-value pair in the student object and add it to transformedData
            Object.entries(student).forEach(([key, value]) => {
              if (key !== "studentIDs") {  // Avoid studentIDs in transformed data
                transformedData[studentId][key] = value as string | number;  // Ensure the value is either string or number
              }
            });
          }
        });
    
        console.log('transformed data: ' + JSON.stringify(transformedData));
        setData(transformedData);
    
      
    
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  }

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

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div id="tableContainer">
      <h3 className='main-title'>Student Prediction Data</h3>
      <h4 id='prediction-err-message'>{predictionMessage}</h4>
      <table id="mainTable">
        <thead>
          <tr>
            <th className="user-management-th">Student ID</th>
            <th className="user-management-th">Prediction</th>
            {/* Display other columns from config's default_display */}
            {defaultDisplayColumns.map((col) => (
              <th className="user-management-th"key={col}>{col}</th>
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
      <div className='download-csv-button-div'>
        <button className='action-button' onClick={downloadCSV}>Download CSV</button>
      </div>
    </div>
  );
};

export default InformUser;
