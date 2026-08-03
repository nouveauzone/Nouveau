const mongoose = require("mongoose");

const healthCheck = (req, res) => {
  res.json({
    db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
};

module.exports = { healthCheck };
