import { NextResponse } from "next/server";
import { createRequire } from "module";
import crypto from "crypto";
import { verifyToken } from "../../_lib/session";

const require = createRequire(import.meta.url);
const { connectToDatabase } = require("../../../../backend/config/db");
const User = require("../../../../backend/models/User");
const Order = require("../../../../backend/models/Order");

export const dynamic = "force-dynamic";

const normalizeOrderItems = (items = []) => {
  return Array.isArray(items) ? items.map((item) => ({ ...item })) : [];
};

export async function POST(request) {
  try {
    await connectToDatabase();

    const decoded = verifyToken(request);
    if (!decoded) {
      return NextResponse.json({ message: "Not authorized: missing bearer token" }, { status: 401 });
    }

    const userId = decoded?.id || decoded?.userId || decoded?._id;
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json({ message: "Not authorized: user not found" }, { status: 401 });
    }

    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      items = [],
      shippingAddress,
      paymentMethod = "RAZORPAY",
      paymentReference = razorpay_payment_id,
      subtotal = 0,
      shippingCharge = 0,
      total = 0,
    } = body || {};

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ success: false, message: "Missing Razorpay verification fields" }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac("sha256", String(process.env.RAZORPAY_KEY_SECRET || ""))
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 400 });
    }

    let savedOrder = null;

    if (orderId) {
      savedOrder = await Order.findById(orderId);
    }

    if (!savedOrder && Array.isArray(items) && items.length > 0 && shippingAddress) {
      savedOrder = await Order.create({
        userId: user._id,
        userName: shippingAddress?.name || user.name || "",
        userEmail: shippingAddress?.email || user.email,
        userPhone: shippingAddress?.phone || user.phone || "",
        products: normalizeOrderItems(items),
        shippingAddress,
        paymentMethod,
        paymentStatus: "paid",
        paymentId: paymentReference || razorpay_payment_id,
        orderStatus: "Placed",
        subtotal: Number(subtotal) || 0,
        shippingCharge: Number(shippingCharge) || 0,
        totalAmount: Number(total) || 0,
      });
    }

    if (savedOrder) {
      savedOrder.paymentStatus = "paid";
      savedOrder.paymentId = paymentReference || razorpay_payment_id;
      if (String(savedOrder.paymentMethod || paymentMethod).toUpperCase() === "RAZORPAY") {
        savedOrder.orderStatus = "Placed";
      }
      await savedOrder.save();
    }

    return NextResponse.json({
      success: true,
      razorpay_order_id,
      razorpay_payment_id,
      order: savedOrder,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error?.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}