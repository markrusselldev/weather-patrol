const fs = require("fs");
const path = require("path");
const moment = require("moment");

// Path to the TOA5 data file
const filePath = path.join(__dirname, "toa5.dat");

// Function to generate random float with smoothing based on previous value
const getSmoothedRandomFloat = (prevValue, minChange, maxChange, minValue, maxValue, allowNegative = false) => {
  const change = Math.random() * (maxChange - minChange) + minChange;
  let newValue = parseFloat(prevValue) + (Math.random() < 0.5 ? -change : change);
  if (!allowNegative) {
    newValue = Math.max(newValue, 0); // Ensure the value is non-negative
  }
  newValue = Math.max(minValue, Math.min(newValue, maxValue)); // Ensure the value stays within the specified range
  return newValue.toFixed(2);
};

// Function to generate random float between min and max
const getRandomFloat = (min, max) => {
  return (Math.random() * (max - min) + min).toFixed(2);
};

// Function to calculate dew point based on relative humidity
const calculateDewPoint = (humidity) => {
  const maxHumidity = 80;
  const minHumidity = 10;
  const maxDewPoint = 30;
  const minDewPoint = -10;

  // Normalize humidity to a range of 0 to 1
  const normalizedHumidity = (humidity - minHumidity) / (maxHumidity - minHumidity);

  // Calculate dew point as the inverse of humidity
  const dewPoint = maxDewPoint - normalizedHumidity * (maxDewPoint - minDewPoint);
  return dewPoint.toFixed(2);
};

// Function to append a new row of data
const appendNewRow = () => {
  // Read the existing data
  const data = fs
    .readFileSync(filePath, "utf8")
    .split("\n")
    .filter(line => line.trim() !== "");

  // Get the last data row and parse its values
  const lastRow = data[data.length - 1].split(",");
  const lastTimestamp = lastRow[0].replace(/"/g, "");
  const lastRecord = parseInt(lastRow[1]);

  // Previous values for smoothing
  const prevAirTFMax = parseFloat(lastRow[2]);
  const prevAirTFMin = parseFloat(lastRow[3]);
  const prevAirTFAvg = parseFloat(lastRow[4]);
  const prevWSmphMax = parseFloat(lastRow[6]);
  const prevWSmphMin = parseFloat(lastRow[7]);
  const prevWSmphAvg = parseFloat(lastRow[8]);
  const prevRH = parseFloat(lastRow[10]);

  // Generate new values with increased variability
  const newTimestamp = moment(lastTimestamp).add(15, "minutes").format("YYYY-MM-DD HH:mm:ss");
  const newRecord = lastRecord + 1;
  const newRow = [
    `"${newTimestamp}"`,
    newRecord,
    getSmoothedRandomFloat(prevAirTFMax, 2, 5, -50, 110), // AirTF_Max with larger change, constrained between -50 and 110
    getSmoothedRandomFloat(prevAirTFMin, 2, 5, -50, 110), // AirTF_Min with larger change, constrained between -50 and 110
    getSmoothedRandomFloat(prevAirTFAvg, 2, 5, -50, 110), // AirTF_Avg with larger change, constrained between -50 and 110
    getRandomFloat(-20, 0), // WC_F_Avg with larger range
    getSmoothedRandomFloat(prevWSmphMax, 3, 10, 0, 100, false), // WS_mph_Max with larger change, constrained between 0 and 100
    getSmoothedRandomFloat(prevWSmphMin, 3, 10, 0, 100, false), // WS_mph_Min with larger change, constrained between 0 and 100
    getSmoothedRandomFloat(prevWSmphAvg, 3, 10, 0, 100, false), // WS_mph_Avg with larger change, constrained between 0 and 100
    getRandomFloat(200, 360), // WindDir (keep random for simplicity)
    getSmoothedRandomFloat(prevRH, 1, 5, 10, 80), // RH with larger change, constrained between 10 and 80
    calculateDewPoint(prevRH), // Dew point based on relative humidity
    getRandomFloat(28, 30), // BP_inHg_Avg (leave as is for now)
    getRandomFloat(13, 15), // BattV (leave as is for now)
    getRandomFloat(-15, -5) // PanelTemp_F (leave as is for now)
  ];

  // Convert the new row to a CSV format string
  const newRowString = newRow.join(",");

  // Append the new row to the file
  fs.appendFileSync(filePath, `\n${newRowString}`);

  console.log(`Appended new row: ${newRowString}`);
};

// Run the append function
appendNewRow();
