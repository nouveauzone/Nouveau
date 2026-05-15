import { useContext, useMemo, useState } from "react";
import apiService from "../services/apiService";
import { AuthContext } from "../context/AuthContext";
import { loadRazorpayScript } from "../utils/loadRazorpay";

const DEFAULT_MERCHANT = "Nouveauz";

const CARD_BRANDS = [
  { name: "American Express", short: "Amex", pattern: /^3[47]/, maxLength: 15, cvvLength: 4, color: "#0f4c81" },
  { name: "Mastercard", short: "Mastercard", pattern: /^(5[1-5]|2[2-7])/, maxLength: 16, cvvLength: 3, color: "#eb001b" },
  { name: "Visa", short: "Visa", pattern: /^4/, maxLength: 19, cvvLength: 3, color: "#1a1f71" },
  { name: "RuPay", short: "RuPay", pattern: /^(60|65|81)/, maxLength: 16, cvvLength: 3, color: "#0066b3" },
];

const stripDigits = (value) => value.replace(/\D/g, "");

const formatCardNumber = (value) => stripDigits(value)
  .slice(0, 19)
  .replace(/(.{4})/g, "$1 ")
  .trim();

const detectCardBrand = (digits) => CARD_BRANDS.find((brand) => brand.pattern.test(digits)) || {
  name: "Card",
  short: "Card",
  maxLength: 19,
  cvvLength: 3,
  color: "#2a2f3a",
};

const luhnCheck = (digits) => {
  if (!digits || digits.length < 12) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const normalizeExpiry = (value) => {
  const digits = stripDigits(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const expiryIsValid = (value) => {
  const match = value.trim().match(/^(\d{2})\/(\d{2}|\d{4})$/);
  if (!match) return false;

  const month = Number(match[1]);
  const year = match[2].length === 2 ? 2000 + Number(match[2]) : Number(match[2]);

  if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) return false;

  const expiryDate = new Date(year, month, 0, 23, 59, 59, 999);
  return expiryDate >= new Date();
};

const maskCardNumber = (digits) => {
  if (!digits) return "•••• ••••• •••• ••••";
  return digits.replace(/\d(?=\d{4})/g, "•").replace(/(.{4})/g, "$1 ").trim();
};

const getOrderIdForVerification = (orderId) => {
  if (typeof orderId === "string" && /^[a-f\d]{24}$/i.test(orderId)) {
    return orderId;
  }
  return undefined;
};

const Spinner = () => (
  <span style={{
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "nvz-spin 0.75s linear infinite",
  }}>
    <style>{"@keyframes nvz-spin { to { transform: rotate(360deg); } }"}</style>
  </span>
);

const CardPayment = ({
  amount,
  orderId,
  customerInfo = {},
  merchantName = DEFAULT_MERCHANT,
  onSuccess,
  onFailure,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [cardName, setCardName] = useState(customerInfo.name || "");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const digitsOnly = useMemo(() => stripDigits(cardNumber), [cardNumber]);
  const brand = useMemo(() => detectCardBrand(digitsOnly), [digitsOnly]);
  const formattedPreview = useMemo(() => maskCardNumber(digitsOnly), [digitsOnly]);

  const validate = () => {
    const nextErrors = {};

    if (!cardName.trim()) nextErrors.cardName = "Card holder name required";
    if (digitsOnly.length < 12) nextErrors.cardNumber = "Card number incomplete";
    else if (digitsOnly.length !== brand.maxLength && !(brand.name === "Card" && digitsOnly.length >= 12)) nextErrors.cardNumber = `Use a valid ${brand.short} number`;
    else if (!luhnCheck(digitsOnly)) nextErrors.cardNumber = "Card number invalid";

    if (!expiry.trim()) nextErrors.expiry = "Expiry required";
    else if (!expiryIsValid(expiry)) nextErrors.expiry = "Expiry date invalid or expired";

    if (!cvv.trim()) nextErrors.cvv = "CVV required";
    else if (!/^\d+$/.test(cvv)) nextErrors.cvv = "CVV must be numeric";
    else if (cvv.length !== brand.cvvLength) nextErrors.cvv = `${brand.cvvLength}-digit CVV required`;

    return nextErrors;
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      const message = "Please login first to use card payment.";
      alert(message);
      onFailure?.({ reason: "auth_required", description: message });
      return;
    }

    const nextErrors = validate();
    setTouched({ cardName: true, cardNumber: true, expiry: true, cvv: true });
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      onFailure?.({
        reason: "validation_failed",
        description: "Card details invalid",
        fields: nextErrors,
      });
      return;
    }

    const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!keyId) {
      const message = "Razorpay key missing. Add REACT_APP_RAZORPAY_KEY_ID in frontend environment.";
      alert(message);
      onFailure?.({ reason: "missing-key", description: message });
      return;
    }

    setLoading(true);

    try {
      await loadRazorpayScript();
      const gatewayOrder = await apiService.createRazorpayOrder({ amount: Number(amount) });
      const verificationOrderId = getOrderIdForVerification(orderId);

      const options = {
        key: keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency || "INR",
        order_id: gatewayOrder.orderId,
        name: merchantName || DEFAULT_MERCHANT,
        description: `Card payment for ${orderId || "order"}`,
        prefill: {
          name: cardName,
          email: customerInfo.email || "",
          contact: customerInfo.phone || "",
        },
        method: { card: true, netbanking: false, upi: false, wallet: false },
        theme: { color: "#1a1a1a" },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          ondismiss: () => {
            setLoading(false);
            onFailure?.({ reason: "cancelled", description: "Payment cancelled" });
          },
        },
        handler: async (response) => {
          try {
            const payload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            if (verificationOrderId) {
              payload.orderId = verificationOrderId;
            }

            await apiService.verifyRazorpayPayment(payload);

            onSuccess?.({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              paymentMethod: "card",
              cardBrand: brand.name,
              cardLast4: digitsOnly.slice(-4),
              cardholderName: cardName,
            });
          } catch (error) {
            const message = error?.message || "Payment verification failed";
            onFailure?.({ reason: "verification_failed", description: message });
            alert(message);
          } finally {
            setLoading(false);
          }
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (response) => {
        setLoading(false);
        onFailure?.({
          reason: response?.error?.reason || "failed",
          description: response?.error?.description || "Payment failed",
          code: response?.error?.code,
        });
      });
      checkout.open();
    } catch (error) {
      setLoading(false);
      const message = error?.message || "Unable to start card payment";
      alert(message);
      onFailure?.({ reason: "start_failed", description: message });
    }
  };

  const cardErrors = errors;

  if (!isAuthenticated) {
    return (
      <div style={{ padding: "20px", borderRadius: "16px", border: "1px solid #f1d99a", background: "#fff8e8", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#7a5a00" }}>Login required for card payment</p>
        <p style={{ margin: "8px 0 0", fontSize: "12px", color: "#8a6d3b" }}>Please sign in before continuing to Razorpay.</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div style={{
        borderRadius: 20,
        padding: 20,
        background: `linear-gradient(135deg, ${brand.color}, #10131a 70%)`,
        color: "#fff",
        boxShadow: "0 18px 40px rgba(0,0,0,0.12)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.78 }}>Secure Card Preview</p>
            <p style={{ margin: "6px 0 0", fontSize: 20, fontWeight: 700 }}>{brand.short}</p>
          </div>
          <div style={{
            alignSelf: "flex-start",
            padding: "6px 10px",
            borderRadius: 999,
            background: "rgba(255,255,255,0.12)",
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
          }}>
            {brand.name}
          </div>
        </div>

        <div style={{
          minHeight: 56,
          fontSize: 18,
          letterSpacing: "0.14em",
          fontVariantNumeric: "tabular-nums",
          marginBottom: 18,
          display: "flex",
          alignItems: "center",
        }}>
          {formattedPreview}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.88 }}>
          <div>
            <div style={{ opacity: 0.65, marginBottom: 4 }}>Card Holder</div>
            <div style={{ fontWeight: 700, textTransform: "none" }}>{cardName || "Your Name"}</div>
          </div>
          <div>
            <div style={{ opacity: 0.65, marginBottom: 4 }}>Expiry</div>
            <div style={{ fontWeight: 700 }}>{expiry || "MM/YY"}</div>
          </div>
          <div>
            <div style={{ opacity: 0.65, marginBottom: 4 }}>CVV</div>
            <div style={{ fontWeight: 700 }}>{cvv ? "•".repeat(cvv.length) : "•••"}</div>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gap: 12 }}>
        <Field
          label="Card Holder Name"
          value={cardName}
          placeholder="Name as on card"
          onChange={(value) => setCardName(value)}
          onBlur={() => setTouched((current) => ({ ...current, cardName: true }))}
          error={touched.cardName ? cardErrors.cardName : ""}
        />

        <Field
          label="Card Number"
          value={cardNumber}
          placeholder="1234 5678 9012 3456"
          onChange={(value) => {
            const digits = stripDigits(value).slice(0, brand.maxLength);
            setCardNumber(formatCardNumber(digits));
            if (touched.cardNumber) setErrors((current) => ({ ...current, cardNumber: "" }));
          }}
          onBlur={() => setTouched((current) => ({ ...current, cardNumber: true }))}
          error={touched.cardNumber ? cardErrors.cardNumber : ""}
          inputMode="numeric"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field
            label="Expiry"
            value={expiry}
            placeholder="MM/YY"
            onChange={(value) => {
              setExpiry(normalizeExpiry(value));
              if (touched.expiry) setErrors((current) => ({ ...current, expiry: "" }));
            }}
            onBlur={() => setTouched((current) => ({ ...current, expiry: true }))}
            error={touched.expiry ? cardErrors.expiry : ""}
            inputMode="numeric"
          />

          <Field
            label={`CVV (${brand.cvvLength} digits)`}
            value={cvv}
            placeholder={brand.cvvLength === 4 ? "1234" : "123"}
            onChange={(value) => {
              const digits = stripDigits(value).slice(0, brand.cvvLength);
              setCvv(digits);
              if (touched.cvv) setErrors((current) => ({ ...current, cvv: "" }));
            }}
            onBlur={() => setTouched((current) => ({ ...current, cvv: true }))}
            error={touched.cvv ? cardErrors.cvv : ""}
            inputMode="numeric"
          />
        </div>
      </div>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12, color: "#667085" }}>
          <span style={{ fontSize: 14 }}>🔎</span>
          <span>
            {digitsOnly.length >= brand.maxLength && luhnCheck(digitsOnly)
              ? `${brand.name} number looks valid`
              : "Validation runs before secure payment opens"}
          </span>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || !amount}
          style={{
            minWidth: 220,
            padding: "15px 22px",
            border: "none",
            borderRadius: 12,
            background: loading ? "#5b5f6a" : "#111827",
            color: "#fff",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 15,
            fontWeight: 700,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          {loading ? (
            <>
              <Spinner />
              Opening secure checkout...
            </>
          ) : (
            <>
              <span>💳</span>
              Pay ₹{Number(amount).toLocaleString("en-IN")}
            </>
          )}
        </button>
      </div>

      <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "#6b7280" }}>
        Card details are validated locally first. If the number, expiry, or CVV is wrong, the payment flow will not open.
      </p>
    </div>
  );
};

const Field = ({ label, value, placeholder, onChange, onBlur, error, inputMode = "text" }) => (
  <label style={{ display: "grid", gap: 7 }}>
    <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{label}</span>
    <input
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      onBlur={onBlur}
      inputMode={inputMode}
      style={{
        width: "100%",
        borderRadius: 12,
        border: `1.5px solid ${error ? "#d92d20" : "#d0d5dd"}`,
        padding: "13px 14px",
        fontSize: 14,
        outline: "none",
        background: "#fff",
        color: "#111827",
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
    />
    {error ? <span style={{ fontSize: 12, color: "#d92d20" }}>{error}</span> : null}
  </label>
);

export default CardPayment;
