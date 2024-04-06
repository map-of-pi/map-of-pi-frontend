const Shop = require("../models/shopModel");
const Product = require("../models/productModel");
const logger = require("../../logger");

const search = async (req, res) => {
    try {
        const { businessType, priceRange, shopName, productName } = req.query;
        logger.debug(`Searching with parameters: businessType=${businessType}, priceRange=${priceRange}, shopName=${shopName}, productName=${productName}`);

        let shopQuery = {};
        let productQuery = {};

        if (businessType != null) {
            shopQuery.businessType = { $regex: new RegExp(businessType, "i") };
        }

        if (shopName != null) {
            shopQuery.name = { $regex: new RegExp(shopName, "i") };
        }

        if (productName != null) {
            productQuery.name = { $regex: new RegExp(productName, "i") };
        }

        let shops = await Shop.find(shopQuery);
        logger.debug(`Found ${shops.length} shops matching the criteria`);

        if (priceRange != null) {
            const [minPrice, maxPrice] = priceRange.split("-");
            const products = await Product.find({
                ...productQuery,
                price: { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) }
            });
            const shopIds = products.map(product => product.shop);
            shops = await Shop.find({ _id: { $in: shopIds } });
            logger.debug(`Filtered shops by price range: minPrice=${minPrice}, maxPrice=${maxPrice}`);
        }
        
        if (shops.length === 0) {
            logger.warn('No shops found matching the criteria');
            return res.status(404).json({ message: 'No shops found matching the criteria.' });
        }

        res.status(200).json({ shops });
    } catch (error) {
        logger.error("Internal server error while searching:", error.message);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = { search };
