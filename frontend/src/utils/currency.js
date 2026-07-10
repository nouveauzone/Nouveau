export const mapCountryToCurrency = (countryCode) => {
  const cc = String(countryCode || "").toUpperCase();
  const euro = new Set(["AT","BE","CY","EE","FI","FR","DE","GR","IE","IT","LV","LT","LU","MT","NL","PT","SK","SI","ES","HR","CZ","HU","PL","RO","BG","SE"]);
  if (cc === "IN") return "INR";
  if (cc === "US") return "USD";
  if (cc === "GB" || cc === "UK") return "GBP";
  if (cc === "AE") return "AED";
  if (cc === "AU") return "AUD";
  if (cc === "CA") return "CAD";
  if (euro.has(cc)) return "EUR";
  return "INR";
};

export const formatCurrency = ({ amount, currency = "INR", locale = null, maximumFractionDigits = 2 }) => {
  try {
    const locales = locale || (currency === "INR" ? "en-IN" : "en-US");
    return new Intl.NumberFormat(locales, { style: "currency", currency, maximumFractionDigits }).format(amount);
  } catch (e) {
    return `${currency} ${Number(amount || 0).toFixed(2)}`;
  }
};
