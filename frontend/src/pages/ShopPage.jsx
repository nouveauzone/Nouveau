import { useState, useEffect } from "react";
import { PRODUCTS as INITIAL_PRODUCTS } from "../data/products";
import { THEME } from "../styles/theme";
import ProductCard from "../components/ProductCard";
import Footer from "../components/Footer";
import API from "../services/apiService";
import { SHIPPING_FREE_THRESHOLD, normalizeCategory } from "../data/constants";
import { fixImageUrl } from "../utils/imageUrl";

const CATS = ["All", "Indian Ethnic Wear", "Indian Western Wear"];

const seedById = INITIAL_PRODUCTS.reduce((acc, item) => {
  acc[item._id] = item;
  return acc;
}, {});

const norm = (p) => {
  const fallbackSeed = seedById[p?._id];
  const rawSizes = Array.isArray(p?.sizes) ? p.sizes : [];
  const normalizedSizes = rawSizes
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const size = String(entry.size || "").trim();
      if (!size) return null;
      const quantity = Math.max(0, Number(entry.quantity ?? entry.stock) || 0);
      return { size, quantity };
    })
    .filter(Boolean);

  if (normalizedSizes.length === 0) {
    const legacyStock = p?.stock != null ? Math.max(0, Number(p.stock) || 0) : null;
    const seedLegacyStock = fallbackSeed?.stock != null ? Math.max(0, Number(fallbackSeed.stock) || 0) : null;
    const migrated = legacyStock != null ? legacyStock : seedLegacyStock != null ? seedLegacyStock : 0;
    normalizedSizes.push({ size: "Free Size", quantity: migrated });
  }

  return {
    ...p,
    category: normalizeCategory(p.category),
    images: Array.isArray(p.images) && p.images.length ? p.images : ["/product1.jpeg"],
    price: Number(p.price) || 0,
    originalPrice: Number(p.originalPrice) || Number(p.price) || 0,
    rating: Number(p.rating) || 0,
    discount: Number(p.discount) || 0,
    sizes: normalizedSizes,
  };
};

// Get products from localStorage OR fallback to built-in 16 products
const getLocalProducts = () => {
  try {
    const s = localStorage.getItem("nouveau_local_products");
    if (s) {
      const p = JSON.parse(s);
      if (Array.isArray(p) && p.length > 0) return p.map(norm);
    }
  } catch { }
  return INITIAL_PRODUCTS.map(norm);
};

export default function ShopPage({ setPage, setSelectedProduct, initialCategory }) {

const mergeById = (primary = [], secondary = []) => {
  const seen = new Set();
  const merged = [];
  [...primary, ...secondary].forEach((item) => {
    const id = String(item?._id || item?.id || "");
    if (!id || seen.has(id)) return;
    seen.add(id);
    merged.push(item);
  });
  return merged;
};
  const [products, setProducts] = useState(getLocalProducts);
  const [cat, setCat] = useState(initialCategory || "All");
  const [search, setSearch] = useState("");
  const [maxPrice, setMaxPrice] = useState(20000);
  const [sortBy, setSortBy] = useState("featured");

  // ── Background sync: try backend, silently fallback to local ─────────────
  useEffect(() => {
    let alive = true;

    API.getProducts({ limit: 200 })
      .then((data) => {
        if (!alive) return;
        const list = data?.products?.length ? data.products
          : Array.isArray(data) && data.length ? data : null;
        if (list && list.length > 0) {
          const normalized = list.map(norm);
          setProducts(normalized);
          try { localStorage.setItem("nouveau_local_products", JSON.stringify(normalized)); } catch { }
        }
        // else: backend returned empty → keep showing local products (no error shown)
      })
      .catch(() => {
        // Backend down/slow → silently keep local products, never show error
      });

    // Listen for admin panel changes
    const onStorage = (e) => {
      if (e.key === "nouveau_local_products" && e.newValue) {
        try {
          const p = JSON.parse(e.newValue);
          if (Array.isArray(p) && p.length > 0) setProducts(p.map(norm));
        } catch { }
      }
    };
    const onProductsUpdated = () => {
      try {
        const s = localStorage.getItem("nouveau_local_products");
        if (!s) return;
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length > 0) setProducts(p.map(norm));
      } catch { }
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("nouveau:products-updated", onProductsUpdated);
    return () => {
      alive = false;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("nouveau:products-updated", onProductsUpdated);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      try {
        const q = String(e?.detail?.query || "").trim();
        if (q) setSearch(q);
      } catch (err) { }
    };
    window.addEventListener("nouveau:shop-search", handler);
    return () => window.removeEventListener("nouveau:shop-search", handler);
  }, []);

  // ── Filter + sort ─────────────────────────────────────────────────────────
  let filtered = products.filter((p) => {
    const q = search.trim().toLowerCase();
    if (q) {
      const title = String(p.title || "").toLowerCase();
      const subcategory = String(p.subcategory || "").toLowerCase();
      const category = String(p.category || "").toLowerCase();
      const description = String(p.description || "").toLowerCase();
      if (!(title.includes(q) || subcategory.includes(q) || category.includes(q) || description.includes(q))) return false;
    }
    if (cat !== "All" && p.category !== cat) return false;
    if ((p.price || 0) > maxPrice) return false;
    return true;
  });

  if (sortBy === "price-asc") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "price-desc") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);
  if (sortBy === "newest") filtered = [...filtered].filter(p => p.isNew);
  if (sortBy === "discount") filtered = [...filtered].sort((a, b) => b.discount - a.discount);

  const ethnicCount = products.filter(p => p.category === "Indian Ethnic Wear").length;
  const westernCount = products.filter(p => p.category === "Indian Western Wear").length;
  const totalCount = products.length;

  const clearFilters = () => { setCat("All"); setSearch(""); setMaxPrice(20000); setSortBy("featured"); };
  const hasFilters = cat !== "All" || search.trim() !== "" || maxPrice < 20000 || sortBy !== "featured";

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh" }}>
      <style>{`
        .sp-layout { display: flex; gap: 28px; max-width: 1400px; margin: 0 auto; padding: 40px var(--container-padding); }
        .sp-sidebar { width: 220px; flex-shrink: 0; }
        .sp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(clamp(140px,36vw,250px),1fr)); gap: clamp(10px,2.5vw,18px); }
        @media(max-width:768px){
          .sp-sidebar{display:none!important;}
          .sp-layout{flex-direction:column;gap:0;}
          .sp-grid{grid-template-columns:repeat(2,1fr)!important;gap:10px!important;}
          .sp-desktop-sort{display:none!important;}
        }
        @media(max-width:380px){.sp-grid{grid-template-columns:1fr!important;}}
        .sp-tab{padding:13px clamp(10px,2.5vw,22px);background:none;border:none;border-bottom:3px solid transparent;cursor:pointer;font-size:10px;letter-spacing:2px;text-transform:uppercase;font-family:'Poppins',sans-serif;font-weight:600;transition:all 0.2s;white-space:nowrap;min-height:44px;color:${THEME.textMuted};}
        .sp-tab.on{border-bottom-color:${THEME.crimson};color:${THEME.crimson};}
        .sp-sel{background:${THEME.bgCard};border:1px solid ${THEME.border};color:${THEME.text};padding:9px 12px;border-radius:10px;font-family:'Poppins',sans-serif;font-size:12px;cursor:pointer;min-height:40px;outline:none;}
        .sp-mob-bar{display:none;background:${THEME.bgCard};border-bottom:1px solid ${THEME.border};padding:10px 16px;align-items:center;justify-content:space-between;gap:10px;}
        @media(max-width:768px){.sp-mob-bar{display:flex!important;}}
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg,${THEME.crimson},${THEME.crimsonDark})`, padding: "clamp(40px, 8vw, 80px) var(--container-padding)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: 0, bottom: "-30px", opacity: 0.06 }}>
          <img src={fixImageUrl("/nouveau-logo.png")} alt="" style={{ width: "200px", height: "260px", objectFit: "contain", filter: "brightness(10)" }} />
        </div>
        <div style={{ maxWidth: "1400px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "6px", color: THEME.gold, marginBottom: "8px", textTransform: "uppercase" }}>Nouveau™ Store</p>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "clamp(26px,5vw,48px)", fontWeight: 700, color: "#fff", marginBottom: "6px" }}>
            {cat === "All" ? "All Collections" : cat}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "13px", fontFamily: "'Poppins',sans-serif" }}>
            {filtered.length} of {totalCount} products · Women Only
          </p>
        </div>
      </div>

      {/* ── CATEGORY TABS ──────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${THEME.border}`, background: THEME.bgCard, position: "sticky", top: "72px", zIndex: 50 }}>
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(16px,5vw,40px)", display: "flex", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
          {CATS.map(c => {
            const count = c === "All" ? totalCount : c === "Indian Ethnic Wear" ? ethnicCount : westernCount;
            return (
              <button key={c} className={`sp-tab${cat === c ? " on" : ""}`} onClick={() => setCat(c)}>
                {c === "All" ? `All (${count})` : c === "Indian Ethnic Wear" ? `Ethnic (${count})` : `Western (${count})`}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── MOBILE FILTER BAR ──────────────────────────────────────────────── */}
      <div className="sp-mob-bar">
        <input
          type="search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search"
          style={{ flex: 1, minWidth: 0, background: THEME.bg, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "9px 10px", borderRadius: "10px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", outline: "none" }}
        />
        <select className="sp-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="featured">Featured</option>
          <option value="newest">New Arrivals</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="rating">Top Rated</option>
          <option value="discount">Best Discount</option>
        </select>
      </div>

      {/* ── MAIN LAYOUT ────────────────────────────────────────────────────── */}
      <div className="sp-layout">

        {/* Sidebar */}
        <aside className="sp-sidebar">
          <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", padding: "20px", position: "sticky", top: "130px" }}>

            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.crimson, textTransform: "uppercase", marginBottom: "14px", fontWeight: 700 }}>Category</p>
            {CATS.map(c => {
              const count = c === "All" ? totalCount : c === "Indian Ethnic Wear" ? ethnicCount : westernCount;
              return (
                <button key={c} onClick={() => setCat(c)} style={{ display: "block", width: "100%", textAlign: "left", background: cat === c ? `${THEME.crimson}10` : "none", border: "none", color: cat === c ? THEME.crimson : THEME.textMuted, cursor: "pointer", padding: "9px 12px", fontSize: "13px", fontFamily: "'Poppins',sans-serif", fontWeight: cat === c ? 700 : 400, borderLeft: cat === c ? `2px solid ${THEME.crimson}` : "2px solid transparent", borderRadius: "0 6px 6px 0", transition: "all 0.2s", minHeight: "40px", marginBottom: "4px" }}>
                  {c === "All" ? `All Products (${count})` : c === "Indian Ethnic Wear" ? `Ethnic Wear (${count})` : `Western Wear (${count})`}
                </button>
              );
            })}

            <div style={{ borderTop: `1px solid ${THEME.border}`, marginTop: "18px", paddingTop: "18px" }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.crimson, textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Max Price</p>
              <input type="range" min="500" max="20000" step="250" value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
                style={{ width: "100%", accentColor: THEME.crimson, cursor: "pointer" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textLight, marginTop: "6px" }}>
                <span>₹500</span><span style={{ color: THEME.crimson, fontWeight: 700 }}>₹{maxPrice.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div style={{ borderTop: `1px solid ${THEME.border}`, marginTop: "18px", paddingTop: "18px" }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.crimson, textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Search</p>
              <input
                type="search"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                style={{ width: "100%", background: THEME.bgCard, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "9px 12px", borderRadius: "10px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", outline: "none", minHeight: "40px" }}
              />
            </div>

            <div style={{ borderTop: `1px solid ${THEME.border}`, marginTop: "18px", paddingTop: "18px" }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.crimson, textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>Sort By</p>
              <select className="sp-sel" value={sortBy} onChange={e => setSortBy(e.target.value)} style={{ width: "100%" }}>
                <option value="featured">Featured</option>
                <option value="newest">New Arrivals</option>
                <option value="price-asc">Price: Low → High</option>
                <option value="price-desc">Price: High → Low</option>
                <option value="rating">Top Rated</option>
                <option value="discount">Best Discount</option>
              </select>
            </div>

            {hasFilters && (
              <button onClick={clearFilters} style={{ width: "100%", marginTop: "14px", background: "none", border: `1px solid ${THEME.crimson}`, color: THEME.crimson, padding: "9px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 600, minHeight: "40px" }}>
                ✕ Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Products */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="sp-desktop-sort" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted }}>
              Showing <strong style={{ color: THEME.text }}>{filtered.length}</strong> of {totalCount} products
            </p>
            <select className="sp-sel" value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="featured">Featured</option>
              <option value="newest">New Arrivals</option>
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
              <option value="rating">Top Rated</option>
              <option value="discount">Best Discount</option>
            </select>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: THEME.bgCard, borderRadius: "16px", border: `1px solid ${THEME.border}` }}>
              <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: THEME.textMuted, marginBottom: "10px" }}>No products found</p>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textLight, marginBottom: "20px" }}>Try removing filters</p>
              <button onClick={clearFilters} style={{ background: THEME.crimson, color: "#fff", border: "none", padding: "12px 28px", borderRadius: "99px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 700, minHeight: "44px" }}>
                Show All Products
              </button>
            </div>
          ) : (
            <div className="sp-grid">
              {filtered.map((p, i) => (
                <ProductCard key={`${p._id || "p"}-${i}`} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} />
              ))}
            </div>
          )}

          {filtered.length > 0 && (
            <div style={{ textAlign: "center", marginTop: "32px", padding: "16px", background: THEME.bgCard, borderRadius: "12px", border: `1px solid ${THEME.border}` }}>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted }}>
                ✅ {filtered.length} products shown · <span style={{ color: THEME.crimson, fontWeight: 600 }}>Free shipping on orders above ₹{SHIPPING_FREE_THRESHOLD.toLocaleString("en-IN")}</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}
