import { useState } from "react";
import { THEME } from "../styles/theme";

const GOLD = "#C9A227";

const OPTIONS = [
  {
    code: "US",
    flag: "🇺🇸",
    title: "Shipping to USA",
    price: "$38 USD",
    subtext: "Delivery in 5-7 business days",
  },
  {
    code: "CA",
    flag: "🇨🇦",
    title: "Shipping to Canada",
    price: "$38 CAD",
    subtext: "Delivery in 7-10 business days",
  },
];

export default function ShippingSelector({ onSelect, selected: controlledSelected }) {
  const [internalSelected, setInternalSelected] = useState(null);
  const selected = controlledSelected !== undefined ? controlledSelected : internalSelected;

  const handleSelect = (code) => {
    setInternalSelected(code);
    onSelect?.(code);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" style={{ marginBottom: "24px" }}>
      {OPTIONS.map((option) => {
        const isSelected = selected === option.code;
        return (
          <div
            key={option.code}
            onClick={() => handleSelect(option.code)}
            style={{
              position: "relative",
              cursor: "pointer",
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
              {option.title}
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
