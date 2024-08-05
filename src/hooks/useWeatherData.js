// src/hooks/useWeatherData.js

import { useEffect, useState, useCallback, useMemo } from "react";
import log from "../utils/logger";
import { formatTimestamp } from "../utils/utils";

const getCardinalDirection = degrees => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round((degrees % 360) / 45) % 8;
  return directions[index];
};

const useWeatherData = weatherData => {
  const [latestData, setLatestData] = useState(null);
  const [pastData, setPastData] = useState([]);

  useEffect(() => {
    log.info({ page: "src/hooks/useWeatherData.js", func: "useEffect" }, "Effect triggered: weatherData changed", weatherData);

    if (weatherData) {
      log.debug({ page: "src/hooks/useWeatherData.js", func: "useEffect" }, "weatherData structure", JSON.stringify(weatherData, null, 2));
      log.debug({ page: "src/hooks/useWeatherData.js", func: "useEffect" }, "weatherData length", weatherData.length);
    }

    if (weatherData && weatherData.length > 0) {
      log.debug({ page: "src/hooks/useWeatherData.js", func: "useEffect" }, "weatherData is available, setting latest and past data");
      setLatestData(weatherData[0]);

      const pastRecordsCount = Math.min(weatherData.length - 1, 4);
      const sortedPastData = weatherData.slice(1, 1 + pastRecordsCount).sort((a, b) => new Date(a.TIMESTAMP) - new Date(b.TIMESTAMP));
      setPastData(sortedPastData);

      log.info({ page: "src/hooks/useWeatherData.js", func: "useEffect" }, "Latest data and past data set successfully", {
        latestData: weatherData[0],
        pastData: sortedPastData
      });

      log.debug({ page: "src/hooks/useWeatherData.js", func: "useEffect" }, "pastData content", JSON.stringify(sortedPastData, null, 2));
      log.debug({ page: "src/hooks/useWeatherData.js", func: "useEffect" }, "pastData length", sortedPastData.length);
    } else {
      log.warn({ page: "src/hooks/useWeatherData.js", func: "useEffect" }, "No weatherData available to set latest and past data");
      setLatestData(null);
      setPastData([]);
    }
  }, [weatherData]);

  const createDataArray = useCallback(
    key => {
      if (!latestData || !latestData[key]) {
        log.warn({ page: "src/hooks/useWeatherData.js", func: "createDataArray" }, `No data available for key: ${key}`);
        return [null];
      }
      const dataArray = [...pastData.map(row => (row[key] !== undefined ? Math.round(row[key]) : null)), Math.round(latestData[key])];
      log.debug({ page: "src/hooks/useWeatherData.js", func: "createDataArray" }, `Data array for ${key}:`, dataArray);
      return dataArray;
    },
    [latestData, pastData]
  );

  const createPastTimestampsArray = useCallback(() => {
    const timestampsArray = pastData.map(row => {
      if (!row.TIMESTAMP) {
        log.error({ page: "src/hooks/useWeatherData.js", func: "createPastTimestampsArray" }, `Missing TIMESTAMP in data row: ${JSON.stringify(row)}`);
        return "Invalid timestamp";
      }
      log.debug({ page: "src/hooks/useWeatherData.js", func: "createPastTimestampsArray" }, "Processing TIMESTAMP:", row.TIMESTAMP);
      const formattedTimestamp = formatTimestamp(row.TIMESTAMP, { showTime: true, showDate: false });
      if (formattedTimestamp === "Invalid timestamp") {
        log.error({ page: "src/hooks/useWeatherData.js", func: "createPastTimestampsArray" }, `Invalid timestamp detected: ${row.TIMESTAMP}`);
      }
      return formattedTimestamp;
    });
    log.debug({ page: "src/hooks/useWeatherData.js", func: "createPastTimestampsArray" }, "Past timestamps array:", timestampsArray);
    return timestampsArray;
  }, [pastData]);

  const data = useMemo(
    () => ({
      temperature: createDataArray("AirTF_Avg"),
      windSpeed: createDataArray("WS_mph_Avg"),
      windDirection: createDataArray("WindDir"),
      windChill: createDataArray("WC_F_Avg"),
      humidity: createDataArray("RH"),
      dewPoint: createDataArray("DP_F_Avg"),
      pressure: createDataArray("BP_inHg_Avg"),
      batteryVoltage: createDataArray("BattV"),
      temperatureMin: latestData?.AirTF_Min !== undefined ? Math.round(latestData.AirTF_Min) : null,
      temperatureMax: latestData?.AirTF_Max !== undefined ? Math.round(latestData.AirTF_Max) : null,
      windSpeedMin: latestData?.WS_mph_Min !== undefined ? Math.round(latestData.WS_mph_Min) : null,
      windSpeedMax: latestData?.WS_mph_Max !== undefined ? Math.round(latestData.WS_mph_Max) : null
    }),
    [createDataArray, latestData]
  );

  const pastTimestamps = useMemo(createPastTimestampsArray, [createPastTimestampsArray]);
  const windDirectionCardinal = useMemo(() => getCardinalDirection(latestData?.WindDir), [latestData?.WindDir]);

  return { data, pastTimestamps, windDirectionCardinal };
};

export default useWeatherData;
