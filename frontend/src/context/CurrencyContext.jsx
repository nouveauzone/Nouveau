import React, { createContext, useState, useEffect, useContext, useMemo, useRef } from "react";

const isProd = process.env.NODE_ENV === "production";
const logWarn = (...args) => { if (!isProd) console.warn(...args); };

export const CurrencyContext = createContext(null);

const COUNTRY_TO_CURRENCY = {
  US: { code: "USD", symbol: "$" },
  GB: { code: "GBP", symbol: "£" },
  IN: { code: "INR", symbol: "₹" },
  AE: { code: "AED", symbol: "د.إ" },
  AU: { code: "AUD", symbol: "A$" },
  CA: { code: "CAD", symbol: "C$" },
  SG: { code: "SGD", symbol: "S$" },
};

// Default fallback limits wait time or API limits
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  EUR: 0.011,
  AED: 0.044,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.016,
};

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCode] = useState("INR");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);
  const warnedRef = useRef(false);

  const GEO_CACHE_KEY = "nouveau_geo_cache";
  const RATE_CACHE_KEY = "nouveau_rate_cache";
  const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

  const readCache = (key) => {
    try {
      const raw = JSON.parse(localStorage.getItem(key) || "null");
      if (!raw?.timestamp) return null;
      if (Date.now() - raw.timestamp > CACHE_TTL_MS) return null;
      return raw.data || null;
    } catch {
      return null;
    }
  };

  const writeCache = (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify({ timestamp: Date.now(), data }));
    } catch {
      // ignore cache write failures
    }
  };

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const initializeCurrency = async () => {
      try {
        if (String(process.env.REACT_APP_GEO_DISABLED || "").toLowerCase() === "true") {
          return;
        }

        if (typeof window !== "undefined") {
          const host = window.location.hostname;
          if (host === "localhost" || host === "127.0.0.1") {
            return;
          }
        }

        // Geo lookup is intentionally disabled to avoid third-party API failures.
        const geoData = readCache(GEO_CACHE_KEY);
        
        if (geoData) {
          const country = geoData?.country_code || "IN";
          const cMap = COUNTRY_TO_CURRENCY[country] || (geoData?.in_eu ? { code:"EUR", symbol:"€" } : { code: "USD", symbol: "$" }); // Default to USD for unknown
          const code = country === "IN" ? "INR" : cMap.code;
          const symbol = country === "IN" ? "₹" : cMap.symbol;

          setCurrencyCode(code);
          setCurrencySymbol(symbol);

          // 2. Fetch Exchange Rates against INR (cached)
          if (code !== "INR") {
            try {
              const cachedRates = readCache(RATE_CACHE_KEY);
              let rateData = cachedRates;

              if (!rateData) {
                const rateRes = await fetch("https://open.er-api.com/v6/latest/INR");
                rateData = await rateRes.json();
                if (rateData?.rates) writeCache(RATE_CACHE_KEY, rateData);
              }

              if (rateData?.rates?.[code]) {
                setExchangeRate(rateData.rates[code]);
              } else {
                setExchangeRate(FALLBACK_RATES[code] || 1);
              }
            } catch (rateErr) {
              if (!warnedRef.current) {
                logWarn("Currency API Error; using fallback rates.");
                warnedRef.current = true;
              }
              setExchangeRate(FALLBACK_RATES[code] || 1);
            }
          }
        }
      } catch (err) {
        if (!warnedRef.current) {
          logWarn("Geo IP tracking failed; defaulting to INR.");
          warnedRef.current = true;
        }
        // Default stays INR
      } finally {
        setLoading(false);
      }
    };

    initializeCurrency();
  }, []);

  // Format Price Helper: formats INR price dynamically
  const formatPrice = useMemo(() => {
    return (inrAmount) => {
      const parsed = Number(inrAmount) || 0;
      if (currencyCode === "INR") {
        return `₹${parsed.toLocaleString("en-IN")}`;
      }
      const converted = Math.round(parsed * exchangeRate);
      return `${currencySymbol}${converted.toLocaleString("en-US")}`;
    };
  }, [currencyCode, currencySymbol, exchangeRate]);

  return (
    <CurrencyContext.Provider value={{ currencyCode, currencySymbol, exchangeRate, formatPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
};
