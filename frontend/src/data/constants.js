import { SHIPPING_RATES, getShippingCharge as getConfiguredShippingCharge } from "../config/shippingConfig";

export const CATEGORIES = ["All", "Indian Ethnic Wear", "Indian Western Wear"];

export const LEGACY_WESTERN_CATEGORY = "Indian Premium Western Wear";
export const WESTERN_CATEGORY = "Indian Western Wear";

export const normalizeCategory = (category = "") =>
  category === LEGACY_WESTERN_CATEGORY ? WESTERN_CATEGORY : category;

/**
 * Product types shown in the shop's "Product Type" filter (under Size).
 * Array order = display order in the sidebar.
 * `priority` decides which type wins when a product text matches several
 * (lower number = checked first), e.g. "Maxi Dress" -> Maxi Dresses, not Dresses.
 */
export const PRODUCT_TYPES = [
  { label: "Tops",                      priority: 14, pattern: /\btops?\b|tunic/i },
  { label: "Dresses",                   priority: 13, pattern: /dress|frock|gown/i },
  { label: "Saree",                     priority: 10, pattern: /\bsar(?:ee|ees|i|is)\b/i },
  { label: "Co-ord Set",                priority: 4,  pattern: /co[\s-]?ord|cord\s*set/i },
  { label: "Unstitched Dress Material", priority: 1,  pattern: /unstitched|dress\s*material/i },
  { label: "Kurtis",                    priority: 11, pattern: /kurt[ia]/i },
  { label: "Maxi Dresses",              priority: 7,  pattern: /maxi/i },
  { label: "Palazzo Kurti Set",         priority: 2,  pattern: /palazzo/i },
  { label: "Suit",                      priority: 12, pattern: /\bsuits?\b/i },
  { label: "Kaftans",                   priority: 9,  pattern: /kaftan|caftan/i },
  { label: "Midi Dresses",              priority: 8,  pattern: /midi/i },
  { label: "Skirt Top",                 priority: 6,  pattern: /skirt[\s-]*top/i },
  { label: "3 Piece",                   priority: 5,  pattern: /\b(?:3|three)[\s-]*(?:piece|pcs?)\b/i },
  { label: "Korean Set",                priority: 3,  pattern: /korean/i },
];

const PRODUCT_TYPES_BY_PRIORITY = [...PRODUCT_TYPES].sort((a, b) => a.priority - b.priority);

/**
 * Returns the PRODUCT_TYPES label for a product, or "" if nothing matches.
 * Looks at `subcategory` first, then falls back to the title.
 */
export const getProductType = (product = {}) => {
  const fields = [product?.subcategory, product?.title];
  for (const field of fields) {
    const text = String(field || "").trim();
    if (!text) continue;
    const hit = PRODUCT_TYPES_BY_PRIORITY.find((t) => t.pattern.test(text));
    if (hit) return hit.label;
  }
  return "";
};

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
export const SHIPPING_FEE_BY_CURRENCY = SHIPPING_RATES;

export const SHIPPING_FREE_THRESHOLD = 2999;

/**
 * Returns the fixed shipping charge for the selected currency.
 */
export const getShippingChargeForCurrency = (
  currencyCode = "INR",
  subtotal = 0
) => {
  return getConfiguredShippingCharge(currencyCode, subtotal);
};

/**
 * Legacy helper (India shipping)
 */
export const getShippingCharge = () => SHIPPING_FEE_BY_CURRENCY.INR;
