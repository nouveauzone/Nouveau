const express = require("express");
const { body, param, query } = require("express-validator");
const {
  createOrder,
  trackOrder,
  updateOrderStatus,
  getMyOrders,
  getOrderById,
  getAllOrders,
  deleteOrder,
} = require("../controllers/orderController");
const { protect, admin } = require("../middleware/auth");
const validate = require("../middleware/validate");
const router = express.Router();
const { sendOrderConfirmation } = require("../utils/whatsapp");

// ── IMPORTANT: Specific routes BEFORE /:id wildcard ──────────────────────────

// PUBLIC — no auth needed
router.get("/track/:trackingId", trackOrder);

// AUTHENTICATED
const orderCreateValidation = [
  body("items").optional().isArray(),
  body("products").optional().isArray(),
  body("paymentMethod").optional().isIn(["COD", "UPI", "RAZORPAY", "cod", "upi", "razorpay"]).withMessage("Unsupported payment method"),

  body("shippingAddress.name").trim().notEmpty(),
  body("shippingAddress.phone").trim().notEmpty(),
  body("shippingAddress.email").isEmail(),
  body("shippingAddress.street").trim().notEmpty(),
  body("shippingAddress.city").trim().notEmpty(),
  body("shippingAddress.state").trim().notEmpty(),
  body("shippingAddress.pincode").trim().notEmpty(),
  body().custom((value) => {
    const method = String(value?.paymentMethod || "COD").toUpperCase();
    const ref = String(value?.paymentReference || "").trim();

    const items = Array.isArray(value?.items)
      ? value.items
      : Array.isArray(value?.products)
        ? value.products
        : [];

    if (!items.length) {
      throw new Error("At least one item is required");
    }

    items.forEach((item, index) => {
      const price = Number(item?.price);
      const qty = Number(item?.qty ?? item?.itemQty ?? 0);
      const size = String(item?.size ?? item?.selectedSize ?? "").trim();

      if (!Number.isFinite(price) || price <= 0) {
        throw new Error(`items[${index}].price must be greater than 0`);
      }
      if (!Number.isInteger(qty) || qty < 1) {
        throw new Error(`items[${index}].qty must be >= 1`);
      }
      if (!size) {
        throw new Error(`items[${index}].size is required`);
      }
    });

    if (method === "UPI" && !/^\d{12}$/.test(ref)) {
      throw new Error("A valid 12-digit UPI UTR/Reference number is required for UPI orders.");
    }

    if (method === "RAZORPAY" && !/^[A-Za-z0-9\-_]{6,64}$/.test(ref)) {
      throw new Error("Valid Razorpay paymentReference is required for online orders");
    }
    return true;
  }),
  validate,
];

// createOrder handles MongoDB save + WhatsApp confirmation (non-blocking on failure)
router.post("/", protect, orderCreateValidation, createOrder);
router.post("/create", protect, orderCreateValidation, createOrder);
router.get("/my", protect, getMyOrders);

router.post("/test-whatsapp", protect, async (req, res) => {
  try {
    await sendOrderConfirmation("7733881577", "Test User", "TEST123", "30 Apr 2026");
    res.json({ success: true, message: "WhatsApp test sent!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ADMIN — specific routes before wildcard
router.get(
  "/all",
  protect, admin,
  [
    query("status").optional().isIn(["Awaiting Payment Verification","Placed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"]),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    validate,
  ],
  getAllOrders
);

router.put(
  "/update/:id",
  protect, admin,
  [
    param("id").isMongoId(),
    body("status").isIn(["Awaiting Payment Verification","Placed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"]),
    validate,
  ],
  updateOrderStatus
);

// Legacy status update
router.put(
  "/:id/status",
  protect, admin,
  [
    param("id").isMongoId(),
    body("status").isIn(["Awaiting Payment Verification","Placed","Processing","Shipped","Out for Delivery","Delivered","Cancelled"]),
    validate,
  ],
  updateOrderStatus
);

router.delete("/:id", protect, admin, [param("id").isMongoId(), validate], deleteOrder);

// WILDCARD last — single order by _id
router.get("/:id", protect, [param("id").isMongoId(), validate], getOrderById);

module.exports = router;
