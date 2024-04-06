const Product = require("../models/productModel");
const Shop = require("../models/shopModel");
const logger = require("../../logger");

const addProductToShop = async (req, res) => {
    const { shopId } = req.params;
    const currentUser = req.currentUser;

    try {
        const shop = await Shop.findById(shopId);
        if (!shop) {
            logger.warn("Shop not found");
            return res.status(404).json({ error: "Shop not found" });
        }

        const newProduct = await Product.create({ ...req.body, shop: shopId });
        
        shop.products.push(newProduct);
        await shop.save();

        logger.info("Product added successfully");
        return res.status(200).json({ message: "Product added successfully", newProduct });
        
    } catch (error) {
        logger.error("Internal server error while adding product:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const deleteProductFromShop = async (req, res) => {};

const updateProduct = async (req, res) => {};

module.exports = { addProductToShop, deleteProductFromShop, updateProduct };
