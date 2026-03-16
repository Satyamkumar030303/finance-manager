const winston = require("winston");

const {combine, timestamp, printf, errors, json, colorize } = winston.format;

//custom logger format
const myFormat = printf(({ level, message, timestamp, stack }) => {
    return `${timestamp} ${level}: ${stack || message}`;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",

    format: combine(
        timestamp(),
        errors({ stack: true }),
        json(),
    ),

    transports:[
        new winston.transports.Console({
            format: combine(
                colorize(),
                myFormat
            ),
        }),
        new winston.transports.File({
            filename: "logs/error.log",
            level: "error",
        }),
        new winston.transports.File({ filename: "logs/combined.log" }),
    ],
    exceptionHandlers: [
        new winston.transports.File({ filename: "logs/exceptions.log" }),
     ],

    rejectionHandlers: [
        new winston.transports.File({ filename: "logs/rejections.log" }),
     ],
    });

module.exports = logger;

  