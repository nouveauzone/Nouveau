export const CATEGORIES = ["All", "Indian Ethnic Wear", "Indian Western Wear"];
export const LEGACY_WESTERN_CATEGORY = "Indian Premium Western Wear";
export const WESTERN_CATEGORY = "Indian Western Wear";

export const normalizeCategory = (category = "") =>
	category === LEGACY_WESTERN_CATEGORY ? WESTERN_CATEGORY : category;

export const SIZE_OPTIONS = [
  "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL", "6XL", "7XL", "8XL", "9XL", "10XL", "Free Size"
];

export const normalizeSizeLabel = (size = "") => {
  const s = String(size).trim().toUpperCase();
  if (s === "XXL") return "2XL";
  if (s === "XXXL") return "3XL";
  return s;
};

export const SHIPPING_FEE_BY_CURRENCY = {
  INR: 99,
  USD: 38,
  CAD: 38,
  AUD: 180,
  AED: 90,
};

export const SHIPPING_FEE = SHIPPING_FEE_BY_CURRENCY.INR;

export const SHIPPING_FREE_THRESHOLD = 2999;

export const getShippingChargeForCurrency = (currencyCode = "INR", rates = {}) => {
  const code = String(currencyCode || "INR").toUpperCase();
  const amount = SHIPPING_FEE_BY_CURRENCY[code] ?? SHIPPING_FEE_BY_CURRENCY.INR;
  const rate = Number(rates?.[code]) || 1;
  return amount / rate;
};

export const getShippingCharge = () => SHIPPING_FEE_BY_CURRENCY.INR;
