const required = ["JWT_SECRET"];

const trimValue = (value) => String(value || "").trim();

const parseCsv = (value) => trimValue(value)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);

  // Check for either MONGODB_URI or legacy MONGO_URI
  const mongoPresent = Boolean(process.env.MONGODB_URI || process.env.MONGO_URI);

  if (missing.length === 0 && mongoPresent) return;

  const missingList = [...missing];
  if (!mongoPresent) missingList.push("MONGODB_URI (or MONGO_URI)");

  const message = `[env] Missing variables: ${missingList.join(", ")}`;

  if (missingList.length === 0) return;

  if (process.env.NODE_ENV === "production") {
    throw new Error(message);
  }

  console.warn(message);
};

const getClientOrigins = () => {
  const origins = new Set();

  [
    process.env.CLIENT_URLS,
    process.env.CLIENT_URL,
    process.env.PRODUCTION_URL,
    process.env.FRONTEND_URL,
    process.env.NEXTAUTH_URL,
  ].forEach((value) => {
    parseCsv(value).forEach((origin) => origins.add(origin));
  });

  if (process.env.NODE_ENV === "production") {
    origins.add("https://nouveau-delta.vercel.app");
    origins.add("https://nouveauz.com");
    origins.add("https://www.nouveauz.com");
  } else {
    origins.add("http://localhost:3000");
    origins.add("http://localhost:3001");
  }

  return [...origins];
};

const getPublicBaseUrl = () => {
  const raw = String(process.env.BASE_URL || "").trim();
  if (raw) return raw.replace(/\/+$/, "");

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (process.env.NODE_ENV === "production") {
    return "https://nouveauz.com";
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};

module.exports = { validateEnv, getClientOrigins, getPublicBaseUrl };
