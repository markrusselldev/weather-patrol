import { useEffect, useState, useContext, memo } from "react";
import { FaThermometerHalf, FaWind, FaCompass, FaTint, FaBatteryFull } from "react-icons/fa";
import { GiWindSlap } from "react-icons/gi";
import ConditionCard from "../components/ConditionCard";
import MemoizedBreadcrumb from "../components/Breadcrumb";
import ErrorMessages from "../components/ErrorMessages";
import { DataContext } from "../contexts/DataContext";
import { formatTimestamp } from "../utils/utils";

const CurrentConditions = () => {
  const [latestData, setLatestData] = useState(null);
  const [pastData, setPastData] = useState([]);
  const { rowData, error } = useContext(DataContext);

  useEffect(() => {
    if (rowData.length > 0) {
      setLatestData(rowData[0]);
      setPastData(rowData.slice(1, 5)); // Keep past readings in their original order for display
    }
  }, [rowData]);

  if (error) return <ErrorMessages message={error} />;
  if (!latestData) return <div>Loading...</div>;

  const createDataArray = key => [...pastData.map(row => Math.round(row[key])), Math.round(latestData[key])]; // Ensure the latest data is at the end
  const createPastTimestampsArray = () => pastData.map(row => formatTimestamp(row.TIMESTAMP, true));

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

  console.log("Past timestamps:", pastTimestamps);
  console.log("Data for temperature:", data.temperature);

  return (
    <section className="weather-conditions flex flex-col flex-grow">
      <MemoizedBreadcrumb title="/ Current Conditions" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 flex-grow">
        <ConditionCard title="Temperature" icon={FaThermometerHalf} data={data.temperature} unit="°F" min={data.temperatureMin} max={data.temperatureMax} pastTimestamps={pastTimestamps} showMinMax />
        <ConditionCard title="Wind Speed" icon={FaWind} data={data.windSpeed} unit="mph" min={data.windSpeedMin} max={data.windSpeedMax} pastTimestamps={pastTimestamps} showMinMax />
        <ConditionCard title="Wind Direction" icon={FaCompass} data={data.windDirection} unit="°" min={265} max={280} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Wind Chill" icon={GiWindSlap} data={data.windChill} unit="°F" min={13} max={15} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Humidity" icon={FaTint} data={data.humidity} unit="%" min={65} max={72} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Dew Point" icon={FaThermometerHalf} data={data.dewPoint} unit="°F" min={8} max={10} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Barometric Pressure" icon={FaCompass} data={data.pressure} unit="inHg" min={29.8} max={29.95} pastTimestamps={pastTimestamps} showMinMax={false} />
        <ConditionCard title="Battery Voltage" icon={FaBatteryFull} data={data.batteryVoltage} unit="V" min={12.4} max={12.7} pastTimestamps={pastTimestamps} showMinMax={false} />
      </div>
    </section>
  );
};

const MemoizedCurrentConditions = memo(CurrentConditions);
export default MemoizedCurrentConditions;
