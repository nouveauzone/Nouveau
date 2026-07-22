import { useContext, useEffect, useState } from "react";
import Footer from "../components/Footer";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext } from "../context/AuthContext";
import { ToastContext } from "../context/Providers";
import { CurrencyContext } from "../context/CurrencyContext";
import { THEME } from "../styles/theme";
import Icons from "../components/Icons";
import StarRating from "../components/StarRating";
import OrnamentDivider from "../components/OrnamentDivider";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import API from "../services/apiService";
import { fixImageUrl } from "../utils/imageUrl";
import { SHIPPING_FREE_THRESHOLD, normalizeCategory } from "../data/constants";

const BAD_TEXT_RE = /(\/static\/media|\.(jpeg|jpg|png|webp|svg)$|\.[a-f0-9]{8,}$|^https?:\/\/|\\)/i;

const cleanText = (value, fallback = "") => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || BAD_TEXT_RE.test(raw) || raw.length > 140) return fallback;
  return raw;
};

const cleanCategory = (value) => {
  const normalized = normalizeCategory(value);
  if (normalized === "Indian Ethnic Wear" || normalized === "Indian Western Wear") return normalized;
  return "Nouveau Collection";
};

const cleanImages = (images) => {
  if (!Array.isArray(images) || !images.length) return ["/product1.jpeg"];
  const filtered = images.filter((img) => typeof img === "string" && img.trim().length > 0 && !img.includes("\\"));
  return filtered.length ? filtered : ["/product1.jpeg"];
};

const normalizeSizeLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^free\s*size$/i.test(raw)) return "Free Size";
  return raw.toUpperCase();
};

const normalizeSizeInventory = (sizes) => {
  if (!Array.isArray(sizes) || !sizes.length) {
    return [{ size: "Free Size", quantity: 0 }];
  }

  const rows = new Map();

  sizes.forEach((entry) => {
    if (!entry) return;

    if (typeof entry === "string") {
      const size = normalizeSizeLabel(entry);
      if (!size) return;
      if (!rows.has(size)) rows.set(size, { size, quantity: 0 });
      return;
    }

    const size = normalizeSizeLabel(entry?.size);
    if (!size) return;
    const quantity = Math.max(0, Number(entry?.quantity ?? entry?.stock) || 0);
    rows.set(size, { size, quantity });
  });

  const normalized = Array.from(rows.values());
  return normalized.length ? normalized : [{ size: "Free Size", quantity: 0 }];
};

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display: "flex", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map(s => (
        <button key={s}
          onMouseEnter={() => setHover(s)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(s)}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "26px", color: (hover || value) >= s ? "#D4AF37" : "#ddd", transition: "color 0.15s", padding: "2px" }}>
          ★
        </button>
      ))}
    </div>
  );
}

export default function ProductPage({ product, setPage }) {
  const initialSizes = normalizeSizeInventory(product?.sizes);
  const [selectedSize, setSelectedSize] = useState(initialSizes.find((entry) => entry.quantity > 0)?.size || initialSizes[0]?.size || "Free Size");
  const [qty, setQty] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeImg, setActiveImg] = useState(0);
  const [activeTab, setActiveTab] = useState("desc");
  const [reviews, setReviews] = useState(Array.isArray(product?.reviews) ? product.reviews : []);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);

  const { dispatch: cartDispatch } = useContext(CartContext);
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { isAuthenticated, user } = useContext(AuthContext);
  const { formatPrice } = useContext(CurrencyContext);
  const toast = useContext(ToastContext);

  const safeTitle = cleanText(product?.title, "Nouveau Signature Piece");
  const safeCategory = cleanCategory(product?.category);
  const safeSubcategory = cleanText(product?.subcategory, "Women's Wear");
  const safeMaterial = cleanText(product?.material || "", "");
  const safeDescription = cleanText(
    product?.description,
    "Elegant premium womenswear crafted with attention to detail and all-day comfort."
  );
  const safeImages = cleanImages(product?.images).map((img) => fixImageUrl(img));
  const sizeInventory = normalizeSizeInventory(product?.sizes);
  const safeSizes = sizeInventory.map((entry) => entry.size);
  const safePrice = Number(product?.price) || 0;
  const safeOriginalPrice = Number(product?.originalPrice) || safePrice;
  const safeDiscount = Number(product?.discount) || 0;
  const safeStock = sizeInventory.reduce((sum, entry) => sum + Number(entry.quantity || 0), 0);
  const selectedSizeStock = sizeInventory.find((entry) => entry.size === selectedSize)?.quantity || 0;
  const isSoldOut = safeStock <= 0;

  useEffect(() => {
    if (!product) return;
    if (!safeSizes.includes(selectedSize)) {
      setSelectedSize(sizeInventory.find((entry) => entry.quantity > 0)?.size || safeSizes[0] || "Free Size");
      setQty(1);
      return;
    }

    if (selectedSizeStock <= 0) {
      setQty(1);
      return;
    }

    setQty((current) => Math.min(Math.max(1, current), selectedSizeStock));
  }, [product, safeSizes, selectedSize, selectedSizeStock]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!product) return null;

  const wished = wishlist.some(w => w._id === product._id);
  const avgRating = reviews.length
    ? +(reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating || 0;
  const alreadyReviewed = reviews.some(r => r.user?._id === user?._id || r.user === user?._id);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast("Please login first to add items to cart", "error");
      setPage("Auth");
      return;
    }
    if (selectedSizeStock <= 0) { toast("This size is sold out", "error"); return; }
    const finalSize = typeof selectedSize === 'object' ? selectedSize?.size : String(selectedSize || "");

    cartDispatch({
      type: "ADD",
      item: {
        ...product,
        sizes: sizeInventory,
        size: finalSize,
        stockQuantity: selectedSizeStock,
        qty,
      },
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleSubmitReview = async () => {
    if (!isAuthenticated) { toast("Please login to write a review", "error"); setPage("Auth"); return; }
    if (!myRating) { toast("Please select a star rating", "error"); return; }
    if (!myComment.trim()) { toast("Please write a comment", "error"); return; }
    setSubmitting(true);
    try {
      const res = await API.addReview(product._id, { rating: myRating, comment: myComment.trim() });
      setReviews(Array.isArray(res.reviews) ? res.reviews : []);
      setMyRating(0); setMyComment("");
      toast("Review submitted! ⭐ Thank you");
    } catch {
      const localReview = {
        _id: "r" + Date.now(),
        user: user?._id,
        name: user?.name || "You",
        rating: myRating,
        comment: myComment.trim(),
        date: new Date().toISOString()
      };
      setReviews(prev => [localReview, ...(Array.isArray(prev) ? prev : [])]);
      setMyRating(0); setMyComment("");
      toast("Review added! ⭐");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh", color: THEME.text }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: isMobile ? "24px 16px" : "48px 40px" }}>

        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "36px", flexWrap: "wrap" }}>
          <button onClick={() => setPage("Shop")} style={{ background: "none", border: "none", color: THEME.textMuted, cursor: "pointer", fontSize: "13px", fontFamily: "'Poppins',sans-serif" }}>← Shop</button>
          <span style={{ color: THEME.textLight }}>/</span>
          <span style={{ color: THEME.textLight, fontSize: "13px", fontFamily: "'Poppins',sans-serif" }}>{safeCategory}</span>
          <span style={{ color: THEME.textLight }}>/</span>
          <span style={{ color: THEME.crimson, fontSize: "13px", fontFamily: "'Poppins',sans-serif", fontWeight: 600 }}>{safeTitle}</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "24px" : "60px", alignItems: "start" }} className="grid-2col">

          {/* Images */}
          <div>
            <div style={{ borderRadius: "16px", overflow: "hidden", marginBottom: "12px", boxShadow: "0 20px 60px rgba(0,0,0,0.10)" }}>
              <img
                src={safeImages[activeImg] || safeImages[0]}
                alt={safeTitle}
                style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
                onError={e => e.target.src = "/product1.jpeg"} />
            </div>
            {safeImages.length > 1 && (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {safeImages.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    style={{ border: `2px solid ${i === activeImg ? THEME.crimson : THEME.border}`, borderRadius: "8px", overflow: "hidden", padding: 0, cursor: "pointer", width: "72px", height: "90px", flexShrink: 0 }}>
                    <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.src = "/product1.jpeg"} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div style={{ position: "sticky", top: "100px" }}>
            <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
              {product.isNew && <span style={{ background: THEME.crimson, color: "#fff", fontSize: "9px", letterSpacing: "2px", padding: "5px 14px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, borderRadius: "99px" }}>NEW ARRIVAL</span>}
              {safeDiscount > 0 && <span style={{ background: THEME.gold, color: "#fff", fontSize: "9px", padding: "5px 14px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, borderRadius: "99px" }}>SAVE {safeDiscount}%</span>}
              <span style={{ background: `${THEME.crimson}15`, color: THEME.crimson, fontSize: "9px", padding: "5px 14px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, borderRadius: "99px" }}>{safeCategory}</span>
            </div>

            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(24px,3vw,34px)", fontWeight: 700, marginBottom: "12px", lineHeight: 1.2 }}>{safeTitle}</h1>

            {avgRating > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <StarRating rating={avgRating} count={reviews.length} />
                <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>{avgRating}/5</span>
              </div>
            )}

            <OrnamentDivider />

            {/* Price */}
            <div style={{ display: "flex", alignItems: "baseline", gap: "14px", margin: "14px 0 18px" }}>
              <span style={{ color: THEME.crimson, fontSize: "32px", fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>{formatPrice(safePrice)}</span>
              {safeOriginalPrice > safePrice && (
                <>
                  <span style={{ color: THEME.textLight, textDecoration: "line-through", fontSize: "18px" }}>{formatPrice(safeOriginalPrice)}</span>
                  <span style={{ color: "#2d6a4f", fontSize: "13px", fontWeight: 700, fontFamily: "'Poppins',sans-serif" }}>Save {formatPrice(safeOriginalPrice - safePrice)}</span>
                </>
              )}
            </div>

            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", color: THEME.textMuted, lineHeight: 1.85, marginBottom: "24px" }}>{safeDescription}</p>

            {/* Size */}
            <div style={{ marginBottom: "20px" }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.crimson, marginBottom: "10px", fontWeight: 700 }}>SELECT SIZE</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {sizeInventory.map((sizeEntry) => (
                  <button key={sizeEntry.size} onClick={() => setSelectedSize(sizeEntry.size)}
                    disabled={sizeEntry.quantity <= 0}
                    style={{ padding: "10px 18px", border: sizeEntry.size === selectedSize ? `2px solid ${THEME.crimson}` : `1px solid ${THEME.border}`, background: sizeEntry.size === selectedSize ? `${THEME.crimson}12` : "transparent", color: sizeEntry.size === selectedSize ? THEME.crimson : THEME.textMuted, cursor: sizeEntry.quantity <= 0 ? "not-allowed" : "pointer", fontSize: "13px", fontFamily: "'Poppins',sans-serif", borderRadius: "8px", fontWeight: sizeEntry.size === selectedSize ? 700 : 400, transition: "all 0.2s", opacity: sizeEntry.quantity <= 0 ? 0.55 : 1 }}>
                    {sizeEntry.size} ({sizeEntry.quantity <= 0 ? "Sold Out" : sizeEntry.quantity < 3 ? `Only ${sizeEntry.quantity} left` : `${sizeEntry.quantity} left`})
                  </button>
                ))}
              </div>
            </div>

            {/* Qty */}
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px" }}>
              {isSoldOut && <span style={{ background: "rgba(183, 28, 28, 0.1)", color: THEME.crimson, padding: "8px 16px", borderRadius: "8px", fontSize: "11px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", border: `1.5px solid ${THEME.crimson}40`, boxShadow: "0 4px 12px rgba(183, 28, 28, 0.08)" }}>Sold Out</span>}
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.crimson, fontWeight: 700 }}>QTY</p>
              <div style={{ display: "flex", alignItems: "center", border: `1px solid ${THEME.border}`, borderRadius: "10px", overflow: "hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q - 1))} disabled={qty <= 1} style={{ background: "none", border: "none", color: THEME.text, padding: "10px 16px", cursor: qty <= 1 ? "not-allowed" : "pointer", fontSize: "18px", opacity: qty <= 1 ? 0.4 : 1 }}>−</button>
                <span style={{ padding: "10px 20px", borderLeft: `1px solid ${THEME.border}`, borderRight: `1px solid ${THEME.border}`, fontFamily: "'Poppins',sans-serif", fontWeight: 600 }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(selectedSizeStock, q + 1))} disabled={qty >= selectedSizeStock || selectedSizeStock <= 0} style={{ background: "none", border: "none", color: THEME.text, padding: "10px 16px", cursor: qty >= selectedSizeStock || selectedSizeStock <= 0 ? "not-allowed" : "pointer", fontSize: "18px", opacity: qty >= selectedSizeStock || selectedSizeStock <= 0 ? 0.4 : 1 }}>+</button>
              </div>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textLight }}>
                {selectedSizeStock > 0 ? `${selectedSizeStock} left in ${selectedSize}` : `${selectedSize} Sold Out`}
              </p>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "12px" }}>
              <BtnPrimary
                onClick={handleAddToCart}
                disabled={isSoldOut || selectedSizeStock <= 0}
                style={{
                  flex: 1,
                  justifyContent: "center",
                  borderRadius: "12px",
                  ...(addedToCart ? { background: THEME.crimsonDark } : {}),
                }}>
                {isSoldOut || selectedSizeStock <= 0 ? "Sold Out" : addedToCart ? "✓ Added to Cart!" : "Add to Cart 🛍️"}
              </BtnPrimary>
              <button onClick={() => { toggleWishlist(product); toast(wished ? "Removed from wishlist" : "Saved to wishlist ❤️"); }}
                style={{
                  padding: "12px 14px",
                  border: `1.5px solid ${wished ? THEME.crimson : THEME.border}`,
                  background: wished ? `${THEME.crimson}12` : "transparent",
                  color: wished ? THEME.crimson : THEME.textMuted,
                  cursor: "pointer",
                  borderRadius: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.3s",
                }}>
                <Icons.Heart filled={wished} />
              </button>
            </div>
            <BtnOutline onClick={() => { if (!isSoldOut && selectedSizeStock > 0) { handleAddToCart(); setPage("Checkout"); } }} color={THEME.gold} style={{ width: "100%", justifyContent: "center", borderRadius: "12px", opacity: isSoldOut || selectedSizeStock <= 0 ? 0.55 : 1, pointerEvents: isSoldOut || selectedSizeStock <= 0 ? "none" : "auto" }}>
              {isSoldOut || selectedSizeStock <= 0 ? "Sold Out" : "Buy Now ⚡"}
            </BtnOutline>

            {/* Trust badges */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "24px" }}>
              {[["🚚", `Free Shipping ${formatPrice(SHIPPING_FREE_THRESHOLD)}+`], ["✅", "Authentic Fabric"], ["⚡", "Fast Dispatch"], ["🔒", "Secure Payment"]].map(([icon, t]) => (
                <div key={t} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 12px", background: THEME.bgDark, border: `1px solid ${THEME.border}`, borderRadius: "10px" }}>
                  <span style={{ fontSize: "14px" }}>{icon}</span>
                  <span style={{ fontSize: "11px", color: THEME.textMuted, fontFamily: "'Poppins',sans-serif" }}>{t}</span>
                </div>
              ))}
            </div>


            {/* ── RETURN & EXCHANGE POLICY ── */}
            <div style={{
              marginTop: "24px",
              background: THEME.bgCard,
              border: `1px solid ${THEME.border}`,
              borderRadius: "14px",
              padding: "18px 20px",
              display: "flex",
              gap: "14px",
              alignItems: "flex-start",
            }}>
              <div style={{ fontSize: "22px", flexShrink: 0, lineHeight: 1 }}>⚠️</div>
              <div>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "2px", color: "#C9506A", fontWeight: 700, marginBottom: "6px", textTransform: "uppercase" }}>
                  Return & Exchange Policy
                </p>
                <ul style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, lineHeight: 1.7, paddingLeft: "18px", margin: 0 }}>
                  <li>Return: In case of returning the product, 30% restocking fees will be deducted from the product price paid by the customer.</li>
                  <li>Exchange: In case of exchange, one-side courier charges will be borne by the customer.</li>
                  <li>Products must be returned unused and in original packaging.</li>
                  <li>Refunds will be processed after quality inspection of the returned product.</li>
                  <li>All sales are final</li>
                  <li>Refund will be initiated between 5-7 business days</li>
                </ul>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight, marginTop: "8px", marginBottom: "6px" }}>
                  🌍 International Buyer - For buying our product in your country, Please communicate with us on WhatsApp.
                </p>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight, marginTop: "2px" }}>
                  For queries: WhatsApp <strong style={{ color: "#D4AF37" }}>+91 7733881577</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ marginTop: "64px" }}>
          <div style={{ display: "flex", borderBottom: `1px solid ${THEME.border}`, marginBottom: "36px", overflowX: "auto" }}>
            {[["desc", "Description"], ["reviews", `Reviews (${reviews.length})`], ["size", "Size Guide"]].map(([id, label]) => (
              <button key={id} onClick={() => setActiveTab(id)}
                style={{ padding: "14px 28px", background: "none", border: "none", borderBottom: activeTab === id ? `2px solid ${THEME.crimson}` : "2px solid transparent", color: activeTab === id ? THEME.crimson : THEME.textMuted, cursor: "pointer", fontSize: "12px", letterSpacing: "2px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, whiteSpace: "nowrap" }}>
                {label}
              </button>
            ))}
          </div>

          {activeTab === "desc" && (
            <div style={{ maxWidth: "700px" }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "15px", color: THEME.textMuted, lineHeight: 1.9 }}>{safeDescription}</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "28px" }}>
                {[["Category", safeCategory], ["Subcategory", safeSubcategory], ["Available Sizes", safeSizes.join(", ")], ["Stock", safeStock + " units"], ...(safeMaterial ? [["Material / Fabric", safeMaterial]] : [])].map(([l, v]) => (
                  <div key={l} style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "10px", padding: "14px 18px" }}>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", color: THEME.textLight, letterSpacing: "2px", marginBottom: "4px" }}>{l.toUpperCase()}</p>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", color: THEME.text, fontWeight: 600 }}>{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "reviews" && (
            <div style={{ maxWidth: "800px" }}>
              {!alreadyReviewed && (
                <div style={{ background: THEME.bgCard, border: `1.5px solid ${THEME.crimson}30`, borderRadius: "16px", padding: "28px", marginBottom: "32px" }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", marginBottom: "20px" }}>
                    {isAuthenticated ? "Write a Review" : "Login to write a review"}
                  </h3>
                  {isAuthenticated ? (
                    <>
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, marginBottom: "10px", fontWeight: 700 }}>YOUR RATING</p>
                        <StarPicker value={myRating} onChange={setMyRating} />
                      </div>
                      <div style={{ marginBottom: "16px" }}>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, marginBottom: "10px", fontWeight: 700 }}>YOUR REVIEW</p>
                        <textarea rows={4} value={myComment} onChange={e => setMyComment(e.target.value)}
                          placeholder="Share your experience..."
                          style={{ width: "100%", background: THEME.bg, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "12px 16px", fontSize: "14px", outline: "none", fontFamily: "'Poppins',sans-serif", borderRadius: "10px", resize: "vertical" }} />
                      </div>
                      <BtnPrimary onClick={handleSubmitReview} disabled={submitting} style={{ borderRadius: "10px" }}>
                        {submitting ? "Submitting..." : "Submit Review ⭐"}
                      </BtnPrimary>
                    </>
                  ) : (
                    <BtnPrimary onClick={() => setPage("Auth")} style={{ borderRadius: "10px" }}>Login to Review</BtnPrimary>
                  )}
                </div>
              )}

              {reviews.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px", background: THEME.bgCard, borderRadius: "14px", border: `1px solid ${THEME.border}` }}>
                  <div style={{ fontSize: "40px", marginBottom: "12px" }}>⭐</div>
                  <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", color: THEME.textMuted }}>No reviews yet</p>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textLight, marginTop: "6px" }}>Be the first to review this product!</p>
                </div>
              ) : reviews.map((r, i) => (
                <div key={r._id || i} style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", padding: "22px 24px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: `linear-gradient(135deg,${THEME.crimson},${THEME.gold})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "14px", fontWeight: 700 }}>
                        {(r.name || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: 700 }}>{r.name || "Customer"}</p>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>
                          {r.date ? new Date(r.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "Recent"}
                        </p>
                      </div>
                    </div>
                    <StarRating rating={r.rating} />
                  </div>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", color: THEME.textMuted, lineHeight: 1.7 }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "size" && (
            <div style={{ maxWidth: "700px" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", background: THEME.bgCard, borderRadius: "14px", overflow: "hidden", border: `1px solid ${THEME.border}` }}>
                  <thead>
                    <tr style={{ background: `${THEME.crimson}12` }}>
                      {["Size", "Bust (inches)", "Waist (inches)", "Hip (inches)"].map(h => (
                        <th key={h} style={{ padding: "14px 18px", fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, textAlign: "left", fontWeight: 700 }}>{h.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[["XS", "30-32", "24-26", "32-34"], ["S", "32-34", "26-28", "34-36"], ["M", "34-36", "28-30", "36-38"], ["L", "36-38", "30-32", "38-40"], ["XL", "38-40", "32-34", "40-42"], ["XXL", "40-42", "34-36", "42-44"]].map(([size, ...vals]) => (
                      <tr key={size} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                        <td style={{ padding: "13px 18px", fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: 700, color: THEME.crimson }}>{size}</td>
                        {vals.map((v, i) => <td key={i} style={{ padding: "13px 18px", fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>{v}"</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ background: `${THEME.gold}10`, border: `1px solid ${THEME.gold}30`, borderRadius: "10px", padding: "16px 20px", marginTop: "20px" }}>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.goldDark, lineHeight: 1.7 }}>
                  💡 <strong>Tip:</strong> If between sizes, size up for ethnic wear. Measure at the fullest part of your bust, narrowest waist, and fullest hips.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
