import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import apiService from "../services/apiService";

const isProd = process.env.NODE_ENV === "production";
const logWarn = (...args) => { if (!isProd) console.warn(...args); };

export const CurrencyContext = createContext(null);

export const SUPPORTED_CURRENCIES = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "AED", symbol: "AED", label: "UAE Dirham" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  GBP: 0.0094,
  EUR: 0.011,
  AED: 0.044,
  AUD: 0.018,
  CAD: 0.016,
};

const STORAGE_KEY = "nouveau_selected_currency";
const RATE_CACHE_KEY = "nouveau_currency_rate_cache";
const CACHE_TTL_MS = 24 * 60 * 60 * 1000;

const CURRENCY_BY_CODE = SUPPORTED_CURRENCIES.reduce((accumulator, currency) => {
  accumulator[currency.code] = currency;
  return accumulator;
}, {});

const readJSON = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeJSON = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage failures.
  }
};

const readSavedCurrency = () => {
  if (typeof window === "undefined") return "INR";
  const saved = String(localStorage.getItem(STORAGE_KEY) || "").trim().toUpperCase();
  return CURRENCY_BY_CODE[saved] ? saved : "INR";
};

const readCachedRates = () => {
  if (typeof window === "undefined") return null;
  const cached = readJSON(RATE_CACHE_KEY);
  if (!cached?.rates || !cached?.timestamp) return null;
  if (Date.now() - cached.timestamp > CACHE_TTL_MS) return null;
  return cached.rates;
};

const persistSelectedCurrency = (code) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Ignore storage failures.
  }
};

export const CurrencyProvider = ({ children }) => {
  const [currencyCode, setCurrencyCodeState] = useState(() => readSavedCurrency());
  const [currencySymbol, setCurrencySymbol] = useState(CURRENCY_BY_CODE[readSavedCurrency()]?.symbol || "₹");
  const [exchangeRate, setExchangeRate] = useState(1);
  const [rates, setRates] = useState(() => ({ ...FALLBACK_RATES }));
  const [country, setCountry] = useState("IN");
  const [detectedCurrencyCode, setDetectedCurrencyCode] = useState("INR");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initializedRef = useRef(false);

  useEffect(() => {
    persistSelectedCurrency(currencyCode);
  }, [currencyCode]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    let active = true;

    const initializeCurrency = async () => {
      try {
        const response = await apiService.getCurrencyInfo();
        if (!active) return;

        const nextCountry = String(response?.country || "IN").trim().toUpperCase() || "IN";
        const nextDetectedCode = CURRENCY_BY_CODE[response?.currencyCode] ? response.currencyCode : "INR";
        const nextRates = {
          ...FALLBACK_RATES,
          ...(response?.rates || {}),
        };

        setCountry(nextCountry);
        setDetectedCurrencyCode(nextDetectedCode);
        setRates(nextRates);
        setCurrencyCodeState(() => {
          const saved = readSavedCurrency();
          return CURRENCY_BY_CODE[saved] ? saved : nextDetectedCode;
        });

        writeJSON(RATE_CACHE_KEY, { timestamp: Date.now(), rates: nextRates });
        setError("");
      } catch (requestError) {
        if (!active) return;

        const cachedRates = readCachedRates();
        const nextRates = cachedRates || { ...FALLBACK_RATES };

        setCountry("IN");
        setDetectedCurrencyCode("INR");
        setRates(nextRates);
        setCurrencyCodeState((current) => CURRENCY_BY_CODE[current] ? current : "INR");
        setError(requestError?.message || "Currency detection failed");

        if (!cachedRates) {
          writeJSON(RATE_CACHE_KEY, { timestamp: Date.now(), rates: nextRates });
        }

        if (!isProd) {
          logWarn("Currency detection failed; using INR fallback.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initializeCurrency();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const nextCurrency = CURRENCY_BY_CODE[currencyCode] || CURRENCY_BY_CODE.INR;
    setCurrencySymbol(nextCurrency.symbol);
    setExchangeRate(Number(rates[currencyCode]) || 1);
  }, [currencyCode, rates]);

  const setCurrencyCode = (nextCode) => {
    const code = CURRENCY_BY_CODE[String(nextCode || "").toUpperCase()] ? String(nextCode || "").toUpperCase() : "INR";
    setCurrencyCodeState(code);
  };

  const formatPrice = useMemo(() => {
    return (inrAmount) => {
      const parsed = Number(inrAmount) || 0;
      const currentCurrency = CURRENCY_BY_CODE[currencyCode] || CURRENCY_BY_CODE.INR;

      if (currencyCode === "INR") {
        return `₹${parsed.toLocaleString("en-IN")}`;
      }

      const converted = parsed * (Number(rates[currencyCode]) || exchangeRate || 1);
      const locale = currencyCode === "EUR" ? "de-DE" : "en-US";
      return `${currentCurrency.symbol}${converted.toLocaleString(locale, { maximumFractionDigits: 2 })}`;
    };
  }, [currencyCode, exchangeRate, rates]);

  const value = useMemo(() => ({
    country,
    currencyCode,
    currencySymbol,
    exchangeRate,
    rates,
    loading,
    error,
    detectedCurrencyCode,
    detectedCurrencySymbol: (CURRENCY_BY_CODE[detectedCurrencyCode] || CURRENCY_BY_CODE.INR).symbol,
    setCurrencyCode,
    formatPrice,
    currencyOptions: SUPPORTED_CURRENCIES,
  }), [country, currencyCode, currencySymbol, exchangeRate, rates, loading, error, detectedCurrencyCode, formatPrice]);

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);

  if (!context) {
    throw new Error("useCurrency must be used within a CurrencyProvider");
  }

  return context;
};
