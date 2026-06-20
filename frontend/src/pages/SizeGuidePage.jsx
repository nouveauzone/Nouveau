import { THEME } from "../styles/theme";
import OrnamentDivider from "../components/OrnamentDivider";
import Footer from "../components/Footer";

export default function SizeGuidePage({ setPage }) {
  const ethnicSizes = [
    ["XS", "30-32", "24-26", "32-34"],
    ["S",  "32-34", "26-28", "34-36"],
    ["M",  "34-36", "28-30", "36-38"],
    ["L",  "36-38", "30-32", "38-40"],
    ["XL", "38-40", "32-34", "40-42"],
    ["XXL","40-42", "34-36", "42-44"],
  ];
  const westernSizes = [
    ["XS / UK 6",  "30-32", "24-26", "32-34"],
    ["S / UK 8",   "32-34", "26-28", "34-36"],
    ["M / UK 10",  "34-36", "28-30", "36-38"],
    ["L / UK 12",  "36-38", "30-32", "38-40"],
    ["XL / UK 14", "38-40", "32-34", "40-42"],
    ["XXL / UK 16","40-42", "34-36", "42-44"],
  ];
  const thStyle = { padding:"12px 20px", fontFamily:"'Poppins',sans-serif", fontSize:"11px", letterSpacing:"2px", textTransform:"uppercase", color:THEME.crimson, background:`${THEME.crimson}10`, fontWeight:700, textAlign:"left" };
  const tdStyle = { padding:"14px 20px", fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, borderBottom:`1px solid ${THEME.border}` };

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh", color:THEME.text }}>
      <div style={{ background:`linear-gradient(135deg,#0a0a0a,#1a0500)`, padding:"72px 40px 48px" }}>
        <div style={{ maxWidth:"900px", margin:"0 auto" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.gold, marginBottom:"10px", textTransform:"uppercase" }}>Nouveau™ Guide</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"#fff" }}>Size Guide</h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", marginTop:"8px", fontFamily:"'Poppins',sans-serif" }}>All measurements in inches. For the perfect fit, measure at the fullest part.</p>
        </div>
      </div>

      <div style={{ maxWidth:"900px", margin:"0 auto", padding:"60px 40px" }}>
        <div style={{ background:`${THEME.crimson}08`, border:`1px solid ${THEME.crimson}30`, borderRadius:"12px", padding:"20px 24px", marginBottom:"48px", display:"flex", gap:"12px", alignItems:"flex-start" }}>
          <span style={{ fontSize:"20px" }}>📏</span>
          <div>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:600, color:THEME.crimson, marginBottom:"4px", fontSize:"14px" }}>How to Measure</p>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:THEME.textMuted, lineHeight:1.7 }}>
              <strong>Bust:</strong> Measure around the fullest part of your chest. &nbsp;|&nbsp;
              <strong>Waist:</strong> Measure around the narrowest part of your waist. &nbsp;|&nbsp;
              <strong>Hip:</strong> Measure around the fullest part of your hips.
            </p>
          </div>
        </div>

        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", marginBottom:"8px" }}>Indian Ethnic Wear</h2>
        <OrnamentDivider />
        <div style={{ overflowX:"auto", marginBottom:"48px" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", background:THEME.bgCard, borderRadius:"12px", overflow:"hidden", border:`1px solid ${THEME.border}` }}>
            <thead>
              <tr>
                {["Size","Bust","Waist","Hip"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {ethnicSizes.map(([size,...vals]) => (
                <tr key={size} style={{ background:THEME.bgCard }}>
                  <td style={{ ...tdStyle, color:THEME.crimson, fontWeight:700 }}>{size}</td>
                  {vals.map((v,i) => <td key={i} style={tdStyle}>{v}"</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", marginBottom:"8px" }}>Indian Western Wear</h2>
        <OrnamentDivider />
        <div style={{ overflowX:"auto", marginBottom:"48px" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", background:THEME.bgCard, borderRadius:"12px", overflow:"hidden", border:`1px solid ${THEME.border}` }}>
            <thead>
              <tr>
                {["Size","Bust","Waist","Hip"].map(h => <th key={h} style={thStyle}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {westernSizes.map(([size,...vals]) => (
                <tr key={size} style={{ background:THEME.bgCard }}>
                  <td style={{ ...tdStyle, color:THEME.crimson, fontWeight:700 }}>{size}</td>
                  {vals.map((v,i) => <td key={i} style={tdStyle}>{v}"</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", padding:"32px" }}>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", marginBottom:"16px", color:THEME.crimson }}>Tips for the Best Fit</h3>
          {["If you're between sizes, we recommend sizing up for ethnic wear and sizing down for western silhouettes.",
            "Sarees are one-size-fits-all and are 5.5 metres long.",
            "Lehengas are customisable — contact us via WhatsApp for made-to-measure.",
            "All garments have 1–2 inch seam allowance for alterations."].map((tip,i) => (
            <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"14px", alignItems:"flex-start" }}>
              <span style={{ color:THEME.gold, fontSize:"16px", marginTop:"2px" }}>✦</span>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, lineHeight:1.7 }}>{tip}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
