const fs = require("fs");
const path = require("path");
const moment = require("moment");

// Path to the TOA5 data file
const filePath = path.join(__dirname, "toa5.dat");

// Function to generate random float with smoothing based on previous value
const getSmoothedRandomFloat = (prevValue, minChange, maxChange) => {
  const change = Math.random() * (maxChange - minChange) + minChange;
  const newValue = parseFloat(prevValue) + (Math.random() < 0.5 ? -change : change);
  return newValue.toFixed(2);
};

// Function to generate random float between min and max
const getRandomFloat = (min, max) => {
  return (Math.random() * (max - min) + min).toFixed(2);
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
    getSmoothedRandomFloat(prevAirTFMax, 2, 5), // AirTF_Max with larger change
    getSmoothedRandomFloat(prevAirTFMin, 2, 5), // AirTF_Min with larger change
    getSmoothedRandomFloat(prevAirTFAvg, 2, 5), // AirTF_Avg with larger change
    getRandomFloat(-20, 0), // WC_F_Avg with larger range
    getSmoothedRandomFloat(prevWSmphMax, 3, 10), // WS_mph_Max with larger change
    getSmoothedRandomFloat(prevWSmphMin, 3, 10), // WS_mph_Min with larger change
    getSmoothedRandomFloat(prevWSmphAvg, 3, 10), // WS_mph_Avg with larger change
    getRandomFloat(200, 360), // WindDir (keep random for simplicity)
    getSmoothedRandomFloat(prevRH, 1, 5), // RH with larger change
    getRandomFloat(5, 8), // DP_F_Avg (leave as is for now)
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
