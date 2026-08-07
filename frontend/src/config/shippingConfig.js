export const SHIPPING_RATES = {
    INR: 99,
    USD: 38,
    CAD: 38,
    AUD: 180,
    AED: 90,
    GBP: 35,
    EUR: 80,
};

export const getShippingCharge = (currency, subtotal = 0) => {
    const code = String(currency || "INR").toUpperCase();
    if (code === "INR") return Number(subtotal) >= 2999 ? 0 : 99;
    return SHIPPING_RATES[code] ?? 0;
};
