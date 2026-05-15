const fs = require("fs");
const path = require("path");
const os = require("os");
const http = require("http");
const https = require("https");
const crypto = require("crypto");
const dotenv = require("dotenv");

// Load environment variables BEFORE importing modules that depend on them
dotenv.config();

// Validate Cloudinary environment variables before importing the config
const validateCloudinaryEnvVars = () => {
  const required = ["CLOUDINARY_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET"];
  const missing = required.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error("❌ ERROR: Missing required Cloudinary environment variables:");
    missing.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error("\nPlease ensure your .env file contains all required variables.");
    process.exit(1);
  }

  console.log("✓ Cloudinary environment variables loaded successfully");
};

validateCloudinaryEnvVars();

// Now safe to import modules that depend on environment variables
const cloudinary = require("../config/cloudinary");
const { connectToDatabase } = require("../config/db");
const Product = require("../models/Product");
const { normalizeImagePathForStorage } = require("../utils/imageUrl");

const HTTP_RE = /^https?:\/\//i;
const CLOUDINARY_RE = /res\.cloudinary\.com/i;

const isRemoteUrl = (value) => HTTP_RE.test(String(value || "").trim());
const isCloudinaryUrl = (value) => CLOUDINARY_RE.test(String(value || "").trim());

const uploadsRoot = path.resolve(__dirname, "..", "uploads");

// Cloudinary has already been validated at startup, so this is always true
const hasCloudinary = true;

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const backupPath = path.resolve(__dirname, `migrateImagesToCloudinary.backup.${timestamp}.json`);

const uploadCache = new Map();

const isLegacyUploadsUrl = (value) => {
  try {
    const parsed = new URL(String(value || "").trim());
    return parsed.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
};

const downloadToTempFile = (url, depth = 0) =>
  new Promise((resolve, reject) => {
    if (depth > 5) {
      return reject(new Error(`Too many redirects while downloading ${url}`));
    }

    const client = url.startsWith("https:") ? https : http;
    const tempPath = path.join(os.tmpdir(), `nouveau-upload-${crypto.randomUUID()}`);
    const fileStream = fs.createWriteStream(tempPath);

    const onError = (err) => {
      fileStream.close(() => {
        fs.unlink(tempPath, () => reject(err));
      });
    };

    const request = client.get(
      url,
      { headers: { "User-Agent": "Nouveau-Migrate/1.0" } },
      (res) => {
        const status = res.statusCode || 0;
        if (status >= 300 && status < 400 && res.headers.location) {
          const redirectUrl = new URL(res.headers.location, url).toString();
          res.resume();
          fileStream.close(() => {
            fs.unlink(tempPath, () =>
              downloadToTempFile(redirectUrl, depth + 1)
                .then(resolve)
                .catch(reject)
            );
          });
          return;
        }

        if (status < 200 || status >= 300) {
          return onError(new Error(`Failed to download (${status}) ${url}`));
        }

        res.pipe(fileStream);
        fileStream.on("finish", () => fileStream.close(() => resolve(tempPath)));
      }
    );

    request.on("error", onError);
    request.setTimeout(30000, () => onError(new Error(`Download timeout for ${url}`)));
  });

const uploadLocalImage = async (absolutePath) => {
  const cacheKey = `file:${absolutePath}`;
  if (uploadCache.has(cacheKey)) {
    return uploadCache.get(cacheKey);
  }

  const response = await cloudinary.uploader.upload(absolutePath, {
    folder: "nouveau-products",
  });

  const secureUrl = response?.secure_url || response?.url || "";
  if (!secureUrl) {
    throw new Error("Cloudinary upload did not return a URL");
  }

  uploadCache.set(cacheKey, secureUrl);
  return secureUrl;
};

const uploadRemoteImage = async (url) => {
  const cacheKey = `url:${url}`;
  if (uploadCache.has(cacheKey)) {
    return uploadCache.get(cacheKey);
  }

  const tempPath = await downloadToTempFile(url);
  try {
    const uploadedUrl = await uploadLocalImage(tempPath);
    uploadCache.set(cacheKey, uploadedUrl);
    return uploadedUrl;
  } finally {
    fs.unlink(tempPath, () => {});
  }
};

const migrateProductImages = async () => {
  console.log("\n🚀 Starting image migration to Cloudinary...\n");

  await connectToDatabase();
  console.log("✓ Connected to database\n");

  const products = await Product.find({}).lean(false);
  const total = products.length;

  const backup = {
    startedAt: new Date().toISOString(),
    totalProducts: total,
    updatedProducts: 0,
    skippedProducts: 0,
    items: [],
  };

  let processed = 0;

  for (const product of products) {
    processed += 1;

    const images = Array.isArray(product.images) ? product.images : [];
    if (!images.length) {
      backup.skippedProducts += 1;
      continue;
    }

    let updated = false;
    const migratedImages = [];

    for (const rawImage of images) {
      if (!rawImage) {
        migratedImages.push(rawImage);
        continue;
      }

      const raw = String(rawImage).trim();

      if (raw.startsWith("data:") || raw.startsWith("blob:")) {
        migratedImages.push(rawImage);
        continue;
      }

      if (isCloudinaryUrl(raw)) {
        migratedImages.push(rawImage);
        continue;
      }

      if (isRemoteUrl(raw)) {
        if (isLegacyUploadsUrl(raw)) {
          try {
            const uploadedUrl = await uploadRemoteImage(raw);
            migratedImages.push(uploadedUrl);
            if (uploadedUrl !== rawImage) updated = true;
          } catch (err) {
            const message = err && err.message ? err.message : String(err);
            console.error(`Upload failed for ${raw} (product ${product._id}):`, message);
            migratedImages.push(rawImage);
          }
          continue;
        }

        migratedImages.push(rawImage);
        continue;
      }

      const normalized = normalizeImagePathForStorage(raw);
      if (!normalized) {
        migratedImages.push(rawImage);
        continue;
      }

      if (isRemoteUrl(normalized)) {
        migratedImages.push(normalized);
        continue;
      }

      if (!normalized.startsWith("uploads/")) {
        migratedImages.push(normalized);
        continue;
      }

      if (!fs.existsSync(uploadsRoot)) {
        console.warn(`Uploads folder not found: ${uploadsRoot}`);
        migratedImages.push(rawImage);
        continue;
      }

      const absolutePath = path.resolve(__dirname, "..", normalized);
      if (!fs.existsSync(absolutePath)) {
        console.warn(`Missing file for product ${product._id}: ${normalized}`);
        migratedImages.push(rawImage);
        continue;
      }

      try {
        const uploadedUrl = await uploadLocalImage(absolutePath);
        migratedImages.push(uploadedUrl);
        if (uploadedUrl !== rawImage) updated = true;
      } catch (err) {
        console.error(`Upload failed for ${normalized} (product ${product._id}):`, err.message);
        migratedImages.push(rawImage);
      }
    }

    if (updated) {
      backup.items.push({
        id: product._id,
        title: product.title,
        before: images,
        after: migratedImages,
      });

      product.images = migratedImages;
      await product.save();
      backup.updatedProducts += 1;
      console.log(`[${processed}/${total}] Updated: ${product.title}`);
    } else {
      backup.skippedProducts += 1;
      console.log(`[${processed}/${total}] Skipped: ${product.title}`);
    }
  }

  if (backup.items.length) {
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2), "utf8");
    console.log(`Backup written: ${backupPath}`);
  } else {
    console.log("No products required updates. No backup file created.");
  }

  console.log(
    `Migration complete. Updated ${backup.updatedProducts} of ${total} products.`
  );
};

migrateProductImages()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err.message);
    process.exit(1);
  });
