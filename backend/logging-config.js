const dotenv = require("dotenv");
const winston = require('winston');
const sql = require('mssql');

const SQLDatabaseTransport = require('./sql-database-transport');

dotenv.config();

// SQL database configuration
const sqlConfig = {
    user: 'MainAdmin',
    password: 'pioneer24!Hackathon',
    database: 'map-of-pi',
    server: 'mapofpi.database.windows.net',
    authentication: {
        type: 'default'
    },
    pool: {
        max: 10,
        min: 0,
        idleTimeoutMillis: 30000
    },
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

const configureLogging = async () => {
    console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV}`);

    // check if the app is running in localhost mode or sandbox
    const isDevelopment = () => {
        return process.env.VERCEL_ENV === "localhost" || process.env.VERCEL_ENV === "sandbox";
    };

    // determine the logging configuration based on the environment
    if (!isDevelopment()) {
        return {
            level: 'debug',
            format: winston.format.cli(),
            transports: [
              new winston.transports.Console()
            ]
        };
    } else {
        try {
            // Create a connection pool
            const pool = await new sql.ConnectionPool(sqlConfig).connect();
 
            console.log("After connecting to SQL DB");

            return {
                level: 'info',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                transports: [
                    new SQLDatabaseTransport({ pool })
                ]
            };
        } catch (error) {
            console.error('Error connecting to SQL DB for logging: ', error);
        }
    }
};

module.exports = configureLogging;
