const mongoose = require("mongoose");

const siteViewSchema = new mongoose.Schema(
  {
    monthKey: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{4}-\d{2}$/,
    },
    year: { type: Number, required: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    views: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

siteViewSchema.index({ year: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("SiteView", siteViewSchema);