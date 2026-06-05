import { THEME } from "../styles/theme";
import Footer from "../components/Footer";
import OrnamentDivider from "../components/OrnamentDivider";
import { SHIPPING_FREE_THRESHOLD } from "../data/constants";

export default function TermsPage({ setPage }) {
  return (
    <div style={{ background:THEME.bg, minHeight:"100vh" }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg,#0a0a0a,#1a0500)`, padding:"72px 40px 48px" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.gold, marginBottom:"10px", textTransform:"uppercase" }}>Legal</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"#fff" }}>Terms & Conditions</h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"13px", fontFamily:"'Poppins',sans-serif", marginTop:"8px" }}>Last updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"60px 40px" }}>

        {/* 1. Returns & Exchanges */}
        <div style={{ marginBottom:"40px", background:THEME.bgCard, border:`1.5px solid ${THEME.crimson}30`, borderRadius:"16px", padding:"32px" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:THEME.crimson, marginBottom:"12px" }}>🔁 Return & Exchange Policy</h2>
          <div style={{ height:"1px", background:`linear-gradient(to right, ${THEME.crimson}40, transparent)`, marginBottom:"16px" }} />
          <ul style={{ fontFamily:"'Poppins',sans-serif", fontSize:"15px", color:THEME.textMuted, lineHeight:1.85, marginBottom:"12px", paddingLeft:"18px" }}>
            <li>Return: In case of returning the product, 30% restocking fees will be deducted from the product price paid by the customer.</li>
            <li>Exchange: In case of exchange, one-side courier charges will be borne by the customer.</li>
            <li>Products must be returned unused and in original packaging.</li>
            <li>Refunds will be processed after quality inspection of the returned product.</li>
          </ul>
          <div style={{ background:`${THEME.gold}15`, border:`1px solid ${THEME.gold}40`, borderRadius:"10px", padding:"14px 18px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.text, fontWeight:600, margin:0 }}>
              📏 Please refer to the Size Chart carefully before placing your order. If you have any doubts regarding sizing, contact us before ordering — we are happy to help!
            </p>
          </div>
        </div>

        {/* 2. Payment Methods */}
        <div style={{ marginBottom:"40px", background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"16px", padding:"32px" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:THEME.text, marginBottom:"12px" }}>Payment Methods</h2>
          <div style={{ height:"1px", background:`linear-gradient(to right, ${THEME.crimson}40, transparent)`, marginBottom:"16px" }} />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            {[
              ["Cash on Delivery (COD)","Available across India"],
              ["Direct UPI Intent","PhonePe, Google Pay, Paytm, BHIM"],
              ["Credit / Debit Cards","All major cards accepted"],
              ["Net Banking","All major banks"],
            ].map(([method, desc]) => (
              <div key={method} style={{ background:THEME.bg, border:`1px solid ${THEME.border}`, borderRadius:"10px", padding:"14px 16px" }}>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:700, color:THEME.text, margin:"0 0 4px" }}>{method}</p>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted, margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:THEME.textMuted, marginTop:"14px", fontStyle:"italic" }}>
            * COD orders will be confirmed via WhatsApp before dispatch.
          </p>
        </div>

        {/* 3. Shipping */}
        <div style={{ marginBottom:"40px", background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"16px", padding:"32px" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:THEME.text, marginBottom:"12px" }}>Shipping & Delivery</h2>
          <div style={{ height:"1px", background:`linear-gradient(to right, ${THEME.crimson}40, transparent)`, marginBottom:"16px" }} />
          {[
            ["Processing Time","1–2 business days"],
            ["Delivery Time","5–7 business days across India"],
            ["Free Shipping",`On all orders above ₹${SHIPPING_FREE_THRESHOLD.toLocaleString("en-IN")}`],
            ["COD Available","Cash on Delivery across India"],
          ].map(([label, value]) => (
            <div key={label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:`1px solid ${THEME.border}` }}>
              <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted }}>{label}</span>
              <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", fontWeight:600, color:THEME.text }}>{value}</span>
            </div>
          ))}
        </div>

        {/* 4. Contact Us */}
        <div style={{ marginBottom:"40px", background:`linear-gradient(135deg, ${THEME.crimsonDark}15, ${THEME.crimson}08)`, border:`1.5px solid ${THEME.crimson}30`, borderRadius:"16px", padding:"32px" }}>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:THEME.crimson, marginBottom:"12px" }}>📞 Contact Us</h2>
          <div style={{ height:"1px", background:`linear-gradient(to right, ${THEME.crimson}40, transparent)`, marginBottom:"16px" }} />
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, marginBottom:"16px" }}>
            For any sizing queries or questions, please contact us <strong>before placing your order</strong>. 
            <br /><br />
            <span style={{ display: "inline-block", background: `${THEME.gold}20`, color: THEME.goldDark, padding: "8px 16px", borderRadius: "8px", fontWeight: 700, border: `1px solid ${THEME.gold}40` }}>
              🌍 International Buyers: For buying our products in your country, please communicate with us on WhatsApp.
            </span>
          </p>
          {[
            ["📧","Email","nouveauzone@gmail.com"],
            ["📞","Phone / WhatsApp","+91 63590 27888"],
            ["📍","Address","A-204, Nirman, Opp. Hocco, Navrangpura, Ahmedabad, Gujarat – 380009"],
            ["🕐","Business Hours","Mon–Fri: 11:30 AM – 6:00 PM IST"],
          ].map(([icon, label, value]) => (
            <div key={label} style={{ display:"flex", gap:"12px", marginBottom:"14px", alignItems:"flex-start" }}>
              <span style={{ fontSize:"18px", flexShrink:0 }}>{icon}</span>
              <div>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", letterSpacing:"2px", color:THEME.crimson, fontWeight:700, margin:"0 0 2px", textTransform:"uppercase" }}>{label}</p>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.text, margin:0 }}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        <OrnamentDivider />

        <div style={{ textAlign:"center", marginTop:"40px" }}>
          <button onClick={() => setPage("Home")}
            style={{ background:THEME.crimson, color:"#fff", border:"none", padding:"14px 36px", borderRadius:"99px", fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:700, letterSpacing:"2px", cursor:"pointer" }}>
            ← Back to Home
          </button>
        </div>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}
