const Product = require("../models/Product");

const getProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 0;

    const products = await Product.find({}).limit(limit);

    res.json(products);
  } catch (error) {
    console.error("❌ PRODUCT ERROR:", error.message);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { getProducts };