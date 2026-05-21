const nodemailer = require("nodemailer");

const htmlToText = (html = "") => {
  return String(html)
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?\s*>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

const createTransporter = () => {
  // If no SMTP config, return null and allow SendGrid fallback
  const emailUser = String(process.env.EMAIL_USER || "").trim();
  const emailPass = String(process.env.EMAIL_PASS || "").trim();
  if (!emailUser || emailUser === "your_gmail@gmail.com" || !emailPass || emailPass === "your_16_char_gmail_app_password") {
    return null; // will skip SMTP
  }
  return nodemailer.createTransport({
    host:   process.env.EMAIL_HOST || "smtp.gmail.com",
    port:   parseInt(process.env.EMAIL_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendOrderEmail = async ({ to, subject, html }) => {
  const from = process.env.EMAIL_FROM || "Nouveau Orders <no-reply@nouveauz.com>";
  const replyTo = process.env.EMAIL_REPLY_TO || from;
  const text = htmlToText(html);

  // Prefer SendGrid when configured
  const sendgridKey = String(process.env.SENDGRID_API_KEY || "").trim();
  if (sendgridKey.startsWith("SG.")) {
    try {
      const fromString = String(from || "").toLowerCase();
      if (/@(gmail|yahoo|outlook|hotmail)\./.test(fromString)) {
        console.log("⚠️ EMAIL_FROM uses a free mailbox domain. For better inbox delivery, use a verified domain sender (e.g. no-reply@nouveauz.com).");
      }

      const sgMail = require("@sendgrid/mail");
      sgMail.setApiKey(sendgridKey);
      await sgMail.send({
        to,
        from,
        replyTo,
        subject,
        html,
        text,
        headers: {
          "X-Auto-Response-Suppress": "OOF, AutoReply",
        },
        trackingSettings: {
          clickTracking: { enable: false, enableText: false },
          openTracking: { enable: false },
        },
      });
      console.log(`📧 SendGrid email sent → ${to}`);
      return;
    } catch (err) {
      console.error("SendGrid send failed:", err?.message || err);
      // fall back to SMTP if available
    }
  } else if (sendgridKey) {
    console.log("📧 SendGrid skipped — SENDGRID_API_KEY does not look valid (expected prefix SG.)");
  }

  // Fallback to SMTP (nodemailer)
  const transporter = createTransporter();
  if (!transporter) {
    console.log(`📧 Email skipped (no SMTP/SendGrid config) — To: ${to} | Subject: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from,
    replyTo,
    to,
    subject,
    html,
    text,
    headers: {
      "X-Auto-Response-Suppress": "OOF, AutoReply",
    },
  });
  console.log(`📧 SMTP email sent → ${to}`);
};

const formatOrderItems = (order = {}) => {
  const items = Array.isArray(order.products)
    ? order.products
    : Array.isArray(order.items)
      ? order.items
      : [];

  return items.map((item) => ({
    title: item.title || item.name || "Product",
    size: item.size || item.selectedSize || "",
    qty: Number(item.qty || item.itemQty || 1),
    price: Number(item.price || 0),
  }));
};

const formatShippingAddress = (order = {}) => {
  const address = order.shippingAddress || {};
  const parts = [address.street, address.city, address.state, address.pincode].filter(Boolean);

  return {
    name: address.name || order.userName || "Customer",
    phone: address.phone || order.userPhone || "",
    line: parts.join(", ") || "Address not provided",
  };
};

const customerOrderConfirmationHTML = (order = {}, user = {}) => {
  const items = formatOrderItems(order);
  const shipping = formatShippingAddress(order);
  const productLabel = items
    .map((item) => `${item.title}${item.size ? ` (${item.size})` : ""} x${item.qty || 1}`)
    .join(", ") || "Your order";
  const paymentStatus = String(order.paymentStatus || "paid").toLowerCase() === "paid" ? "Successful ✅" : "Pending";
  const trackingId = order.trackingId || order._id || "N/A";
  const trackingBase = process.env.CLIENT_URL || "https://nouveauz.com";
  const trackingUrl = `${trackingBase.replace(/\/$/, "")}/track/${trackingId}`;

  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:620px;margin:0 auto;background:#ffffff;color:#1f2937;line-height:1.5;border:1px solid #e5e7eb">
  <div style="padding:20px 20px 8px">
    <h2 style="margin:0 0 8px;font-size:20px;color:#111827">Nouveau Order Confirmation</h2>
    <p style="margin:0;color:#4b5563;font-size:14px">Your order has been placed successfully.</p>
  </div>
  <div style="padding:8px 20px 20px">
    <table role="presentation" style="width:100%;border-collapse:collapse">
      <tr><td style="padding:7px 0;font-size:14px;color:#111827"><strong>Order ID:</strong> ${trackingId}</td></tr>
      <tr><td style="padding:7px 0;font-size:14px;color:#111827"><strong>Name:</strong> ${user?.name || shipping.name || "Customer"}</td></tr>
      <tr><td style="padding:7px 0;font-size:14px;color:#111827"><strong>Product:</strong> ${productLabel}</td></tr>
      <tr><td style="padding:7px 0;font-size:14px;color:#111827"><strong>Phone:</strong> ${shipping.phone || "Not provided"}</td></tr>
      <tr><td style="padding:7px 0;font-size:14px;color:#111827"><strong>Address:</strong> ${shipping.line}</td></tr>
      <tr><td style="padding:7px 0;font-size:14px;color:#111827"><strong>Payment:</strong> ${paymentStatus}</td></tr>
    </table>
    <p style="margin:16px 0 0;font-size:14px">
      Track your order:
      <a href="${trackingUrl}" style="color:#2563eb;text-decoration:underline">${trackingUrl}</a>
    </p>
    <p style="margin:14px 0 0;font-size:14px;color:#374151">Thank you for shopping with us.</p>
    <div style="margin-top:16px;padding-top:14px;border-top:1px solid #e5e7eb;font-size:13px;color:#4b5563">
      <p style="margin:0 0 6px"><strong>AMDERON TRENDZ PVT LTD.</strong></p>
      <p style="margin:0 0 6px">Indian Clothing Brand</p>
      <p style="margin:0 0 6px">Phone: 7733881577</p>
      <p style="margin:0">Address: A-204, Nirman, Opp. Hocco, Navrangpura, Ahmedabad, Gujarat (India) - 380009</p>
    </div>
  </div>
</div>
`;
};

const orderConfirmHTML = (order, user) => {
  const items = formatOrderItems(order);
  const shipping = formatShippingAddress(order);
  const orderId = order.trackingId || order._id || "Order";
  const paymentStatus = String(order.paymentStatus || "paid").toLowerCase() === "paid" ? "Successful ✅" : String(order.paymentStatus || "Pending");
  const totalAmount = Number(order.totalAmount ?? order.total ?? 0);
  const totalItems = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);

  return `
<div style="font-family:Arial,sans-serif;max-width:680px;margin:0 auto;background:#faf7f2;color:#1a1a1a">
  <div style="background:#B76E79;padding:28px 36px;text-align:center">
    <h1 style="color:#fff;font-family:Georgia,serif;font-size:28px;margin:0">🛒 Nouveau Order Confirmation</h1>
    <p style="color:rgba(255,255,255,0.9);margin:8px 0 0;font-size:14px;letter-spacing:2px">ORDER RECEIPT</p>
  </div>

  <div style="padding:34px 36px">
    <p style="margin:0 0 16px;font-size:15px;color:#555">Hi <strong>${user?.name || shipping.name || "Customer"}</strong>, your order has been placed successfully.</p>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:18px 0 22px">
      <div style="background:#fff;border:1px solid #eadbd2;border-radius:12px;padding:16px">
        <div style="font-size:12px;letter-spacing:1px;color:#B76E79;margin-bottom:4px">ORDER ID</div>
        <div style="font-size:16px;font-weight:bold;word-break:break-word">${orderId}</div>
      </div>
      <div style="background:#fff;border:1px solid #eadbd2;border-radius:12px;padding:16px">
        <div style="font-size:12px;letter-spacing:1px;color:#B76E79;margin-bottom:4px">PAYMENT STATUS</div>
        <div style="font-size:16px;font-weight:bold">${paymentStatus}</div>
      </div>
    </div>

    <div style="background:#fff;border:1px solid #eadbd2;border-radius:12px;padding:18px;margin:20px 0">
      <div style="font-size:12px;letter-spacing:1px;color:#B76E79;margin-bottom:10px">ORDER DETAILS</div>
      <table style="width:100%;border-collapse:collapse">
        <thead>
          <tr style="background:#f7f1ea">
            <th style="padding:10px;text-align:left;font-size:12px;color:#777">PRODUCT</th>
            <th style="padding:10px;text-align:center;font-size:12px;color:#777">QTY</th>
            <th style="padding:10px;text-align:right;font-size:12px;color:#777">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => {
            const lineTotal = Number(item.price) * Number(item.qty);
            return `<tr style="border-bottom:1px solid #f0e5dc"><td style="padding:12px 10px;font-size:14px;color:#333">${item.title}${item.size ? ` <span style="color:#999;font-size:12px">/ ${item.size}</span>` : ""}</td><td style="padding:12px 10px;text-align:center;font-size:14px">×${item.qty}</td><td style="padding:12px 10px;text-align:right;font-size:14px;font-weight:bold;color:#B76E79">₹${lineTotal.toLocaleString("en-IN")}</td></tr>`;
          }).join("")}
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-top:14px;padding-top:14px;border-top:2px solid #eadbd2">
        <span style="font-size:14px;color:#555">Total items: ${totalItems}</span>
        <span style="font-size:18px;font-weight:bold;color:#1a1a1a">Total: ₹${totalAmount.toLocaleString("en-IN")}</span>
      </div>
    </div>

    <div style="background:#f3ede5;border-radius:12px;padding:18px 20px;margin:20px 0">
      <div style="font-size:12px;letter-spacing:1px;color:#B76E79;margin-bottom:8px">DELIVERY ADDRESS</div>
      <p style="font-size:14px;color:#333;margin:0 0 6px"><strong>${shipping.name}</strong>${shipping.phone ? ` · ${shipping.phone}` : ""}</p>
      <p style="font-size:13px;color:#777;margin:0">${shipping.line}</p>
    </div>

    <div style="background:#D4AF37;color:#fff;padding:14px 18px;border-radius:10px;margin:20px 0;text-align:center">
      <p style="margin:0;font-size:13px">Track your order anytime at <strong>${process.env.CLIENT_URL || "https://nouveauz.com"}/track</strong></p>
    </div>

    <p style="color:#555;font-size:14px;margin:0">🙏 Thank you for shopping with us!</p>
  </div>

  <div style="background:#B76E79;padding:18px 36px;text-align:center">
    <p style="color:rgba(255,255,255,0.75);font-size:12px;margin:0">© 2026 Nouveau™ · Own Your Aura · Made with ♥ in India</p>
  </div>
</div>
`;
};

const shippedEmailHTML = (order) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#faf7f2">
  <div style="background:#2d6a4f;padding:32px 40px;text-align:center">
    <h1 style="color:#fff;font-family:Georgia,serif;font-size:28px;margin:0">Your Order is Shipped! 🚚</h1>
  </div>
  <div style="padding:36px 40px">
    <p style="color:#555;font-size:15px">Great news! Your Nouveau™ order <strong>${order._id}</strong> has been shipped and is on its way.</p>
    <div style="background:#d4edda;border:1px solid #c3e6cb;border-radius:10px;padding:20px;margin:20px 0;text-align:center">
      <p style="font-size:24px;margin:0">📦 → 🚚 → 🏠</p>
      <p style="color:#155724;font-size:14px;font-weight:bold;margin:8px 0 0">Expected in 3–5 days</p>
    </div>
    <p style="color:#555;font-size:14px">Payment method: <strong>${order.paymentMethod}</strong></p>
  </div>
  <div style="background:#B76E79;padding:20px;text-align:center">
    <p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0">© 2026 Nouveau™ · Own Your Aura</p>
  </div>
</div>
`;

module.exports = { sendOrderEmail, customerOrderConfirmationHTML, orderConfirmHTML, shippedEmailHTML };
