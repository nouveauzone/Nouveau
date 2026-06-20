import { NextResponse } from "next/server";

const SUPPORTED_CURRENCIES = {
  INR: { symbol: "₹", decimals: 0 },
  USD: { symbol: "$", decimals: 2 },
  GBP: { symbol: "£", decimals: 2 },
  EUR: { symbol: "€", decimals: 2 },
  AED: { symbol: "AED", decimals: 2 },
  AUD: { symbol: "A$", decimals: 2 },
  CAD: { symbol: "C$", decimals: 2 },
};

const EUROPE_COUNTRIES = new Set([
  "AT", "BE", "BG", "CH", "CY", "CZ", "DE", "DK", "EE", "ES", "FI", "FR", "GR",
  "HR", "HU", "IE", "IS", "IT", "LI", "LT", "LU", "LV", "MT", "NL", "NO", "PL",
  "PT", "RO", "SE", "SI", "SK", "SM", "VA",
]);

const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  EUR: 0.011,
  AED: 0.044,
  AUD: 0.018,
  CAD: 0.016,
};

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const currencyCache = globalThis.__nouveauCurrencyCache ?? {
  rates: null,
  fetchedAt: 0,
};

globalThis.__nouveauCurrencyCache = currencyCache;

const getCountryFromRequest = (request) => {
  const headerCountry = String(request.headers.get("x-vercel-ip-country") || request.headers.get("cf-ipcountry") || "").trim().toUpperCase();
  if (headerCountry && headerCountry !== "XX") {
    return headerCountry;
  }

  return "IN";
};

const getCurrencyFromCountry = (country) => {
  if (country === "US") return "USD";
  if (country === "GB") return "GBP";
  if (country === "IN") return "INR";
  if (country === "AE") return "AED";
  if (country === "AU") return "AUD";
  if (country === "CA") return "CAD";
  if (EUROPE_COUNTRIES.has(country)) return "EUR";
  return "INR";
};

const loadRates = async () => {
  const cacheIsFresh = currencyCache.rates && (Date.now() - currencyCache.fetchedAt) < CACHE_TTL_MS;
  if (cacheIsFresh) {
    return currencyCache.rates;
  }

  try {
    const response = await fetch("https://open.er-api.com/v6/latest/INR", {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    const payload = await response.json();
    const rates = payload?.rates && typeof payload.rates === "object"
      ? {
          ...FALLBACK_RATES,
          INR: 1,
          USD: Number(payload.rates.USD) || FALLBACK_RATES.USD,
          GBP: Number(payload.rates.GBP) || FALLBACK_RATES.GBP,
          EUR: Number(payload.rates.EUR) || FALLBACK_RATES.EUR,
          AED: Number(payload.rates.AED) || FALLBACK_RATES.AED,
          AUD: Number(payload.rates.AUD) || FALLBACK_RATES.AUD,
          CAD: Number(payload.rates.CAD) || FALLBACK_RATES.CAD,
        }
      : { ...FALLBACK_RATES };

    currencyCache.rates = rates;
    currencyCache.fetchedAt = Date.now();
    return rates;
  } catch {
    if (!currencyCache.rates) {
      currencyCache.rates = { ...FALLBACK_RATES };
      currencyCache.fetchedAt = Date.now();
    }
    return currencyCache.rates;
  }
};

export async function GET(request) {
  const country = getCountryFromRequest(request);
  const currencyCode = getCurrencyFromCountry(country);
  const currency = SUPPORTED_CURRENCIES[currencyCode] || SUPPORTED_CURRENCIES.INR;
  const rates = await loadRates();
  const exchangeRate = Number(rates[currencyCode]) || 1;

  return NextResponse.json({
    country,
    currencyCode,
    currencySymbol: currency.symbol,
    exchangeRate,
    rates,
  });
}