import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import '../css/InformUser.css';

interface Data {
    [key: string]: string | number;
}

const InformUser: React.FC = () => {
    const [data, setData] = useState<Data>({});
    const [loading, setLoading] = useState<boolean>(true);
    const [predictionMessage, setPredictionMessage] = useState<string>('');

    const location = useLocation();
    useEffect(() => {
        function fillForm() {
            const filteredData: Data = {};

            for (const [key, value] of Object.entries(location.state.data)) {
                console.log(value);

                if (value !== 0 && value !== null && value !== undefined) {
                    filteredData[key] = String(value);
                }
            }

            setData(filteredData);

            if (location.state.prediction !== undefined) {
                const predictionValue = location.state.prediction[0];
                if (predictionValue === 1) {
                    setPredictionMessage('Prediction is Yes');
                } else if (predictionValue === 0) {
                    setPredictionMessage('Prediction is No');
                }
            }
        }

        fillForm();
    }, []);


    console.log(location.state.prediction);

    return (
        <div>
            <h3>Student Prediction Data</h3>
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
