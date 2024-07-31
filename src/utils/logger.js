import log from "loglevel";

const logLevel = import.meta.env.VITE_LOG_LEVEL || "debug"; // Set to 'debug' by default
log.setLevel(logLevel);

// Enhance loglevel to include timestamps and log levels
const originalFactory = log.methodFactory;
log.methodFactory = function (methodName, logLevel, loggerName) {
  const rawMethod = originalFactory(methodName, logLevel, loggerName);
  return function (...args) {
    try {
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
      rawMethod(`[${new Date().toISOString()}] ${methodName.toUpperCase()}:`, ...messages);
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
