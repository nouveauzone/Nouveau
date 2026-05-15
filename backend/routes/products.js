const express = require("express");
const multer = require("multer");
const { body, param, query } = require("express-validator");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/auth");
const asyncHandler = require("../utils/asyncHandler");
const validate = require("../middleware/validate");
const { normalizeProductInput, normalizeProductOutput } = require("../utils/imageUrl");

const router = express.Router();

const toSafeProduct = (doc) => normalizeProductOutput(doc?.toObject ? doc.toObject() : doc);

const ALLOWED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL", "Free Size"];
const ALLOWED_CATEGORIES = ["Indian Ethnic Wear", "Indian Western Wear", "Indian Premium Western Wear"];
const DEFAULT_CATEGORY = "Indian Ethnic Wear";
const DEFAULT_DESCRIPTION = "Elegant premium womenswear crafted with attention to detail and all-day comfort.";
const DEFAULT_IMAGE = "/product1.jpeg";
const parseProductFields = multer().none();

const coerceSizeInventory = (value) => {
  let raw = value;

  // Parse JSON string
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }

  // Convert object -> array
  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    raw = Object.entries(raw).map(([size, quantity]) => ({
      size,
      quantity,
    }));
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;

      const size = String(entry.size || "").trim();

      // VERY IMPORTANT FIX
      const quantity = parseInt(entry.quantity ?? entry.stock ?? 0, 10);

      if (!size) return null;

      return {
        size,
        quantity: Number.isFinite(quantity) ? quantity : 0,
      };
    })
    .filter(Boolean);
};

const isValidSizeInventory = (sizes) => {
  if (!Array.isArray(sizes) || sizes.length === 0) {
    return false;
  }

  return sizes.every((entry) => {
    if (!entry || typeof entry !== "object") return false;

    const size = String(entry.size || "").trim();

    const quantity = parseInt(entry.quantity, 10);

    return (
      ALLOWED_SIZES.includes(size) &&
      Number.isInteger(quantity) &&
      quantity >= 0
    );
  });
};

const normalizeProductPayload = (payload = {}) => {
  const normalized = normalizeProductInput(payload);
  const title = String(normalized.title || "").trim();
  const description = String(normalized.description || "").trim() || DEFAULT_DESCRIPTION;
  const category = ALLOWED_CATEGORIES.includes(normalized.category) ? normalized.category : DEFAULT_CATEGORY;
  const price = Number(normalized.price) || 0;
  const originalPrice = Number(normalized.originalPrice) || price;
  const hasSizesField = normalized.sizes !== undefined;
  const coercedSizes = hasSizesField ? coerceSizeInventory(normalized.sizes) : undefined;
  const sizes = hasSizesField && isValidSizeInventory(coercedSizes) ? coercedSizes : undefined;
  const images = Array.isArray(normalized.images) && normalized.images.length ? normalized.images : [DEFAULT_IMAGE];

  const cleaned = {
    ...normalized,
    title,
    description,
    category,
    price,
    originalPrice,
    images,
  };

  if (sizes !== undefined) cleaned.sizes = sizes;
  return cleaned;
};


// ===============================
// GET ALL PRODUCTS
// ===============================
router.get(
  "/",
  [
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("page").optional().isInt({ min: 1 }),
    query("limit").optional().isInt({ min: 1, max: 200 }),
    validate,
  ],
  async (req, res) => {
    try {
      res.set("Cache-Control", "no-store");
      const parsedLimit = Number.parseInt(req.query.limit, 10);
      const limit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? parsedLimit : 0;

      const products = await Product.find({}).limit(limit);
      res.json(products.map(toSafeProduct));
    } catch (error) {
      console.error("PRODUCT ERROR:", error);
      res.status(500).json({ message: "Server Error" });
    }
  }
);


// ===============================
// GET SINGLE PRODUCT
// ===============================
router.get(
  "/:id",
  [param("id").isMongoId(), validate],
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(toSafeProduct(product));
  })
);


// admin
router.post(
  "/",
  protect,
  admin,
  parseProductFields,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("price").isFloat({ gt: 0 }).withMessage("Price must be greater than 0"),
    body("sizes")
    .optional()
    .customSanitizer((value, { req }) => {
    const coerced = coerceSizeInventory(value);
    req.body.sizes = coerced;
    return coerced;
  })
  .custom((sizes) => isValidSizeInventory(sizes))
  .withMessage("sizes must be an array of { size, quantity }"),
    validate,
  ],
  asyncHandler(async (req, res) => {
    const parsedSizes = coerceSizeInventory(req.body?.sizes);
    console.log("[products:create] received payload:", JSON.stringify(req.body, null, 2));
    console.log("[products:create] parsed sizes:", JSON.stringify(parsedSizes, null, 2));
    console.log("[products:create] validation result:", {
      isArray: Array.isArray(parsedSizes),
      count: parsedSizes.length,
      valid: isValidSizeInventory(parsedSizes),
    });
    const product = await Product.create(normalizeProductPayload({ ...req.body, sizes: parsedSizes }));
    const io = req.app.get("io");
    if (io) io.emit("productUpdated");
    res.status(201).json(toSafeProduct(product));
  })
);


// ===============================
// UPDATE PRODUCT
// ===============================
router.put(
  "/:id",
  protect,
  admin,
  parseProductFields,
  [
    param("id").isMongoId().withMessage("Invalid product ID"),
    body("sizes")
      .optional()
      .customSanitizer((value, { req }) => {
        const coerced = coerceSizeInventory(value);
        req.body.sizes = coerced;
        return coerced;
      })
      .custom((sizes) => isValidSizeInventory(sizes))
      .withMessage("sizes must be an array of { size, quantity }"),
    validate,
  ],
  asyncHandler(async (req, res) => {
    if (req.body?.sizes !== undefined) {
      const parsedSizes = coerceSizeInventory(req.body.sizes);
      console.log("[products:update] received payload:", JSON.stringify(req.body, null, 2));
      console.log("[products:update] parsed sizes:", JSON.stringify(parsedSizes, null, 2));
      console.log("[products:update] validation result:", {
        isArray: Array.isArray(parsedSizes),
        count: parsedSizes.length,
        valid: isValidSizeInventory(parsedSizes),
      });
      req.body.sizes = parsedSizes;
    }
    const payload = normalizeProductPayload(req.body);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      payload,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: "Not found" });
    }

    const io = req.app.get("io");
    if (io) io.emit("productUpdated");

    res.json(toSafeProduct(product));
  })
);


// ===============================
// DELETE PRODUCT
// ===============================
router.delete(
  "/:id",
  protect,
  admin,
  [param("id").isMongoId(), validate],
  asyncHandler(async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    const io = req.app.get("io");
    if (io) io.emit("productUpdated");
    res.json({ message: "Deleted successfully" });
  })
);


module.exports = router;