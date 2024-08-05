import { useEffect, useState, useContext, memo } from "react";
import { WiThermometer, WiThermometerExterior, WiStrongWind, WiHumidity, WiBarometer } from "react-icons/wi";
import { IoBatteryChargingOutline } from "react-icons/io5";
import { PiCompassRose } from "react-icons/pi";
import { GiDew } from "react-icons/gi";
import ConditionCard from "../components/ConditionCard";
import ErrorMessages from "../components/ErrorMessages";
import { DataContext } from "../contexts/DataContext";
import { formatTimestamp } from "../utils/utils";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

// Function to convert wind direction degrees to cardinal direction
const getCardinalDirection = degrees => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round((degrees % 360) / 45) % 8;
  return directions[index];
};

const CurrentConditions = () => {
  const [latestData, setLatestData] = useState(null);
  const [pastData, setPastData] = useState([]);
  const { weatherData, error } = useContext(DataContext);

  // Effect to set the latest and past data when weatherData changes
  useEffect(() => {
    log.info({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "useEffect" }, "Effect triggered: weatherData changed", weatherData);

    // Log the structure and length of weatherData
    if (weatherData) {
      log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "useEffect" }, "weatherData structure", JSON.stringify(weatherData, null, 2));
      log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "useEffect" }, "weatherData length", weatherData.length);
    }

    if (weatherData && weatherData.length > 0) {
      log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "useEffect" }, "weatherData is available, setting latest and past data");
      setLatestData(weatherData[0]);

      // Ensure there are at least 5 records for past data
      const pastRecordsCount = Math.min(weatherData.length - 1, 4);
      const sortedPastData = weatherData.slice(1, 1 + pastRecordsCount).sort((a, b) => new Date(a.TIMESTAMP) - new Date(b.TIMESTAMP));
      setPastData(sortedPastData);

      log.info({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "useEffect" }, "Latest data and past data set successfully", {
        latestData: weatherData[0],
        pastData: sortedPastData
      });

      // Log the content and length of pastData
      log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "useEffect" }, "pastData content", JSON.stringify(sortedPastData, null, 2));
      log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "useEffect" }, "pastData length", sortedPastData.length);
    } else {
      log.warn({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "useEffect" }, "No weatherData available to set latest and past data");
      setLatestData(null); // Set latestData to null to avoid using stale data
      setPastData([]); // Clear pastData
    }
  }, [weatherData]);

  // Handle errors by displaying an error message
  if (error) {
    log.error({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Error in CurrentConditions component:", error);
    return <ErrorMessages message={errorHandler(error)} />;
  }

  // Display loading message if latestData is not yet available
  if (!latestData) {
    log.info({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Loading latest data...");
    return <div>Loading...</div>;
  }

  // Create an array of data for a specific key, ensuring the latest data is at the end
  const createDataArray = key => {
    if (!latestData[key]) {
      log.warn({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "createDataArray" }, `No data available for key: ${key}`);
      return [null];
    }
    const dataArray = [...pastData.map(row => (row[key] !== undefined ? Math.round(row[key]) : null)), Math.round(latestData[key])];
    log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "createDataArray" }, `Data array for ${key}:`, dataArray);
    return dataArray;
  };

  // Create an array of past timestamps
  const createPastTimestampsArray = () => {
    const timestampsArray = pastData.map(row => {
      if (!row.TIMESTAMP) {
        log.error({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "createPastTimestampsArray" }, `Missing TIMESTAMP in data row: ${JSON.stringify(row)}`);
        return "Invalid timestamp";
      }
      log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "createPastTimestampsArray" }, "Processing TIMESTAMP:", row.TIMESTAMP);
      const formattedTimestamp = formatTimestamp(row.TIMESTAMP, { showTime: true, showDate: false });
      if (formattedTimestamp === "Invalid timestamp") {
        log.error({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "createPastTimestampsArray" }, `Invalid timestamp detected: ${row.TIMESTAMP}`);
      }
      return formattedTimestamp;
    });
    log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "createPastTimestampsArray" }, "Past timestamps array:", timestampsArray);
    return timestampsArray;
  };

  // Prepare data and timestamps for ConditionCard components
  const data = {
    temperature: createDataArray("AirTF_Avg"),
    windSpeed: createDataArray("WS_mph_Avg"),
    windDirection: createDataArray("WindDir"),
    windChill: createDataArray("WC_F_Avg"),
    humidity: createDataArray("RH"),
    dewPoint: createDataArray("DP_F_Avg"),
    pressure: createDataArray("BP_inHg_Avg"),
    batteryVoltage: createDataArray("BattV"),
    temperatureMin: latestData.AirTF_Min !== undefined ? Math.round(latestData.AirTF_Min) : null,
    temperatureMax: latestData.AirTF_Max !== undefined ? Math.round(latestData.AirTF_Max) : null,
    windSpeedMin: latestData.WS_mph_Min !== undefined ? Math.round(latestData.WS_mph_Min) : null,
    windSpeedMax: latestData.WS_mph_Max !== undefined ? Math.round(latestData.WS_mph_Max) : null
  };

  const pastTimestamps = createPastTimestampsArray();
  const windDirectionCardinal = getCardinalDirection(latestData.WindDir);

  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Past timestamps:", pastTimestamps);
  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Data for temperature:", data.temperature);
  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Data for wind speed:", data.windSpeed);
  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Data for wind direction:", data.windDirection);
  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Data for wind chill:", data.windChill);
  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Data for humidity:", data.humidity);
  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Data for dew point:", data.dewPoint);
  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Data for pressure:", data.pressure);
  log.debug({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Data for battery voltage:", data.batteryVoltage);

  return (
    <section className="weather-conditions flex flex-col flex-grow">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
        <ConditionCard title="Temperature" icon={WiThermometer} data={data.temperature} unit="°F" min={data.temperatureMin} max={data.temperatureMax} pastTimestamps={pastTimestamps} showMinMax />
        <ConditionCard title="Wind Speed" icon={WiStrongWind} data={data.windSpeed} unit="mph" min={data.windSpeedMin} max={data.windSpeedMax} pastTimestamps={pastTimestamps} showMinMax />
        <ConditionCard title="Wind Direction" icon={PiCompassRose} data={data.windDirection} unit="°" min={265} max={280} pastTimestamps={pastTimestamps} cardinalDirection={windDirectionCardinal} showMinMax={false} />
        <ConditionCard title="Wind Chill" icon={WiThermometerExterior} data={data.windChill} unit="°F" min={13} max={15} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Humidity" icon={WiHumidity} data={data.humidity} unit="%" min={65} max={72} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Dew Point" icon={GiDew} data={data.dewPoint} unit="°F" min={8} max={10} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Barometric Pressure" icon={WiBarometer} data={data.pressure} unit="inHg" min={29.8} max={29.95} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Battery Voltage" icon={IoBatteryChargingOutline} data={data.batteryVoltage} unit="V" min={12.4} max={12.7} pastTimestamps={pastTimestamps} showMinMax={false} />
      </div>
    </section>
  );
};

const MemoizedCurrentConditions = memo(CurrentConditions);
export default MemoizedCurrentConditions;
