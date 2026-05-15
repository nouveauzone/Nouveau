const express = require("express");

const app = express();

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "API Running Successfully"
  });
});

module.exports = app;