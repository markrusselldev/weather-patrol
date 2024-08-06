import { useState, useEffect, useMemo } from "react";
import log from "../utils/logger";
import { formatTimestamp } from "../utils/utils";

// Function to downsample data
const downsampleData = (data, factor) => {
  if (factor <= 1) return data;
  const downsampledData = [];
  for (let i = 0; i < data.length; i += factor) {
    downsampledData.push(data[i]);
  }
  return downsampledData;
};

const useFilteredWeatherData = (weatherData, timeframe) => {
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Effect to filter data based on selected timeframe
  useEffect(() => {
    const logContext = { page: "src/hooks/useFilteredWeatherData.js", func: "useEffect" };
    log.info(logContext, "Filtering data based on selected timeframe");

    if (!weatherData || weatherData.length === 0) {
      setFilteredData([]);
      setIsLoading(false);
      return;
    }

    try {
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
      log.debug(logContext, `Latest Record Timestamp: ${latestRecordTimestamp}`);

      // Filter data based on the latest record timestamp
      const filtered = weatherData.filter(row => {
        const rowTimestamp = new Date(row.TIMESTAMP);
        const hoursDifference = (latestRecordTimestamp - rowTimestamp) / (1000 * 60 * 60); // Calculate hours difference
        return hoursDifference <= timeframes[timeframe].hours;
      });

      log.debug(logContext, `Filtered data count for timeframe ${timeframe}: ${filtered.length}`);
      const downsampled = downsampleData(filtered, timeframes[timeframe].factor).reverse(); // Reverse the order
      setFilteredData(downsampled);
    } catch (error) {
      log.error(logContext, `Error filtering data: ${error.message}`);
      setFilteredData([]);
    }

    setIsLoading(false);
  }, [weatherData, timeframe]);

  const dataPoints = useMemo(() => {
    if (!filteredData || filteredData.length === 0) {
      return {
        labels: [],
        temperature: [],
        windSpeed: [],
        windDirection: [],
        windChill: [],
        humidity: [],
        dewPoint: [],
        pressure: [],
        batteryVoltage: []
      };
    }

    return {
      labels: filteredData.map(row => formatTimestamp(row.TIMESTAMP, { showTime: true, showMonthDay: true })),
      temperature: filteredData.map(row => row.AirTF_Avg),
      windSpeed: filteredData.map(row => row.WS_mph_Avg),
      windDirection: filteredData.map(row => row.WindDir),
      windChill: filteredData.map(row => row.WC_F_Avg),
      humidity: filteredData.map(row => row.RH),
      dewPoint: filteredData.map(row => row.DP_F_Avg),
      pressure: filteredData.map(row => row.BP_inHg_Avg),
      batteryVoltage: filteredData.map(row => row.BattV)
    };
  }, [filteredData]);

  return { dataPoints, isLoading };
};

export default useFilteredWeatherData;
