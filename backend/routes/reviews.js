const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/auth");
const router  = express.Router();

// GET /api/reviews — admin: all reviews across products
router.get("/", protect, admin, async (req, res) => {
  try {
    const products = await Product.find({ "reviews.0":{ $exists:true } }).select("title reviews");
    const reviews = [];
    products.forEach(p => p.reviews.forEach(r => reviews.push({ ...r.toObject(), productTitle:p.title, productId:p._id })));
    reviews.sort((a,b) => new Date(b.date)-new Date(a.date));
    res.json(reviews);
  } catch (err) { res.status(500).json({ message:err.message }); }
});

module.exports = router;
