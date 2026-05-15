const required = ["JWT_SECRET", "MONGO_URI"];

const validateEnv = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (!missing.length) return;

  const message = `[env] Missing variables: ${missing.join(", ")}`;

  if (process.env.NODE_ENV === "production") {
    console.warn(`${message} (server will continue to boot)`);
    return;
  }

  console.warn(message);
};

const getPublicBaseUrl = () => {
  const raw = String(process.env.BASE_URL || "").trim();
  if (raw) return raw.replace(/\/+$/, "");

  if (process.env.NODE_ENV === "production") {
    return "https://nouveauz.com";
  }

  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};

module.exports = { validateEnv, getPublicBaseUrl };
