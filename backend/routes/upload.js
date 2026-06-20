const express    = require("express");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");
const { protect, admin } = require("../middleware/auth");
const { normalizeImagePathForStorage, toPublicImageUrl } = require("../utils/imageUrl");
const router = express.Router();

// ── Cloudinary-only uploads (serverless compatible) ─────────────────────────
const imageFileFilter = (req, file, cb) => {
  if (String(file?.mimetype || "").startsWith("image/")) return cb(null, true);
  return cb(new Error("Only image files are allowed"));
};

const hasCloudinary = Boolean(
  process.env.CLOUDINARY_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "nouveau-products",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

const upload = multer({ storage, fileFilter: imageFileFilter, limits:{ fileSize:5*1024*1024 } });

// POST /api/upload — upload images (admin only)
router.post("/", protect, admin, (req, res, next) => {
  if (!hasCloudinary) {
    return res.status(500).json({ message:"Cloudinary is not configured on the server." });
  }
  return upload.array("images", 5)(req, res, next);
}, (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ message:"No files uploaded" });
    const rawItems = req.files.map((f) => f.path);
    const paths = rawItems.map((item) => normalizeImagePathForStorage(item)).filter(Boolean);
    const urls = paths.map((item) => toPublicImageUrl(item)).filter(Boolean);
    res.json({
      paths,
      urls,
      image: paths[0] || "",
      imageUrl: urls[0] || "",
      message:"Upload successful",
    });
  } catch (err) { res.status(500).json({ message:err.message }); }
});

module.exports = router;
