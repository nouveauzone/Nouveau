const express = require("express");
const { param, query } = require("express-validator");
const User    = require("../models/User");
const Order   = require("../models/Order");
const { protect, admin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const router  = express.Router();

// GET /api/users — admin: all users
router.get(
  "/",
  protect,
  admin,
  [
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    query("search").optional().isString().isLength({ max: 100 }),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const { page=1, limit=50, search } = req.query;
    const q = search ? { $or:[{ name:{$regex:search,$options:"i"} }, { email:{$regex:search,$options:"i"} }] } : {};
    const users = await User.find(q).select("-password").sort({ createdAt:-1 }).skip((page-1)*+limit).limit(+limit);
    const total = await User.countDocuments(q);
    res.json({ users, total });
  })
);

// GET /api/users/:id/detail — admin: single user profile + order history
router.get(
  "/:id/detail",
  protect,
  admin,
  [param("id").isMongoId().withMessage("Invalid user id"), validate],
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const orders = await Order.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("items.product", "title images")
      .populate("user", "name email");

    const orderTotal = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const lastOrder = orders[0] || null;
    const lastShipping = lastOrder?.shippingAddress || {};
    const primaryAddress = Array.isArray(user.addresses) && user.addresses.length ? user.addresses[0] : {};

    res.json({
      user,
      orders,
      stats: {
        totalOrders: orders.length,
        totalSpend: orderTotal,
        lastOrderDate: lastOrder?.createdAt || null,
        phone: lastShipping.phone || user.phone || "",
        city: lastShipping.city || primaryAddress.city || "",
        state: lastShipping.state || primaryAddress.state || "",
      },
    });
  })
);

// DELETE /api/users/:id — admin
router.delete(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId().withMessage("Invalid user id"), validate],
  asyncHandler(async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message:"User deleted" });
  })
);

module.exports = router;
