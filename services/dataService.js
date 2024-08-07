const fs = require("fs"); // File system module for file operations
const path = require("path"); // Path module for handling file paths
const Joi = require("joi"); // Joi for schema validation
const moment = require("moment"); // Moment for date manipulation
const chokidar = require("chokidar"); // Chokidar for file watching
const NodeCache = require("node-cache"); // NodeCache for in-memory caching
const log = require("../utils/logger"); // Custom logger
const config = require("../config/config.json"); // Configuration file

const logContext = { page: "dataService.js" };

let weatherData = []; // Array to store weather data
let environmentInfo = ""; // Variable to store environment info
const cache = new NodeCache({ stdTTL: 900 }); // Cache with 15-minute TTL
let sseClients = []; // Array to store SSE clients
let previousLatestRecord = null; // To keep track of the previously sent latest record

// Schema validation setup using Joi
const schema = Joi.object(
  config.columns.reduce((schema, col) => {
    switch (col.type) {
      case "datetime":
        schema[col.name] = Joi.date().iso();
        break;
      case "float":
        schema[col.name] = Joi.number().precision(2);
        break;
      case "int":
        schema[col.name] = Joi.number().integer();
        break;
      default:
        schema[col.name] = Joi.string();
    }
    return schema;
  }, {})
);

// Function to parse the TOA5 file
const parseTOA5File = filePath => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const lines = data.split("\n").filter(line => line.trim() !== "");

    if (lines.length < 5) {
      log.error("File does not contain enough lines.", { ...logContext, func: "parseTOA5File" });
      return { headers: [], rows: [], environmentInfo: "" };
    }

    // Capture and clean the first header (environment info)
    environmentInfo = lines[0].replace(/"/g, "").trim();
    const headers = lines[1].split(",").map(header => header.trim().replace(/"/g, ""));

    const columnMap = headers.reduce((map, header, index) => {
      const configColumn = config.columns.find(col => col.name === header);
      if (configColumn) {
        map[header] = { index, type: configColumn.type };
      }
      return map;
    }, {});

    if (Object.keys(columnMap).length === 0) {
      log.error("Header mismatch or empty header.", { ...logContext, func: "parseTOA5File" });
      return { headers: [], rows: [], environmentInfo };
    }

    const rows = lines
      .slice(4)
      .map(line => {
        const values = line.split(",");
        if (values.length !== headers.length) {
          log.warn(`Data row length mismatch with header length. Row: ${line}`, { ...logContext, func: "parseTOA5File" });
          return null;
        }

        let rowData = {};
        for (const [header, meta] of Object.entries(columnMap)) {
          let value = values[meta.index].trim();
          switch (meta.type) {
            case "datetime":
              value = value.replace(/"/g, "").replace(/\.000Z$/, ""); // Remove extra double quotes if present and .000Z
              const parsedDate = moment(value, moment.ISO_8601);
              if (parsedDate.isValid()) {
                value = parsedDate.toISOString();
              } else {
                log.error(`Invalid datetime format for value: "${value}"`, { ...logContext, func: "parseTOA5File" });
                return null;
              }
              break;
            case "float":
              value = parseFloat(value);
              if (isNaN(value)) {
                log.error(`Invalid float format for value: "${values[meta.index]}" in column: "${header}"`, { ...logContext, func: "parseTOA5File" });
                return null;
              }
              break;
            case "int":
              value = parseInt(value, 10);
              if (isNaN(value)) {
                log.error(`Invalid integer format for value: "${values[meta.index]}" in column: "${header}"`, { ...logContext, func: "parseTOA5File" });
                return null;
              }
              break;
            default:
              value = value;
          }
          rowData[header] = value;
        }
        return rowData;
      })
      .filter(row => row !== null);

    if (rows.length === 0) {
      log.error("No valid data rows found.", { ...logContext, func: "parseTOA5File" });
    }

    log.info("Data parsed successfully", { ...logContext, func: "parseTOA5File" });
    return { headers, rows, environmentInfo };
  } catch (err) {
    log.error(`Error reading or parsing file: ${err.message}`, { ...logContext, func: "parseTOA5File" });
    return { headers: [], rows, environmentInfo: "" };
  }
};

// Function to validate data against the schema
const validateData = data => {
  return data
    .map(row => {
      const { error, value } = schema.validate(row);
      if (error) {
        log.error(`Validation error: ${error.message} for data: ${JSON.stringify(row)}`, { ...logContext, func: "validateData" });
        return null;
      }
      return value;
    })
    .filter(row => row !== null);
};

// Function to load data from the TOA5 file
const loadData = () => {
  const filePath = path.join(__dirname, "../data/toa5.dat");
  log.info(`Loading data from file: ${filePath}`, { ...logContext, func: "loadData" });

  if (fs.existsSync(filePath)) {
    const { headers, rows, environmentInfo: envInfo } = parseTOA5File(filePath);
    weatherData = validateData(rows);

    if (weatherData.length > 0) {
      // Sort the data in descending order by TIMESTAMP
      weatherData.sort((a, b) => {
        const dateA = new Date(a.TIMESTAMP);
        const dateB = new Date(b.TIMESTAMP);

        if (isNaN(dateA) || isNaN(dateB)) {
          log.error(`Invalid date found. a: ${a.TIMESTAMP}, b: ${b.TIMESTAMP}`, { ...logContext, func: "loadData" });
          return 0;
        }

        return dateB - dateA;
      });

      log.debug(
        "Sorted weather data (records):",
        weatherData.map(d => d.RECORD),
        { ...logContext, func: "loadData" }
      );

      cache.set("weatherData", { headers, rows: weatherData }); // Cache the data
      environmentInfo = envInfo; // Store cleaned environment info
      log.info("Data loaded, sorted, and cached", { ...logContext, func: "loadData" });

      log.debug(
        "Cache content after loading data:",
        cache.get("weatherData").rows.map(d => d.RECORD),
        { ...logContext, func: "loadData" }
      );
    } else {
      log.warn("No valid weather data available after validation.", { ...logContext, func: "loadData" });
    }
  } else {
    log.error(`File not found: ${filePath}`, { ...logContext, func: "loadData" });
  }
};

// Watch the TOA5 file for changes
const watcher = chokidar.watch(path.join(__dirname, "../data/toa5.dat"), {
  persistent: true,
  ignoreInitial: true // Ignore initial add events
});

// Function to get the latest record based on the latest TIMESTAMP
const getLatestRecord = () => {
  const data = cache.get("weatherData") || { headers: [], rows: weatherData };
  log.debug(
    "Data in cache for latest record check:",
    data.rows.map(d => d.TIMESTAMP),
    { ...logContext, func: "getLatestRecord" }
  );

  // Find the latest record based on the latest TIMESTAMP
  const latestRecord = data.rows.reduce((latest, current) => {
    const latestTime = new Date(latest.TIMESTAMP);
    const currentTime = new Date(current.TIMESTAMP);
    return currentTime > latestTime ? current : latest;
  }, data.rows[0]);

  log.debug("Latest record identified:", latestRecord, { ...logContext, func: "getLatestRecord" });
  return latestRecord;
};

// Function to notify SSE clients only if the new data is different from the previous data
const notifyClients = () => {
  const latestRecord = getLatestRecord();
  if (!previousLatestRecord || JSON.stringify(latestRecord) !== JSON.stringify(previousLatestRecord)) {
    log.debug("Notifying clients with updated data:", latestRecord, { ...logContext, func: "notifyClients" });
    sseClients.forEach(client => {
      client.res.write(`data: ${JSON.stringify(latestRecord)}\n\n`);
    });
    previousLatestRecord = latestRecord;
  }
};

// File watcher callback for changes
watcher.on("change", () => {
  log.info("TOA5 file has changed. Reloading data...", { ...logContext, func: "watcher" });
  setTimeout(() => {
    loadData();
    notifyClients(); // Function call to notify clients after data is reloaded and cached
  }, 100); // Use a debounce delay to handle rapid successive changes
});

// Function to get environment information
const getEnvironmentInfo = () => {
  return environmentInfo;
};

// Function to get cached data
const getCachedData = () => {
  const data = cache.get("weatherData") || { headers: [], rows: weatherData };
  return { headers: data.headers, rows: data.rows };
};

// Function to add SSE client
const addSSEClient = (req, res) => {
  if (!req || !res) {
    log.error("Request or Response object is undefined.", { ...logContext, func: "addSSEClient" });
    return;
  }

  // Log request and response objects for debugging
  log.debug("Request object received.", { ...logContext, func: "addSSEClient" });
  log.debug("Response object received.", { ...logContext, func: "addSSEClient" });

  // Set the necessary headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders(); // Flush the headers to establish SSE

  const clientId = Date.now();

  // Add the client to the clients array
  const newClient = {
    id: clientId,
    res
  };

  sseClients.push(newClient);

  log.info(`SSE client with ID ${clientId} added successfully`, { ...logContext, func: "addSSEClient" });

  // Send a comment to confirm the connection is established
  res.write(`: SSE client ${clientId} connected\n\n`);

  // Handle client disconnection
  req.on("close", () => {
    sseClients = sseClients.filter(client => client.id !== clientId);
    log.info(`SSE client with ID ${clientId} disconnected`, { ...logContext, func: "addSSEClient" });
  });
};

// Function to get the count of SSE clients connected
const getSSEClientCount = () => {
  return sseClients.length;
};

// Export functions for external use
module.exports = {
  loadData,
  getLatestRecord,
  getEnvironmentInfo,
  getCachedData,
  addSSEClient,
  getSSEClientCount,
  cache
};
