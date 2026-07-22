/*
  Serverless API: /api/currency
  - Detects country using x-vercel-ip-country header (Vercel Edge)
  - Falls back to IP geolocation service
  - Falls back to Accept-Language
  - Returns mapped currency code and exchange rates
*/
const axios = require("axios");
const mapCountryToCurrency = (cc) => {
  const c = String(cc || "").toUpperCase();
  const euro = new Set(["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES","HR","CZ","HU","PL","RO","BG","SE"]);
  if (c === "IN") return "INR";
  if (c === "US") return "USD";
  if (c === "GB" || c === "UK") return "GBP";
  if (c === "AE") return "AED";
  if (c === "AU") return "AUD";
  if (c === "CA") return "CAD";
  if (euro.has(c)) return "EUR";
  return "INR";
};

const getClientIP = (req) => {
  const forwarded = req.headers["x-forwarded-for"] || req.headers["x-real-ip"];
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.socket && req.socket.remoteAddress ? req.socket.remoteAddress : "";
};

module.exports = async (req, res) => {
  try {
    // Preferred: Vercel geolocation header
    const vercelCountry = req.headers["x-vercel-ip-country"]; // e.g. "IN"
    const acceptLang = req.headers["accept-language"] || "";
    let countryCode = vercelCountry || null;
    let countryName = null;

    if (!countryCode) {
      const ip = getClientIP(req);
      if (ip) {
        try {
          const resp = await axios.get(`http://ip-api.com/json/${ip}?fields=country,countryCode`, { timeout: 3000 });
          countryCode = resp.data?.countryCode || null;
          countryName = resp.data?.country || null;
        } catch (e) {
          countryCode = null;
        }
      }
    }

    if (!countryCode && acceptLang) {
      const locale = String(acceptLang).split(",")[0].trim();
      const parts = locale.split(/[-_]/);
      if (parts[1]) countryCode = parts[1].toUpperCase();
    }

    if (!countryCode) countryCode = "IN";

    const currencyCode = mapCountryToCurrency(countryCode);

    // Fetch rates from /api/exchange-rates (same project)
    let rates = null;
    try {
      const host = process.env.NEXT_PUBLIC_BASE_URL || process.env.BASE_URL || "";
      const prefix = host ? host.replace(/\/$/, "") : "";
      const url = `${prefix}/api/exchange-rates`;
      const resp = await axios.get(url, { timeout: 5000 });
      rates = resp.data?.rates || null;
    } catch (e) {
      // try direct external fetch as fallback
      try {
        const resp2 = await axios.get(`https://api.exchangerate.host/latest?base=INR&symbols=INR,USD,GBP,EUR,AED,AUD,CAD`, { timeout: 5000 });
        const remote = resp2.data?.rates || {};
        remote.INR = 1;
        rates = remote;
      } catch (err) {
        rates = null;
      }
    }

    if (!rates) {
      // Highest-safety fallback: minimal INR-only rates
      rates = { INR: 1 };
    }

    return res.status(200).json({ success: true, countryCode, country: countryName || countryCode, currencyCode, rates });
  } catch (error) {
    console.error("/api/currency error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Currency lookup failed" });
  }
};
