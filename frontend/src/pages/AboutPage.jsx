import { THEME } from "../styles/theme";
import NouveauLogo from "../components/Logo";
import OrnamentDivider from "../components/OrnamentDivider";
import { BtnPrimary } from "../components/Buttons";
import Footer from "../components/Footer";

export default function AboutPage({ setPage }) {
  return (
    <div style={{ background:THEME.bg, minHeight:"100vh" }}>

      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg, ${THEME.crimsonDark}, #9f5b65)`, padding:"120px 40px 80px", textAlign:"center", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, opacity:0.05, display:"flex", alignItems:"center", justifyContent:"center" }}><NouveauLogo size={500} /></div>
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:"24px" }}><NouveauLogo size={72} bg={true} /></div>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(40px,7vw,80px)", fontWeight:900, color:"#fff", marginBottom:"16px" }}>Our Story</h1>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"16px", color:"rgba(255,255,255,0.9)", fontWeight:600, letterSpacing:"2px", marginBottom:"8px" }}>Nouveau — By Jinal & Team</p>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"16px", color:"rgba(255,255,255,0.7)", fontStyle:"italic", maxWidth:"600px", margin:"0 auto", lineHeight:1.7 }}>Where Tradition Meets Modern Elegance</p>
        </div>
      </div>

      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"80px 40px" }}>

        {/* Brand Story */}
        <div style={{ marginBottom:"60px" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"32px", fontWeight:700, marginBottom:"16px" }}>All About Us</h2>
          <OrnamentDivider />
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"16px", color:THEME.textMuted, lineHeight:1.85, marginBottom:"20px" }}>
            Nouveau is a contemporary ethnic wear label for women, founded in 2025 by Jinal. The brand embodies fresh design thinking while staying rooted in Indian traditions, offering chic, comfortable, and elegant outfits that redefine everyday ethnic fashion with a perfect balance of heritage and modernity.
          </p>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"16px", color:THEME.textMuted, lineHeight:1.85 }}>
            Which inspired by the idea of "newness" and evolving fashion identity. The brand beautifully blends traditional Indian aesthetics with contemporary silhouettes, offering elegant, high-quality designs that celebrate femininity, culture, and confidence for the modern woman.
          </p>
        </div>

        <div style={{ textAlign:"center" }}>
          <BtnPrimary onClick={() => setPage("Shop")} style={{ borderRadius:"99px", padding:"16px 48px" }}>Shop The Collection →</BtnPrimary>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
