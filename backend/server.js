const fs = require("fs");
const path = require("path");
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const morganLogger = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");

dotenv.config();

// routes
// const userRoutes = require("./handlers/users");
const paymentRoutes = require("./src/handlers/payments");
const transactionRoutes = require("./src/handlers/transactions");
const userRoutes = require("./src/routes/userRoutes");
const shopRoutes = require("./src/routes/shopRoutes");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  next();
});

const corsOptions = {
  origin: [process.env.FRONTEND_URL,process.env.MAP_OF_PI_URL2,process.env.MAP_OF_PI_URL1],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser()); // Use cookie-parser middleware

app.use(
  morganLogger("common", {
    stream: fs.createWriteStream(path.join(__dirname, ".", "access.log"), {
      flags: "a",
    }),
  })
);

app.use("/user", userRoutes);
app.use("/payments", paymentRoutes);
app.use("/transactions", transactionRoutes);
app.use("/shops",shopRoutes)

mongoose
  .connect(`${process.env.MONGODB_URL}`)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Successful connection to DB");
    });
  })
  .catch((err) => {
    console.log("Error while connecting to DB", err);
  });
