const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const logger = require("../../logger");

const isAuthenticated = async (req, res, next) => {
  logger.debug("isAuthenticated middleware started");
  const token =
    req.headers.authorization && req.headers.authorization.split(" ")[1];
  logger.debug("Token: " + token);

  if (!token) {
    logger.error("User authentication failed; token not provided");
    return res.status(401).json({ error: "User unauthorized; expected token not provided" });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const currentUser = await User.findOne({ uid: decodedToken.userId });

    if (!currentUser) {
      logger.error("User authentication failed; current user not found");
      return res.status(401).json({ error: "User unauthorized; current user not found" });
    }

    req.currentUser = currentUser;

    next();
  } catch (error) {
    logger.error("Error verifying token:", error);
    return res
      .status(401)
      .json({ error: "User unauthorized; token is invalid", details: error.message });
  } finally {
    logger.debug("isAuthenticated middleware finished");
  }
};

module.exports = isAuthenticated;
