const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URL);
    // console.log(`Mongo DB Connection successfully attained: ${conn.connection.host}`);
    return conn;
  } catch (err) {
    console.error("Mongo DB Connection failed", err);
  }
};

module.exports = connectDB;
