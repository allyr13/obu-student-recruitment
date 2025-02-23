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
    // Default Values
    state: '',
    country: '',
    gender: '',
    ethnicity: '',
    originSource: '',
    studentType: '',
    major: '',
    financialAidOfferedAmount: 0,
    athlete: 'N', 
    sport: '',
    raleyCollegeTagExists: 'N', 
    recruitingTerritory: '',
    counselorIncomingTextCount: '',
    counselorOutgoingTextCount: '',
    phoneSuccessfulCount: '',
    phoneUnsuccessfulCount: '',
    phoneVoicemailCount: '',
    admittedStudentsDay: 'N', 
    bisonDay: 'N', 
    bisonDayAtTheWeekend: 'N', 
    campusVisit: 'N', 
    dallasBisonExclusive: 'N', 
    footballVisit: 'N', 
    golfVisit: 'N', 
    oklahomaCityBisonExclusive: 'N', 
    scholarsBisonDay: 'N', 
    scholarsMixerAndBanquet: 'N', 
    scholarshipInterview: 'N', 
    scholarshipInterviewRegistration: 'N', 
    softballVisit: 'N', 
    trackVisit: 'N', 
    tulsaBisonExclusive: 'N', 
    volleyballVisit: 'N', 
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
    console.log(csvData)
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
      <label>State:</label>
      <select
        name="state"
        value={formData.state}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose a State</option>
        <option value="AL">AL</option>
        <option value="AK">AK</option>
        <option value="AZ">AZ</option>
        <option value="AR">AR</option>
        <option value="CA">CA</option>
        <option value="CO">CO</option>
        <option value="CT">CT</option>
        <option value="DE">DE</option>
        <option value="FL">FL</option>
        <option value="GA">GA</option>
        <option value="HI">HI</option>
        <option value="ID">ID</option>
        <option value="IL">IL</option>
        <option value="IN">IN</option>
        <option value="IA">IA</option>
        <option value="KS">KS</option>
        <option value="KY">KY</option>
        <option value="LA">LA</option>
        <option value="ME">ME</option>
        <option value="MD">MD</option>
        <option value="MA">MA</option>
        <option value="MI">MI</option>
        <option value="MN">MN</option>
        <option value="MS">MS</option>
        <option value="MO">MO</option>
        <option value="MT">MT</option>
        <option value="NE">NE</option>
        <option value="NV">NV</option>
        <option value="NH">NH</option>
        <option value="NJ">NJ</option>
        <option value="NM">NM</option>
        <option value="NY">NY</option>
        <option value="NC">NC</option>
        <option value="ND">ND</option>
        <option value="OH">OH</option>
        <option value="OK">OK</option>
        <option value="OR">OR</option>
        <option value="PA">PA</option>
        <option value="RI">RI</option>
        <option value="SC">SC</option>
        <option value="SD">SD</option>
        <option value="TN">TN</option>
        <option value="TX">TX</option>
        <option value="UT">UT</option>
        <option value="VT">VT</option>
        <option value="VA">VA</option>
        <option value="WA">WA</option>
        <option value="WV">WV</option>
        <option value="WI">WI</option>
        <option value="WY">WY</option>
        <option value="Other">Other</option> 
      </select>
      <br />

      {/* Country */}
      <label>Country:</label>
      <select
        name="country"
        value={formData.country}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose a Country</option>
        <option value="USA">USA</option>
        <option value="AGF">AFG</option>
        <option value="ALB">ALB</option>
        <option value="DZA">DZA</option>
        <option value="ASM">ASM</option>
        <option value="AND">AND</option>
        <option value="AGO">AGO</option>
        <option value="AIA">AIA</option>
        <option value="ATA">ATA</option>
        <option value="ATG">ATG</option>
        <option value="ARG">ARG</option>
        <option value="ARM">ARM</option>
        <option value="ABW">ABW</option>
        <option value="AUS">AUS</option>
        <option value="AUT">AUT</option>
        <option value="AZE">AZE</option>
        <option value="BHS">BHS</option>
        <option value="BHR">BHR</option>
        <option value="BGD">BGD</option>
        <option value="BRB">BRB</option>
        <option value="BLR">BLR</option>
        <option value="BEL">BEL</option>
        <option value="BLZ">BLZ</option>
        <option value="BEN">BEN</option>
        <option value="BMU">BMU</option>
        <option value="BTN">BTN</option>
        <option value="BOL">BOL</option>
        <option value="BES">BES</option>
        <option value="BIH">BIH</option>
        <option value="BWA">BWA</option>
        <option value="BVT">BVT</option>
        <option value="BRA">BRA</option>
        <option value="IOT">IOT</option>
        <option value="BRN">BRN</option>
        <option value="BGR">BGR</option>
        <option value="BFA">BFA</option>
        <option value="BDI">BDI</option>
        <option value="CPV">CPV</option>
        <option value="KHM">KHM</option>
        <option value="CMR">CMR</option>
        <option value="CAN">CAN</option>
        <option value="CYM">CYM</option>
        <option value="CAF">CAF</option>
        <option value="TCD">TCD</option>
        <option value="CHL">CHL</option>
        <option value="CHN">CHN</option>
        <option value="CXR">CXR</option>
        <option value="CCK">CCK</option>
        <option value="COL">COL</option>
        <option value="COM">COM</option>
        <option value="COD">COD</option>
        <option value="COG">COG</option>
        <option value="COK">COK</option>
        <option value="CRI">CRI</option>
        <option value="HRV">HRV</option>
        <option value="CUB">CUB</option>
        <option value="CUW">CUW</option>
        <option value="CYP">CYP</option>
        <option value="CZE">CZE</option>
        <option value="CIV">CIV</option>
        <option value="DNK">DNK</option>
        <option value="DJI">DJI</option>
        <option value="DMA">DMA</option>
        <option value="DOM">DOM</option>
        <option value="ECU">ECU</option>
        <option value="EGY">EGY</option>
        <option value="SLV">SLV</option>
        <option value="GNQ">GNQ</option>
        <option value="ERI">ERI</option>
        <option value="EST">EST</option>
        <option value="SWZ">SWZ</option>
        <option value="ETH">ETH</option>
        <option value="FLK">FLK</option>
        <option value="FRO">FRO</option>
        <option value="FJI">FJI</option>
        <option value="FIN">FIN</option>
        <option value="FRA">FRA</option>
        <option value="GUF">GUF</option>
        <option value="PYF">PYF</option>
        <option value="ATF">ATF</option>
        <option value="GAB">GAB</option>
        <option value="GMB">GMB</option>
        <option value="GEO">GEO</option>
        <option value="DEU">DEU</option>
        <option value="GHA">GHA</option>
        <option value="GIB">GIB</option>
        <option value="GRC">GRC</option>
        <option value="GRL">GRL</option>
        <option value="GRD">GRD</option>
        <option value="GLP">GLP</option>
        <option value="GUM">GUM</option>
        <option value="GTM">GTM</option>
        <option value="GGY">GGY</option>
        <option value="GIN">GIN</option>
        <option value="GNB">GNB</option>
        <option value="GUY">GUY</option>
        <option value="HTI">HTI</option>
        <option value="HMD">HMD</option>
        <option value="VAT">VAT</option>
        <option value="HND">HND</option>
        <option value="HKG">HKG</option>
        <option value="HUN">HUN</option>
        <option value="ISL">ISL</option>
        <option value="IND">IND</option>
        <option value="IDN">IDN</option>
        <option value="IRN">IRN</option>
        <option value="IRQ">IRQ</option>
        <option value="IRL">IRL</option>
        <option value="IMN">IMN</option>
        <option value="ISR">ISR</option>
        <option value="ITA">ITA</option>
        <option value="JAM">JAM</option>
        <option value="JPN">JPN</option>
        <option value="JEY">JEY</option>
        <option value="JOR">JOR</option>
        <option value="KAZ">KAZ</option>
        <option value="KEN">KEN</option>
        <option value="KIR">KIR</option>
        <option value="PRK">PRK</option>
        <option value="KOR">KOR</option>
        <option value="KWT">KWT</option>
        <option value="KGZ">KGZ</option>
        <option value="LAO">LAO</option>
        <option value="LVA">LVA</option>
        <option value="LBN">LBN</option>
        <option value="LSO">LSO</option>
        <option value="LBR">LBR</option>
        <option value="LBY">LBY</option>
        <option value="LIE">LIE</option>
        <option value="LTU">LTU</option>
        <option value="LUX">LUX</option>
        <option value="MAC">MAC</option>
        <option value="MDG">MDG</option>
        <option value="MWI">MWI</option>
        <option value="MYS">MYS</option>
        <option value="MDV">MDV</option>
        <option value="MLI">MLI</option>
        <option value="MLT">MLT</option>
        <option value="MHL">MHL</option>
        <option value="MTQ">MTQ</option>
        <option value="MRT">MRT</option>
        <option value="MUS">MUS</option>
        <option value="MYT">MYT</option>
        <option value="MEX">MEX</option>
        <option value="FSM">FSM</option>
        <option value="MDA">MDA</option>
        <option value="MCO">MCO</option>
        <option value="MNG">MNG</option>
        <option value="MNE">MNE</option>
        <option value="MSR">MSR</option>
        <option value="MAR">MAR</option>
        <option value="MOZ">MOZ</option>
        <option value="MMR">MMR</option>
        <option value="NAM">NAM</option>
        <option value="NRU">NRU</option>
        <option value="NPL">NPL</option>
        <option value="NLD">NLD</option>
        <option value="NCL">NCL</option>
        <option value="NZL">NZL</option>
        <option value="NIC">NIC</option>
        <option value="NER">NER</option>
        <option value="NGA">NGA</option>
        <option value="NIU">NIU</option>
        <option value="NFK">NFK</option>
        <option value="MNP">MNP</option>
        <option value="NOR">NOR</option>
        <option value="OMN">OMN</option>
        <option value="PAK">PAK</option>
        <option value="PLW">PLW</option>
        <option value="PSE">PSE</option>
        <option value="PAN">PAN</option>
        <option value="PNG">PNG</option>
        <option value="PRY">PRY</option>
        <option value="PER">PER</option>
        <option value="PHL">PHL</option>
        <option value="PCN">PCN</option>
        <option value="POL">POL</option>
        <option value="PRT">PRT</option>
        <option value="PRI">PRI</option>
        <option value="QAT">QAT</option>
        <option value="MKD">MKD</option>
        <option value="ROU">ROU</option>
        <option value="RUS">RUS</option>
        <option value="RWA">RWA</option>
        <option value="REU">REU</option>
        <option value="BLM">BLM</option>
        <option value="SHN">SHN</option>
        <option value="KNA">KNA</option>
        <option value="LCA">LCA</option>
        <option value="MAF">MAF</option>
        <option value="SPM">SPM</option>
        <option value="VCT">VCT</option>
        <option value="WSM">WSM</option>
        <option value="SMR">SMR</option>
        <option value="STP">STP</option>
        <option value="SAU">SAU</option>
        <option value="SEN">SEN</option>
        <option value="SRB">SRB</option>
        <option value="SYC">SYC</option>
        <option value="SLE">SLE</option>
        <option value="SGP">SGP</option>
        <option value="SXM">SXM</option>
        <option value="SVK">SVK</option>
        <option value="SVN">SVN</option>
        <option value="SLB">SLB</option>
        <option value="SOM">SOM</option>
        <option value="ZAF">ZAF</option>
        <option value="SGS">SGS</option>
        <option value="SSD">SSD</option>
        <option value="ESP">ESP</option>
        <option value="LKA">LKA</option>
        <option value="SDN">SDN</option>
        <option value="SUR">SUR</option>
        <option value="SJM">SJM</option>
        <option value="SWE">SWE</option>
        <option value="CHE">CHE</option>
        <option value="SYR">SYR</option>
        <option value="TWN">TWN</option>
        <option value="TJK">TJK</option>
        <option value="TZA">TZA</option>
        <option value="THA">THA</option>
        <option value="TLS">TLS</option>
        <option value="TGO">TGO</option>
        <option value="TKL">TKL</option>
        <option value="TON">TON</option>
        <option value="TTO">TTO</option>
        <option value="TUN">TUN</option>
        <option value="TUR">TUR</option>
        <option value="TKM">TKM</option>
        <option value="TCA">TCA</option>
        <option value="TUV">TUV</option>
        <option value="UGA">UGA</option>
        <option value="UKR">UKR</option>
        <option value="ARE">ARE</option>
        <option value="GBR">GBR</option>
        <option value="UMI">UMI</option>
        <option value="URY">URY</option>
        <option value="UZB">UZB</option>
        <option value="VUT">VUT</option>
        <option value="VEN">VEN</option>
        <option value="VNM">VNM</option>
        <option value="VGB">VGB</option>
        <option value="VIR">VIR</option>
        <option value="WLF">WLF</option>
        <option value="ESH">ESH</option>
        <option value="YEM">YEM</option>
        <option value="ZMB">ZMB</option>
        <option value="ZWE">ZWE</option>
        <option value="ALA">ALA</option>
        
      </select>
      <br />

      {/* Gender */}
      <label>Gender:</label>
      <select
        name="gender"
        value={formData.gender}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose a Gender</option>
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
        <option value="" disabled>Choose an Ethnicity</option>
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
      <select
        name="originSource"
        value={formData.originSource}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose an Origin Source</option>
        <option value="NA">NA</option>
        <option value="Origin1">Origin1</option>
        <option value="Origin2">Origin2</option>
        </select>
      <br />

      {/* Student Type */}
      <label>Student Type:</label>
      <select
        name="studentType"
        value={formData.studentType}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose a Student Type</option>
        <option value="First time">First time</option>
        <option value="Transfer">Transfer</option>
        <option value="Test Optional">Test Optional</option>
        <option value="Transfer (24+ Hours)">Transfer (24+ Hours)</option>
      </select>
      <br />

      {/* Major */}
      <label>Major:</label>
      <select
        name="major"
        value={formData.major}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose a Major</option>
        <option value="Computer Science">Computer Science</option>
        <option value="Accounting">Accounting</option>
        <option value="Business">Business</option>
      </select>
      <br />

      {/* Financial Aid Offered Amount */}
      <label >Financial Aid Offered Amount:</label>
      <input
        type="number"
        name="financialAidOfferedAmount"
        value={formData.financialAidOfferedAmount}
        onChange={handleInputChange}
        placeholder="0.00"
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
        <option value="1">Y</option>
        <option value="0">N</option>
      </select>
      <br />

      {/* Sport */}
      <label>Sport:</label>
      <select
        name="sport"
        value={formData.sport}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose a Sport</option>
        <option value="No Sport">No Sport</option>
        <option value="Volleyball">Volleyball</option>
        <option value="Softball">Softball</option>
        <option value="Baseball">Baseball</option>
        <option value="Men's Basketball">Men's Basketball</option>
        <option value="Women's Basketball">Women's Basketball</option>
        <option value="Football">Football</option>
        <option value="Men's Cross Country">Men's Cross Country</option>
        <option value="Women's Cross Country">Women's Cross Country</option>
        <option value="Men's Track and Field">Men's Track and Field</option>
        <option value="Women's Track and Field">Women's Track and Field</option>
        <option value="Women's Golf">Women's Golf</option>
        <option value="Women's Soccer">Women's Soccer</option>
        <option value="Stunt">Stunt</option>
      </select>
      <br />

      {/* Raley College Tag Exists */}
      <label>Raley College Tag Exists:</label>
      <select
        name="raleyCollegeTagExists"
        value={formData.raleyCollegeTagExists}
        onChange={handleInputChange}
        required
      >
        <option value="0">N</option>
        <option value="1">Y</option>
      </select>
      <br />

      {/* Recruiting Territory */}
      <label>Recruiting Territory:</label>
      <select
        name="recruitingTerritory"
        value={formData.recruitingTerritory}
        onChange={handleInputChange}
        required
      >
        <option value="" disabled>Choose a Territory</option>
        <option value="territory1">Territory 1</option>
        <option value="territory2">Territory 2</option>
      </select>
      <br />

      {/* Counselor Incoming Text Count */}
      <label>Counselor Incoming Text Count:</label>
      <input
        type="number"
        name="counselorIncomingTextCount"
        value={formData.counselorIncomingTextCount}
        onChange={handleInputChange}
        placeholder="0.00"
        required
      />
      <br />

      {/* Counselor Outgoing Text Count */}
      <label>Counselor Outgoing Text Count:</label>
      <input
        type="number"
        name="counselorOutgoingTextCount"
        value={formData.counselorOutgoingTextCount}
        onChange={handleInputChange}
        placeholder="0.00"
        required
      />
      <br />

      {/* Phone Successful Count */}
      <label>Phone Successful Count:</label>
      <input
        type="number"
        name="phoneSuccessfulCount"
        value={formData.phoneSuccessfulCount}
        onChange={handleInputChange}
        placeholder="0.00"
        required
      />
      <br />

      {/* Phone Unsuccessful Count */}
      <label>Phone Unsuccessful Count:</label>
      <input
        type="number"
        name="phoneUnsuccessfulCount"
        value={formData.phoneUnsuccessfulCount}
        onChange={handleInputChange}
        placeholder="0.00"
        required
      />
      <br />

      {/* Phone Voicemail Count */}
      <label>Phone Voicemail Count:</label>
      <input
        type="number"
        name="phoneVoicemailCount"
        value={formData.phoneVoicemailCount}
        onChange={handleInputChange}
        placeholder="0.00"
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
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
        <option value="0">N</option>
        <option value="1">Y</option>
      </select>
      <br />

      {/* Events Attended Count */}
      <label>Events Attended Count:</label>
      <input
        type="number"
        name="eventsAttendedCount"
        value={formData.eventsAttendedCount}
        onChange={handleInputChange}
        placeholder="0.00"
        required
      />
      <br />

      {/* Submit Button */}
      <button type="submit">Submit</button>
      </form>
  );
};

export default StudentForm;