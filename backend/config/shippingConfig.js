const SHIPPING_RATES = {
    // Existing international fixed rates
    USD: 38,
    CAD: 38,
    AUD: 180,
    AED: 90,
    // United Kingdom (England, Scotland, Wales and Northern Ireland)
    GBP: 35,
    // One standard rate for all European destinations
    EUR: 80,
};

const getShippingCharge = (currency, subtotal = 0) => {
    const code = String(currency || "INR").toUpperCase();
    if (code === "INR") return Number(subtotal) >= 2999 ? 0 : 99;
    return SHIPPING_RATES[code] ?? 0;
};

module.exports = {
    SHIPPING_RATES,
    getShippingCharge
};
