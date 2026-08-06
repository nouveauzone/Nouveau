// Fixed charges are already expressed in the selected currency and must not be converted.
export const SHIPPING_CONFIG = Object.freeze({
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

export const SHIPPING_RATES = Object.freeze({
  GBP: 35,
  EUR: 80,
});

const normalizeCountryName = (value = "") => String(value || "").trim().replace(/\s+/g, " ");

export const resolveShippingProfile = (shippingCountry = "", preferredCurrency = "") => {
  const countryName = normalizeCountryName(shippingCountry);
  const countryLower = countryName.toLowerCase();
  const preferredCode = String(preferredCurrency || "").trim().toUpperCase();

  if (countryName) {
    const match = Object.entries(SHIPPING_CONFIG).find(([, config]) =>
      config.countries.some((name) => String(name).trim().toLowerCase() === countryLower)
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

export const getShippingCharge = (currencyCode = "", shippingCountry = "") => {
  const profile = resolveShippingProfile(shippingCountry, currencyCode);
  return profile.shippingCharge;
};
