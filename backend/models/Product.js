const mongoose = require("mongoose");
const { normalizeImagePathForStorage } = require("../utils/imageUrl");

const ALLOWED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL", "Free Size"];

const normalizeSizeLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^free\s*size$/i.test(raw)) return "Free Size";
  return raw.toUpperCase();
};

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const sizeQuantitySchema = new mongoose.Schema(
  {
    size: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: ALLOWED_SIZES,
        message: "Invalid size. Allowed sizes: XS, S, M, L, XL, XXL, XXXL, 4XL, 5XL, 6XL, Free Size",
      },
      set: normalizeSizeLabel,
    },
    quantity: {
      type: Number,
      required: true,
      default: 0,
      set: (value) => Math.max(0, Number(value) || 0),
      min: 0,
    },
  },
  { _id: false }
);

const coerceSizeInventory = (value) => {
  let raw = value;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }

  if (raw && typeof raw === "object" && !Array.isArray(raw)) {
    raw = Object.entries(raw).map(([size, quantity]) => ({ size, quantity }));
  }

  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const size = normalizeSizeLabel(entry.size);
      const quantity = Math.max(0, Number(entry.quantity ?? entry.stock) || 0);
      if (!size || !ALLOWED_SIZES.includes(size)) return null;
      return { size, quantity };
    })
    .filter(Boolean);
};

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    category: {
      type: String,
      required: true,
      enum: ["Indian Ethnic Wear", "Indian Western Wear", "Indian Premium Western Wear"],
    },
    subcategory: { type: String, default: "" },
    gender: { type: String, enum: ["Women", "Men", "Unisex"], default: "Women" },
    images: [{ type: String, set: normalizeImagePathForStorage }],
    sizes: { type: [sizeQuantitySchema], default: [] },
    isNew: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    discount: { type: Number, default: 0 },
    reviews: [reviewSchema],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

productSchema.index({ category: 1, createdAt: -1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: -1, createdAt: -1 });
productSchema.index({ title: "text", description: "text" });

productSchema.virtual("avgRating").get(function () {
  if (!this.reviews.length) return 0;
  return +(this.reviews.reduce((sum, review) => sum + review.rating, 0) / this.reviews.length).toFixed(1);
});

productSchema.virtual("numReviews").get(function () {
  return this.reviews.length;
});

productSchema.virtual("totalStock").get(function () {
  if (!Array.isArray(this.sizes)) return 0;
  return this.sizes.reduce((sum, entry) => sum + Math.max(0, Number(entry?.quantity) || 0), 0);
});

productSchema.virtual("stock").get(function () {
  return this.totalStock;
});

productSchema.pre("validate", function (next) {
  if (typeof this.sizes === "string") {
    this.sizes = coerceSizeInventory(this.sizes);
  } else if (this.sizes && typeof this.sizes === "object" && !Array.isArray(this.sizes)) {
    this.sizes = coerceSizeInventory(this.sizes);
  }

  if (!Array.isArray(this.sizes)) {
    this.sizes = [];
    return next();
  }

  const cleaned = new Map();

  this.sizes.forEach((entry) => {
    const size = normalizeSizeLabel(entry?.size);
    if (!size || !ALLOWED_SIZES.includes(size)) return;

    const quantity = Math.max(0, Number(entry?.quantity ?? entry?.stock) || 0);
    cleaned.set(size, { size, quantity });
  });

  this.sizes = Array.from(cleaned.values());
  next();
});

module.exports = mongoose.model("Product", productSchema);
