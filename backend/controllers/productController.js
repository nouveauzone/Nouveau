const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const products = await Product.find({}).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error("❌ PRODUCT ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getProducts };