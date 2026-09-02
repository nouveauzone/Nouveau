import { useEffect } from "react";
import { THEME } from "../styles/theme";
import { SHIPPING_FEE_BY_CURRENCY } from "../data/constants";

const GOLD = "#C6A15B";

export const SHIPPING_OPTIONS_BY_CURRENCY = {
  USD: {
    code: "US",
    flag: "🇺🇸",
    title: "Shipping to USA",
    price: `$${SHIPPING_FEE_BY_CURRENCY.USD} USD`,
    subtext: "Delivery in 20 business days",
    coverageLabel: "United States coverage",
  },
  CAD: {
    code: "CA",
    flag: "🇨🇦",
    title: "Shipping to Canada",
    price: `$${SHIPPING_FEE_BY_CURRENCY.CAD} CAD`,
    subtext: "Delivery in 20 business days",
    coverageLabel: "Canada coverage",
  },
  AUD: {
    code: "AU",
    flag: "🇦🇺",
    title: "Shipping to Australia",
    price: `A$${SHIPPING_FEE_BY_CURRENCY.AUD} AUD`,
    subtext: "Delivery in 20 business days",
    coverageLabel: "Australia coverage",
  },
  AED: {
    code: "AE",
    flag: "🇦🇪",
    title: "Shipping to UAE (Dubai)",
    price: `AED ${SHIPPING_FEE_BY_CURRENCY.AED}`,
    subtext: "Delivery in 20 business days",
    coverageLabel: "UAE coverage",
  },
  GBP: {
    code: "England, Northern Ireland, Scotland and Wales",
    title: "Shipping to England, Northern Ireland, Scotland and Wales",
    price: `£${SHIPPING_FEE_BY_CURRENCY.GBP} GBP`,
    subtext: "One standard UK rate · Delivery in 20 business days",
    coverageLabel: "UK coverage",
  },
  EUR: {
    code: "Europe",
    title: "Shipping to Europe",
    price: `€${SHIPPING_FEE_BY_CURRENCY.EUR} EUR`,
    subtext: "One standard Europe-wide rate · Delivery in 20 business days",
    coverageLabel: "Europe-wide coverage",
  },
};

export default function ShippingSelector({ currencyCode, onSelect, selected: controlledSelected }) {
  const configuredOptions = SHIPPING_OPTIONS_BY_CURRENCY[currencyCode];
  const visibleOptions = Array.isArray(configuredOptions)
    ? configuredOptions
    : configuredOptions ? [configuredOptions] : [];

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
              borderRadius: "18px",
              padding: "22px",
              background: isSelected ? "linear-gradient(135deg, #fffdf7 0%, #fffbef 100%)" : THEME.bgCard,
              border: `2px solid ${isSelected ? GOLD : THEME.border}`,
              boxShadow: isSelected ? `0 10px 28px ${GOLD}20, 0 0 0 1px ${GOLD}` : "0 3px 12px rgba(55, 35, 20, 0.04)",
              transition: "all 0.2s",
              overflow: "hidden",
            }}
          >
            {isSelected && (
              <span
                style={{
                  position: "absolute",
                  top: "10px",
                  right: "10px",
                  background: GOLD,
                  color: "#FFFFFF",
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
            <div style={{ marginBottom: "14px", color: GOLD, fontFamily: "'Poppins',sans-serif", fontSize: "10px", fontWeight: 700, letterSpacing: "1.2px", textTransform: "uppercase" }}>
              {option.coverageLabel}
            </div>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, color: THEME.text, marginBottom: "4px" }}>
              {option.title}
            </p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "15px", fontWeight: 700, color: GOLD, marginBottom: "2px" }}>
              {option.price}
            </p>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textMuted }}>
              {option.subtext}
            </p>
            <div style={{ height: "3px", width: "100%", borderRadius: "999px", background: isSelected ? `linear-gradient(90deg, ${GOLD}, #f0d87b)` : "#f2ede5", marginTop: "16px" }} />
          </div>
        );
      })}
    </div>
  );
}
