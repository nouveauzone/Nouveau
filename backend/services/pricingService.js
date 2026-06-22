const COUPONS = { NOUVEAU10: 10, AURA20: 20, LOTUS15: 15 };

const normalizeCoupon = (couponCode = "") => couponCode.trim().toUpperCase();

/**
 * Calculate order totals including coupon or returning customer discount
 * Priority: Coupon code takes precedence if provided
 * @param {array} items - Order items
 * @param {string} couponCode - Optional coupon code
 * @param {boolean} isReturningCustomer - Whether customer is returning (has 1+ paid orders)
 * @returns {object} - Totals breakdown
 */
const calculateOrderTotals = (items = [], couponCode = "", isReturningCustomer = false) => {
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
  
  const shippingCharge = subtotal >= 2999 ? 0 : 99;
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
    shippingCharge,
    total,
  };
};

module.exports = { COUPONS, calculateOrderTotals, normalizeCoupon };
