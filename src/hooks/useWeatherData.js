import { useEffect, useState, useCallback, useMemo } from "react";
import log from "../utils/logger";
import { formatTimestamp } from "../utils/utils";

// Helper function to convert wind direction degrees into cardinal direction
const getCardinalDirection = degrees => {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round((degrees % 360) / 45) % 8;
  return directions[index];
};

const useWeatherData = weatherData => {
  const [latestData, setLatestData] = useState(null); // State to store the latest weather data
  const [pastData, setPastData] = useState([]); // State to store past weather data

  useEffect(() => {
    const logContext = { page: "src/hooks/useWeatherData.js", func: "useEffect" };
    log.info(logContext, "Effect triggered: weatherData changed", weatherData);

    if (weatherData && weatherData.length > 0) {
      log.debug(logContext, "weatherData structure", JSON.stringify(weatherData, null, 2));
      log.debug(logContext, "weatherData length", weatherData.length);

      // Set the latest data to the most recent entry
      setLatestData(weatherData[0]);

      // Determine the number of past records to store (up to 4)
      const pastRecordsCount = Math.min(weatherData.length - 1, 4);
      const sortedPastData = weatherData.slice(1, 1 + pastRecordsCount).sort((a, b) => new Date(a.TIMESTAMP) - new Date(b.TIMESTAMP));
      setPastData(sortedPastData);

      log.info(logContext, "Latest data and past data set successfully", {
        latestData: weatherData[0],
        pastData: sortedPastData
      });
      log.debug(logContext, "pastData content", JSON.stringify(sortedPastData, null, 2));
      log.debug(logContext, "pastData length", sortedPastData.length);
    } else {
      log.info(logContext, "No weatherData available to set latest and past data");
      setLatestData(null);
      setPastData([]);
    }
  }, [weatherData]);

  // Function to create an array of data points for a given key
  const createDataArray = useCallback(
    key => {
      if (!latestData) return [null];
      return [...pastData.map(row => (row[key] !== undefined ? Math.round(row[key]) : null)), Math.round(latestData[key])];
    },
    [latestData, pastData]
  );

  // Function to create an array of formatted past timestamps
  const createPastTimestampsArray = useCallback(() => {
    return pastData.map(row => {
      const formattedTimestamp = formatTimestamp(row.TIMESTAMP, { showTime: true, showDate: false });
      return formattedTimestamp === "Invalid timestamp" ? "Invalid timestamp" : formattedTimestamp;
    });
  }, [pastData]);

  // Memoized object containing various weather data arrays
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

  // Memoized array of past timestamps
  const pastTimestamps = useMemo(createPastTimestampsArray, [createPastTimestampsArray]);

  // Memoized value for the cardinal direction of the wind
  const windDirectionCardinal = useMemo(() => getCardinalDirection(latestData?.WindDir), [latestData?.WindDir]);

  return { data, pastTimestamps, windDirectionCardinal }; // Return the processed data
};

export default useWeatherData;
