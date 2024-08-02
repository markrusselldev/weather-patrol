import { useState, useEffect, memo, useContext } from "react";
import PropTypes from "prop-types";
import TrendCard from "../components/TrendCard";
import { WiThermometer, WiThermometerExterior, WiStrongWind, WiHumidity, WiBarometer } from "react-icons/wi";
import { IoBatteryChargingOutline } from "react-icons/io5";
import { PiCompassRose } from "react-icons/pi";
import { GiDew } from "react-icons/gi";
import ErrorMessages from "../components/ErrorMessages";
import { DataContext } from "../contexts/DataContext";
import { formatTimestamp } from "../utils/utils";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

// Function to downsample data
const downsampleData = (data, factor) => {
  if (factor <= 1) return data;
  const downsampledData = [];
  for (let i = 0; i < data.length; i += factor) {
    downsampledData.push(data[i]);
  }
  return downsampledData;
};

const WeatherTrends = ({ timeframe }) => {
  const { weatherData, error } = useContext(DataContext); // Use DataContext to get weather data and error state
  const [filteredData, setFilteredData] = useState([]); // State to manage filtered data

  // Effect to filter data based on selected timeframe
  useEffect(() => {
    if (weatherData && weatherData.length > 0) {
      log.info({ page: "WeatherTrends", component: "WeatherTrends", func: "useEffect" }, "Filtering data based on selected timeframe");

      // Define timeframes in hours and downsampling factors
      const timeframes = {
        "3hr": { hours: 3, factor: 1 },
        "6hr": { hours: 6, factor: 2 },
        "12hr": { hours: 12, factor: 3 },
        "1D": { hours: 24, factor: 6 },
        "7D": { hours: 24 * 7, factor: 24 },
        "14D": { hours: 24 * 14, factor: 48 }
      };

      // Find the latest record timestamp
      const latestRecordTimestamp = new Date(weatherData[0].TIMESTAMP);
      log.debug({ page: "WeatherTrends", component: "WeatherTrends", func: "useEffect" }, `Latest Record Timestamp: ${latestRecordTimestamp}`);

      // Filter data based on the latest record timestamp
      const filtered = weatherData.filter(row => {
        const rowTimestamp = new Date(row.TIMESTAMP);
        const hoursDifference = (latestRecordTimestamp - rowTimestamp) / (1000 * 60 * 60); // Calculate hours difference
        return hoursDifference <= timeframes[timeframe].hours;
      });

      log.debug({ page: "WeatherTrends", component: "WeatherTrends", func: "useEffect" }, `Filtered data count for timeframe ${timeframe}: ${filtered.length}`);
      const downsampled = downsampleData(filtered, timeframes[timeframe].factor);
      setFilteredData(downsampled); // Update filteredData state
    } else {
      log.warn({ page: "WeatherTrends", component: "WeatherTrends", func: "useEffect" }, "weatherData is empty or undefined");
      setFilteredData([]);
    }
  }, [weatherData, timeframe]); // Re-run effect when weatherData or timeframe changes

  // Return error message if there's an error
  if (error) {
    log.error({ page: "WeatherTrends", component: "WeatherTrends", func: "render" }, "Error in WeatherTrends component:", error);
    return <ErrorMessages message={errorHandler(error)} />;
  }

  // Display message if no data is available
  if (!filteredData || filteredData.length === 0) {
    log.info({ page: "WeatherTrends", component: "WeatherTrends", func: "render" }, "No filtered data available.");
    return <div>No data available for the selected timeframe.</div>;
  }

  // Transform filteredData to the format required by TrendCard components
  const dataPoints = {
    labels: filteredData.map(row => formatTimestamp(row.TIMESTAMP)),
    temperature: filteredData.map(row => row.AirTF_Avg),
    windSpeed: filteredData.map(row => row.WS_mph_Avg),
    windDirection: filteredData.map(row => row.WindDir),
    windChill: filteredData.map(row => row.WC_F_Avg),
    humidity: filteredData.map(row => row.RH),
    dewPoint: filteredData.map(row => row.DP_F_Avg),
    pressure: filteredData.map(row => row.BP_inHg_Avg),
    batteryVoltage: filteredData.map(row => row.BattV)
  };

  log.debug({ page: "WeatherTrends", component: "WeatherTrends", func: "render" }, "Data points for TrendCards count:", {
    labels: dataPoints.labels.length,
    temperature: dataPoints.temperature.length,
    windSpeed: dataPoints.windSpeed.length,
    windDirection: dataPoints.windDirection.length,
    windChill: dataPoints.windChill.length,
    humidity: dataPoints.humidity.length,
    dewPoint: dataPoints.dewPoint.length,
    pressure: dataPoints.pressure.length,
    batteryVoltage: dataPoints.batteryVoltage.length
  });

  return (
    <section className="weather-trends">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <TrendCard title="Temperature" icon={WiThermometer} labels={dataPoints.labels} data={dataPoints.temperature} unit="°F" />
        <TrendCard title="Wind Speed" icon={WiStrongWind} labels={dataPoints.labels} data={dataPoints.windSpeed} unit="mph" />
        <TrendCard title="Wind Direction" icon={PiCompassRose} labels={dataPoints.labels} data={dataPoints.windDirection} unit="°" />
        <TrendCard title="Wind Chill" icon={WiThermometerExterior} labels={dataPoints.labels} data={dataPoints.windChill} unit="°F" />
        <TrendCard title="Humidity" icon={WiHumidity} labels={dataPoints.labels} data={dataPoints.humidity} unit="%" />
        <TrendCard title="Dew Point" icon={GiDew} labels={dataPoints.labels} data={dataPoints.dewPoint} unit="°F" />
        <TrendCard title="Barometric Pressure" icon={WiBarometer} labels={dataPoints.labels} data={dataPoints.pressure} unit="inHg" />
        <TrendCard title="Battery Voltage" icon={IoBatteryChargingOutline} labels={dataPoints.labels} data={dataPoints.batteryVoltage} unit="V" />
      </div>
    </section>
  );
};

WeatherTrends.propTypes = {
  timeframe: PropTypes.string.isRequired
};

const MemoizedWeatherTrends = memo(WeatherTrends);
export default MemoizedWeatherTrends;
