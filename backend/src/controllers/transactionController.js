const Order = require("../models/orderModel");
const initializeLogger = require("../../logger");

let logger;

initializeLogger().then((initializedLogger) => {
  logger = initializedLogger;
});

const getUserTransactions = async (req, res) => {
  const currentUser = req.currentUser;

  try {
    const transactions = await Order.find({ user: currentUser.uid }).sort({ createdAt: 1 })
    logger.debug("Successfully fetched user transactions");
    return res.status(200).json({ transactions });
  } catch (error) {
    logger.error("Error getting user transactions:", error.message);
    return res.status(500).json({ error: "Internal server error", details: error.message });
  }
};

module.exports = { getUserTransactions };
