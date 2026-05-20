/**
 * Nouveau™ WhatsApp Routes
 * POST /api/whatsapp/webhook  → Twilio chatbot webhook
 * POST /api/whatsapp/send     → Admin manual send
 * POST /api/whatsapp/invoice  → Send invoice to customer
 * GET  /api/whatsapp/logs     → Message logs (admin)
 * POST /api/whatsapp/test     → Test message
 */

const express      = require("express");
const path         = require("path");
const Order        = require("../models/Order");
const { protect, admin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const {
  sendWhatsApp,
  sendOrderConfirmation,
  sendInvoiceLink,
  getMessageLog,
} = require("../services/whatsappService");

const router = express.Router();
const BUSINESS_UPI_ID = (process.env.UPI_ID || "amdtrendzz@kotak").trim().toLowerCase();
const TEST_PAGE_PATH = path.join(__dirname, "..", "public", "whatsapp-test.html");
const TEST_KEY = String(process.env.WHATSAPP_TEST_KEY || "").trim();

// ── Chatbot reply logic ───────────────────────────────────────────────────────
const getChatbotReply = async (incomingMsg) => {
  const msg = (incomingMsg || "").trim().toLowerCase();

  // Greeting
  if (["hi","hello","hey","namaste","hii","helo"].includes(msg)) {
    return [
      `🌸 *Namaste! Welcome to Nouveau™* 🪷`,
      ``,
      `I'm your personal shopping assistant! How can I help?`,
      ``,
      `Reply with:`,
      `📦 *ORDER* — Track your order`,
      `💳 *PAYMENT* — Payment queries`,
      `🔄 *RETURN* — Return policy`,
      `📞 *SUPPORT* — Human support`,
      `🛍️ *SHOP* — Browse collection`,
      ``,
      `Or send your *Tracking ID* directly! (e.g. ORD1748xxxxxxx)`,
    ].join("\n");
  }

  // Track order
  if (["order","track","status","tracking"].includes(msg)) {
    return [
      `📦 *Track Your Order — Nouveau™*`,
      ``,
      `Please send your *Tracking ID* directly.`,
      ``,
      `Example: *ORD1748123456789*`,
      ``,
      `📍 Find your Tracking ID in:`,
      `  • WhatsApp confirmation message`,
      `  • Order Success page`,
      `  • Your email confirmation`,
    ].join("\n");
  }

  // Tracking ID lookup
  if (msg.startsWith("ord") && msg.length > 10) {
    const trackingId = incomingMsg.trim().toUpperCase();
    try {
      const order = await Order.findOne({ trackingId }).lean();
      if (order) {
        const trackURL = `${process.env.CLIENT_URL || "http://localhost:3000"}/track/${trackingId}`;
        const statusEmoji = {
          "Placed":"📋","Processing":"⚙️","Shipped":"🚀",
          "Out for Delivery":"🛵","Delivered":"✅","Cancelled":"❌"
        }[order.orderStatus] || "📦";

        const totalAmount = Number(order.totalAmount ?? order.total ?? 0);
        return [
          `✅ *Order Found! — Nouveau™*`,
          ``,
          `${statusEmoji} Status: *${order.orderStatus}*`,
          `🆔 Tracking ID: *${trackingId}*`,
          `💰 Total: *₹${totalAmount.toLocaleString("en-IN")}*`,
          `📅 Ordered: ${new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}`,
          ``,
          `🔗 *Full tracking:*`,
          trackURL,
          ``,
          `Reply *SUPPORT* if you need help 🌸`,
        ].join("\n");
      } else {
        return [
          `❌ *Order Not Found*`,
          ``,
          `No order with ID: *${trackingId}*`,
          ``,
          `Please check your tracking ID and try again.`,
          `Or reply *SUPPORT* to contact our team.`,
        ].join("\n");
      }
    } catch {
      return `⚠️ Unable to check order right now. Reply *SUPPORT* for help.`;
    }
  }

  // Payment
  if (["payment","pay","paid"].includes(msg)) {
    return [
      `💳 *Payment — Nouveau™*`,
      ``,
      `We accept:`,
      `  💵 Cash on Delivery (COD)`,
      `  📱 UPI / QR Code (GPay, PhonePe, Paytm)`,
      ``,
      `💳 UPI ID: *${BUSINESS_UPI_ID}*`,
      ``,
      `Payment issue? Reply *SUPPORT* 🌸`,
    ].join("\n");
  }

  // Return/Refund
  if (["return","refund","exchange","cancel"].includes(msg)) {
    return [
      `🔄 *Return Policy — Nouveau™*`,
      ``,
      `⚠️ *No Return / No Exchange policy.*`,
      ``,
      `All sales are final. Please verify:`,
      `  ✅ Size before ordering`,
      `  ✅ Product details`,
      ``,
      `*Damaged/Wrong item?* Reply *SUPPORT* within 24hrs of delivery.`,
    ].join("\n");
  }

  // Support
  if (["support","help","contact","problem","issue"].includes(msg)) {
    return [
      `📞 *Nouveau™ Support*`,
      ``,
      `Our team is here to help! 💪`,
      ``,
      `📱 WhatsApp: +91 7733881577`,
      `🕐 Hours: Mon–Sat, 10am–7pm IST`,
      ``,
      `Please describe your issue and we'll respond shortly! 🌸`,
    ].join("\n");
  }

  // Shop
  if (["shop","buy","collection","products","catalog"].includes(msg)) {
    return [
      `🛍️ *Shop Nouveau™*`,
      ``,
      `Explore our exclusive collections:`,
      `  👗 Indian Ethnic Wear`,
      `  👔 Premium Western Wear`,
      ``,
      `🔗 ${process.env.CLIENT_URL || "http://localhost:3000"}`,
      ``,
      `_Wear the culture_ 🪷`,
    ].join("\n");
  }

  // Review
  if (["review","feedback","rating"].includes(msg)) {
    return [
      `⭐ *Leave a Review — Nouveau™*`,
      ``,
      `We'd love your feedback! 💖`,
      ``,
      `Visit our website → Find your product → Leave a review`,
      `🔗 ${process.env.CLIENT_URL || "http://localhost:3000"}`,
      ``,
      `Your feedback helps us serve you better! 🌸`,
    ].join("\n");
  }

  // Fallback
  return [
    `🤖 *Nouveau™ Bot*`,
    ``,
    `Sorry, I didn't understand that.`,
    ``,
    `Try these commands:`,
    `📦 *ORDER* — Track order`,
    `💳 *PAYMENT* — Payment help`,
    `🔄 *RETURN* — Return policy`,
    `📞 *SUPPORT* — Human help`,
    `🛍️ *SHOP* — Browse collection`,
    ``,
    `Or send your *Tracking ID* (e.g. ORD1748xxxxxxx)`,
  ].join("\n");
};

// ── POST /api/whatsapp/webhook — Twilio incoming message webhook ──────────────
router.post("/webhook", async (req, res) => {
  try {
    const incomingMsg = req.body?.Body || "";
    const from        = req.body?.From || "";
    console.log(`📱 [Webhook] From: ${from} | Msg: "${incomingMsg}"`);

    const replyText = await getChatbotReply(incomingMsg);

    // TwiML response
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>${replyText.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</Message>
</Response>`;

    res.type("text/xml").status(200).send(twiml);
  } catch (err) {
    console.error("Webhook error:", err.message);
    res.type("text/xml").status(200).send(`<?xml version="1.0" encoding="UTF-8"?>
<Response><Message>⚠️ Service unavailable. Please try again later.</Message></Response>`);
  }
});

// ── GET /api/whatsapp/test-page — static HTML form for testing ─────────────
router.get("/test-page", (req, res) => {
  res.sendFile(TEST_PAGE_PATH);
});

// ── POST /api/whatsapp/send-test — send a test WhatsApp message ───────────
router.post("/send-test", asyncHandler(async (req, res) => {
  const { phone, message, testKey } = req.body || {};

  if (!phone || !message) {
    return res.status(400).json({ message: "phone and message required" });
  }

  if (TEST_KEY) {
    if (String(testKey || "").trim() !== TEST_KEY) {
      return res.status(403).json({ message: "Invalid test key" });
    }
  } else if (String(process.env.NODE_ENV || "development") === "production") {
    return res.status(403).json({ message: "Test endpoint disabled in production" });
  }

  const result = await sendWhatsApp({ to: phone, body: message, type: "TEST_PAGE" });
  res.json({ message: result.success ? "Sent!" : "Failed: " + (result.error || result.reason), result });
}));

// ── POST /api/whatsapp/test — send test message ───────────────────────────────
router.post("/test", protect, admin, asyncHandler(async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ message: "phone required" });

  const result = await sendWhatsApp({
    to:   phone,
    type: "TEST",
    body: [
      `🌸 *Test Message — Nouveau™* 🪷`,
      ``,
      `✅ Your WhatsApp integration is working!`,
      ``,
      `Bot Number: +917733881577`,
      `Time: ${new Date().toLocaleString("en-IN")}`,
      ``,
      `_Nouveau™ WhatsApp System Active_ 🎉`,
    ].join("\n"),
  });

  res.json({ message: result.success ? "✅ WhatsApp sent!" : "⚠️ " + (result.error || result.reason), result });
}));

// ── POST /api/whatsapp/send — manual message (admin) ─────────────────────────
router.post("/send", protect, admin, asyncHandler(async (req, res) => {
  const { phone, message } = req.body;
  if (!phone || !message) return res.status(400).json({ message: "phone and message required" });

  const result = await sendWhatsApp({ to: phone, body: message, type: "MANUAL" });
  res.json({ message: result.success ? "Sent!" : "Failed: " + result.error, result });
}));

// ── POST /api/whatsapp/invoice — send invoice to customer ─────────────────────
router.post("/invoice", protect, admin, asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  if (!orderId) return res.status(400).json({ message: "orderId required" });

  const order = await Order.findById(orderId).lean();
  if (!order) return res.status(404).json({ message: "Order not found" });

  const phone = order.shippingAddress?.phone;
  if (!phone) return res.status(400).json({ message: "No phone number on this order" });

  const items = Array.isArray(order.products) && order.products.length
    ? order.products
    : Array.isArray(order.items)
      ? order.items
      : [];

  const result = await sendInvoiceLink({
    phone,
    customerName: order.shippingAddress?.name || "Customer",
    trackingId:   order.trackingId,
    total:        order.totalAmount ?? order.total ?? order.subtotal ?? 0,
    items,
  });

  res.json({ message: result.success ? "Invoice sent!" : "Failed: " + result.error, result });
}));

// ── GET /api/whatsapp/logs — message logs (admin) ─────────────────────────────
router.get("/logs", protect, admin, asyncHandler(async (req, res) => {
  res.json({ logs: getMessageLog() });
}));

module.exports = router;
