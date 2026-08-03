import { useState, useEffect } from "react";
import { THEME } from "../styles/theme";
import NouveauLogo from "../components/Logo";
import OrnamentDivider from "../components/OrnamentDivider";
import Icons from "../components/Icons";
import { BtnOutline } from "../components/Buttons";
import Footer from "../components/Footer";

export default function CollectionsPage({ setPage }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div style={{ background:THEME.bg, minHeight:"100vh", color:THEME.text }}>
      <div style={{ background:`linear-gradient(135deg, ${THEME.crimsonDark}, #1d0408)`, padding:"120px 40px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:0.05, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <NouveauLogo size={600} />
        </div>
        <div style={{ position:"relative", zIndex:1 }}>
          <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"10px", letterSpacing:"8px", color:THEME.gold, marginBottom:"16px" }}>OUR STORY</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(48px,8vw,96px)", fontWeight:900, color:"#fff", lineHeight:0.9, marginBottom:"24px" }}>
            The Nouveau<br /><em style={{ color:THEME.goldLight }}>Collections</em>
          </h1>
          <OrnamentDivider color={THEME.gold} />
          <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"18px", color:"rgba(255,255,255,0.65)", fontStyle:"italic", maxWidth:"560px", margin:"0 auto", lineHeight:1.8 }}>
            Born from the intersection of heritage craftsmanship and modern sensibility  a celebration of the Indian aesthetic spirit.
          </p>
        </div>
      </div>

      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"80px 40px" }}>
        {[
          ["The Lotus Heritage","Our signature collection draws from the sacred lotus  a symbol of purity and resilience. Each piece features hand-embroidered motifs crafted by artisans from Rajasthan and Gujarat.","",THEME.crimson],
          ["Aura  The Festive Edit","Curated for celebrations that demand radiance. Rich silks, gold zardozi work, and colours that command attention. Because every festival deserves its own legend.","",THEME.gold],
          ["The Modern Royals","Where the regal past meets contemporary cuts. Structured silhouettes in premium fabrics, designed for those who carry elegance effortlessly into the modern world.","",THEME.crimsonDark],
        ].map(([title, desc, icon, color], i) => (
          <div key={title} style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap:"0", marginBottom:"3px" }} className="grid-2col">
            <div style={{ order: isMobile ? "auto" : (i%2===1 ? 2 : 1), padding: isMobile ? "48px 24px" : "72px 56px", background:THEME.bgCard, border:`1px solid ${THEME.border}`, display:"flex", flexDirection:"column", justifyContent:"center" }}>
              <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"10px", letterSpacing:"6px", color:color, marginBottom:"16px" }}>COLLECTION 0{i+1}</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"36px", fontWeight:700, marginBottom:"20px", lineHeight:1.2 }}>{title}</h2>
              <OrnamentDivider color={color} />
              <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"17px", color:THEME.textMuted, lineHeight:1.8, marginBottom:"32px" }}>{desc}</p>
              <div>
                <BtnOutline onClick={() => setPage("Shop")} color={color}>Explore Collection <Icons.Arrow /></BtnOutline>
              </div>
            </div>
            <div style={{ order: isMobile ? "auto" : (i%2===1 ? 1 : 2), background:`linear-gradient(135deg, ${color}, ${color}cc)`, minHeight: isMobile ? "250px" : "420px", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:"20px" }}>
              <span style={{ fontSize:"80px" }}>{icon}</span>
              <NouveauLogo size={80} />
            </div>
          </div>
        ))}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
