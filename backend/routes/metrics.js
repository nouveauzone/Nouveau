const express = require("express");
const { query } = require("express-validator");
const SiteView = require("../models/SiteView");
const Search = require("../models/Search");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");

const router = express.Router();

const monthKeyRegex = /^\d{4}-\d{2}$/;

const getMonthKeyNow = () => {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
};

const parseMonthKey = (monthKey) => {
  const key = String(monthKey || "").trim() || getMonthKeyNow();
  if (!monthKeyRegex.test(key)) {
    const error = new Error("month must be in YYYY-MM format");
    error.statusCode = 400;
    throw error;
  }

  const [yearStr, monthStr] = key.split("-");
  return {
    monthKey: key,
    year: Number(yearStr),
    month: Number(monthStr),
  };
};

// GET /api/metrics/views?month=YYYY-MM
router.get(
  "/views",
  [query("month").optional().matches(monthKeyRegex), validate],
  asyncHandler(async (req, res) => {
    const { monthKey } = parseMonthKey(req.query.month);
    const doc = await SiteView.findOne({ monthKey }).lean();
    res.json({ monthKey, views: Number(doc?.views || 0) });
  })
);

// POST /api/metrics/views  -> increments current month view count
router.post(
  "/views",
  asyncHandler(async (req, res) => {
    const { monthKey, year, month } = parseMonthKey(req.body?.month);

    const updated = await SiteView.findOneAndUpdate(
      { monthKey },
      {
        $setOnInsert: { monthKey, year, month },
        $inc: { views: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    res.status(201).json({ monthKey, views: Number(updated?.views || 0) });
  })
);

// GET /api/metrics/searches -> get total search count
router.get(
  "/searches",
  asyncHandler(async (req, res) => {
    let doc = await Search.findOne().lean();
    if (!doc) {
      doc = await Search.create({ totalSearches: 0 });
    }
    res.json({ totalSearches: Number(doc.totalSearches || 0) });
  })
);

// POST /api/metrics/searches -> increment search count
router.post(
  "/searches",
  asyncHandler(async (req, res) => {
    let doc = await Search.findOne();
    if (!doc) {
      doc = await Search.create({ totalSearches: 1 });
    } else {
      doc.totalSearches = (doc.totalSearches || 0) + 1;
      await doc.save();
    }
    res.status(201).json({ totalSearches: Number(doc.totalSearches || 0) });
  })
);

module.exports = router;