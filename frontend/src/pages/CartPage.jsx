import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { CurrencyContext } from "../context/CurrencyContext";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import Footer from "../components/Footer";
import { fixImageUrl } from "../utils/imageUrl";
import { getShippingCharge, SHIPPING_FREE_THRESHOLD } from "../data/constants";

const GOLD = "#C9A227";
const CRIMSON = "#B71C1C";

export default function CartPage({ setPage }) {
  const { cart, dispatch } = useContext(CartContext);
  const { formatPrice } = useContext(CurrencyContext);

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping = getShippingCharge(subtotal);
  const total = subtotal + shipping;


  if (!cart.length) {
    return (
      <div style={{ background: THEME.bg, minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "20px", padding: "60px 20px" }}>
          <span style={{ fontSize: "64px" }}>🛍️</span>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "28px" }}>Your cart is empty</h2>
          <p style={{ color: THEME.textMuted, fontSize: "16px" }}>Looks like you haven't added anything yet.</p>
          <BtnPrimary onClick={() => setPage("Shop")} style={{ borderRadius: "12px", marginTop: "10px" }}>Browse Collections →</BtnPrimary>
        </div>
        <Footer setPage={setPage} />
      </div>
    );
  }

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", color: THEME.text }}>
      <div className="resp-container" style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px var(--container-padding)" }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(28px, 5vw, 36px)", marginBottom: "40px" }}>Shopping Bag</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "clamp(30px, 5vw, 60px)" }} className="cart-grid-mobile">
          
          {/* ITEMS */}
          <div>
            {cart.map((item) => {
              const stock = Number(item.stockQuantity ?? item.sizeStock ?? item.stock);
              const hasStockInfo = Number.isFinite(stock);
              const outOfStock = hasStockInfo && stock <= 0;
              const lowStock = hasStockInfo && stock > 0 && item.qty > stock;
              const canIncrease = !hasStockInfo || item.qty < stock;
              return (
                <div key={`${item._id}-${item.size}`} className="cart-item-mobile" style={{ display: "flex", gap: "24px", padding: "32px 0", borderBottom: `1px solid ${THEME.border}` }}>
                  <div className="cart-item-img" style={{ width: "120px", height: "160px", borderRadius: "16px", overflow: "hidden", background: THEME.bgDark, flexShrink: 0, border: `1px solid ${THEME.border}`, boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                    <img src={fixImageUrl(item.images?.[0])} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease" }} />
                  </div>

                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", gap: "12px", flexWrap: "wrap" }}>
                      <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "clamp(14px, 4vw, 16px)", fontWeight: 600 }}>{item.title}</p>
                      <p style={{ fontFamily: "'Poppins', sans-serif", fontSize: "16px", fontWeight: 700, color: GOLD }}>{formatPrice(item.price * item.qty)}</p>
                    </div>
                    
                    <p style={{ fontSize: "13px", color: THEME.textMuted, marginBottom: "12px" }}>Size: {typeof item.size === 'object' ? item.size?.size : String(item.size || "Free Size")}</p>
                    {hasStockInfo && (
                      <div style={{ marginBottom: "12px", display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 10px", borderRadius: "99px", background: outOfStock ? "#f8d7da" : lowStock ? "#fff3cd" : "#e8f5e9", color: outOfStock ? "#721c24" : lowStock ? "#856404" : "#1f6f43", fontSize: "11px", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>
                        {outOfStock ? "Sold Out" : lowStock ? `Only ${stock} left` : `${stock} in stock`}
                      </div>
                    )}

                    <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "auto" }}>
                      <div style={{ display: "flex", alignItems: "center", background: "#f5f5f5", borderRadius: "8px", padding: "4px" }}>
                        <button 
                          style={{ background: "none", border: "none", padding: "8px 12px", cursor: "pointer", fontSize: "18px" }}
                          onClick={() => item.qty > 1 ? dispatch({ type: "UPDATE_QTY", id: item._id, size: item.size, qty: item.qty - 1 }) : dispatch({ type: "REMOVE", id: item._id, size: item.size })}
                        >-</button>
                        <span style={{ minWidth: "30px", textAlign: "center", fontWeight: 600 }}>{item.qty}</span>
                        <button 
                          disabled={!canIncrease}
                          style={{ background: "none", border: "none", padding: "8px 12px", cursor: canIncrease ? "pointer" : "not-allowed", fontSize: "18px", opacity: canIncrease ? 1 : 0.4 }}
                          onClick={() => canIncrease && dispatch({ type: "UPDATE_QTY", id: item._id, size: item.size, qty: item.qty + 1 })}
                        >+</button>
                      </div>

                      <button 
                        onClick={() => dispatch({ type: "REMOVE", id: item._id, size: item.size })}
                        style={{ background: "none", border: "none", color: CRIMSON, fontSize: "13px", cursor: "pointer", textDecoration: "underline" }}
                      >Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}

            <div style={{ marginTop: "30px" }}>
              <button 
                onClick={() => dispatch({ type: "CLEAR" })}
                style={{ background: "none", border: "none", color: THEME.textMuted, cursor: "pointer", fontSize: "14px" }}
              >Clear Shopping Bag</button>
            </div>
          </div>

          {/* SUMMARY */}
          <div>
            <div className="cart-summary-mobile" style={{ padding: "clamp(20px, 5vw, 30px)", background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", position: "sticky", top: "100px" }}>
              <h2 style={{ fontFamily: "'Poppins', sans-serif", fontSize: "18px", fontWeight: 700, marginBottom: "24px" }}>Order Summary</h2>
              
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: THEME.textMuted }}>
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", color: THEME.textMuted }}>
                <span>Shipping</span>
                <span style={{ color: shipping === 0 ? "#2ecc71" : THEME.text }}>{shipping === 0 ? "FREE" : formatPrice(shipping)}</span>
              </div>

              {shipping > 0 && (
                <p style={{ fontSize: "12px", color: THEME.textMuted, marginBottom: "20px", fontStyle: "italic" }}>
                  Add {formatPrice(Math.max(0, SHIPPING_FREE_THRESHOLD - subtotal))} more for free shipping
                </p>
              )}

              {shipping === 0 && (
                <div style={{ background: "#2ecc7110", color: "#2ecc71", padding: "8px 12px", borderRadius: "8px", fontSize: "12px", marginBottom: "20px", display: "flex", gap: "8px", alignItems: "center" }}>
                  Free shipping applied!
                </div>
              )}

              <div style={{ display: "flex", justifyContent: "space-between", margin: "24px 0", paddingTop: "20px", borderTop: `1px solid ${THEME.border}` }}>
                <span style={{ fontWeight: 700, fontSize: "18px" }}>Total</span>
                <span style={{ fontWeight: 800, fontSize: "22px", color: GOLD }}>{formatPrice(total)}</span>
              </div>

              <BtnPrimary onClick={() => setPage("Checkout")} style={{ width: "100%", justifyContent: "center", borderRadius: "12px", padding: "16px" }}>
                Proceed to Checkout →
              </BtnPrimary>

              <div style={{ marginTop: "24px", display: "grid", gap: "10px" }}>
                <p style={{ fontSize: "11px", color: THEME.textMuted }}>Secure and encrypted checkout</p>
                <p style={{ fontSize: "11px", color: THEME.textMuted }}>Estimated delivery in 3-5 days</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}