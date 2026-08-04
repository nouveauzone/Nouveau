import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import Hero from "../components/Hero";
import { PRODUCTS as INITIAL_PRODUCTS } from "../data/products";
import { THEME } from "../styles/theme";
import ProductCard from "../components/ProductCard";
import NouveauLogo from "../components/Logo";
import Icons from "../components/Icons";
import OrnamentDivider from "../components/OrnamentDivider";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import Footer from "../components/Footer";
import API from "../services/apiService";
import { SHIPPING_FREE_THRESHOLD, normalizeCategory } from "../data/constants";
import { fixImageUrl } from "../utils/imageUrl";

const normalizeProduct = (product = {}) => ({
  ...product,
  category: normalizeCategory(product?.category),
  images: Array.isArray(product?.images) && product.images.length
    ? product.images.map((image) => fixImageUrl(image))
    : [fixImageUrl("/product1.jpeg")],
  price: Number(product?.price) || 0,
  originalPrice: Number(product?.originalPrice) || Number(product?.price) || 0,
  rating: Number(product?.rating) || 0,
  discount: Number(product?.discount) || 0,
});

const dedupeProducts = (items = []) => {
  const seen = new Set();
  const merged = [];

  items.forEach((item) => {
    const normalized = normalizeProduct(item);
    const id = String(normalized?._id || normalized?.id || "");
    const fingerprint = id || `${normalized?.title || ""}-${normalized?.price || 0}-${normalized?.category || ""}-${normalized?.subcategory || ""}-${String(normalized?.images?.[0] || "")}`;
    if (!fingerprint || seen.has(fingerprint)) return;
    seen.add(fingerprint);
    merged.push(normalized);
  });

  return merged;
};

export default function HomePage({ setPage, setSelectedProduct }) {
  const { user } = useContext(AuthContext);
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  
  useEffect(() => {
    setIsLoading(true);
    setIsError(false);
    // First try localStorage (Admin panel changes)
    try {
      const saved = localStorage.getItem('nouveau_local_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPRODUCTS(dedupeProducts(parsed));
          setIsLoading(false);
          return;
        }
      }
    } catch {}
    // Then try backend API
    API.getProducts().then((data) => {
      const list = Array.isArray(data?.products)
        ? data.products
        : Array.isArray(data)
          ? data
          : [];

      if (list.length > 0) {
        setPRODUCTS(dedupeProducts(list));
      } else {
        setPRODUCTS(dedupeProducts(INITIAL_PRODUCTS));
      }
    }).catch(() => {
      setIsError(true);
      setPRODUCTS(dedupeProducts(INITIAL_PRODUCTS));
    }).finally(() => {
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    const handleProductsUpdated = () => {
      try {
        const saved = localStorage.getItem("nouveau_local_products");
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPRODUCTS(dedupeProducts(parsed));
        }
      } catch { }
    };

    window.addEventListener("nouveau:products-updated", handleProductsUpdated);
    return () => window.removeEventListener("nouveau:products-updated", handleProductsUpdated);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const newArrivals = PRODUCTS.filter((p) => p.isNew && normalizeCategory(p.category) === "Indian Ethnic Wear").slice(0, 4);

  const trendingBase = PRODUCTS.filter((p) => normalizeCategory(p.category) === "Indian Western Wear");
  const trendingFallback = PRODUCTS.filter((p) => !trendingBase.some((w) => w._id === p._id));
  const trending = [...trendingBase, ...trendingFallback].slice(0, 4);

  const featuredCollections = [
    {
      badge: "NEW ARRIVAL",
      title: "Women's Festive Collection",
      description: "Elegant handcrafted ethnic wear for every celebration.",
      button: "SHOP WOMEN →",
      image: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
      page: "EthnicWear",
    },
    {
      badge: "LIMITED EDITION",
      title: "Indo-Western Collection",
      description: "Modern silhouettes with timeless Indian elegance.",
      button: "EXPLORE COLLECTION →",
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1200&q=80",
      page: "WesternWear",
    },
  ];

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh", color:THEME.text }}>
      <style>{`
        .featured-collections-shell {
          padding: 80px clamp(16px, 5vw, 40px);
          background: linear-gradient(180deg, ${THEME.bgCard} 0%, ${THEME.bg} 100%);
        }

        .featured-collections-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 32px;
        }

        .featured-campaign-card {
          position: relative;
          border-radius: 24px;
          overflow: hidden;
          min-height: 520px;
          background: #111111;
          cursor: pointer;
          box-shadow: 0 20px 54px rgba(28, 17, 11, 0.14);
          transition: transform 300ms ease, box-shadow 300ms ease;
          isolation: isolate;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .featured-campaign-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 30px 66px rgba(28, 17, 11, 0.2);
        }

        .featured-campaign-card__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 350ms ease;
        }

        .featured-campaign-card:hover .featured-campaign-card__image {
          transform: scale(1.05);
        }

        .featured-campaign-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10, 10, 10, 0.12) 0%, rgba(12, 16, 12, 0.38) 45%, rgba(8, 12, 8, 0.92) 100%);
          z-index: 1;
        }

        .featured-campaign-card__content {
          position: absolute;
          inset: auto 0 0 0;
          z-index: 2;
          padding: 28px 28px 30px;
          color: #fff;
        }

        .featured-campaign-card__badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 248, 240, 0.18);
          border: 1px solid rgba(255, 248, 240, 0.28);
          color: #fff8f0;
          font-family: 'Poppins', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 3px;
          text-transform: uppercase;
          backdrop-filter: blur(8px);
        }

        .featured-campaign-card__title {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          line-height: 1.02;
          margin: 0 0 12px;
          color: #fff8f0;
          max-width: 12ch;
          text-shadow: 0 3px 24px rgba(0,0,0,0.28);
        }

        .featured-campaign-card__description {
          font-family: 'Poppins', sans-serif;
          font-size: 16px;
          line-height: 1.7;
          color: rgba(255, 248, 240, 0.82);
          margin: 0 0 22px;
          max-width: 28ch;
        }

        .featured-campaign-card__cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 13px 22px;
          border-radius: 999px;
          background: #138808;
          color: #fff8f0;
          font-family: 'Poppins', sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 2px;
          text-transform: uppercase;
          border: 1px solid rgba(255,255,255,0.16);
          transition: transform 300ms ease, background 300ms ease, box-shadow 300ms ease;
          box-shadow: 0 10px 24px rgba(19, 136, 8, 0.22);
        }

        .featured-campaign-card:hover .featured-campaign-card__cta {
          transform: translateX(6px);
          background: #D4AF37;
          box-shadow: 0 14px 28px rgba(212, 175, 55, 0.22);
        }

        @media (max-width: 1024px) {
          .featured-collections-grid {
            gap: 24px;
          }

          .featured-campaign-card {
            min-height: 460px;
          }

          .featured-campaign-card__title {
            font-size: 36px;
          }
        }

        @media (max-width: 768px) {
          .featured-collections-shell {
            padding: 64px 16px;
          }

          .featured-collections-grid {
            grid-template-columns: 1fr;
            gap: 24px;
          }

          .featured-campaign-card {
            min-height: 420px;
          }

          .featured-campaign-card__content {
            padding: 24px 22px 26px;
          }

          .featured-campaign-card__title {
            font-size: 34px;
          }

          .featured-campaign-card__description {
            font-size: 15px;
          }
        }
      `}</style>

      <Hero setPage={setPage} />

      {user && (
        <div className="welcome-section">
          Welcome {user.name.charAt(0).toUpperCase() + user.name.slice(1)}! 🌸
        </div>
      )}

      {/* Marquee */}
      <div style={{ overflow:"hidden", background:THEME.crimson, padding:"14px 0" }}>
        <div style={{ display:"flex", animation:"marquee 28s linear infinite", whiteSpace:"nowrap" }}>
          {Array(4).fill(["Indian Ethnic Wear", "Premium Western Wear", "Nouveau™", "Women's Wear", `Free Shipping ₹${SHIPPING_FREE_THRESHOLD.toLocaleString("en-IN")}+`]).flat().map((t, i) => (
            <span key={i} style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", letterSpacing:"5px", color:"rgba(255,255,255,0.88)", textTransform:"uppercase", padding:"0 32px", flexShrink:0 }}>
              {t} <span style={{ color:THEME.gold }}>✦</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── TWO CATEGORY SHOWCASE ── */}
      <div className="featured-collections-shell">
        <div style={{ maxWidth:"1400px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"48px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.crimson, textTransform:"uppercase", marginBottom:"12px" }}>Featured Collections</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700 }}>Grace in every Thread</h2>
            <OrnamentDivider />
          </div>

          <div className="featured-collections-grid">
            {featuredCollections.map((card) => (
              <div
                key={card.title}
                className="featured-campaign-card"
                role="button"
                tabIndex={0}
                onClick={() => setPage(card.page)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setPage(card.page);
                }}
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="featured-campaign-card__image"
                  loading="lazy"
                  decoding="async"
                />
                <div className="featured-campaign-card__overlay" />
                <div className="featured-campaign-card__content">
                  <span className="featured-campaign-card__badge">{card.badge}</span>
                  <h3 className="featured-campaign-card__title">{card.title}</h3>
                  <p className="featured-campaign-card__description">{card.description}</p>
                  <span className="featured-campaign-card__cta">{card.button}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── NEW ARRIVALS ── */}
      <div style={{ padding:"clamp(40px, 10vw, 80px) clamp(16px, 5vw, 40px)", maxWidth:"1400px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.crimson, textTransform:"uppercase", marginBottom:"12px" }}>Curated Selection</p>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700 }}>New Arrivals</h2>
          <OrnamentDivider />
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"15px", color:THEME.textMuted, maxWidth:"460px", margin:"0 auto", lineHeight:1.7 }}>
            Handpicked pieces defining the season's most coveted looks — for the modern Indian woman
          </p>
        </div>
        {isLoading ? (
          <div style={{ textAlign:"center", padding:"40px", color:THEME.textMuted }}>Loading collections...</div>
        ) : isError ? (
          <div style={{ textAlign:"center", padding:"40px", color:THEME.crimson }}>Failed to load products. Please try again later.</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(clamp(160px, 40vw, 300px), 1fr))", gap:"clamp(16px, 4vw, 24px)" }}>
            {newArrivals.map((p, i) => (
              <ProductCard key={`${p._id || p.title || "arrival"}-${i}`} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} />
            ))}
          </div>
        )}
        <div style={{ textAlign:"center", marginTop:"44px" }}>
          <BtnOutline onClick={() => setPage("Shop")} color={THEME.crimson}>View All Collections <Icons.Arrow /></BtnOutline>
        </div>
      </div>

      {/* ── STORY SECTION ── */}
      <div className="your-section" style={{ maxWidth:"1400px", margin:"0 auto", padding:"clamp(40px, 10vw, 80px) clamp(16px, 5vw, 40px)" }}>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "40px" : "80px", alignItems:"center" }} className="grid-2col">
          <div>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.crimson, textTransform:"uppercase", marginBottom:"16px" }}>Our Philosophy</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,48px)", fontWeight:700, lineHeight:1.15, marginBottom:"20px" }}>
              Where Every Thread<br /><em style={{ color:THEME.crimson }}>Tells A Story</em>
            </h2>
            <OrnamentDivider />
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"16px", color:THEME.textMuted, lineHeight:1.85, marginBottom:"18px" }}>
              Born from the rich tapestry of Indian craftsmanship, Nouveau™ bridges the timeless and the contemporary. Each piece is a dialogue between heritage artisans and modern sensibility.
            </p>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"15px", color:THEME.textMuted, lineHeight:1.85, marginBottom:"32px" }}>
              We celebrate the Indian woman in two ways: through our ethnic heritage and through contemporary premium western silhouettes, all crafted with the same love for quality and craft.
            </p>
            <BtnPrimary onClick={() => setPage("About")} style={{ borderRadius:"99px" }}>Discover Our Story <Icons.Arrow /></BtnPrimary>
          </div>

          <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"center", width:"100%" }}>
            <div style={{ width:"min(100%, 340px)", height:"clamp(320px, 70vw, 420px)", background:`linear-gradient(135deg, ${THEME.crimson}, ${THEME.crimsonDark})`, borderRadius:"170px 170px 0 0", display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", inset:0, background:`radial-gradient(circle at 30% 30%, rgba(212,175,55,0.3), transparent 60%)` }} />
              <NouveauLogo size={180} />
            </div>

          </div>
        </div>
      </div>

      {/* ── TRENDING NOW ── */}
      <div style={{ background:THEME.bgDark, padding:"clamp(40px, 10vw, 80px) clamp(16px, 5vw, 40px)" }}>
        <div style={{ maxWidth:"1400px", margin:"0 auto" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:"44px", flexWrap:"wrap", gap:"16px" }}>
            <div>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.crimson, textTransform:"uppercase", marginBottom:"10px" }}>Bestsellers</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(26px,4vw,40px)", fontWeight:700 }}>Trending Now</h2>
            </div>
            <BtnOutline onClick={() => setPage("Shop")} color={THEME.crimson} style={{ borderRadius:"99px" }}>View All <Icons.Arrow /></BtnOutline>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(clamp(150px, 35vw, 250px), 1fr))", gap:"clamp(14px, 3vw, 20px)" }}>
            {trending.map((p, i) => (
              <ProductCard key={`${p._id || p.title || "trending"}-${i}`} product={p} setPage={setPage} setSelectedProduct={setSelectedProduct} compact />
            ))}
          </div>
        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}
