const dotenv = require("dotenv");
const winston = require('winston');
const { MongoClient } = require('mongodb');
const mongoose = require("mongoose");

require('winston-mongodb');

dotenv.config();

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
        const url = "mongodb+srv://mapofpi:mapofpi@map-of-pi-cluster.xoijxiu.mongodb.net/map-of-pi?retryWrites=true&w=majority";
        // const url = "mongodb://localhost:27017/";
        console.log(url);
        try {
            const client = new MongoClient(url);
            

            console.log("Before connecting to MongoDB");
            await client.connect();
            console.log("After connecting to MongoDB");

            // Check if the client is connected
            if (client.topology && client.topology.isConnected()) {
                console.log("Client is connected to MongoDB");
            } else {
                console.log("Client is not connected to MongoDB");
            }

            const db = client.db(); // Get the database object
            console.log("Database object:", db); // Log the database object

            console.log("Connected to MongoDB");

            // return {
            //     level: 'info',
            //     format: winston.format.json(),
            //     transports: [new winston.transports.MongoDB(dbOptions)]
            // };

            return {
                level: 'info',
                format: winston.format.json(),
                transports: [
                new winston.transports.MongoDB({
                    db: client.db(),
                    options: {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    },
                    collection: 'server-logs'
                })]
            };
        } catch (error) {
            console.error('Error connecting to MongoDB for logging: ', error);
        }
    }
}

module.exports = configureLogging;
