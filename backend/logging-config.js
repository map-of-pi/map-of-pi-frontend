const dotenv = require("dotenv");
const winston = require('winston');
const { MongoClient } = require('mongodb');

require('winston-mongodb');

dotenv.config();

const configureLogging = async () => {
    console.log(`VERCEL_ENV: ${process.env.VERCEL_ENV}`);

    // check if the app is running in localhost mode or sandbox
    const isDevelopment = () => {
        return process.env.VERCEL_ENV === "localhost" || process.env.VERCEL_ENV === "sandbox";
    };

    // determine the logging configuration based on the server environment
    if (isDevelopment()) {
        return {
            level: 'debug',
            format: winston.format.cli(),
            transports: [
              new winston.transports.Console()
            ]
        };
    } else {
        const url = "mongodb+srv://mapofpi:mapofpi@mapofpi.vibqtx2.mongodb.net/mapofpiDB?retryWrites=true&w=majority";
        try {
            const client = new MongoClient(url);
            await client.connect();

            return {
                level: 'info',
                format: winston.format.combine(
                    winston.format.timestamp(),
                    winston.format.json()
                ),
                transports: [
                    new winston.transports.MongoDB({
                        db: client.db(),
                        options: {
                            useNewUrlParser: true,
                            useUnifiedTopology: true
                        },
                        collection: 'serverLogs'
                    })
                ]
            };
        } catch (error) {
            console.error('Error connecting to SQL DB for logging: ', error);
        }
    }
};

module.exports = configureLogging;
