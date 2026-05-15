const express    = require("express");
const multer     = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { protect, admin } = require("../middleware/auth");
const path = require("path");
const fs   = require("fs");
const { normalizeImagePathForStorage, toPublicImageUrl } = require("../utils/imageUrl");
const router = express.Router();

// ── If Cloudinary is configured, use it; else save locally ──────────────────
const useCloudinary = process.env.CLOUDINARY_NAME && process.env.CLOUDINARY_NAME !== "your_cloud_name";
const imageFileFilter = (req, file, cb) => {
  if (String(file?.mimetype || "").startsWith("image/")) return cb(null, true);
  return cb(new Error("Only image files are allowed"));
};

let upload;
if (useCloudinary) {
  cloudinary.config({
    cloud_name:  process.env.CLOUDINARY_NAME,
    api_key:     process.env.CLOUDINARY_API_KEY,
    api_secret:  process.env.CLOUDINARY_API_SECRET,
  });
  const storage = new CloudinaryStorage({
    cloudinary,
    params: { folder:"nouveau", allowed_formats:["jpg","jpeg","png","webp"], transformation:[{ width:800, crop:"limit" }] },
  });
  upload = multer({ storage, fileFilter: imageFileFilter, limits:{ fileSize:5*1024*1024 } });
} else {
  // Local storage fallback
  const uploadDir = path.join(__dirname, "../uploads");
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive:true });
  const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => cb(null, Date.now()+"-"+file.originalname.replace(/\s/g,"_")),
  });
  upload = multer({ storage, fileFilter: imageFileFilter, limits:{ fileSize:5*1024*1024 } });
}

// POST /api/upload — upload images (admin only)
router.post("/", protect, admin, upload.array("images", 5), (req, res) => {
  try {
    if (!req.files || !req.files.length) return res.status(400).json({ message:"No files uploaded" });
    const rawItems = req.files.map((f) => (useCloudinary ? f.path : `uploads/${f.filename}`));
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
