const express  = require("express");
const cors     = require("cors");
const dotenv   = require("dotenv");
const helmet   = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const hpp = require("hpp");
const morgan = require("morgan");
const { validateEnv } = require("./config/env");
const { connectToDatabase } = require("./config/db");
const { notFound, errorHandler } = require("./middleware/error");
dotenv.config();
validateEnv();

const app = express();
app.set("trust proxy", 1);

const allowedOrigins = [
  ...(process.env.CLIENT_URLS || "").split(","),
  process.env.CLIENT_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
  "https://nouveauz.com",
  "https://www.nouveauz.com",
  "http://localhost:3000",
  "http://localhost:3001",
]
  .map((origin) => String(origin || "").trim())
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;

  try {
    const parsed = new URL(origin);
    if (parsed.protocol === "https:" && parsed.hostname.endsWith(".cloudfront.net")) return true;
    if (parsed.protocol === "https:" && parsed.hostname.endsWith(".vercel.app")) return true;
    if (parsed.protocol === "https:" && parsed.hostname.endsWith(".vercel.dev")) return true;
  } catch {
    return false;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests and server-to-server calls.
    if (isAllowedOrigin(origin)) return callback(null, true);
    return callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Socket.IO is not supported on Vercel serverless; keep a no-op placeholder.
app.set("io", null);

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(morgan("dev")); // Production-level request logging
app.use(helmet({
  // Frontend runs on a different origin (localhost:3000) in dev.
  // Allow static resources like product images to be embedded cross-origin.
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(compression());
app.use(mongoSanitize());
app.use(hpp());
// Global rate limit — 1000 requests per 15 mins (generous for dev + prod)
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.ip === "127.0.0.1" || req.ip === "::1", // skip localhost
  message: { message: "Too many requests, please try again after 15 minutes." },
}));

// Ensure DB connection (cached across warm invocations).
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    return next();
  } catch (err) {
    return next(err);
  }
});

// Stricter limit only for auth routes — prevent brute force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many login attempts, please try again after 15 minutes." },
});
app.use(express.json({ limit:"10mb" }));
// Twilio webhook needs urlencoded body
app.use("/api/whatsapp/webhook", express.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended:true, limit:"10mb" }));

// ── Routes ──────────────────────────────────────────────────────────────────
app.use("/api/auth",     authLimiter, require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders",   require("./routes/orders"));
app.use("/api/users",    require("./routes/users"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/upload",   require("./routes/upload"));
app.use("/api/reviews",  require("./routes/reviews"));
app.use("/api/email",    require("./routes/email"));
app.use("/api/health",   require("./routes/health"));
app.use("/api/whatsapp", require("./routes/whatsapp"));
app.use("/api/metrics",  require("./routes/metrics"));

// ── Health check ────────────────────────────────────────────────────────────
app.get("/", (req, res) => res.json({ message:"Nouveau™ API v2 running 🪷", status:"ok" }));

// ── Error handler ───────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

module.exports = app;
