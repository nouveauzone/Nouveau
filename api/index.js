const express = require("express");

const app = express();

app.get("/api", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "API Running Successfully"
  });
});

module.exports = app;