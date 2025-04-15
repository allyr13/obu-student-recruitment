import React, { useState, ChangeEvent, FormEvent, useEffect } from 'react';
import '../css/StudentForm.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {useLocation} from 'react-router-dom';

const BASE_API = process.env.REACT_APP_API_BASE_URL;

interface FormData {
    state: string;
    country: string;
    gender: string;
    ethnicity: string;
    studentIDs: string;
    originSource: string;
    studentType: string;
    major: string;
    financialAidOfferedAmount: number;
    athlete: string;
    sport: string;
    raleyCollegeTagExists: string;
    recruitingTerritory: string;
    counselor: string;
    counselorIncomingTextCount: number;
    counselorOutgoingTextCount: number;
    phoneSuccessfulCount: number;
    phoneUnsuccessfulCount: number;
    phoneVoicemailCount: number;
    admittedStudentsDay: number;
    bisonDay: number;
    bisonDayAtTheWeekend: number;
    campusVisit: number;
    dallasBisonExclusive: number;
    footballVisit: number;
    golfVisit: number;
    oklahomaCityBisonExclusive: number;
    scholarsBisonDay: number;
    scholarsMixerAndBanquet: number;
    scholarshipInterview: number;
    scholarshipInterviewRegistration: number;
    softballVisit: number;
    trackVisit: number;
    tulsaBisonExclusive: number;
    volleyballVisit: number;
    eventsAttendedCount: number;
}

const StudentForm: React.FC = () => {
    // Initial state for the form with all fields
    const [formData, setFormData] = useState<FormData>({
        // Default Values
        state: 'OK',
        country: 'USA',
        gender: 'F',
        ethnicity: 'Not Declared',
        studentIDs: '01304217',
        originSource: 'Falls Creek',
        studentType: 'First-Time Freshman',
        major: 'Undecided',
        financialAidOfferedAmount: 24724.1,
        athlete: 'N',
        sport: 'Not Declared',
        raleyCollegeTagExists: 'N',
        recruitingTerritory: 'Raley College',
        counselor: 'C11',
        counselorIncomingTextCount: 5.6,
        counselorOutgoingTextCount: 14.3,
        phoneSuccessfulCount: 2.1,
        phoneUnsuccessfulCount: 2.0,
        phoneVoicemailCount: 3.1,
        admittedStudentsDay: 0.0,
        bisonDay: 0.0,
        bisonDayAtTheWeekend: 0.0,
        campusVisit: 0.0,
        dallasBisonExclusive: 0.0,
        footballVisit: 0.0,
        golfVisit: 0.0,
        oklahomaCityBisonExclusive: 0.0,
        scholarsBisonDay: 0.0,
        scholarsMixerAndBanquet: 0.0,
        scholarshipInterview: 0.0,
        scholarshipInterviewRegistration: 0.0,
        softballVisit: 0.0,
        trackVisit: 0.0,
        tulsaBisonExclusive: 0.0,
        volleyballVisit: 0.0,
        eventsAttendedCount: 1.4,
    });

    let date = new Date();
    let dateTimeString = date.toISOString().slice(0, 19);

    const [message, setMessage] = useState('');
    const [userPrefix, setUserPrefix] = useState('');
    const [userID, setUserID] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const location = useLocation();
    const selectedFolder = location.state.folder.selectedFolder || '';
    const [fileName, setFileName] = useState(`student_form_data_${dateTimeString}.csv`)

    useEffect(() => {
        const storedAuth = localStorage.getItem("isAuthenticated");
        const storedPrefix = localStorage.getItem("User_Prefix");
        const storedUserID = localStorage.getItem("User_ID");
        
        if (storedAuth === "true" && storedPrefix && storedUserID) {
          setIsAuthenticated(true);
          setUserPrefix(storedPrefix);
          setUserID(storedUserID);
        }
    }, []);

    const navigate = useNavigate();

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

    const handleFileNameChange = (e: ChangeEvent<HTMLInputElement>) => {
        let theFileName = e.target.value;
        if (!theFileName.endsWith(".csv")){
            theFileName += ".csv"
        }
        setFileName(theFileName);
        
    }

    const uploadFileToS3 = async (files: FileList, globalFlag: string) => {
        if (!files || files.length === 0) {
          setMessage("Please select files to upload.");
          return;
        }
    
        console.log(files)
    
        const fileData = new FormData();
    
        Array.from(files).forEach((file) => {
          const relativePath = (file as any).webkitRelativePath || file.name;
          fileData.append("file", file);
          fileData.append(`path_${file.name}`, relativePath);
        });
        
        let prefix = userPrefix;
        if (selectedFolder == "global") {
            prefix = "/global";
            globalFlag = "True";
            }
        console.log("Prefix:", prefix);
        console.log("Global Flag:", globalFlag);
        console.log("Selected Folder:", selectedFolder);
        fileData.append('prefix', prefix);
        fileData.append('global', globalFlag);
        fileData.append('folder', selectedFolder)
        console.log("Uploading file to S3 Bucket. Is global upload:", globalFlag);
    
        try {
          const response = await axios.post(`${BASE_API}/api/upload_to_s3`, fileData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          setMessage(`File uploaded successfully: ${response.data.message}`);
        } catch (error) {
          setMessage('Error uploading file: ' + error.message);
        }
      };
    
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        try {

            const csvHeader = Object.keys(formData).join(',');
            const csvRow = Object.values(formData).join(',');
            const csvData = `${csvHeader}\n${csvRow}`;

            const csvBlob = new Blob([csvData], { type: 'text/csv' });
            const formDataToSend = new FormData();
            formDataToSend.append('file', csvBlob, fileName);

            const response = await fetch(`${BASE_API}/api/upload_data`, {
                method: 'POST',
                body: formDataToSend,
            });
            const result = await response.json();
            const predictionsObj = result.data;

            if (!response.ok) {
                console.error(result.error);
                alert(`Error: ${result.error}`);
                return;
            }else{
                if (predictionsObj["0"] == 0) {
                    predictionsObj["0"] = "No";
                } else {
                    predictionsObj["0"] = "Yes";
                }
                
            }

            let list = new DataTransfer();
            let csvFile = new File([csvBlob], fileName);
            list.items.add(csvFile);
            let fileList = list.files;

            const jsonData = () => {
              const headers = Object.keys(formData);
              const rows = Object.values(formData);
            
              const jsonData: Record<string, Record<number, string | number>> = {};
            
              headers.forEach((key, colIndex) => {
                  jsonData[key] = { "0": rows[colIndex] }; // "0" represents the first row (more rows would be added dynamically)
              });
              return jsonData
            }
            
            if (result.status === 200) {
                uploadFileToS3(fileList, "False")
                navigate('/table', {state: {data: jsonData(), prediction: predictionsObj}});
            }

        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while uploading the file or sending the prediction.');
        }
    };


    return (
        <div>
        <form className="form" onSubmit={handleSubmit}>
            {/* State */}
            <label>State:</label>
            <select
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                required
            >
                <option value="AB">AB</option>
                <option value="AE">AE</option>
                <option value="AK">AK</option>
                <option value="AL">AL</option>
                <option value="AP">AP</option>
                <option value="AR">AR</option>
                <option value="AZ">AZ</option>
                <option value="BC">BC</option>
                <option value="CA">CA</option>
                <option value="CO">CO</option>
                <option value="CT">CT</option>
                <option value="DC">DC</option>
                <option value="DE">DE</option>
                <option value="FL">FL</option>
                <option value="GA">GA</option>
                <option value="HI">HI</option>
                <option value="IA">IA</option>
                <option value="ID">ID</option>
                <option value="IL">IL</option>
                <option value="IN">IN</option>
                <option value="KS">KS</option>
                <option value="KY">KY</option>
                <option value="LA">LA</option>
                <option value="MA">MA</option>
                <option value="MD">MD</option>
                <option value="ME">ME</option>
                <option value="MI">MI</option>
                <option value="MN">MN</option>
                <option value="MO">MO</option>
                <option value="MS">MS</option>
                <option value="MT">MT</option>
                <option value="NC">NC</option>
                <option value="ND">ND</option>
                <option value="NE">NE</option>
                <option value="NH">NH</option>
                <option value="NJ">NJ</option>
                <option value="NM">NM</option>
                <option value="NV">NV</option>
                <option value="NY">NY</option>
                <option value="OH">OH</option>
                <option value="OK">OK</option>
                <option value="ON">ON</option>
                <option value="OR">OR</option>
                <option value="PA">PA</option>
                <option value="PR">PR</option>
                <option value="RI">RI</option>
                <option value="SC">SC</option>
                <option value="SD">SD</option>
                <option value="TN">TN</option>
                <option value="TX">TX</option>
                <option value="UT">UT</option>
                <option value="VA">VA</option>
                <option value="VT">VT</option>
                <option value="WA">WA</option>
                <option value="WI">WI</option>
                <option value="WV">WV</option>
                <option value="WY">WY</option>
                <option value="-- Select --">-- Select --</option>
                <option value="ADDIS ABABA">ADDIS ABABA</option>
                <option value="ANAMBRA">ANAMBRA</option>
                <option value="ASHANTI">ASHANTI</option>
                <option value="ASHANTI REGION">ASHANTI REGION</option>
                <option value="Abia">Abia</option>
                <option value="Addis Ababa">Addis Ababa</option>
                <option value="Akwa Ibom">Akwa Ibom</option>
                <option value="Al Farwaniyah">Al Farwaniyah</option>
                <option value="Almaty">Almaty</option>
                <option value="Anambra">Anambra</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Antananarivo">Antananarivo</option>
                <option value="Araucania">Araucania</option>
                <option value="Artigas">Artigas</option>
                <option value="Ashanti">Ashanti</option>
                <option value="BONO EAST">BONO EAST</option>
                <option value="Bagmati">Bagmati</option>
                <option value="Balochistan">Balochistan</option>
                <option value="Banjul">Banjul</option>
                <option value="Baringo">Baringo</option>
                <option value="Barisal">Barisal</option>
                <option value="Bihar">Bihar</option>
                <option value="Bolivar">Bolivar</option>
                <option value="Bong">Bong</option>
                <option value="Brong-Ahafo">Brong-Ahafo</option>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="Bujumbura">Bujumbura</option>
                <option value="CAPITAL CITY">CAPITAL CITY</option>
                <option value="CENTRAL REGION">CENTRAL REGION</option>
                <option value="Central">Central</option>
                <option value="Central Equatoria">Central Equatoria</option>
                <option value="Central River Division">Central River Division</option>
                <option value="Centre">Centre</option>
                <option value="Chittagong Division">Chittagong Division</option>
                <option value="Colon">Colon</option>
                <option value="Cross River">Cross River</option>
                <option value="DAKAR">DAKAR</option>
                <option value="Dar es Salaam">Dar es Salaam</option>
                <option value="Delhi">Delhi</option>
                <option value="Delta">Delta</option>
                <option value="Dhaka Division">Dhaka Division</option>
                <option value="Doukkala-Abda">Doukkala-Abda</option>
                <option value="Dubai">Dubai</option>
                <option value="Dushanbe">Dushanbe</option>
                <option value="ENUGU STATE">ENUGU STATE</option>
                <option value="ETHIOPIA">ETHIOPIA</option>
                <option value="East Kazakhstan">East Kazakhstan</option>
                <option value="Eastern">Eastern</option>
                <option value="Eastern Cape">Eastern Cape</option>
                <option value="Eastern Visayas">Eastern Visayas</option>
                <option value="Edo">Edo</option>
                <option value="Elgeyo-Marakwet">Elgeyo-Marakwet</option>
                <option value="Enga">Enga</option>
                <option value="Enugu">Enugu</option>
                <option value="FARG'ONA VILOYATI">FARG'ONA VILOYATI</option>
                <option value="FERGANA">FERGANA</option>
                <option value="Famagusta">Famagusta</option>
                <option value="Fars">Fars</option>
                <option value="Federal Capital Territory">Federal Capital Territory</option>
                <option value="Fergana">Fergana</option>
                <option value="Francisco Morazan">Francisco Morazan</option>
                <option value="GHANA">GHANA</option>
                <option value="GREATER ACCRA">GREATER ACCRA</option>
                <option value="GUATENG">GUATENG</option>
                <option value="Gandaki">Gandaki</option>
                <option value="Garissa">Garissa</option>
                <option value="Gauteng">Gauteng</option>
                <option value="Gaza">Gaza</option>
                <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                <option value="Grand Casablanca">Grand Casablanca</option>
                <option value="Greater Accra">Greater Accra</option>
                <option value="Harare">Harare</option>
                <option value="Harghita">Harghita</option>
                <option value="Herat">Herat</option>
                <option value="Hesse">Hesse</option>
                <option value="Hhohho">Hhohho</option>
                <option value="ISLAMABAD CAPITAL TERRITORY">ISLAMABAD CAPITAL TERRITORY</option>
                <option value="Imo">Imo</option>
                <option value="Istanbul">Istanbul</option>
                <option value="JANAKPUR">JANAKPUR</option>
                <option value="KANESHIE">KANESHIE</option>
                <option value="KERICHO">KERICHO</option>
                <option value="Kaduna">Kaduna</option>
                <option value="Kericho">Kericho</option>
                <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa</option>
                <option value="Kiambu">Kiambu</option>
                <option value="Kigali">Kigali</option>
                <option value="Kinshasa">Kinshasa</option>
                <option value="Kisii">Kisii</option>
                <option value="KwaZulu-Natal">KwaZulu-Natal</option>
                <option value="Kwara">Kwara</option>
                <option value="LAGOS">LAGOS</option>
                <option value="Lagos">Lagos</option>
                <option value="Lambayeque">Lambayeque</option>
                <option value="Limpopo">Limpopo</option>
                <option value="Littoral">Littoral</option>
                <option value="Madhesh Pradesh">Madhesh Pradesh</option>
                <option value="Madhya Pashchimanchal">Madhya Pashchimanchal</option>
                <option value="Madrid Autonomous Community">Madrid Autonomous Community</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manicaland">Manicaland</option>
                <option value="Manipur">Manipur</option>
                <option value="Manzini">Manzini</option>
                <option value="Maritime">Maritime</option>
                <option value="Maseru">Maseru</option>
                <option value="Metro Manila">Metro Manila</option>
                <option value="Mexico City">Mexico City</option>
                <option value="Minas Gerais">Minas Gerais</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Montserrado">Montserrado</option>
                <option value="Morazan">Morazan</option>
                <option value="Mpumalanga">Mpumalanga</option>
                <option value="Muscat">Muscat</option>
                <option value="Nairobi County">Nairobi County</option>
                <option value="Namangan">Namangan</option>
                <option value="Nandi">Nandi</option>
                <option value="New Providence">New Providence</option>
                <option value="Nimba">Nimba</option>
                <option value="North Kivu">North Kivu</option>
                <option value="North Rhine-Westphalia">North Rhine-Westphalia</option>
                <option value="Northern">Northern</option>
                <option value="Northern Ireland">Northern Ireland</option>
                <option value="Northwest">Northwest</option>
                <option value="Not Declared">Not Declared</option>
                <option value="Odisha">Odisha</option>
                <option value="Ogun">Ogun</option>
                <option value="Ondo">Ondo</option>
                <option value="Oromia">Oromia</option>
                <option value="Oshana">Oshana</option>
                <option value="Osun">Osun</option>
                <option value="Oyo">Oyo</option>
                <option value="Oyo State">Oyo State</option>
                <option value="PUNJAB">PUNJAB</option>
                <option value="Parana">Parana</option>
                <option value="Piedmont">Piedmont</option>
                <option value="Plateau">Plateau</option>
                <option value="Prague">Prague</option>
                <option value="Punjab">Punjab</option>
                <option value="Purwanchal">Purwanchal</option>
                <option value="Qashqadaryo">Qashqadaryo</option>
                <option value="Quang Nam">Quang Nam</option>
                <option value="RIO GRANDE DO NORTE">RIO GRANDE DO NORTE</option>
                <option value="Rivers">Rivers</option>
                <option value="SANCTI SPIRITUS">SANCTI SPIRITUS</option>
                <option value="SOUTHWEST REGION">SOUTHWEST REGION</option>
                <option value="Sabaragamuwa">Sabaragamuwa</option>
                <option value="Sagaing">Sagaing</option>
                <option value="Saint Catherine">Saint Catherine</option>
                <option value="Saint James">Saint James</option>
                <option value="Saint Philip">Saint Philip</option>
                <option value="Samarqand">Samarqand</option>
                <option value="Sao Paulo">Sao Paulo</option>
                <option value="Scotland">Scotland</option>
                <option value="Sindh">Sindh</option>
                <option value="Southern">Southern</option>
                <option value="Southwest">Southwest</option>
                <option value="Sudur Pashchimanchal">Sudur Pashchimanchal</option>
                <option value="Sylhet Division">Sylhet Division</option>
                <option value="Tangier-Tetouan">Tangier-Tetouan</option>
                <option value="Tashkent">Tashkent</option>
                <option value="Tashkent Province">Tashkent Province</option>
                <option value="Telangana">Telangana</option>
                <option value="Uasin Gishu">Uasin Gishu</option>
                <option value="Ulaanbaatar">Ulaanbaatar</option>
                <option value="Upper West">Upper West</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Volta">Volta</option>
                <option value="WEST COAST DIVISION">WEST COAST DIVISION</option>
                <option value="West">West</option>
                <option value="West Bengal">West Bengal</option>
                <option value="West Coast Division">West Coast Division</option>
                <option value="Western">Western</option>
                <option value="Western Area">Western Area</option>
                <option value="Western Cape">Western Cape</option>
                <option value="Western Highlands">Western Highlands</option>
                <option value="Yangon">Yangon</option>
                <option value="Zurich">Zurich</option>
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
                <option value="ARE">ARE</option>
                <option value="ARG">ARG</option>
                <option value="BDI">BDI</option>
                <option value="BEN">BEN</option>
                <option value="BFA">BFA</option>
                <option value="BGD">BGD</option>
                <option value="BHS">BHS</option>
                <option value="BRA">BRA</option>
                <option value="BRB">BRB</option>
                <option value="BWA">BWA</option>
                <option value="CAN">CAN</option>
                <option value="CHE">CHE</option>
                <option value="CHL">CHL</option>
                <option value="CMR">CMR</option>
                <option value="COD">COD</option>
                <option value="CUB">CUB</option>
                <option value="CYP">CYP</option>
                <option value="CZE">CZE</option>
                <option value="DEU">DEU</option>
                <option value="ESP">ESP</option>
                <option value="ETH">ETH</option>
                <option value="FRA">FRA</option>
                <option value="GBR">GBR</option>
                <option value="GHA">GHA</option>
                <option value="GMB">GMB</option>
                <option value="HKG">HKG</option>
                <option value="HND">HND</option>
                <option value="IND">IND</option>
                <option value="IRN">IRN</option>
                <option value="ITA">ITA</option>
                <option value="JAM">JAM</option>
                <option value="KAZ">KAZ</option>
                <option value="KEN">KEN</option>
                <option value="KWT">KWT</option>
                <option value="LBR">LBR</option>
                <option value="LKA">LKA</option>
                <option value="LSO">LSO</option>
                <option value="MAR">MAR</option>
                <option value="MDG">MDG</option>
                <option value="MEX">MEX</option>
                <option value="MMR">MMR</option>
                <option value="MNG">MNG</option>
                <option value="MWI">MWI</option>
                <option value="NAM">NAM</option>
                <option value="NGA">NGA</option>
                <option value="NLD">NLD</option>
                <option value="NPL">NPL</option>
                <option value="NZL">NZL</option>
                <option value="Not Declared">Not Declared</option>
                <option value="OMN">OMN</option>
                <option value="PAK">PAK</option>
                <option value="PER">PER</option>
                <option value="PHL">PHL</option>
                <option value="PNG">PNG</option>
                <option value="PSE">PSE</option>
                <option value="ROU">ROU</option>
                <option value="RWA">RWA</option>
                <option value="SAU">SAU</option>
                <option value="SEN">SEN</option>
                <option value="SLE">SLE</option>
                <option value="SLV">SLV</option>
                <option value="SSD">SSD</option>
                <option value="SWZ">SWZ</option>
                <option value="TGO">TGO</option>
                <option value="TJK">TJK</option>
                <option value="TUR">TUR</option>
                <option value="TZA">TZA</option>
                <option value="UGA">UGA</option>
                <option value="URY">URY</option>
                <option value="USA">USA</option>
                <option value="UZB">UZB</option>
                <option value="VEN">VEN</option>
                <option value="VNM">VNM</option>
                <option value="WSM">WSM</option>
                <option value="ZAF">ZAF</option>
                <option value="ZMB">ZMB</option>
                <option value="ZWE">ZWE</option>
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
                <option value="M">M</option>
                <option value="F">F</option>
                <option value="Not Declared">Not Declared</option>
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
                <option value="Not Declared">Not Declared</option>
            </select>
            <br />

            {/* Student ID */}
            <label>Student ID:</label>
            <input
                type="text"
                name="stduentId"
                value={formData.studentIDs}
                onChange={handleInputChange}
                maxLength={8}
                required
            >
            </input>
            <br />

            {/* Origin Source */}
            <label>Origin Source:</label>
            <select
                name="originSource"
                value={formData.originSource}
                onChange={handleInputChange}
                required
            >
                <option value="ACT Tape Load">ACT Tape Load</option>
                <option value="Bison Day Attended">Bison Day Attended</option>
                <option value="Bison Day Registration">Bison Day Registration</option>
                <option value="CLT Application">CLT Application</option>
                <option value="CLT Prospect">CLT Prospect</option>
                <option value="CLT Score">CLT Score</option>
                <option value="Campus Visit Attended">Campus Visit Attended</option>
                <option value="Campus Visit Registration">Campus Visit Registration</option>
                <option value="Capture Higher Ed">Capture Higher Ed</option>
                <option value="Christian Connector">Christian Connector</option>
                <option value="Christian Connector Web Response">Christian Connector Web Response</option>
                <option value="Church Visit">Church Visit</option>
                <option value="Clark Higher Ed Leads">Clark Higher Ed Leads</option>
                <option value="Clark Higher Ed Paid Social">Clark Higher Ed Paid Social</option>
                <option value="Clark Higher Ed Prospect">Clark Higher Ed Prospect</option>
                <option value="Clark Higher Ed Quick App">Clark Higher Ed Quick App</option>
                <option value="Clark Higher Ed Search">Clark Higher Ed Search</option>
                <option value="CollegExpress">CollegExpress</option>
                <option value="College Fair Contact">College Fair Contact</option>
                <option value="College Raptor">College Raptor</option>
                <option value="Empower Conference">Empower Conference</option>
                <option value="Encoura">Encoura</option>
                <option value="Encoura Affinity Connection">Encoura Affinity Connection</option>
                <option value="FAFSA">FAFSA</option>
                <option value="Falls Creek">Falls Creek</option>
                <option value="GTCF Matchmaker">GTCF Matchmaker</option>
                <option value="GenWhy">GenWhy</option>
                <option value="Graduate Website Inquiry">Graduate Website Inquiry</option>
                <option value="High School Visit">High School Visit</option>
                <option value="Inquiry Card">Inquiry Card</option>
                <option value="Inquiry Form">Inquiry Form</option>
                <option value="Jump Forward Athletic Website">Jump Forward Athletic Website</option>
                <option value="NRCCUA Declared Names">NRCCUA Declared Names</option>
                <option value="New Mexico Annual Convention">New Mexico Annual Convention</option>
                <option value="Next Step Magazine">Next Step Magazine</option>
                <option value="Niche Inquiries">Niche Inquiries</option>
                <option value="Niche Prospects">Niche Prospects</option>
                <option value="Night on the Hill Reservation">Night on the Hill Reservation</option>
                <option value="Not Declared">Not Declared</option>
                <option value="Oklahoma Promise">Oklahoma Promise</option>
                <option value="Online Application">Online Application</option>
                <option value="Paper Application">Paper Application</option>
                <option value="Phone Call - Successful">Phone Call - Successful</option>
                <option value="Phone Call - Unsuccessful">Phone Call - Unsuccessful</option>
                <option value="Phone Call - Voicemail">Phone Call - Voicemail</option>
                <option value="Private Colleges & Universities">Private Colleges & Universities</option>
                <option value="RNL Junior Search">RNL Junior Search</option>
                <option value="RNL Sophomore Search">RNL Sophomore Search</option>
                <option value="Referral - OBU Faculty Member">Referral - OBU Faculty Member</option>
                <option value="SAT Score">SAT Score</option>
                <option value="STEM Camp">STEM Camp</option>
                <option value="Southern Baptist Convention">Southern Baptist Convention</option>
                <option value="StriveScan - Connections">StriveScan - Connections</option>
                <option value="StriveScan - Scans">StriveScan - Scans</option>
                <option value="Super Summer">Super Summer</option>
                <option value="Text Message">Text Message</option>
                <option value="Text Message - Outgoing">Text Message - Outgoing</option>
                <option value="Transcript Received">Transcript Received</option>
                <option value="Website Inquiry">Website Inquiry</option>
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
                <option value="First-Time Freshman">First-Time Freshman</option>
                <option value="Readmit">Readmit</option>
                <option value="Second Degree">Second Degree</option>
                <option value="Test Optional">Test Optional</option>
                <option value="Transfer">Transfer</option>
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
                <option value="Accounting, Interdisciplinary Emphasis">Accounting, Interdisciplinary Emphasis</option>
                <option value="Alternative Teaching Certificate">Alternative Teaching Certificate</option>
                <option value="Applied Mathematics: Actuarial and Financial Math Emphasis">Applied Mathematics: Actuarial and Financial Math Emphasis</option>
                <option value="Applied Mathematics: Data Science Emphasis">Applied Mathematics: Data Science Emphasis</option>
                <option value="Art">Art</option>
                <option value="Art Education, P-12">Art Education, P-12</option>
                <option value="Biblical and Theological Studies">Biblical and Theological Studies</option>
                <option value="Biblical and Theological Studies, Biblical Language Emphasis">Biblical and Theological Studies, Biblical Language Emphasis</option>
                <option value="Biblical and Theological Studies, Biblical Studies Emphasis">Biblical and Theological Studies, Biblical Studies Emphasis</option>
                <option value="Biblical and Theological Studies, History and Theology Emphasis">Biblical and Theological Studies, History and Theology Emphasis</option>
                <option value="Biblical and Theological Studies, Practical Theology Emphasis">Biblical and Theological Studies, Practical Theology Emphasis</option>
                <option value="Biochemistry">Biochemistry</option>
                <option value="Biology">Biology</option>
                <option value="Biology, Forensic Emphasis">Biology, Forensic Emphasis</option>
                <option value="Business Administration">Business Administration</option>
                <option value="Chemistry">Chemistry</option>
                <option value="Chemistry, Forensic Emphasis">Chemistry, Forensic Emphasis</option>
                <option value="Christian Ministry">Christian Ministry</option>
                <option value="Christian Ministry, Pastoral Ministry Emphasis">Christian Ministry, Pastoral Ministry Emphasis</option>
                <option value="Christian Ministry, Student and Family Ministry Emphasis">Christian Ministry, Student and Family Ministry Emphasis</option>
                <option value="Christian Ministry, Women's Ministry Emphasis">Christian Ministry, Women's Ministry Emphasis</option>
                <option value="Christian Studies">Christian Studies</option>
                <option value="Communication Studies">Communication Studies</option>
                <option value="Computer Information Systems">Computer Information Systems</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Computer Science, Cybersecurity Emphasis">Computer Science, Cybersecurity Emphasis</option>
                <option value="Computer Science, Interdisciplinary Emphasis">Computer Science, Interdisciplinary Emphasis</option>
                <option value="Corporate Innovation">Corporate Innovation</option>
                <option value="Creative Media">Creative Media</option>
                <option value="Creative Writing">Creative Writing</option>
                <option value="Criminal Justice">Criminal Justice</option>
                <option value="Cross-Cultural Ministry">Cross-Cultural Ministry</option>
                <option value="Early Childhood Education">Early Childhood Education</option>
                <option value="Elementary Education">Elementary Education</option>
                <option value="Engineering - Electrical Engineering">Engineering - Electrical Engineering</option>
                <option value="Engineering - Mechanical Engineering">Engineering - Mechanical Engineering</option>
                <option value="Engineering - Systems Engineering">Engineering - Systems Engineering</option>
                <option value="English">English</option>
                <option value="English Education, Secondary">English Education, Secondary</option>
                <option value="Exercise Science, Human Performance Emphasis">Exercise Science, Human Performance Emphasis</option>
                <option value="Exercise Science, Pre-Allied Health Emphasis">Exercise Science, Pre-Allied Health Emphasis</option>
                <option value="Family Science">Family Science</option>
                <option value="Family Therapy">Family Therapy</option>
                <option value="Finance">Finance</option>
                <option value="Fine Arts">Fine Arts</option>
                <option value="Forensic Psychology">Forensic Psychology</option>
                <option value="Global Marketplace Engagement, Business Emphasis">Global Marketplace Engagement, Business Emphasis</option>
                <option value="Global Marketplace Engagement, Global Education Emphasis">Global Marketplace Engagement, Global Education Emphasis</option>
                <option value="Global Marketplace Engagement, Graphic Design Emphasis">Global Marketplace Engagement, Graphic Design Emphasis</option>
                <option value="Global Marketplace Engagement, Math Education Emphasis">Global Marketplace Engagement, Math Education Emphasis</option>
                <option value="Global Marketplace Engagement, Political Science Emphasis">Global Marketplace Engagement, Political Science Emphasis</option>
                <option value="Global Marketplace Engagement, Spanish Emphasis">Global Marketplace Engagement, Spanish Emphasis</option>
                <option value="Global Marketplace Engagement, TESOL Emphasis">Global Marketplace Engagement, TESOL Emphasis</option>
                <option value="Graphic Design">Graphic Design</option>
                <option value="History">History</option>
                <option value="Interdisciplinary">Interdisciplinary</option>
                <option value="Interdisciplinary Studies">Interdisciplinary Studies</option>
                <option value="International Business">International Business</option>
                <option value="Journalism and Mass Communication, Journalism Emphasis">Journalism and Mass Communication, Journalism Emphasis</option>
                <option value="Journalism and Mass Communication, Media Production Emphasis">Journalism and Mass Communication, Media Production Emphasis</option>
                <option value="MBA in Transformational Leadership">MBA in Transformational Leadership</option>
                <option value="Management">Management</option>
                <option value="Marketing">Marketing</option>
                <option value="Master of Arts in Christian Studies: Biblical and Theological Studies (In-Person)">Master of Arts in Christian Studies: Biblical and Theological Studies (In-Person)</option>
                <option value="Master of Arts in Christian Studies: Biblical and Theological Studies (Online)">Master of Arts in Christian Studies: Biblical and Theological Studies (Online)</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Mathematics Education, Secondary">Mathematics Education, Secondary</option>
                <option value="Middle School Education">Middle School Education</option>
                <option value="Music Composition">Music Composition</option>
                <option value="Music Education">Music Education</option>
                <option value="Music Education, Instrumental Certificate P-12">Music Education, Instrumental Certificate P-12</option>
                <option value="Musical Arts">Musical Arts</option>
                <option value="Natural Science">Natural Science</option>
                <option value="Not Declared">Not Declared</option>
                <option value="Nursing">Nursing</option>
                <option value="Philosophy">Philosophy</option>
                <option value="Philosophy, Apologetics Emphasis">Philosophy, Apologetics Emphasis</option>
                <option value="Physics">Physics</option>
                <option value="Piano Performance, Pedagogy Emphasis">Piano Performance, Pedagogy Emphasis</option>
                <option value="Political Science">Political Science</option>
                <option value="Project Management">Project Management</option>
                <option value="Psychology">Psychology</option>
                <option value="Psychology, Pre-Counseling">Psychology, Pre-Counseling</option>
                <option value="Science Education, Secondary">Science Education, Secondary</option>
                <option value="Social Sciences Education, Secondary">Social Sciences Education, Secondary</option>
                <option value="Sociology">Sociology</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Spanish Education, P-12">Spanish Education, P-12</option>
                <option value="Special Education, Early Childhood Track">Special Education, Early Childhood Track</option>
                <option value="Special Education, Elementary Track">Special Education, Elementary Track</option>
                <option value="Sport Psychology">Sport Psychology</option>
                <option value="Sports Communication">Sports Communication</option>
                <option value="Sports and Recreation, Athletic Coaching Emphasis">Sports and Recreation, Athletic Coaching Emphasis</option>
                <option value="Sports and Recreation, Camp Administration Emphasis">Sports and Recreation, Camp Administration Emphasis</option>
                <option value="Sports and Recreation, Sports Ministry Emphasis">Sports and Recreation, Sports Ministry Emphasis</option>
                <option value="Sports and Recreation, Sports and Recreation Management Emphasis">Sports and Recreation, Sports and Recreation Management Emphasis</option>
                <option value="Theatre">Theatre</option>
                <option value="Undecided">Undecided</option>
                <option value="Vocal Performance">Vocal Performance</option>
                <option value="Worship Studies">Worship Studies</option>
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
                <option value="Y">Y</option>
                <option value="Not Declared">N</option>
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
                <option value="Basketball (Men's)">Basketball (Men's)</option>
                <option value="Basketball (Women's)">Basketball (Women's)</option>
                <option value="Dance">Dance</option>
                <option value="Football">Football</option>
                <option value="Golf">Golf</option>
                <option value="Marching Band">Marching Band</option>
                <option value="Not Declared">Not Declared</option>
                <option value="STUNT">STUNT</option>
                <option value="Soccer">Soccer</option>
                <option value="Softball">Softball</option>
                <option value="Track & Field (Men's)">Track & Field (Men's)</option>
                <option value="Track & Field (Women's)">Track & Field (Women's)</option>
                <option value="Volleyball">Volleyball</option>
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
                <option value="Y">Y</option>
                <option value="Not Declared">N</option>
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
                <option value="Graduate">Graduate</option>
                <option value="Homeschool">Homeschool</option>
                <option value="P01">P01</option>
                <option value="P02">P02</option>
                <option value="Raley College">Raley College</option>
                <option value="T00">T00</option>
                <option value="T01">T01</option>
                <option value="T02">T02</option>
                <option value="T03">T03</option>
                <option value="T04">T04</option>
                <option value="T05">T05</option>
                <option value="T06">T06</option>
                <option value="T07">T07</option>
            </select>
            <br />

            {/* Recruiting Territory */}
            <label>Counselor:</label>
            <select
                name="counselor"
                value={formData.counselor}
                onChange={handleInputChange}
                required
            >
                <option value="C10">C10</option>
                <option value="C11">C11</option>
                <option value="C12">C12</option>
                <option value="C13">C13</option>
                <option value="C14">C14</option>
                <option value="C2">C2</option>
                <option value="C3">C3</option>
                <option value="C4">C4</option>
                <option value="C5">C5</option>
                <option value="C6">C6</option>
                <option value="C7">C7</option>
                <option value="C8">C8</option>
                <option value="C9'">C9'</option>
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

            { /* File Name */}
            <label>File Name:</label>
            <input
                type="text"    
                name="fileName"
                onChange={handleFileNameChange}
                placeholder="form_data.csv"
            ></input>

            {/* Submit Button */}
            <button className='action-button' type="submit">Submit</button>
        </form>
        </div>
    );
};

export default StudentForm;