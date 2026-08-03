const mongoose = require("mongoose");

const searchSchema = new mongoose.Schema(
  {
    totalSearches: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Search", searchSchema);
