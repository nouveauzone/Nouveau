const COUPONS = { NOUVEAU10: 10, AURA20: 20, LOTUS15: 15 };
const { getShippingCharge } = require("../config/shippingConfig");

const normalizeCoupon = (couponCode = "") => couponCode.trim().toUpperCase();

/**
 * Calculate order totals including coupon or returning customer discount
 * Priority: Coupon code takes precedence if provided
 * @param {array} items - Order items
 * @param {string} couponCode - Optional coupon code
 * @param {boolean} isReturningCustomer - Whether customer is returning (has 1+ paid orders)
 * @returns {object} - Totals breakdown
 */
const calculateOrderTotals = (items = [], couponCode = "", isReturningCustomer = false, currency = "INR", exchangeRate = 1) => {
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
  
  const shippingCurrency = String(currency || "INR").toUpperCase();
  const conversionRate = shippingCurrency === "INR" ? 1 : Math.max(0, Number(exchangeRate) || 1);
  const shippingCharge = getShippingCharge(shippingCurrency, subtotal);
  // GST Calculation
  const cgst = +(subtotal * 0.025).toFixed(2);
  const sgst = +(subtotal * 0.025).toFixed(2);
  const convertedSubtotal = +(subtotal * conversionRate).toFixed(2);
  const convertedDiscount = +(discount * conversionRate).toFixed(2);
  const convertedCgst = shippingCurrency === "INR" ? cgst : 0;
  const convertedSgst = shippingCurrency === "INR" ? sgst : 0;
  const total = +(convertedSubtotal - convertedDiscount + convertedCgst + convertedSgst + shippingCharge).toFixed(2);

  return {
    couponCode: normalizedCoupon,
    subtotal: convertedSubtotal,
    discount: convertedDiscount,
    discountPct,
    discountType,
    isReturningCustomer,
    cgst: convertedCgst,
    sgst: convertedSgst,
    shippingCharge,
    shippingCurrency,
    grandTotal: total,
    total,
  };
};

module.exports = { COUPONS, calculateOrderTotals, normalizeCoupon };
