const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  title:   String,
  image:   String,
  price:   Number,
  size:    String,
  qty:     Number,
});

const statusHistorySchema = new mongoose.Schema({
  status:    { type: String, required: true },
  message:   { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, default: "" },
    userEmail: { type: String, default: "" },
    userPhone: { type: String, default: "" },
    products: [orderItemSchema],

    // ── Tracking ────────────────────────────────────────────────────────────
    trackingId: {
      type: String,
      unique: true,
      default: () => "ORD" + Date.now(),
    },

    // ── Status ──────────────────────────────────────────────────────────────
    orderStatus: {
      type: String,
      enum: ["Awaiting Payment Verification", "Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"],
      default: "Placed",
    },
    statusHistory: { type: [statusHistorySchema], default: [] },

    // ── Shipping ──────────────────────────────────────────────────────────
    shippingAddress: {
      name:    String,
      phone:   String,
      email:   String,
      street:  String,
      city:    String,
      state:   String,
      pincode: String,
    },

    // ── Payment ───────────────────────────────────────────────────────────
    paymentMethod: { type: String, default: "COD" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
    paymentId:     { type: String, default: "" },

    // ── Totals ────────────────────────────────────────────────────────────
    subtotal:       { type: Number, default: 0 },
    discount:       { type: Number, default: 0 },
    shippingCharge: { type: Number, default: 0 },
    totalAmount:    { type: Number, default: 0 },
    couponCode:     { type: String, default: "" },
    emailSent:      { type: Boolean, default: false },

    // ── Estimated Delivery ────────────────────────────────────────────────
    estimatedDelivery: { type: Date },
  },
  { timestamps: true }
);

// Auto-push "Placed" to statusHistory on first save
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    const defaultMessage = this.orderStatus === "Awaiting Payment Verification"
      ? "Order received. Waiting for UPI payment verification."
      : "Order placed successfully.";

    this.statusHistory.push({ status: this.orderStatus, message: defaultMessage });
    const est = new Date();
    est.setDate(est.getDate() + 7);
    this.estimatedDelivery = est;
  }
  next();
});

orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ trackingId: 1 });
orderSchema.index({ orderStatus: 1, createdAt: -1 });

module.exports = mongoose.model("Order", orderSchema);
