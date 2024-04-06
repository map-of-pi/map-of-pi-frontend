const winston = require('winston');
const configureLogging = require('./logging-config');

const loggingConfig = configureLogging();
const logger = winston.createLogger(loggingConfig);

module.exports = logger;
