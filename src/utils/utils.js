import moment from "moment";
import log from "../utils/logger";

/**
 * Formats a timestamp based on the provided options.
 * @param {string} timestamp - The timestamp to format.
 * @param {Object} options - Formatting options.
 * @param {boolean} options.showTime - Whether to show the time.
 * @param {boolean} options.showDate - Whether to show the date.
 * @param {boolean} options.showMonthDay - Whether to show the date in MMM.DD format.
 * @returns {string} The formatted timestamp.
 */
export const formatTimestamp = (timestamp, { showTime = true, showDate = true, showMonthDay = false } = {}) => {
  if (!timestamp) {
    log.error({ page: "src/utils/utils.js", func: "formatTimestamp" }, "Error: No timestamp provided. Timestamp value:", timestamp);
    return "Invalid timestamp";
  }

  const momentTimestamp = moment(timestamp);
  if (!momentTimestamp.isValid()) {
    log.error({ page: "src/utils/utils.js", func: "formatTimestamp" }, "Error: Invalid timestamp provided. Timestamp value:", timestamp);
    return "Invalid timestamp";
  }

  let format = "";
  if (showTime && showDate && !showMonthDay) {
    format = "HH:mm MM/DD/YY";
  } else if (showTime && showMonthDay) {
    format = "HH:mm MMM.DD";
  } else if (showMonthDay) {
    format = "MMM.DD";
  } else if (showTime) {
    format = "HH:mm";
  } else if (showDate) {
    format = "MM/DD/YY";
  } else {
    format = "YYYY-MM-DD HH:mm:ss"; // Default format if both showTime and showDate are false
    log.warn({ page: "src/utils/utils.js", func: "formatTimestamp" }, "Warning: Neither showTime nor showDate is true. Defaulting to full timestamp format.");
  }

  return momentTimestamp.format(format);
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
  log.debug({ page: "src/utils/utils.js", func: "getCssVariable" }, `Fetching CSS variable: ${varName}, value: ${finalValue}`);
  return finalValue;
};
