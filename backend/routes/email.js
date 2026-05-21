const express = require("express");
const { protect, admin } = require("../middleware/auth");
const { sendOrderEmail } = require("../utils/email");
const router  = express.Router();

// POST /api/email/test — test email config
router.post("/test", protect, admin, async (req, res) => {
  try {
    await sendOrderEmail({
      to: req.user.email,
      subject: "Nouveau™ — Email Test ✅",
      html: "<h2>Email working!</h2><p>Your Nouveau™ email config is set up correctly.</p>"
    });
    res.json({ message:"Test email sent to "+req.user.email });
  } catch (err) { res.status(500).json({ message:"Email failed: "+err.message }); }
});

module.exports = router;
