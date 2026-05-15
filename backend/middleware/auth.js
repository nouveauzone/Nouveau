const jwt  = require("jsonwebtoken");
const User = require("../models/User");

const extractBearerToken = (authHeader = "") => {
  const value = String(authHeader || "").trim();
  if (!value) return "";
  if (!value.toLowerCase().startsWith("bearer ")) return "";
  return value.slice(7).trim();
};

const protect = async (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message:"Not authorized: missing bearer token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user) return res.status(401).json({ message:"Not authorized: user not found" });
    next();
  } catch (err) {
    if (err?.name === "TokenExpiredError") {
      return res.status(401).json({ message:"Token expired" });
    }
    if (err?.name === "JsonWebTokenError") {
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
