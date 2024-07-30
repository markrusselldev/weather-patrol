import { useEffect, useState, useContext, memo } from "react";
import { WiThermometer, WiThermometerExterior, WiStrongWind, WiHumidity, WiBarometer } from "react-icons/wi";
import { IoBatteryChargingOutline } from "react-icons/io5";
import { PiCompassRose } from "react-icons/pi";
import { GiDew } from "react-icons/gi";
import ConditionCard from "../components/ConditionCard";
import MemoizedBreadcrumb from "../components/Breadcrumb";
import ErrorMessages from "../components/ErrorMessages";
import { DataContext } from "../contexts/DataContext";
import { formatTimestamp } from "../utils/utils";
import logger from "../utils/logger";
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
  const { rowData, error } = useContext(DataContext);

  // Effect to set the latest and past data when rowData changes
  useEffect(() => {
    logger.info("Effect triggered: rowData changed", rowData);
    if (rowData && rowData.length > 0) {
      setLatestData(rowData[0]);
      // Sort pastData in ascending order based on TIMESTAMP
      const sortedPastData = rowData.slice(1, 5).sort((a, b) => new Date(a.TIMESTAMP) - new Date(b.TIMESTAMP));
      setPastData(sortedPastData);
      logger.info("Latest data and past data set successfully", { latestData: rowData[0], pastData: sortedPastData });
    } else {
      logger.warn("No rowData available to set latest and past data");
    }
  }, [rowData]);

  // Handle errors by displaying an error message
  if (error) {
    logger.error("Error in CurrentConditions component:", error);
    return <ErrorMessages message={errorHandler(error)} />;
  }

  // Display loading message if latestData is not yet available
  if (!latestData) {
    logger.info("Loading latest data...");
    return <div>Loading...</div>;
  }

  // Create an array of data for a specific key, ensuring the latest data is at the end
  const createDataArray = key => {
    if (!latestData[key]) {
      logger.warn(`No data available for key: ${key}`);
      return [null];
    }
    return [...pastData.map(row => Math.round(row[key])), Math.round(latestData[key])];
  };

  // Create an array of past timestamps
  const createPastTimestampsArray = () => pastData.map(row => formatTimestamp(row.TIMESTAMP, true));

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
    temperatureMin: Math.round(latestData.AirTF_Min),
    temperatureMax: Math.round(latestData.AirTF_Max),
    windSpeedMin: Math.round(latestData.WS_mph_Min),
    windSpeedMax: Math.round(latestData.WS_mph_Max)
  };

  const pastTimestamps = createPastTimestampsArray();

  const windDirectionCardinal = getCardinalDirection(latestData.WindDir);

  logger.debug("Past timestamps:", pastTimestamps);
  logger.debug("Data for temperature:", data.temperature);

  return (
    <section className="weather-conditions flex flex-col flex-grow">
      <MemoizedBreadcrumb title="/ Current Conditions" />
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
