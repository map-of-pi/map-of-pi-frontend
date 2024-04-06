const dotenv = require("dotenv");
const winston = require('winston');

dotenv.config();

const configureLogging = () => {
    console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV}`);

    // check if the app is running in localhost mode or sandbox
    const isDevelopment = () => {
        return process.env.VERCEL_ENV === "localhost" || process.env.VERCEL_ENV === "sandbox";
    };

    // determine the logging configuration based on the environment
    if (isDevelopment()) {
        return {
            level: 'debug',
            format: winston.format.cli(),
            transports: [
              new winston.transports.Console()
            ]
        };
    } else {
        return {
            level: 'error',
            format: winston.format.cli(),
            transports: [
              new winston.transports.Console()
            ]
        };
    }
}

module.exports = configureLogging;
