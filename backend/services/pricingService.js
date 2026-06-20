const COUPONS = { NOUVEAU10: 10, AURA20: 20, LOTUS15: 15 };

const normalizeCoupon = (couponCode = "") => couponCode.trim().toUpperCase();

const calculateOrderTotals = (items = [], couponCode = "") => {
  const subtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0);
  const normalizedCoupon = normalizeCoupon(couponCode);
  const discountPct = COUPONS[normalizedCoupon] || 0;
  const discount = Math.round((subtotal * discountPct) / 100);
  const shippingCharge = subtotal >= 2999 ? 0 : 99;
  // GST Calculation
  const cgst = +(subtotal * 0.025).toFixed(2);
  const sgst = +(subtotal * 0.025).toFixed(2);
  const total = subtotal - discount + cgst + sgst + shippingCharge;

  return {
    couponCode: normalizedCoupon,
    subtotal,
    discount,
    cgst,
    sgst,
    shippingCharge,
    total,
  };
};

module.exports = { COUPONS, calculateOrderTotals, normalizeCoupon };
