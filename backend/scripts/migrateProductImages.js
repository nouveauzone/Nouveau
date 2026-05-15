const dotenv = require("dotenv");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const {
  normalizeImageListForStorage,
  toPublicImageUrl,
} = require("../utils/imageUrl");

dotenv.config();

const isSameArray = (a, b) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (a[i] !== b[i]) return false;
  }
  return true;
};

const run = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is required in environment");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("[migrate] MongoDB connected");

  const cursor = Product.find({}, { _id: 1, images: 1 }).cursor();

  let scanned = 0;
  let updated = 0;

  for await (const product of cursor) {
    scanned += 1;
    const current = Array.isArray(product.images) ? product.images : [];
    const normalized = normalizeImageListForStorage(current);

    if (isSameArray(current, normalized)) continue;

    await Product.updateOne({ _id: product._id }, { $set: { images: normalized } });
    updated += 1;

    if (updated <= 5) {
      const sample = normalized[0] ? toPublicImageUrl(normalized[0]) : "(no image)";
      console.log(`[migrate] updated ${product._id} -> ${sample}`);
    }
  }

  console.log(`[migrate] scanned=${scanned}, updated=${updated}`);
  await mongoose.disconnect();
  console.log("[migrate] done");
};

run().catch(async (err) => {
  console.error("[migrate] failed:", err.message);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
