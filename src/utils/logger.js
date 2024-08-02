import log from "loglevel";

const logLevel = import.meta.env.VITE_LOG_LEVEL || "debug"; // Set to 'debug' by default
log.setLevel(logLevel);

const recentLogs = new Set();

const clearRecentLogs = () => {
  recentLogs.clear();
  setTimeout(clearRecentLogs, 5000); // Clear recent logs every 5 seconds
};

clearRecentLogs();

// Enhance loglevel to include timestamps, log levels, and structured context
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return function (...args) {
    try {
      let context = "";
      if (args.length > 0 && typeof args[0] === "object" && args[0].page && args[0].component && args[0].func) {
        const { page, component, func } = args.shift();
        context = `[Page: ${page}, Component: ${component}, Function: ${func}]`;
      }

      const logEntry = `[${new Date().toISOString()}] ${methodName.toUpperCase()}${context ? " " + context : ""}: ${args.join(" ")}`;
      if (recentLogs.has(logEntry)) {
        return; // Skip logging if duplicate
      }
      recentLogs.add(logEntry);

      const messages = args.map(arg => {
        if (typeof arg === "object") {
          return JSON.stringify(
            arg,
            (key, value) => {
              if (value instanceof Error) {
                return { ...value, message: value.message, stack: value.stack };
              }
              return value;
            },
            2
          );
        }
        return arg;
      });
      rawMethod(logEntry, ...messages);
    } catch (error) {
      rawMethod(`[${new Date().toISOString()}] ${methodName.toUpperCase()}: Error in logging -`, error);
    }
  };
};

log.setLevel(log.getLevel()); // Apply the new methodFactory

// Test logs for all levels
/* log.trace("This is a TRACE log");
log.debug("This is a DEBUG log");
log.info("This is an INFO log");
log.warn("This is a WARN log");
log.error("This is an ERROR log"); */

export default log;
