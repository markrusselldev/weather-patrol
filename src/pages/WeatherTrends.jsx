import { useContext, memo } from "react";
import PropTypes from "prop-types";
import TrendCard from "../components/TrendCard";
import { WiThermometer, WiThermometerExterior, WiStrongWind, WiHumidity, WiBarometer } from "react-icons/wi";
import { IoBatteryChargingOutline } from "react-icons/io5";
import { PiCompassRose } from "react-icons/pi";
import { GiDew } from "react-icons/gi";
import ErrorMessages from "../components/ErrorMessages";
import { DataContext } from "../contexts/DataContext";
import useFilteredWeatherData from "../hooks/useFilteredWeatherData";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";
import { FaSpinner } from "react-icons/fa";

const WeatherTrends = ({ timeframe }) => {
  const { weatherData, error } = useContext(DataContext);
  const { dataPoints, isLoading } = useFilteredWeatherData(weatherData, timeframe);

  if (error) {
    log.error({ page: "src/pages/WeatherTrends.jsx", component: "WeatherTrends", func: "render" }, "Error in WeatherTrends component:", error);
    return <ErrorMessages message={errorHandler(error)} />;
  }

  if (isLoading) {
    log.info({ page: "src/pages/WeatherTrends.jsx", component: "WeatherTrends", func: "render" }, "Loading filtered data...");
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="absolute top-1/2 transform -translate-y-1/2">
          <FaSpinner className="animate-spin text-8xl text-gray-300" /> 
        </div>
      </div>
    );
  }

  if (!dataPoints.labels.length) {
    log.info({ page: "src/pages/WeatherTrends.jsx", component: "WeatherTrends", func: "render" }, "No filtered data available.");
  }

  log.debug({ page: "src/pages/WeatherTrends.jsx", component: "WeatherTrends", func: "render" }, "Data points for TrendCards count:", {
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
