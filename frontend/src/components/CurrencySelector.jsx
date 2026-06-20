import { useCurrency } from "../context/CurrencyContext";

export default function CurrencySelector({ className = "" }) {
  const { currencyCode, setCurrencyCode, currencyOptions, loading } = useCurrency();

  return (
    <label className={className} style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
      <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", textTransform: "uppercase", color: "#8b8b8b" }}>
        Currency
      </span>
      <select
        value={currencyCode}
        onChange={(event) => setCurrencyCode(event.target.value)}
        disabled={loading}
        aria-label="Select currency"
        style={{
          minWidth: "130px",
          borderRadius: "999px",
          border: "1px solid rgba(26, 26, 26, 0.12)",
          background: "#fff",
          color: "#1a1a1a",
          padding: "10px 14px",
          fontFamily: "'Poppins',sans-serif",
          fontSize: "12px",
          fontWeight: 600,
          outline: "none",
          cursor: loading ? "wait" : "pointer",
        }}
      >
        {currencyOptions.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.symbol} {currency.code}
          </option>
        ))}
      </select>
    </label>
  );
}