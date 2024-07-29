import moment from "moment";

export const formatTimestamp = (timestamp, timeOnly = false) => {
  if (!timestamp) {
    console.error("Error: Invalid timestamp provided.");
    return "";
  }

  const format = timeOnly ? "HH:mm" : "HH:mm MM/DD/YY";
  const formattedTimestamp = moment(timestamp).format(format);
  
  if (formattedTimestamp === "Invalid date") {
    console.error("Error: Invalid date format provided.");
    return "";
  }

  return formattedTimestamp;
};
