const COUPONS = { NOUVEAU10: 10, AURA20: 20, LOTUS15: 15 };
<<<<<<< HEAD
=======
const { resolveShippingProfile } = require("../config/shippingConfig");
>>>>>>> 8edd4d6 (Implement country-based shipping flow)

const normalizeCoupon = (couponCode = "") => couponCode.trim().toUpperCase();

/**
 * Calculate order totals including coupon or returning customer discount
 * Priority: Coupon code takes precedence if provided
 * @param {array} items - Order items
 * @param {string} couponCode - Optional coupon code
 * @param {boolean} isReturningCustomer - Whether customer is returning (has 1+ paid orders)
 * @returns {object} - Totals breakdown
 */
<<<<<<< HEAD
const calculateOrderTotals = (items = [], couponCode = "", isReturningCustomer = false) => {
=======
const calculateOrderTotals = (items = [], couponCode = "", isReturningCustomer = false, shippingCurrency = "", shippingCountry = "") => {
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  const normalizedCoupon = normalizeCoupon(couponCode);
  
  let discount = 0;
  let discountType = "none";
  let discountPct = 0;
  
  // Coupon takes precedence if provided
  if (normalizedCoupon && COUPONS[normalizedCoupon]) {
    discountPct = COUPONS[normalizedCoupon];
    discount = Math.round((subtotal * discountPct) / 100);
    discountType = "coupon";
  }
  // Apply returning customer discount if no coupon and customer is returning
  else if (isReturningCustomer) {
    discountPct = 10;
    discount = Math.round((subtotal * discountPct) / 100);
    discountType = "returning_customer";
  }
  
<<<<<<< HEAD
  const shippingCharge = subtotal >= 2999 ? 0 : 99;
=======
  const shippingProfile = resolveShippingProfile(shippingCountry, shippingCurrency);
  const normalizedShippingCurrency = String(shippingProfile.shippingCurrency || shippingCurrency || "").trim().toUpperCase();
  const shippingCharge = Number(shippingProfile.shippingCharge || 0);
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
  // GST Calculation
  const cgst = +(subtotal * 0.025).toFixed(2);
  const sgst = +(subtotal * 0.025).toFixed(2);
  const total = subtotal - discount + cgst + sgst + shippingCharge;

  return {
    couponCode: normalizedCoupon,
    subtotal,
    discount,
    discountPct,
    discountType,
    isReturningCustomer,
    cgst,
    sgst,
<<<<<<< HEAD
    shippingCharge,
=======
    shippingCountry: shippingProfile.shippingCountry || "",
    shippingCharge,
    shippingCurrency: normalizedShippingCurrency,
    grandTotal: total,
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
    total,
  };
};

module.exports = { COUPONS, calculateOrderTotals, normalizeCoupon };
