import { useState, useEffect } from "react";
import { THEME } from "../styles/theme";
import OrnamentDivider from "../components/OrnamentDivider";
import Footer from "../components/Footer";
import { SHIPPING_FREE_THRESHOLD } from "../data/constants";

export default function ShippingPage({ setPage }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <div style={{ background:THEME.bg, minHeight:"100vh" }}>
      <div style={{ background:`linear-gradient(135deg,#0a0a0a,#1a0500)`, padding:"72px 40px 48px" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.gold, marginBottom:"10px", textTransform:"uppercase" }}>Fast & Safe</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"#fff" }}>Shipping Information</h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", marginTop:"8px", fontFamily:"'Poppins',sans-serif" }}>Pan-India delivery. Free shipping on orders above ₹{SHIPPING_FREE_THRESHOLD.toLocaleString("en-IN")}.</p>
        </div>
      </div>

      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"60px 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap:"20px", marginBottom:"56px" }} className="grid-2col">
          {[
            { icon:"🚚", label:"Standard Delivery", value:"5–7 Business Days", note:`Free above ₹${SHIPPING_FREE_THRESHOLD.toLocaleString("en-IN")}` },
            { icon:"⚡", label:"Express Delivery", value:"2–3 Business Days", note:"₹500 flat rate" },
          ].map(({ icon, label, value, note }) => (
            <div key={label} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", padding:"28px 20px", textAlign:"center" }}>
              <div style={{ fontSize:"32px", marginBottom:"10px" }}>{icon}</div>
              <p style={{ fontFamily:"'Josefin Sans',sans-serif", fontSize:"10px", letterSpacing:"3px", color:THEME.crimson, textTransform:"uppercase", marginBottom:"6px" }}>{label}</p>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", fontWeight:700, color:THEME.text, marginBottom:"6px" }}>{value}</p>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted }}>{note}</p>
            </div>
          ))}
        </div>

        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", marginBottom:"8px" }}>Shipping Details</h2>
        <OrnamentDivider />
        {[
          ["Order Processing","Orders are processed within 1–2 business days. During festive seasons (Navratri, Diwali, Wedding Season), processing may take up to 3 business days."],
          ["Tracking","Once your order is shipped, you will receive a tracking link via SMS and WhatsApp. Track your order in real-time through our courier partner."],
          ["Packaging","All garments are tissue-wrapped and packed in our signature Nouveau™ box to ensure they reach you in perfect condition."],
          ["International Shipping","We currently ship to select international destinations. Please WhatsApp us for rates and delivery timelines for international orders."],
          ["Delivery Attempts","Our courier will attempt delivery 3 times. After 3 failed attempts, the order will be returned to our warehouse and you will be contacted for re-delivery or refund."],
        ].map(([title, desc]) => (
          <div key={title} style={{ marginBottom:"24px", padding:"24px", background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"12px", borderLeft:`3px solid ${THEME.gold}` }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:THEME.goldDark, fontSize:"13px", letterSpacing:"1px", marginBottom:"8px" }}>{title.toUpperCase()}</p>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, lineHeight:1.8 }}>{desc}</p>
          </div>
        ))}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
