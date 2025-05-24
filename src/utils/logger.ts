import winston from "winston";
import "winston-daily-rotate-file";
import config from "../config/config";
const {transports, format} = winston;
const { combine, timestamp, printf, json, colorize } = format;

const formatDefault = combine(
    timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    json()
);

const logger = winston.createLogger({
    format: formatDefault
});

// Create a console transport for the development environment
const devConsoleTransport = new transports.Console({
    format: combine(
        colorize(),
        printf(
            ({ level, message, timestamp }) => `${timestamp} [${level}]: ${message}`
        )
    ),
});

// Create a file transport for the production environment
const prodFileTransport = new transports.DailyRotateFile({
    filename: "logs/blogs-rest-app-%DATE%.log",
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
    format: formatDefault,
})

// Create a file transport for only warn level logs in production
const criticalProdLogsFileTransport = new transports.File({
    filename: "./logs/error.log",
    level: "error",
});

// Create File transport for exception handler in production
const exceptionsLogsFileTransport = new transports.File({
    filename: "./logs/exceptions.log",
});

// Create File transport for rejection handler in production
const rejectionsLogsFileTransport = new transports.File({
    filename: "./logs/rejections.log",
});
if (config.NODE_ENV === "development") {
    logger.add(devConsoleTransport);
} else if (config.NODE_ENV === "production"){
    logger.add(prodFileTransport);
    logger.add(criticalProdLogsFileTransport);
    logger.add(exceptionsLogsFileTransport);
    logger.add(rejectionsLogsFileTransport);
}

export default logger;