import React, { useState, useEffect } from 'react';
import '../css/InformUser.css'; // Import the CSS file

interface Data {
  [key: string]: string | number;
}

const InformUser: React.FC = () => {
  const [data, setData] = useState<Data>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [predictionMessage, setPredictionMessage] = useState<string>(''); // State to store prediction message

  // Fetch data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/get_table_data');
        const result = await response.json();

        if (result.status === 200 && result.data) {
          const filteredData: Data = {};

          // Filter out the keys with values of 0
          for (const [key, value] of Object.entries(result.data)) {
            const valueObj = value as { [key: number]: string | number };
            const firstValue = valueObj[0];

            if (firstValue !== 0 && firstValue !== null && firstValue !== undefined) {
              filteredData[key] = firstValue;
            }
          }

          setData(filteredData);

          // Check if 'Prediction' exists and set the prediction message
          if (result.data['Prediction'] !== undefined) {
            const predictionValue = result.data['Prediction'][0]; // Get the first value
            if (predictionValue === 1) {
              setPredictionMessage('Prediction is Yes');
            } else if (predictionValue === 0) {
              setPredictionMessage('Prediction is No');
            }
          }
        } else {
          console.error('Error: Invalid data format or status');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false); // stop loading after fetching data
      }
    };

    fetchData();
  }, []);

  // Render a loading state until data is fetched
  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div>
      <h3>Student Prediction Data</h3>

      {/* Display the Prediction message */}
      <h4>{predictionMessage}</h4>

      <table>
        <thead>
          <tr>
            <th>Attribute</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(data).map(([key, value], index) => (
            <tr key={index}>
              <td>{key}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InformUser;
