// src/pages/CurrentConditions.jsx

import { useContext, memo } from "react";
import { WiThermometer, WiThermometerExterior, WiStrongWind, WiHumidity, WiBarometer } from "react-icons/wi";
import { IoBatteryChargingOutline } from "react-icons/io5";
import { PiCompassRose } from "react-icons/pi";
import { GiDew } from "react-icons/gi";
import ConditionCard from "../components/ConditionCard";
import ErrorMessages from "../components/ErrorMessages";
import { DataContext } from "../contexts/DataContext";
import useWeatherData from "../hooks/useWeatherData";
import log from "../utils/logger";
import errorHandler from "../utils/errorHandler";

const CurrentConditions = () => {
  const { weatherData, error } = useContext(DataContext);
  const { data, pastTimestamps, windDirectionCardinal, isLoading } = useWeatherData(weatherData);

  if (error) {
    log.error({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Error in CurrentConditions component:", error);
    return <ErrorMessages message={errorHandler(error)} />;
  }

  if (isLoading) {
    log.info({ page: "src/pages/CurrentConditions.jsx", component: "CurrentConditions", func: "render" }, "Loading latest data...");
    return <div>Loading...</div>;
  }

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
