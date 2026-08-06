import { useEffect } from "react";
import { THEME } from "../styles/theme";
import { SHIPPING_FEE_BY_CURRENCY } from "../data/constants";

<<<<<<< HEAD
=======
const COUNTRY_SELECTIONS = {
  GBP: [{ code: "United Kingdom", label: "United Kingdom", flag: "🇬🇧", price: "£35", subtext: "United Kingdom shipping" }],
  EUR: [
    { code: "Germany", label: "Germany", flag: "🇩🇪", price: "€80", subtext: "Germany shipping" },
    { code: "France", label: "France", flag: "🇫🇷", price: "€80", subtext: "France shipping" },
    { code: "Italy", label: "Italy", flag: "🇮🇹", price: "€80", subtext: "Italy shipping" },
    { code: "Spain", label: "Spain", flag: "🇪🇸", price: "€80", subtext: "Spain shipping" },
    { code: "Netherlands", label: "Netherlands", flag: "🇳🇱", price: "€80", subtext: "Netherlands shipping" },
    { code: "Belgium", label: "Belgium", flag: "🇧🇪", price: "€80", subtext: "Belgium shipping" },
    { code: "Austria", label: "Austria", flag: "🇦🇹", price: "€80", subtext: "Austria shipping" },
    { code: "Portugal", label: "Portugal", flag: "🇵🇹", price: "€80", subtext: "Portugal shipping" },
    { code: "Ireland", label: "Ireland", flag: "🇮🇪", price: "€80", subtext: "Ireland shipping" },
    { code: "Luxembourg", label: "Luxembourg", flag: "🇱🇺", price: "€80", subtext: "Luxembourg shipping" },
    { code: "Finland", label: "Finland", flag: "🇫🇮", price: "€80", subtext: "Finland shipping" },
    { code: "Greece", label: "Greece", flag: "🇬🇷", price: "€80", subtext: "Greece shipping" },
    { code: "Sweden", label: "Sweden", flag: "🇸🇪", price: "€80", subtext: "Sweden shipping" },
    { code: "Denmark", label: "Denmark", flag: "🇩🇰", price: "€80", subtext: "Denmark shipping" },
    { code: "Poland", label: "Poland", flag: "🇵🇱", price: "€80", subtext: "Poland shipping" },
    { code: "Czech Republic", label: "Czech Republic", flag: "🇨🇿", price: "€80", subtext: "Czech Republic shipping" },
    { code: "Hungary", label: "Hungary", flag: "🇭🇺", price: "€80", subtext: "Hungary shipping" },
    { code: "Romania", label: "Romania", flag: "🇷🇴", price: "€80", subtext: "Romania shipping" },
    { code: "Slovakia", label: "Slovakia", flag: "🇸🇰", price: "€80", subtext: "Slovakia shipping" },
    { code: "Slovenia", label: "Slovenia", flag: "🇸🇮", price: "€80", subtext: "Slovenia shipping" },
    { code: "Croatia", label: "Croatia", flag: "🇭🇷", price: "€80", subtext: "Croatia shipping" },
    { code: "Estonia", label: "Estonia", flag: "🇪🇪", price: "€80", subtext: "Estonia shipping" },
    { code: "Latvia", label: "Latvia", flag: "🇱🇻", price: "€80", subtext: "Latvia shipping" },
    { code: "Lithuania", label: "Lithuania", flag: "🇱🇹", price: "€80", subtext: "Lithuania shipping" },
    { code: "Malta", label: "Malta", flag: "🇲🇹", price: "€80", subtext: "Malta shipping" },
    { code: "Cyprus", label: "Cyprus", flag: "🇨🇾", price: "€80", subtext: "Cyprus shipping" },
    { code: "Bulgaria", label: "Bulgaria", flag: "🇧🇬", price: "€80", subtext: "Bulgaria shipping" },
  ],
};

>>>>>>> 8edd4d6 (Implement country-based shipping flow)
const GOLD = "#D4AF37";

export const SHIPPING_OPTIONS_BY_CURRENCY = {
  USD: {
    code: "US",
    flag: "🇺🇸",
    title: "Shipping to USA",
<<<<<<< HEAD
    price: `$${SHIPPING_FEE_BY_CURRENCY.USD} USD`,
=======
    price: `$${SHIPPING_FEE_BY_CURRENCY.USD ?? 0} USD`,
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
    subtext: "Delivery in 20 business days",
  },
  CAD: {
    code: "CA",
    flag: "🇨🇦",
    title: "Shipping to Canada",
<<<<<<< HEAD
    price: `$${SHIPPING_FEE_BY_CURRENCY.CAD} CAD`,
=======
    price: `$${SHIPPING_FEE_BY_CURRENCY.CAD ?? 0} CAD`,
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
    subtext: "Delivery in 20 business days",
  },
  AUD: {
    code: "AU",
    flag: "🇦🇺",
    title: "Shipping to Australia",
<<<<<<< HEAD
    price: `A$${SHIPPING_FEE_BY_CURRENCY.AUD} AUD`,
=======
    price: `A$${SHIPPING_FEE_BY_CURRENCY.AUD ?? 0} AUD`,
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
    subtext: "Delivery in 20 business days",
  },
  AED: {
    code: "AE",
    flag: "🇦🇪",
    title: "Shipping to UAE (Dubai)",
<<<<<<< HEAD
    price: `AED ${SHIPPING_FEE_BY_CURRENCY.AED}`,
=======
    price: `AED ${SHIPPING_FEE_BY_CURRENCY.AED ?? 0}`,
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
    subtext: "Delivery in 20 business days",
  },
};

export default function ShippingSelector({ currencyCode, onSelect, selected: controlledSelected }) {
<<<<<<< HEAD
  const visibleOption = SHIPPING_OPTIONS_BY_CURRENCY[currencyCode] || null;
  const visibleOptions = visibleOption ? [visibleOption] : [];
=======
  const visibleOptions = COUNTRY_SELECTIONS[currencyCode] || [];
>>>>>>> 8edd4d6 (Implement country-based shipping flow)

  useEffect(() => {
    const defaultOption = visibleOptions[0];
    if (defaultOption && controlledSelected !== defaultOption.code) {
      onSelect?.(defaultOption.code);
    }
  }, [controlledSelected, onSelect, visibleOptions]);

  const selected = controlledSelected;

  if (!visibleOptions.length) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" style={{ marginBottom: "24px" }}>
      {visibleOptions.map((option) => {
        const isSelected = selected === option.code;
        return (
          <div
            key={option.code}
            onClick={() => onSelect?.(option.code)}
            style={{
              position: "relative",
              cursor: visibleOptions.length === 1 ? "default" : "pointer",
              borderRadius: "16px",
              padding: "20px",
              background: THEME.bgCard,
              border: `2px solid ${isSelected ? GOLD : THEME.border}`,
              boxShadow: isSelected ? `0 0 0 1px ${GOLD}` : "none",
              transition: "all 0.2s",
            }}
          >
            {isSelected && (
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: GOLD,
                  color: "#1a1a1a",
                  fontSize: "10px",
                  fontWeight: 700,
                  letterSpacing: "1px",
                  padding: "3px 9px",
                  borderRadius: "999px",
                  fontFamily: "'Poppins',sans-serif",
                }}
              >
                SELECTED
              </span>
            )}
            <div style={{ fontSize: "26px", marginBottom: "8px" }}>{option.flag}</div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, color: THEME.text, marginBottom: "4px" }}>
<<<<<<< HEAD
              {option.title}
=======
              {option.label}
>>>>>>> 8edd4d6 (Implement country-based shipping flow)
            </p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "15px", fontWeight: 700, color: GOLD, marginBottom: "2px" }}>
              {option.price}
            </p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textMuted }}>
              {option.subtext}
            </p>
          </div>
        );
      })}
    </div>
  );
}
