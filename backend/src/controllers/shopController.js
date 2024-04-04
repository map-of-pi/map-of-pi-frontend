const Product = require("../models/productModel");
const Shop = require("../models/shopModel");
const initializeLogger = require("../../logger");

let logger;

initializeLogger().then((initializedLogger) => {
  logger = initializedLogger;
});

const getAllShops = async (req, res) => {
  try {
    const shops = await Shop.find().populate("products");
    if (shops.length > 0) {
      logger.debug("Successfully fetched all shops");
      return res.status(200).json({ shops });
    } else {
      logger.debug("No shops found");
      return res.status(404).json({ message: "No shops found" });
    }
  } catch (error) {
    logger.error("Error while searching all shops:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const registerShop = async (req, res) => {
  const currentUser = req.currentUser;
  try {
    const newShop = await Shop.create({ ...req.body, owner: currentUser.uid });
    await currentUser.shops.push(newShop);
    logger.info("Successfully registered new shop:", newShop);
    return res.status(200).json({ newShop });
  } catch (error) {
    logger.error("Error while registering new shop:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getSingleShop = async (req, res) => {
  const { shopId } = req.params;
  try {
    const shop = await Shop.findById(shopId);
    if (shop) {
      logger.debug("Successfully fetched single shop:", shop);
      return res.status(200).json({ shop });
    } else {
      logger.debug("No shop found");
      return res.status(404).json({ message: "No shop found" });
    }
  } catch (error) {
    logger.error("Error while searching single shop:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const deleteShop = async (req, res) => {
  const { shopId } = req.params;
  const currentUser = req.currentUser;
  try {
    const shopToDelete = await Shop.findById(shopId);
    if (shopToDelete && shopToDelete.owner === currentUser.uid) {
      await Shop.findByIdAndDelete(shopId);
      logger.debug("Successfully deleted shop:", shopToDelete);
      return res.status(200).json({ message: "Shop deleted successfully" });
    } else {
      logger.warn("Shop removal denied due to lack of permission");
      return res.status(401).json({ message: "Shop removal denied due to lack of permission" });
    }
  } catch (error) {
    logger.error("Error while deleting shop:", error.message);
    return res.status(500).json({ error: "Internal server error while deleting shop" });
  }
};

const updateShop = async (req, res) => {
  const { shopId } = req.params;
  const currentUser = req.currentUser;
  try {
    const shopToUpdate = await Shop.findById(shopId);
    if (shopToUpdate && shopToUpdate.owner === currentUser.uid) {
      await Shop.updateOne({ _id: shopId }, { ...req.body }, { new: true });
      logger.info("Successfully updated shop:", shopToUpdate);
      return res.status(200).json({ message: "Shop updated successfully" });
    } else {
      logger.warn("Unauthorized to update this shop");
      return res.status(401).json({ message: "Unauthorized to update this shop" });
    }
  } catch (error) {
    logger.error("Error while updating shop:", error.message);
    return res.status(500).json({ error: "Internal server error while updating shop" });
  }
};


const getShopProducts = async (req, res) => {
  const { shopId } = req.params;
  try {
    const products = await Product.find({ shop: shopId });
    if (products.length > 0) {
      logger.debug("Successfully fetched products for shop");
      return res.status(200).json({ products });
    } else {
      logger.debug("Shop has no products");
      return res.status(200).json({ message: "Shop has no products" });
    }
  } catch (error) {
    logger.error("Error while searching products for a shop:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  registerShop,
  getAllShops,
  deleteShop,
  updateShop,
  getShopProducts,
  getSingleShop
};
