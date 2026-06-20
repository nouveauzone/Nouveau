const { getPublicBaseUrl } = require("../config/env");

const HTTP_RE = /^https?:\/\//i;
const LOCAL_HOST_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

const forceHttps = (url) => url.replace(/^http:\/\//i, "https://");

const normalizeImagePathForStorage = (src) => {
  const raw = String(src || "").trim();
  if (!raw) return "";

  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  if (HTTP_RE.test(raw)) {
    // Keep non-local external URLs (Cloudinary/S3), but enforce HTTPS.
    if (!LOCAL_HOST_RE.test(raw)) return forceHttps(raw);

    try {
      const parsed = new URL(raw);
      return normalizeImagePathForStorage(parsed.pathname);
    } catch {
      return "";
    }
  }

  if (raw.startsWith("/uploads/")) return raw.slice(1);
  if (raw.startsWith("uploads/")) return raw;
  if (raw.startsWith("/")) return `uploads/${raw.slice(1)}`;

  // Bare filename from old seed/admin data.
  if (!raw.includes("/")) return `uploads/${raw}`;

  return raw;
};

const toPublicImageUrl = (src) => {
  const raw = String(src || "").trim();
  if (!raw) return "/product1.jpeg";

  if (raw.startsWith("data:") || raw.startsWith("blob:")) return raw;

  if (HTTP_RE.test(raw) && !LOCAL_HOST_RE.test(raw)) {
    return forceHttps(raw);
  }

  const baseUrl = getPublicBaseUrl();
  const stored = normalizeImagePathForStorage(raw);
  if (!stored) return "";

  const uploadsDisabled = process.env.UPLOADS_DISABLED === "true" || Boolean(process.env.VERCEL);
  if (uploadsDisabled && (stored.startsWith("uploads/") || stored.startsWith("/uploads/"))) {
    return "/product1.jpeg";
  }

  if (HTTP_RE.test(stored)) return forceHttps(stored);
  if (stored.startsWith("uploads/")) return `${baseUrl}/${stored}`;
  if (stored.startsWith("/uploads/")) return `${baseUrl}${stored}`;
  if (stored.startsWith("/")) return `${baseUrl}/uploads/${stored.slice(1)}`;
  return `${baseUrl}/${stored}`;
};

const normalizeImageListForStorage = (images) => {
  if (!Array.isArray(images)) return [];
  return images
    .map((src) => normalizeImagePathForStorage(src))
    .filter(Boolean);
};

const ALLOWED_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL", "Free Size"];

const normalizeSizeLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^free\s*size$/i.test(raw)) return "Free Size";
  return raw.toUpperCase();
};

const normalizeSizeInventory = (sizes) => {
  if (!Array.isArray(sizes) || sizes.length === 0) return [];

  const merged = new Map();
  sizes.forEach((entry) => {
    if (typeof entry === "string") {
      const size = normalizeSizeLabel(entry);
      if (size && ALLOWED_SIZES.includes(size)) merged.set(size, { size, quantity: 0 });
      return;
    }

    const size = normalizeSizeLabel(entry?.size);
    if (!size || !ALLOWED_SIZES.includes(size)) return;

    const rawQty = entry?.quantity ?? entry?.stock;
    const quantity = Math.max(0, Number(rawQty) || 0);
    merged.set(size, { size, quantity });
  });

  return Array.from(merged.values());
};

const normalizeProductInput = (payload = {}) => {
  if (!payload || typeof payload !== "object") return payload;

  const { stock: _ignoredStock, ...rest } = payload;
  const normalizedSizes = normalizeSizeInventory(rest.sizes);

  return {
    ...rest,
    images: Array.isArray(rest.images)
      ? normalizeImageListForStorage(rest.images)
      : rest.images,
    sizes: normalizedSizes.length || Array.isArray(rest.sizes)
      ? normalizedSizes
      : rest.sizes,
  };
};

const normalizeProductOutput = (product = {}) => {
  if (!product || typeof product !== "object") return product;

  const { stock: _ignoredStock, ...rest } = product;
  const normalizedSizes = normalizeSizeInventory(rest.sizes);

  const images = Array.isArray(rest.images)
    ? rest.images.map((src) => toPublicImageUrl(src)).filter(Boolean)
    : [];

  return {
    ...rest,
    images,
    sizes: normalizedSizes.length || Array.isArray(rest.sizes)
      ? normalizedSizes
      : rest.sizes,
  };
};

const normalizeOrderOutput = (order = {}) => {
  if (!order || typeof order !== "object") return order;

  const rawItems = order.products || order.items || [];
  const normalizedItems = Array.isArray(rawItems)
    ? rawItems.map((item) => ({
        ...item,
        image: toPublicImageUrl(item?.image || ""),
      }))
    : [];

  return {
    ...order,
    // Provide both new and old properties for seamless backwards compatibility
    products: normalizedItems,
    items: normalizedItems,
    userId: order.userId || order.user?._id || order.user,
    user: order.userId || order.user,
    totalAmount: order.totalAmount !== undefined ? order.totalAmount : order.total,
    total: order.totalAmount !== undefined ? order.totalAmount : order.total,
  };
};

module.exports = {
  normalizeImagePathForStorage,
  normalizeImageListForStorage,
  normalizeProductInput,
  normalizeProductOutput,
  normalizeOrderOutput,
  toPublicImageUrl,
};
