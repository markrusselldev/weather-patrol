import log from "loglevel";

const logLevel = import.meta.env.VITE_LOG_LEVEL || "info";
log.setLevel(logLevel);

export default log;
