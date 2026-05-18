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

export default function HomePage({ setPage, setSelectedProduct }) {
  const { isAuthenticated, user } = useContext(AuthContext);
  const [PRODUCTS, setPRODUCTS] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  
  useEffect(() => {
    setIsLoading(true);
    // First try localStorage (Admin panel changes)
    try {
      const saved = localStorage.getItem('nouveau_local_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setPRODUCTS(parsed);
          setIsLoading(false);
          return;
        }
      }
    } catch {}
    // Then try backend API
    API.getProducts().then((data) => {
      if (data.products && data.products.length > 0) setPRODUCTS(data.products);
      else if (Array.isArray(data) && data.length > 0) setPRODUCTS(data);
      else setPRODUCTS(INITIAL_PRODUCTS);
    }).catch(() => {
      setPRODUCTS(INITIAL_PRODUCTS);
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
          setPRODUCTS(parsed);
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

  const ethnic = PRODUCTS.filter((p) => normalizeCategory(p.category) === "Indian Ethnic Wear");
  const western = PRODUCTS.filter((p) => normalizeCategory(p.category) === "Indian Western Wear");
  const newArrivals = PRODUCTS.filter((p) => p.isNew && normalizeCategory(p.category) === "Indian Ethnic Wear").slice(0, 4);

  const trendingBase = PRODUCTS.filter((p) => normalizeCategory(p.category) === "Indian Western Wear");
  const trendingFallback = PRODUCTS.filter((p) => !trendingBase.some((w) => w._id === p._id));
  const trending = [...trendingBase, ...trendingFallback].slice(0, 4);

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh", color:THEME.text }}>
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
      <div style={{ padding:"clamp(40px, 10vw, 80px) clamp(16px, 5vw, 40px)", background:THEME.bgCard }}>
        <div style={{ maxWidth:"1400px", margin:"0 auto" }}>
          <div style={{ textAlign:"center", marginBottom:"48px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.crimson, textTransform:"uppercase", marginBottom:"12px" }}>Our Collections</p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,4vw,44px)", fontWeight:700 }}>Grace in every Thread</h2>
            <OrnamentDivider />
          </div>

          <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:"24px" }} className="grid-2col">
            {/* Indian Ethnic Wear */}
            <div onClick={() => setPage("EthnicWear")}
              style={{ position:"relative", borderRadius:"20px", overflow:"hidden", cursor:"pointer", minHeight:"420px", background:`linear-gradient(135deg, ${THEME.crimsonDark}, #9f5b65)`, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px", transition:"transform 0.35s" }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.015)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)", borderRadius:"20px" }} />
              <div style={{ position:"absolute", top:"28px", right:"28px", opacity:0.32, filter:"brightness(1.35) saturate(1.1) drop-shadow(0 0 10px rgba(212,175,55,0.25))" }}><NouveauLogo size={120} /></div>
              <div style={{ position:"relative", zIndex:1 }}>
                <span style={{ background:THEME.gold, color:"#fff", fontSize:"9px", letterSpacing:"3px", padding:"5px 14px", fontFamily:"'Poppins',sans-serif", fontWeight:700, borderRadius:"99px", display:"inline-block", marginBottom:"14px" }}>
                  {ethnic.length} AESTHETICS
                </span>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,3vw,38px)", fontWeight:700, color:"#fff", lineHeight:1.2, marginBottom:"10px" }}>
                  Indian Ethnic<br />Wear
                </h3>
                <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", color:THEME.gold, fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"2px" }}>
                  EXPLORE <Icons.Arrow />
                </div>
              </div>
            </div>

            {/* Indian Western Wear */}
            <div onClick={() => setPage("WesternWear")}
              style={{ position:"relative", borderRadius:"20px", overflow:"hidden", cursor:"pointer", minHeight:"420px", background:`linear-gradient(135deg, #2a1a00, #6b5000)`, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"40px", transition:"transform 0.35s" }}
              onMouseEnter={e => e.currentTarget.style.transform="scale(1.015)"}
              onMouseLeave={e => e.currentTarget.style.transform="scale(1)"}>
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 60%)", borderRadius:"20px" }} />
              <div style={{ position:"absolute", top:"28px", right:"28px", opacity:0.32, filter:"brightness(1.35) saturate(1.1) drop-shadow(0 0 10px rgba(212,175,55,0.25))" }}><NouveauLogo size={120} /></div>
              <div style={{ position:"relative", zIndex:1 }}>
                <span style={{ background:THEME.crimson, color:"#fff", fontSize:"9px", letterSpacing:"3px", padding:"5px 14px", fontFamily:"'Poppins',sans-serif", fontWeight:700, borderRadius:"99px", display:"inline-block", marginBottom:"14px" }}>
                  {western.length} AESTHETICS
                </span>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,3vw,38px)", fontWeight:700, color:"#fff", lineHeight:1.2, marginBottom:"10px" }}>
                  Indian<br />Western Wear
                </h3>
                <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", color:THEME.goldLight, fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"2px" }}>
                  EXPLORE <Icons.Arrow />
                </div>
              </div>
            </div>
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
