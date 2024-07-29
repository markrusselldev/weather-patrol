import axiosInstance from "./utils/axiosInstance";

export const getLatestWeatherData = async () => {
  try {
    const response = await axiosInstance.get("/latest");
    return response.data;
  } catch (error) {
    console.error("Error fetching latest weather data:", error);
    throw error;
  }
};

export const getAllWeatherData = async () => {
  try {
    const response = await axiosInstance.get("/data");
    const data = response.data;

    // Extract headers from the second row of headers in the API response
    if (data.data && data.data.rows.length > 0) {
      const headers = data.data.headers && data.data.headers.length > 1 ? data.data.headers[1] : Object.keys(data.data.rows[0]);
      data.data.headers = headers;
    }

    return data;
  } catch (error) {
    console.error("Error fetching all weather data:", error);
    throw error;
  }
};
