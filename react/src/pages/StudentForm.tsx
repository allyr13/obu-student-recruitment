import React, { useState, ChangeEvent, FormEvent } from 'react';
import '../css/StudentForm.css';


interface FormData {
  state: string;
  country: string;
  gender: string;
  ethnicity: string;
  originSource: string;
  studentType: string;
  major: string;
  financialAidOfferedAmount: number;
  athlete: string;
  sport: string;
  raleyCollegeTagExists: string;
  recruitingTerritory: string;
  counselorIncomingTextCount: string;
  counselorOutgoingTextCount: string;
  phoneSuccessfulCount: string;
  phoneUnsuccessfulCount: string;
  phoneVoicemailCount: string;
  admittedStudentsDay: string;
  bisonDay: string;
  bisonDayAtTheWeekend: string;
  campusVisit: string;
  dallasBisonExclusive: string;
  footballVisit: string;
  golfVisit: string;
  oklahomaCityBisonExclusive: string;
  scholarsBisonDay: string;
  scholarsMixerAndBanquet: string;
  scholarshipInterview: string;
  scholarshipInterviewRegistration: string;
  softballVisit: string;
  trackVisit: string;
  tulsaBisonExclusive: string;
  volleyballVisit: string;
  eventsAttendedCount: string;
}

const StudentForm: React.FC = () => {
  // Initial state for the form with all fields
  const [formData, setFormData] = useState<FormData>({
    state: '',
    country: '',
    gender: '',
    ethnicity: '',
    originSource: '',
    studentType: '',
    major: '',
    financialAidOfferedAmount: 0,
    athlete: 'N', // Default to 'N'
    sport: '',
    raleyCollegeTagExists: 'N', // Default to 'N'
    recruitingTerritory: '',
    counselorIncomingTextCount: '',
    counselorOutgoingTextCount: '',
    phoneSuccessfulCount: '',
    phoneUnsuccessfulCount: '',
    phoneVoicemailCount: '',
    admittedStudentsDay: 'N', // Default to 'N'
    bisonDay: 'N', // Default to 'N'
    bisonDayAtTheWeekend: 'N', // Default to 'N'
    campusVisit: 'N', // Default to 'N'
    dallasBisonExclusive: 'N', // Default to 'N'
    footballVisit: 'N', // Default to 'N'
    golfVisit: 'N', // Default to 'N'
    oklahomaCityBisonExclusive: 'N', // Default to 'N'
    scholarsBisonDay: 'N', // Default to 'N'
    scholarsMixerAndBanquet: 'N', // Default to 'N'
    scholarshipInterview: 'N', // Default to 'N'
    scholarshipInterviewRegistration: 'N', // Default to 'N'
    softballVisit: 'N', // Default to 'N'
    trackVisit: 'N', // Default to 'N'
    tulsaBisonExclusive: 'N', // Default to 'N'
    volleyballVisit: 'N', // Default to 'N'
    eventsAttendedCount: '',
  });

  // Handle input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseInt(value), // If it's a number, parse it to an integer
      });
    } else {
      setFormData({
        ...formData,
        [name]: value, // For other fields, just use the value
      });
    }
  };

  // Handle form submission
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    // Convert form data to CSV format
    const csvHeader = Object.keys(formData).join(', ');
    const csvRow = Object.values(formData).join(', ');
    const csvData = `${csvHeader}\n${csvRow}`;

    // Trigger CSV download
    const csvBlob = new Blob([csvData], { type: 'text/csv' });
    const url = URL.createObjectURL(csvBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'student_data.csv';
    sendCSVToServer(csvData);
    a.click();
    URL.revokeObjectURL(url);
  };

  const sendCSVToServer = async (csvData: string) => {
    console.log("DATA SENT TO SERVER")
    try {
        const response = await fetch('http://127.0.0.1:5555/api/upload_csv', {
            method: 'POST',
            headers: {
                'Content-Type': 'text/csv',
            },
            body: csvData,
        });

        if (!response.ok) {
            throw new Error('Failed to send CSV data to server');
        }

        console.log('CSV data successfully sent to server');
    } catch (error) {
        console.error('Error sending CSV data:', error);
    }
  };


  return (
    <form onSubmit={handleSubmit}>
      {/* State */}
      <label>State (2-letter abbreviation):</label>
      <input
        type="text"
        name="state"
        value={formData.state}
        onChange={handleInputChange}
        maxLength={2}
        required
      />
      <br />

      {/* Country */}
      <label>Country (3-letter abbreviation):</label>
      <input
        type="text"
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        maxLength={3}
        required
      />
      <br />

      {/* Gender */}
      <label>Gender:</label>
      <select
        name="gender"
        value={formData.gender}
        onChange={handleInputChange}
        required
      >
        <option value="Male">Male</option>
        <option value="Female">Female</option>
        <option value="Other">Other</option>
      </select>
      <br />

      {/* Ethnicity */}
      <label>Ethnicity (Eth-1 through Eth-9):</label>
      <select
        name="ethnicity"
        value={formData.ethnicity}
        onChange={handleInputChange}
        required
      >
        <option value="Eth-1">Eth-1</option>
        <option value="Eth-2">Eth-2</option>
        <option value="Eth-3">Eth-3</option>
        <option value="Eth-4">Eth-4</option>
        <option value="Eth-5">Eth-5</option>
        <option value="Eth-6">Eth-6</option>
        <option value="Eth-7">Eth-7</option>
        <option value="Eth-8">Eth-8</option>
        <option value="Eth-9">Eth-9</option>
      </select>
      <br />

      {/* Origin Source */}
      <label>Origin Source:</label>
      <input
        type="text"
        name="originSource"
        value={formData.originSource}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Student Type */}
      <label>Student Type:</label>
      <select
        name="studentType"
        value={formData.studentType}
        onChange={handleInputChange}
        required
      >
        <option value="First time">First time</option>
        <option value="Transfer">Transfer</option>
        <option value="Test Optional">Test Optional</option>
        <option value="Transfer (24+ Hours)">Transfer (24+ Hours)</option>
      </select>
      <br />

      {/* Major */}
      <label>Major:</label>
      <input
        type="text"
        name="major"
        value={formData.major}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Financial Aid Offered Amount */}
      <label>Financial Aid Offered Amount:</label>
      <input
        type="number"
        name="financialAidOfferedAmount"
        value={formData.financialAidOfferedAmount}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Athlete */}
      <label>Athlete:</label>
      <select
        name="athlete"
        value={formData.athlete}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Sport */}
      <label>Sport:</label>
      <input
        type="text"
        name="sport"
        value={formData.sport}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Raley College Tag Exists */}
      <label>Raley College Tag Exists:</label>
      <select
        name="raleyCollegeTagExists"
        value={formData.raleyCollegeTagExists}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Recruiting Territory */}
      <label>Recruiting Territory:</label>
      <input
        type="text"
        name="recruitingTerritory"
        value={formData.recruitingTerritory}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Counselor Incoming Text Count */}
      <label>Counselor Incoming Text Count:</label>
      <input
        type="text"
        name="counselorIncomingTextCount"
        value={formData.counselorIncomingTextCount}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Counselor Outgoing Text Count */}
      <label>Counselor Outgoing Text Count:</label>
      <input
        type="text"
        name="counselorOutgoingTextCount"
        value={formData.counselorOutgoingTextCount}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Phone Successful Count */}
      <label>Phone Successful Count:</label>
      <input
        type="text"
        name="phoneSuccessfulCount"
        value={formData.phoneSuccessfulCount}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Phone Unsuccessful Count */}
      <label>Phone Unsuccessful Count:</label>
      <input
        type="text"
        name="phoneUnsuccessfulCount"
        value={formData.phoneUnsuccessfulCount}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Phone Voicemail Count */}
      <label>Phone Voicemail Count:</label>
      <input
        type="text"
        name="phoneVoicemailCount"
        value={formData.phoneVoicemailCount}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Admitted Students Day */}
      <label>Admitted Students Day:</label>
      <select
        name="admittedStudentsDay"
        value={formData.admittedStudentsDay}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Bison Day */}
      <label>Bison Day:</label>
      <select
        name="bisonDay"
        value={formData.bisonDay}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Bison Day at The Weekend */}
      <label>Bison Day at The Weekend:</label>
      <select
        name="bisonDayAtTheWeekend"
        value={formData.bisonDayAtTheWeekend}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Campus Visit */}
      <label>Campus Visit:</label>
      <select
        name="campusVisit"
        value={formData.campusVisit}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Dallas Bison Exclusive */}
      <label>Dallas Bison Exclusive:</label>
      <select
        name="dallasBisonExclusive"
        value={formData.dallasBisonExclusive}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Football Visit */}
      <label>Football Visit:</label>
      <select
        name="footballVisit"
        value={formData.footballVisit}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Golf Visit */}
      <label>Golf Visit:</label>
      <select
        name="golfVisit"
        value={formData.golfVisit}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Oklahoma City Bison Exclusive */}
      <label>Oklahoma City Bison Exclusive:</label>
      <select
        name="oklahomaCityBisonExclusive"
        value={formData.oklahomaCityBisonExclusive}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Scholars Bison Day */}
      <label>Scholars Bison Day:</label>
      <select
        name="scholarsBisonDay"
        value={formData.scholarsBisonDay}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Scholars Mixer and Banquet */}
      <label>Scholars Mixer and Banquet:</label>
      <select
        name="scholarsMixerAndBanquet"
        value={formData.scholarsMixerAndBanquet}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Scholarship Interview */}
      <label>Scholarship Interview:</label>
      <select
        name="scholarshipInterview"
        value={formData.scholarshipInterview}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Scholarship Interview Registration */}
      <label>Scholarship Interview Registration:</label>
      <select
        name="scholarshipInterviewRegistration"
        value={formData.scholarshipInterviewRegistration}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Softball Visit */}
      <label>Softball Visit:</label>
      <select
        name="softballVisit"
        value={formData.softballVisit}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Track Visit */}
      <label>Track Visit:</label>
      <select
        name="trackVisit"
        value={formData.trackVisit}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Tulsa Bison Exclusive */}
      <label>Tulsa Bison Exclusive:</label>
      <select
        name="tulsaBisonExclusive"
        value={formData.tulsaBisonExclusive}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Volleyball Visit */}
      <label>Volleyball Visit:</label>
      <select
        name="volleyballVisit"
        value={formData.volleyballVisit}
        onChange={handleInputChange}
        required
      >
        <option value="Y">Y</option>
        <option value="N">N</option>
      </select>
      <br />

      {/* Events Attended Count */}
      <label>Events Attended Count:</label>
      <input
        type="text"
        name="eventsAttendedCount"
        value={formData.eventsAttendedCount}
        onChange={handleInputChange}
        required
      />
      <br />

      {/* Submit Button */}
      <button type="submit">Submit</button>
      </form>
  );
};

export default StudentForm;