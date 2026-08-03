const express = require("express");
const fs = require("fs");
const path = require("path");
const asyncHandler = require("../utils/asyncHandler");

const router = express.Router();

const CACHE_DIR = path.join(__dirname, "..", "cache");
const CACHE_FILE = path.join(CACHE_DIR, "currency.json");
const SIX_HOURS = 6 * 60 * 60 * 1000;

const SUPPORTED = ["INR", "USD", "GBP", "EUR", "AED", "AUD", "CAD"];
const FALLBACK_RATES = { INR: 1, USD: 0.012, GBP: 0.0094, EUR: 0.011, AED: 0.044, AUD: 0.018, CAD: 0.016 };

const readCache = () => {
  try {
    if (!fs.existsSync(CACHE_FILE)) return null;
    const raw = fs.readFileSync(CACHE_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return parsed && parsed.timestamp && parsed.rates ? parsed : null;
  } catch (e) { return null; }
};

const writeCache = (obj) => {
  try {
    if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj), "utf8");
  } catch (e) { /* ignore */ }
};

const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "";
};

const getCountryInfo = async (ip, acceptLanguage) => {
  try {
    if (!ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168") || ip.startsWith("10.")) {
      // Fallback to accept-language
      if (acceptLanguage) {
        const locale = String(acceptLanguage).split(",")[0].trim();
        const parts = locale.split(/[-_]/);
        if (parts[1]) return { countryCode: parts[1].toUpperCase(), country: parts[1].toUpperCase() };
      }
      return { countryCode: "IN", country: "India" };
    }

    const axios = require("axios");
    const res = await axios.get(`http://ip-api.com/json/${ip}?fields=country,countryCode`, { timeout: 3000 });
    const country = res.data?.country || "India";
    const countryCode = res.data?.countryCode || "IN";
    return { country, countryCode };
  } catch (e) {
    // Use accept-language fallback
    if (acceptLanguage) {
      const locale = String(acceptLanguage).split(",")[0].trim();
      const parts = locale.split(/[-_]/);
      if (parts[1]) return { countryCode: parts[1].toUpperCase(), country: parts[1].toUpperCase() };
    }
    return { countryCode: "IN", country: "India" };
  }
};

const mapCountryToCurrency = (countryCode) => {
  const cc = String(countryCode || "").toUpperCase();
  const euroCountries = new Set(["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES","HR","CZ","HU","PL","RO","BG","SE"]);
  if (cc === "IN") return "INR";
  if (cc === "US") return "USD";
  if (cc === "GB" || cc === "UK") return "GBP";
  if (cc === "AE") return "AED";
  if (cc === "AU") return "AUD";
  if (cc === "CA") return "CAD";
  if (euroCountries.has(cc)) return "EUR";
  return "INR"; // default fallback
};

let memoryCache = readCache();

const fetchLiveRates = async () => {
  try {
    const axios = require("axios");
    const symbols = SUPPORTED.filter(s => s !== "INR").join(",");
    const url = `https://api.exchangerate.host/latest?base=INR&symbols=${symbols},INR`;
    const res = await axios.get(url, { timeout: 5000 });
    const remoteRates = res.data?.rates || {};
    // Ensure INR present
    remoteRates.INR = 1;
    const rates = {};
    SUPPORTED.forEach((c) => { rates[c] = Number(remoteRates[c]) || Number(FALLBACK_RATES[c]) || 1; });
    const payload = { timestamp: Date.now(), rates };
    writeCache(payload);
    memoryCache = payload;
    return rates;
  } catch (e) {
    const cached = memoryCache?.rates || (readCache()?.rates) || FALLBACK_RATES;
    return cached;
  }
};

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const ip = getClientIP(req);
    const acceptLanguage = req.headers["accept-language"] || "";
    const info = await getCountryInfo(ip, acceptLanguage);
    const currencyCode = mapCountryToCurrency(info.countryCode || info.country);

    // Serve cached rates if fresh, otherwise refresh when older than 6 hours
    const cached = memoryCache || readCache();
    let rates = cached?.rates || null;
    if (!cached || (Date.now() - (cached.timestamp || 0)) > SIX_HOURS) {
      rates = await fetchLiveRates();
    }

    return res.json({ success: true, country: info.country, countryCode: info.countryCode, currencyCode, rates });
  })
);

module.exports = router;
