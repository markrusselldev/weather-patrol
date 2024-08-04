import moment from "moment";
import log from "../utils/logger";

/**
 * Formats a timestamp based on the provided options.
 * @param {string} timestamp - The timestamp to format.
 * @param {Object} options - Formatting options.
 * @param {boolean} options.showTime - Whether to show the time.
 * @param {boolean} options.showDate - Whether to show the date.
 * @returns {string} The formatted timestamp.
 */
export const formatTimestamp = (timestamp, { showTime = true, showDate = true } = {}) => {
  if (!timestamp) {
    log.error("Error: Invalid timestamp provided.");
    return "";
  }

  let format = "";
  if (showTime && showDate) {
    format = "HH:mm MM/DD/YY";
  } else if (showTime) {
    format = "HH:mm";
  } else if (showDate) {
    format = "MM/DD/YY";
  } else {
    format = "YYYY-MM-DD HH:mm:ss"; // Default format if both showTime and showDate are false
    log.warn("Warning: Neither showTime nor showDate is true. Defaulting to full timestamp format.");
  }

  const formattedTimestamp = moment(timestamp).format(format);

  if (formattedTimestamp === "Invalid date") {
    log.error("Error: Invalid date format provided.");
    return "";
  }

  return formattedTimestamp;
};

/**
 * Get CSS variable with default fallback.
 * @param {string} varName - The name of the CSS variable.
 * @param {string} [fallback] - The fallback value if the variable is not found.
 * @returns {string} The value of the CSS variable or the fallback.
 */
export const getCssVariable = (varName, fallback = "") => {
  const value = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  const finalValue = value || fallback;
  log.debug({ function: "getCssVariable" }, `Fetching CSS variable: ${varName}, value: ${finalValue}`);
  return finalValue;
};
