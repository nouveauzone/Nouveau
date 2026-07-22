/*
  Serverless API: /api/exchange-rates
  - Returns INR-based exchange rates for supported currencies
  - Uses Vercel KV (optional) or in-memory fallback cache
  - TTL: 12 hours
*/
const axios = require("axios");

const SUPPORTED = ["INR", "USD", "GBP", "EUR", "AED", "AUD", "CAD"];
const FALLBACK = { INR: 1, USD: 0.012, GBP: 0.0094, EUR: 0.011, AED: 0.044, AUD: 0.018, CAD: 0.016 };
const TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

let memoryCache = null;

// Optional Vercel KV integration if available (configure env vars if you wish)
let kvClient = null;
try {
  if (process.env.VERCEL_KV_REST_URL && process.env.VERCEL_KV_TOKEN) {
    const { KV } = require("@vercel/kv");
    kvClient = KV({ url: process.env.VERCEL_KV_REST_URL, token: process.env.VERCEL_KV_TOKEN });
  }
} catch (e) {
  // KV not available — continue with in-memory fallback
  kvClient = null;
}

const readCached = async () => {
  try {
    if (kvClient) {
      const item = await kvClient.get("nvz_exchange_rates");
      if (!item) return null;
      return item;
    }
  } catch (e) {
    // ignore
  }

  if (memoryCache && memoryCache.timestamp && (Date.now() - memoryCache.timestamp) < TTL_MS) {
    return memoryCache;
  }
  return null;
};

const writeCached = async (payload) => {
  try {
    if (kvClient) {
      await kvClient.set("nvz_exchange_rates", payload);
      return;
    }
  } catch (e) {
    // ignore
  }

  memoryCache = payload;
};

const fetchLive = async () => {
  try {
    const symbols = SUPPORTED.join(",");
    // exchangerate.host provides free live rates
    const url = `https://api.exchangerate.host/latest?base=INR&symbols=${symbols}`;
    const res = await axios.get(url, { timeout: 7000 });
    const remoteRates = res.data?.rates || {};
    remoteRates.INR = 1;
    const rates = {};
    SUPPORTED.forEach((c) => { rates[c] = Number(remoteRates[c]) || Number(FALLBACK[c]) || 1; });
    const payload = { timestamp: Date.now(), rates };
    await writeCached(payload);
    return payload;
  } catch (e) {
    return null;
  }
};

module.exports = async (req, res) => {
  try {
    // Try cache
    const cached = await readCached();
    if (cached && (Date.now() - cached.timestamp) < TTL_MS) {
      return res.status(200).json({ success: true, source: "cache", rates: cached.rates, timestamp: cached.timestamp });
    }

    // Fetch fresh rates
    const fresh = await fetchLive();
    if (fresh) {
      return res.status(200).json({ success: true, source: "live", rates: fresh.rates, timestamp: fresh.timestamp });
    }

    // Fallback to cached if available or to fallback constants
    if (cached) {
      return res.status(200).json({ success: true, source: "cache_stale", rates: cached.rates, timestamp: cached.timestamp });
    }

    return res.status(200).json({ success: true, source: "fallback", rates: FALLBACK, timestamp: Date.now() });
  } catch (error) {
    console.error("/api/exchange-rates error:", error?.message || error);
    return res.status(500).json({ success: false, message: "Failed to retrieve exchange rates" });
  }
};
