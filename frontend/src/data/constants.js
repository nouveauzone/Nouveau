<<<<<<< HEAD
=======
import { SHIPPING_RATES, getShippingCharge as getConfiguredShippingCharge, resolveShippingProfile } from "../config/shippingConfig";

>>>>>>> 8edd4d6 (Implement country-based shipping flow)
export const CATEGORIES = ["All", "Indian Ethnic Wear", "Indian Western Wear"];

export const LEGACY_WESTERN_CATEGORY = "Indian Premium Western Wear";
export const WESTERN_CATEGORY = "Indian Western Wear";

export const normalizeCategory = (category = "") =>
  category === LEGACY_WESTERN_CATEGORY ? WESTERN_CATEGORY : category;

export const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "6XL",
  "7XL",
  "8XL",
  "9XL",
  "10XL",
  "Free Size",
];

export const normalizeSizeLabel = (size = "") => {
  const s = String(size).trim().toUpperCase();

  if (s === "XXL") return "2XL";
  if (s === "XXXL") return "3XL";

  return s;
};

/**
 * Fixed shipping charges in each currency.
 * These values are NOT converted using exchange rates.
 */
<<<<<<< HEAD
export const SHIPPING_FEE_BY_CURRENCY = {
  INR: 99,
  USD: 38,
  CAD: 38,
  AUD: 180,
  AED: 90,
=======
export const SHIPPING_FEE_BY_CURRENCY = SHIPPING_RATES;

export const CURRENCY_SYMBOLS = {
  INR: "₹",
  USD: "$",
  GBP: "£",
  EUR: "€",
  AED: "AED",
  AUD: "A$",
  CAD: "C$",
};

export const SHIPPING_COUNTRY_BY_CURRENCY = {
  INR: "India",
  USD: "United States",
  GBP: "United Kingdom",
  EUR: "Europe",
  AED: "United Arab Emirates",
  AUD: "Australia",
  CAD: "Canada",
};

export const getCurrencySymbol = (currencyCode = "INR") => {
  const code = String(currencyCode || "INR").trim().toUpperCase();
  return CURRENCY_SYMBOLS[code] || code;
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
};

export const SHIPPING_FREE_THRESHOLD = 2999;

/**
 * Returns the fixed shipping charge for the selected currency.
 */
export const getShippingChargeForCurrency = (
  currencyCode = "INR",
<<<<<<< HEAD
  subtotal = 0
) => {
  const code = String(currencyCode || "INR").toUpperCase();

  // Free shipping only in India
  if (code === "INR" && subtotal >= SHIPPING_FREE_THRESHOLD) {
    return 0;
  }

  return SHIPPING_FEE_BY_CURRENCY[code] ?? SHIPPING_FEE_BY_CURRENCY.INR;
};
=======
  shippingCountry = ""
) => getConfiguredShippingCharge(currencyCode, shippingCountry);

export const getShippingProfileForCountry = (shippingCountry = "", preferredCurrency = "INR") =>
  resolveShippingProfile(shippingCountry, preferredCurrency);
>>>>>>> 8edd4d6 (Implement country-based shipping flow)

/**
 * Legacy helper (India shipping)
 */
<<<<<<< HEAD
export const getShippingCharge = () => SHIPPING_FEE_BY_CURRENCY.INR;
=======
export const getShippingCharge = () => 0;
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
