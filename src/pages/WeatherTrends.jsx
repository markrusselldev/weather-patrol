import { useState, useEffect, memo, useContext } from "react";
import TrendCard from "../components/TrendCard";
import { FaThermometerHalf, FaWind, FaCompass, FaTint, FaBatteryFull } from "react-icons/fa";
import { GiWindSlap } from "react-icons/gi";
import MemoizedBreadcrumb from "../components/Breadcrumb";
import ErrorMessages from "../components/ErrorMessages";
import { DataContext } from "../contexts/DataContext";
import { formatTimestamp } from "../utils/utils";

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
    if (rowData.length > 0) {
      // Log data availability
      // console.log("Raw rowData:", rowData.length > 0 ? "Data loaded" : "No data");

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
      // Log latest record timestamp
      // console.log(`Latest Record Timestamp: ${latestRecordTimestamp}`);

      // Filter data based on the latest record timestamp
      const filtered = rowData.filter(row => {
        const rowTimestamp = new Date(row.TIMESTAMP);
        const hoursDifference = (latestRecordTimestamp - rowTimestamp) / (1000 * 60 * 60); // Calculate hours difference
        // Log each row's time and hours difference if it falls within the selected timeframe
        // if (hoursDifference <= timeframes[timeframe]) {
        //   console.log(`Row Time: ${rowTimestamp}, Hours Difference: ${hoursDifference}, Timeframe: ${timeframes[timeframe]}`);
        // }
        return hoursDifference <= timeframes[timeframe];
      });

      // Log filtered data count
      // console.log(`Filtered data count for timeframe ${timeframe}: ${filtered.length}`);
      setFilteredData(filtered); // Update filteredData state
    }
  }, [rowData, timeframe]); // Re-run effect when rowData or timeframe changes

  // Return error message if there's an error
  if (error) return <ErrorMessages message={error} />;

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

  // Log counts of data points for TrendCards
  // console.log("Data points for TrendCards count:", {
  //   labels: dataPoints.labels.length,
  //   temperature: dataPoints.temperature.length,
  //   windSpeed: dataPoints.windSpeed.length,
  //   windDirection: dataPoints.windDirection.length,
  //   windChill: dataPoints.windChill.length,
  //   humidity: dataPoints.humidity.length,
  //   dewPoint: dataPoints.dewPoint.length,
  //   pressure: dataPoints.pressure.length,
  //   batteryVoltage: dataPoints.batteryVoltage.length
  // });

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
        <TrendCard title="Temperature" icon={FaThermometerHalf} labels={dataPoints.labels} data={dataPoints.temperature} unit="°F" />
        <TrendCard title="Wind Speed" icon={FaWind} labels={dataPoints.labels} data={dataPoints.windSpeed} unit="mph" />
        <TrendCard title="Wind Direction" icon={FaCompass} labels={dataPoints.labels} data={dataPoints.windDirection} unit="°" />
        <TrendCard title="Wind Chill" icon={GiWindSlap} labels={dataPoints.labels} data={dataPoints.windChill} unit="°F" />
        <TrendCard title="Humidity" icon={FaTint} labels={dataPoints.labels} data={dataPoints.humidity} unit="%" />
        <TrendCard title="Dew Point" icon={FaThermometerHalf} labels={dataPoints.labels} data={dataPoints.dewPoint} unit="°F" />
        <TrendCard title="Barometric Pressure" icon={FaCompass} labels={dataPoints.labels} data={dataPoints.pressure} unit="inHg" />
        <TrendCard title="Battery Voltage" icon={FaBatteryFull} labels={dataPoints.labels} data={dataPoints.batteryVoltage} unit="V" />
      </div>
    </section>
  );
};

const MemoizedWeatherTrends = memo(WeatherTrends);
export default MemoizedWeatherTrends;
