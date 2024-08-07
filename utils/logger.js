const { createLogger, format, transports } = require("winston");
const DailyRotateFile = require("winston-daily-rotate-file");
require("dotenv").config();

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message, context }) => {
    const ctx = context ? JSON.stringify(context) : "";
    const msg = typeof message === "object" ? JSON.stringify(message) : message;
    return `${timestamp} ${level}: ${ctx ? ctx + " " : ""}${msg}`;
  })
);

const consoleTransport = new transports.Console({
  format: format.combine(format.colorize(), logFormat)
});

const combinedFileTransport = new DailyRotateFile({
  filename: "logs/combined-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  level: process.env.LOG_LEVEL || "info"
});

const errorFileTransport = new DailyRotateFile({
  filename: "logs/error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d",
  level: "error"
});

const exceptionFileTransport = new DailyRotateFile({
  filename: "logs/exceptions-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d"
});

const rejectionFileTransport = new DailyRotateFile({
  filename: "logs/rejections-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  maxSize: "20m",
  maxFiles: "14d"
});

const logger = createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: logFormat,
  transports: [consoleTransport, combinedFileTransport, errorFileTransport],
  exceptionHandlers: [exceptionFileTransport],
  rejectionHandlers: [rejectionFileTransport],
  exitOnError: false
});

logger.on("error", err => {
  console.error("Logger error:", err);
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

const log = logger; // Export as log for consistency with front end

module.exports = log;
