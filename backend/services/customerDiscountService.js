const Order = require("../models/Order");

const RETURNING_CUSTOMER_DISCOUNT_PCT = 10;

/**
 * Checks if a customer is a returning customer (has at least 1 successful paid order)
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<boolean>} - true if customer has at least 1 paid order
 */
const isReturningCustomer = async (userId) => {
  if (!userId) return false;

  try {
    const paidOrderCount = await Order.countDocuments({
      userId,
      paymentStatus: "paid",
    });

    return paidOrderCount >= 1;
  } catch (error) {
    console.error("[customerDiscountService] error checking returning customer:", error.message);
    return false;
  }
};

/**
 * Gets the count of successful paid orders for a customer
 * @param {string} userId - MongoDB ObjectId of the user
 * @returns {Promise<number>} - count of paid orders
 */
const getPaidOrderCount = async (userId) => {
  if (!userId) return 0;

  try {
    const count = await Order.countDocuments({
      userId,
      paymentStatus: "paid",
    });

    return Math.max(0, count);
  } catch (error) {
    console.error("[customerDiscountService] error getting paid order count:", error.message);
    return 0;
  }
};

/**
 * Calculates returning customer discount for an order
 * @param {number} subtotal - Order subtotal
 * @param {boolean} isReturning - Whether customer is returning
 * @returns {object} - { discount: number, discountPct: number, isReturningCustomer: boolean }
 */
const calculateReturningCustomerDiscount = (subtotal, isReturning) => {
  if (!isReturning || !Number.isFinite(subtotal) || subtotal <= 0) {
    return {
      discount: 0,
      discountPct: 0,
      isReturningCustomer: false,
    };
  }

  const discount = Math.round((subtotal * RETURNING_CUSTOMER_DISCOUNT_PCT) / 100);

  return {
    discount,
    discountPct: RETURNING_CUSTOMER_DISCOUNT_PCT,
    isReturningCustomer: true,
  };
};

module.exports = {
  isReturningCustomer,
  getPaidOrderCount,
  calculateReturningCustomerDiscount,
  RETURNING_CUSTOMER_DISCOUNT_PCT,
};
