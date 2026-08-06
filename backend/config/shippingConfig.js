// Keep this server-side copy authoritative: orders never accept a client supplied charge.
const SHIPPING_CONFIG = Object.freeze({
  GBP: {
    countries: ["United Kingdom"],
    charge: 35,
  },
  EUR: {
    countries: [
      "Germany",
      "France",
      "Italy",
      "Spain",
      "Netherlands",
      "Belgium",
      "Austria",
      "Portugal",
      "Ireland",
      "Luxembourg",
      "Finland",
      "Greece",
      "Sweden",
      "Denmark",
      "Poland",
      "Czech Republic",
      "Hungary",
      "Romania",
      "Slovakia",
      "Slovenia",
      "Croatia",
      "Estonia",
      "Latvia",
      "Lithuania",
      "Malta",
      "Cyprus",
      "Bulgaria",
    ],
    charge: 80,
  },
});

const SHIPPING_RATES = Object.freeze({
  GBP: 35,
  EUR: 80,
});

const normalizeCountryName = (value = "") => String(value || "").trim().replace(/\s+/g, " ");

const resolveShippingProfile = (shippingCountry = "", preferredCurrency = "") => {
  const countryName = normalizeCountryName(shippingCountry);
  const preferredCode = String(preferredCurrency || "").trim().toUpperCase();

  if (countryName) {
    const normalizedCountry = countryName.toLowerCase();
    const match = Object.entries(SHIPPING_CONFIG).find(([, config]) =>
      config.countries.some((name) => String(name).trim().toLowerCase() === normalizedCountry)
    );

    if (match) {
      const [currencyCode, config] = match;
      return {
        shippingCountry: countryName,
        shippingCurrency: currencyCode,
        shippingCharge: Number(config.charge || 0),
      };
    }
  }

  if (preferredCode === "GBP") {
    return {
      shippingCountry: countryName || "United Kingdom",
      shippingCurrency: "GBP",
      shippingCharge: SHIPPING_RATES.GBP,
    };
  }

  if (preferredCode === "EUR") {
    return {
      shippingCountry: countryName || "Europe",
      shippingCurrency: "EUR",
      shippingCharge: SHIPPING_RATES.EUR,
    };
  }

  return {
    shippingCountry: countryName,
    shippingCurrency: "",
    shippingCharge: 0,
  };
};

const getShippingCharge = (currencyCode = "", shippingCountry = "") => {
  const profile = resolveShippingProfile(shippingCountry, currencyCode);
  return profile.shippingCharge;
};

module.exports = { SHIPPING_CONFIG, SHIPPING_RATES, getShippingCharge, normalizeCountryName, resolveShippingProfile };
