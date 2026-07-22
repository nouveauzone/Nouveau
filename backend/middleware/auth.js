const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const parseCookies = (cookieHeader = "") => {
  return String(cookieHeader || "")
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce((cookies, pair) => {
      const index = pair.indexOf("=");
      if (index === -1) return cookies;
      const key = decodeURIComponent(pair.slice(0, index).trim());
      const value = decodeURIComponent(pair.slice(index + 1).trim());
      if (key) cookies[key] = value;
      return cookies;
    }, {});
};

const previewToken = (token) => {
  const value = String(token || "").trim();
  if (!value) return "";
  return `${value.slice(0, 10)}...${value.slice(-6)} (len:${value.length})`;
};

const extractBearerToken = (req) => {
  const candidates = [
    req.headers.authorization,
    req.headers.Authorization,
    req.headers["x-access-token"],
    req.headers["x-auth-token"],
    req.headers.token,
  ];

  for (const candidate of candidates) {
    const value = String(candidate || "").trim();
    if (!value) continue;

    if (value.toLowerCase().startsWith("bearer ")) {
      return { token: value.slice(7).trim(), source: "bearer" };
    }

    if (/^eyJ/.test(value) || value.split(".").length === 3) {
      return { token: value, source: "raw" };
    }
  }

  const cookies = parseCookies(req.headers.cookie || "");
  const cookieToken = String(cookies.token || cookies.jwt || cookies.authToken || "").trim();
  if (cookieToken) {
    return { token: cookieToken, source: "cookie" };
  }

  return { token: "", source: "missing" };
};

const protect = async (req, res, next) => {
  try {
    const authHeader = String(req.headers.authorization || req.headers.Authorization || "").trim();
    const { token, source } = extractBearerToken(req);

    console.log(`[auth] request ${req.method} ${req.originalUrl}`, {
      hasAuthorizationHeader: Boolean(authHeader),
      authHeaderPreview: authHeader ? `${authHeader.slice(0, 20)}...` : "",
      tokenSource: source,
      tokenPreview: previewToken(token),
      hasJwtSecret: Boolean(process.env.JWT_SECRET),
    });

    if (!token) {
      console.warn(`[auth] Missing bearer token for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ message:"Not authorized: missing bearer token" });
    }

    if (!process.env.JWT_SECRET) {
      console.error(`[auth] JWT_SECRET is missing for ${req.method} ${req.originalUrl}`);
      return res.status(500).json({ message:"Authentication not configured on server" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded?.id || decoded?.userId || decoded?._id;

    console.log(`[auth] JWT verified for ${req.method} ${req.originalUrl}`, {
      decoded,
      userId,
    });

    req.auth = decoded;
    req.user = await User.findById(userId).select("-password");
    if (!req.user) {
      console.warn(`[auth] User not found for ${req.method} ${req.originalUrl}`, {
        userId,
        decoded,
      });
      return res.status(401).json({ message:"Not authorized: user not found" });
    }

    console.log(`[auth] User attached for ${req.method} ${req.originalUrl}`, {
      userId: req.user?._id?.toString(),
      email: req.user?.email || "",
      role: req.user?.role || "",
    });

    next();
  } catch (err) {
    console.error(`[auth] Authentication error for ${req.method} ${req.originalUrl}`, {
      name: err?.name,
      message: err?.message,
    });

    if (err?.name === "TokenExpiredError") {
      console.warn(`[auth] Token expired for ${req.method} ${req.originalUrl}`);
      return res.status(401).json({ message:"Token expired" });
    }
    if (err?.name === "JsonWebTokenError") {
      console.warn(`[auth] Invalid token for ${req.method} ${req.originalUrl}`, {
        message: err?.message,
      });
      return res.status(401).json({ message:"Token invalid" });
    }
    return res.status(401).json({ message:"Authentication failed" });
  }
};

const admin = (req, res, next) => {
  if (req.user?.role !== "admin") return res.status(403).json({ message:"Admin access required" });
  next();
};

module.exports = { protect, admin };
