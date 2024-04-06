const mongoose = require("mongoose");
const Product = require("./productModel");
const User = require("./userModel");
const logger = require("../../logger");

const shopSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  state: String,
  coordinates: [Number, Number],
  phone: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  description: String,
  image: String,
  owner_uid: String,
  owner_username: String,
  rating: {
    type: Number,
    default: 0,
  },
  transactionEnabled: { type: Boolean, default: true },
  orderWithoutPayment: { type: Boolean, default: false },
  orders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  }],
  products: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
});

shopSchema.pre("remove", async function (next) {
  try {
    await Product.deleteMany({ shop: this._id });
    next();
  } catch (error) {
    logger.error("Product failed to be deleted with shop", error);
    next(error);
  }
});

module.exports = mongoose.model("Shop", shopSchema);
