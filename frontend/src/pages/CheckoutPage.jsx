import { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import NouveauzCheckout from "../components/NouveauzCheckout";
import { CartContext } from "../context/CartContext";
import { AppDataContext } from "../context/Providers";
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext } from "../context/CurrencyContext";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import { fixImageUrl } from "../utils/imageUrl";
import { getShippingCharge } from "../data/constants";
import { ToastContext } from "../context/Providers";

const GOLD = "#C9A227";
const CRIMSON = "#B71C1C";
const ADDRESS_FIELDS = [
  { key: "name", label: "Full Name", type: "text" },
  { key: "phone", label: "Phone Number (WhatsApp updates)", type: "tel" },
  { key: "email", label: "Email Address", type: "email", fullRow: true },
  { key: "street", label: "Street Address", type: "text", fullRow: true },
  { key: "city", label: "City", type: "text" },
  { key: "state", label: "State", type: "text" },
  { key: "pincode", label: "Pincode", type: "text" },
];

export default function CheckoutPage({ setPage }) {
  const { cart, dispatch: cartDispatch } = useContext(CartContext);
  const { placeOrder } = useContext(AppDataContext);
  const toast = useContext(ToastContext);
  const { isAuthenticated, token } = useContext(AuthContext);
  const { formatPrice } = useContext(CurrencyContext);
  const [storedAuthToken, setStoredAuthToken] = useState("");
  const isAdminSession = (() => {
    try {
      const adminSession = JSON.parse(localStorage.getItem("admin") || "null");
      const role = String(adminSession?.user?.role || adminSession?.role || "").toLowerCase();
      return role === "admin" && Boolean(String(adminSession?.token || "").trim());
    } catch {
      return false;
    }
  })();
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));
  const [step, setStep] = useState(1);
  const [address, setAddress] = useState({ name: "", phone: "", email: "", street: "", city: "", state: "", pincode: "" });
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  useEffect(() => {
    const savedToken = String(localStorage.getItem("token") || "").trim();
    if (savedToken) {
      setStoredAuthToken(savedToken);
    }
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cgst = +(subtotal * 0.025).toFixed(2);
  const sgst = +(subtotal * 0.025).toFixed(2);
  const shipping = getShippingCharge(subtotal);
  const total = subtotal + cgst + sgst + shipping;

  const validate = () => {
    const nextErrors = {};
    if (!address.name.trim()) nextErrors.name = "Required";
    if (!address.phone.trim()) nextErrors.phone = "Required";
    if (!address.email.trim()) nextErrors.email = "Required";
    if (!address.street.trim()) nextErrors.street = "Required";
    if (!address.city.trim()) nextErrors.city = "Required";
    if (!address.state.trim()) nextErrors.state = "Required";
    if (!address.pincode.trim()) nextErrors.pincode = "Required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRazorpaySuccess = async ({ paymentId, verification }) => {
    if (!isAuthenticated) return;

    setProcessing(true);
    try {
      const savedOrderId = verification?.order?._id || verification?.order?.id || verification?.orderId || "";

      if (savedOrderId) {
        cartDispatch({ type: "CLEAR" });
        localStorage.setItem("lastOrderId", savedOrderId);
        setPage("OrderSuccess");
        return;
      }

      const orderId = await placeOrder(address, cart, "RAZORPAY", paymentId || `RZP-${Date.now()}`);
      cartDispatch({ type: "CLEAR" });
      localStorage.setItem("lastOrderId", orderId);
      setPage("OrderSuccess");
    } catch (error) {
      console.error("Razorpay order failed:", error);
      toast(error.message || "Payment was completed but order creation failed.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const hasAuthToken = Boolean(String(token || storedAuthToken || "").trim());
  const canCheckout = (isAuthenticated && hasAuthToken) || isAdminSession;

  if (!canCheckout) {
    return (
      <div style={{ background: THEME.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 20px" }}>
        <div style={{ maxWidth: "520px", width: "100%", background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "18px", padding: "34px 30px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, fontWeight: 700, marginBottom: "10px" }}>SECURE CHECKOUT</p>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", marginBottom: "10px", color: THEME.text }}>Login Required</h2>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted, lineHeight: 1.7, marginBottom: "24px" }}>
            Please login first to place your order.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            <BtnOutline onClick={() => setPage("Home")} color={THEME.textMuted} style={{ borderRadius: "12px" }}>← Back to Store</BtnOutline>
            <BtnPrimary onClick={() => { localStorage.setItem("nouveau_post_auth_page", "Checkout"); setPage("Auth"); }} style={{ borderRadius: "12px" }}>Login to Continue</BtnPrimary>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", color: THEME.text }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "60px clamp(16px, 4vw, 40px)" }}>
        <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "42px", marginBottom: "8px", color: THEME.text }}>Checkout</h1>
        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, marginBottom: "40px" }}>Secure checkout — powered by Nouveau™ and Razorpay</p>

        <div style={{ display: "flex", alignItems: "center", marginBottom: "48px", flexWrap: "wrap", gap: "8px" }}>
          {["Address", "Payment"].map((label, index) => (
            <div key={label} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: step > index + 1 ? "pointer" : "default" }} onClick={() => step > index + 1 && setStep(index + 1)}>
                <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: step > index + 1 ? `linear-gradient(135deg,${CRIMSON},${GOLD})` : step === index + 1 ? GOLD : THEME.bgCard, border: step === index + 1 ? "none" : `1px solid ${THEME.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: step >= index + 1 ? "#fff" : THEME.textLight, transition: "all 0.3s", fontFamily: "'Poppins',sans-serif" }}>
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                <span style={{ fontSize: "10px", letterSpacing: "2px", color: step >= index + 1 ? THEME.text : THEME.textLight, fontFamily: "'Poppins',sans-serif", fontWeight: step >= index + 1 ? 600 : 400, textTransform: "uppercase" }}>{label}</span>
              </div>
              {index < 1 && <div style={{ width: "48px", height: "1.5px", background: step > index + 1 ? GOLD : THEME.border, margin: "0 12px", transition: "all 0.3s" }} />}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: isMobile ? "24px" : "40px" }} className="cart-sidebar">
          <div>
            {step === 1 && (
              <div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, marginBottom: "24px", fontWeight: 700 }}>DELIVERY ADDRESS</p>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", columnGap: "20px", rowGap: "16px" }} className="checkout-address-grid">
                  {ADDRESS_FIELDS.map(({ key, label, type, fullRow }) => (
                    <div key={key} style={{ gridColumn: fullRow ? "1 / -1" : "auto", width: "100%", minWidth: 0 }}>
                      <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: errors[key] ? CRIMSON : THEME.textMuted, display: "block", marginBottom: "6px", fontWeight: 600, textTransform: "uppercase" }}>
                        {label}{errors[key] && <span style={{ color: CRIMSON, marginLeft: "6px" }}>*</span>}
                      </label>
                      <input
                        type={type}
                        value={address[key]}
                        onChange={(event) => setAddress((current) => ({ ...current, [key]: event.target.value }))}
                        className="checkout-input"
                        style={{ width: "100%", padding: "14px", background: THEME.bgCard, border: `1px solid ${errors[key] ? CRIMSON : THEME.border}`, borderRadius: "10px", color: THEME.text, fontFamily: "'Poppins',sans-serif", fontSize: "14px", transition: "all 0.2s" }}
                        placeholder={label}
                      />
                    </div>
                  ))}
                </div>

                <div style={{ background: "#25D36610", border: "1px solid #25D36640", borderRadius: "10px", padding: "12px 16px", marginTop: "16px", display: "flex", gap: "10px", alignItems: "center" }}>
                  <span style={{ fontSize: "20px" }}>💬</span>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: "#128C7E" }}>
                    <strong>WhatsApp updates</strong> — Order confirmation & tracking sent to your phone!
                  </p>
                </div>

                <div style={{ marginTop: "32px" }}>
                  <BtnPrimary onClick={() => { if (validate()) setStep(2); }} style={{ borderRadius: "12px", padding: "15px 40px" }}>
                    Continue to Payment →
                  </BtnPrimary>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, marginBottom: "24px", fontWeight: 700 }}>PAYMENT</p>

                <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", padding: "24px", marginBottom: "20px" }}>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "2px", color: GOLD, marginBottom: "12px", fontWeight: 700, textAlign: "center" }}>RAZORPAY SECURE CHECKOUT</p>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted, lineHeight: 1.7, textAlign: "center", marginBottom: "18px" }}>
                    Pay using UPI, card, or net banking in Razorpay&apos;s secure modal. After successful payment, your order is saved to MongoDB, the cart clears, and WhatsApp confirmation is sent automatically.
                  </p>

                  <NouveauzCheckout
                    amount={total}
                    cartItems={cart}
                    customerInfo={address}
                    onSuccess={handleRazorpaySuccess}
                    onFailure={(error) => {
                      if (error?.reason === "auth" || error?.reason === "auth_required") {
                        localStorage.setItem("nouveau_post_auth_page", "Checkout");
                        toast("Session expired. Please login again.", "error");
                        setPage("Auth");
                        return;
                      }

                      if (error?.reason !== "cancelled") {
                        console.error("Razorpay payment failed:", error);
                        toast(error?.description || "Payment failed", "error");
                      }
                    }}
                  />

                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, marginTop: "14px", textAlign: "center", lineHeight: 1.7 }}>
                    The old UPI QR flow has been removed from checkout.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                  <BtnOutline onClick={() => setStep(1)} color={THEME.textMuted} style={{ borderRadius: "12px" }}>← Back</BtnOutline>
                </div>
              </div>
            )}
          </div>

          <div>
            <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", padding: "clamp(16px, 5vw, 24px)", position: "sticky", top: "100px" }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: GOLD, marginBottom: "20px", fontWeight: 700 }}>ORDER SUMMARY</p>

              <div style={{ maxHeight: "280px", overflowY: "auto", marginBottom: "20px", paddingRight: "4px" }}>
                {cart.map((item, index) => (
                  <div key={index} style={{ display: "flex", gap: "12px", marginBottom: "14px", paddingBottom: "14px", borderBottom: index < cart.length - 1 ? `1px solid ${THEME.border}` : "none" }}>
                    <div style={{ width: "54px", height: "68px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: THEME.bgDark }}>
                      <img
                        src={fixImageUrl(item.images?.[0])}
                        alt={item.title || item.name || "Product"}
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={(event) => { event.target.src = "/product1.jpeg"; }}
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 600, color: THEME.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginBottom: "3px" }}>{item.title || item.name}</p>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", color: THEME.textMuted }}>Size: {typeof item.size === 'object' ? item.size?.size : String(item.size || "—")} · Qty: {item.qty}</p>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: GOLD, fontWeight: 700, marginTop: "4px" }}>{formatPrice(item.price * item.qty)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: `1px solid ${THEME.border}`, paddingTop: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>Subtotal</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text }}>{formatPrice(subtotal)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>CGST 2.5%</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text }}>{formatPrice(cgst)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>SGST 2.5%</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text }}>{formatPrice(sgst)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>Shipping</span>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: shipping === 0 ? "#2ecc71" : THEME.text }}>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "12px", borderTop: `1px solid ${THEME.border}` }}>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, color: THEME.text }}>Total</span>
                  <span style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", fontWeight: 700, color: GOLD }}>{formatPrice(total)}</span>
                </div>
              </div>

              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: `1px solid ${THEME.border}`, display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  "100% Secure Checkout",
                  "Razorpay Payment Modal",
                  "UPI, Card, NetBanking",
                  "WhatsApp Order Updates",
                  "Fast Dispatch"
                ].map((text, idx) => (
                  <div key={idx}>
                    <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textMuted }}>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
