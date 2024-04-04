const winston = require('winston');
const configureLogging = require('./logging-config');

const initializeLogger = async () => {
    try {
        const loggingConfig = await configureLogging();
        const logger = winston.createLogger(loggingConfig);
        return logger;
    } catch (error) {
        console.error('Error initializing logger:', error);
        return null;
    }
};

module.exports = initializeLogger;
