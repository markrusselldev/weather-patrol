import { useState, useEffect, memo, useContext } from "react";
import TrendCard from "../components/TrendCard";
import { WiThermometer, WiThermometerExterior, WiStrongWind, WiHumidity, WiBarometer } from "react-icons/wi";
import { IoBatteryChargingOutline } from "react-icons/io5";
import { PiCompassRose } from "react-icons/pi";
import { GiDew } from "react-icons/gi";
import MemoizedBreadcrumb from "../components/Breadcrumb";
import ErrorMessages from "../components/ErrorMessages";
import { DataContext } from "../contexts/DataContext";
import { formatTimestamp } from "../utils/utils";
import logger from "../utils/logger";
import errorHandler from "../utils/errorHandler";

const WeatherTrends = () => {
  const { rowData, error } = useContext(DataContext); // Use DataContext to get weather data and error state
  const [timeframe, setTimeframe] = useState("3hr"); // State to manage selected timeframe
  const [filteredData, setFilteredData] = useState([]); // State to manage filtered data

  // Handle timeframe change
  const handleTimeframeChange = event => {
    setTimeframe(event.target.value); // Update timeframe state when user selects a different timeframe
  };

  // Effect to filter data based on selected timeframe
  useEffect(() => {
    if (rowData && rowData.length > 0) {
      logger.info("Filtering data based on selected timeframe");

      // Define timeframes in hours
      const timeframes = {
        "3hr": 3,
        "6hr": 6,
        "12hr": 12,
        "1D": 24,
        "7D": 24 * 7,
        "14D": 24 * 14
      };

      // Find the latest record timestamp
      const latestRecordTimestamp = new Date(rowData[0].TIMESTAMP);
      logger.debug(`Latest Record Timestamp: ${latestRecordTimestamp}`);

      // Filter data based on the latest record timestamp
      const filtered = rowData.filter(row => {
        const rowTimestamp = new Date(row.TIMESTAMP);
        const hoursDifference = (latestRecordTimestamp - rowTimestamp) / (1000 * 60 * 60); // Calculate hours difference
        return hoursDifference <= timeframes[timeframe];
      });

      logger.debug(`Filtered data count for timeframe ${timeframe}: ${filtered.length}`);
      setFilteredData(filtered); // Update filteredData state
    } else {
      logger.warn("rowData is empty or undefined");
      setFilteredData([]);
    }
  }, [rowData, timeframe]); // Re-run effect when rowData or timeframe changes

  // Return error message if there's an error
  if (error) {
    logger.error("Error in WeatherTrends component:", error);
    return <ErrorMessages message={errorHandler(error)} />;
  }

  // Display message if no data is available
  if (!filteredData || filteredData.length === 0) {
    logger.info("No filtered data available.");
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

  logger.debug("Data points for TrendCards count:", {
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
      <MemoizedBreadcrumb
        title="/ Weather Trends"
        timeframeSelector={
          <div className="timeframe-container flex items-center">
            <label htmlFor="timeframe" className="mr-2">
              Timeframe:
            </label>
            <select id="timeframe" className="timeframe-dropdown bg-dropdownBg text-dropdownText p-1 rounded border border-dropdownBorder" onChange={handleTimeframeChange} value={timeframe}>
              <option value="3hr">3h</option>
              <option value="6hr">6h</option>
              <option value="12hr">12h</option>
              <option value="1D">1d</option>
              <option value="7D">7d</option>
              <option value="14D">14d</option>
            </select>
          </div>
        }
      />
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

const MemoizedWeatherTrends = memo(WeatherTrends);
export default MemoizedWeatherTrends;
