import { useEffect, useState } from "react";
import { THEME } from "../styles/theme";
import { BtnPrimary } from "../components/Buttons";
import OrnamentDivider from "../components/OrnamentDivider";
import Footer from "../components/Footer";

// ══════════════════════════════════════════════
// 🔑 APNI EMAILJS KEYS YAHAN DAALO
// ══════════════════════════════════════════════
const EMAILJS_SERVICE_ID  = "service_ew0v7mh";
const EMAILJS_TEMPLATE_ID = "template_vluzsfq";
const EMAILJS_PUBLIC_KEY  = "Aa9gwBcfEpz3-JQE0";
// ══════════════════════════════════════════════

export default function ContactPage({ setPage }) {
  const [form, setForm]       = useState({ name:"", email:"", subject:"", message:"" });
  const [status, setStatus]   = useState("idle"); // idle | sending | sent | error
  const [errorMsg, setErrorMsg] = useState("");
  const [isMobile, setIsMobile] = useState(() => (typeof window !== "undefined" ? window.innerWidth < 768 : false));

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  const handleSubmit = async () => {
    // Basic validation
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg("Please fill in all required fields.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(form.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setStatus("sending");
    setErrorMsg("");

    try {
      // Dynamically load EmailJS SDK
      if (!window.emailjs) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        window.emailjs.init(EMAILJS_PUBLIC_KEY);
      }

      // Send email via EmailJS
      await window.emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          from_name:  form.name,
          from_email: form.email,
          subject:    form.subject || "General Inquiry",
          message:    form.message,
          to_name:    "Nouveau Team",
          reply_to:   form.email,
        },
        EMAILJS_PUBLIC_KEY
      );

      setStatus("sent");
      setForm({ name:"", email:"", subject:"", message:"" });

    } catch (err) {
      console.error("EmailJS error:", err);
      setStatus("error");
      setErrorMsg("Failed to send message. Please try again or contact us directly.");
    }
  };

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh" }}>

      {/* Header */}
      <div style={{ background:`linear-gradient(135deg, ${THEME.crimsonDark}, #9f5b65)`, padding:"72px 40px 48px" }}>
        <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"#fff" }}>Get in Touch</h1>
        </div>
      </div>

      <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"60px clamp(16px, 4vw, 40px)" }}>
        <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "1fr 1.6fr", gap:isMobile ? "28px" : "60px", alignItems:"start" }} className="grid-2col">

          {/* Contact Info */}
          <div>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"28px", marginBottom:"8px" }}>Contact Details</h2>
            <OrnamentDivider />
            {[
              { icon:"📍", title:"Address", lines:["A-204, Nirman, Opp. Hocco,", "Navrangpura, Ahmedabad,", "Gujarat (India) – 380009"] },
              { icon:"📞", title:"Phone / WhatsApp", lines:["+91 7733881577", "Mon–Fri · 11:30 AM – 6:00 PM IST"] },
              { icon:"✉️", title:"Email", lines:["nouveauzone@gmail.com", "We reply within 24 hours"] },
              { icon:"🕐", title:"Business Hours", lines:["Monday – Friday: 11:30 AM – 6:00 PM", "Saturday & Sunday: Closed"] },
            ].map(({ icon, title, lines }) => (
              <div key={title} style={{ display:"flex", gap:"16px", marginBottom:"28px", alignItems:"flex-start" }}>
                <div style={{ width:"44px", height:"44px", background:`${THEME.crimson}12`, borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"20px", flexShrink:0 }}>{icon}</div>
                <div>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"13px", color:THEME.crimson, letterSpacing:"1px", marginBottom:"4px" }}>{title.toUpperCase()}</p>
                  {lines.map((l,i) => <p key={i} style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, lineHeight:1.7 }}>{l}</p>)}
                </div>
              </div>
            ))}

            <div style={{ display:"flex", gap:"12px", marginTop:"8px", flexWrap:"wrap" }}>
              {[
                ["📸","Instagram","https://www.instagram.com/nouveauzon?igsh=aWc4bGltMGxkOWU2","#E1306C"],
                ["📘","Facebook","https://www.facebook.com/nouveauzone","#1877F2"],
              ].map(([icon,name,href,color]) => (
                <a key={name} href={href} target="_blank" rel="noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:color, color:"#fff", padding:"10px 16px", borderRadius:"99px", fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:600, textDecoration:"none" }}>
                  {icon} {name}
                </a>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"16px", padding:"clamp(24px, 4vw, 40px)" }}>

            {/* ── SUCCESS STATE ── */}
            {status === "sent" ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ fontSize:"56px", marginBottom:"16px" }}>✅</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"26px", color:THEME.crimson, marginBottom:"12px" }}>Message Sent!</h3>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, lineHeight:1.7 }}>
                  Thank you for reaching out! Our team will reply within 24 hours.
                </p>
                <button
                  onClick={() => setStatus("idle")}
                  style={{ marginTop:"24px", background:"none", border:`1px solid ${THEME.crimson}`, color:THEME.crimson, padding:"10px 24px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"12px" }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", marginBottom:"28px" }}>Send Us a Message</h2>

                {/* Error Banner */}
                {(status === "error" || errorMsg) && (
                  <div style={{ background:"#ffeaea", border:"1px solid #ffaaaa", borderRadius:"10px", padding:"12px 16px", marginBottom:"20px", display:"flex", gap:"10px", alignItems:"center" }}>
                    <span>⚠️</span>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:"#c0392b" }}>
                      {errorMsg || "Something went wrong. Please try again."}
                    </p>
                  </div>
                )}

                {/* Name + Email */}
                <div style={{ display:"grid", gridTemplateColumns:isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap:"16px", marginBottom:"16px" }}>
                  {[["name","Full Name *","text"],["email","Email Address *","email"]].map(([key,label,type]) => (
                    <div key={key}>
                      <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"2px", color:THEME.crimson, display:"block", marginBottom:"8px", fontWeight:600 }}>
                        {label.toUpperCase()}
                      </label>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={e => { setForm(f=>({...f,[key]:e.target.value})); setErrorMsg(""); }}
                        style={{ width:"100%", padding:"13px 16px", border:`1px solid ${THEME.border}`, borderRadius:"10px", fontSize:"14px", outline:"none", fontFamily:"'Poppins',sans-serif", color:THEME.text, transition:"border-color 0.2s" }}
                        onFocus={e => e.target.style.borderColor = THEME.crimson}
                        onBlur={e => e.target.style.borderColor = THEME.border}
                      />
                    </div>
                  ))}
                </div>

                {/* Subject */}
                <div style={{ marginBottom:"16px" }}>
                  <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"2px", color:THEME.crimson, display:"block", marginBottom:"8px", fontWeight:600 }}>SUBJECT</label>
                  <select
                    value={form.subject}
                    onChange={e => setForm(f=>({...f,subject:e.target.value}))}
                    style={{ width:"100%", padding:"13px 16px", border:`1px solid ${THEME.border}`, borderRadius:"10px", fontSize:"14px", outline:"none", fontFamily:"'Poppins',sans-serif", color:THEME.text, background:THEME.bgCard }}>
                    <option value="">Select a subject</option>
                    {["Order Query","Returns & Exchanges","Custom Sizing","Product Inquiry","Wholesale / Bulk","Other"].map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                {/* Message */}
                <div style={{ marginBottom:"24px" }}>
                  <label style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"2px", color:THEME.crimson, display:"block", marginBottom:"8px", fontWeight:600 }}>MESSAGE *</label>
                  <textarea
                    rows={5}
                    value={form.message}
                    onChange={e => { setForm(f=>({...f,message:e.target.value})); setErrorMsg(""); }}
                    placeholder="How can we help you?"
                    style={{ width:"100%", padding:"13px 16px", border:`1px solid ${THEME.border}`, borderRadius:"10px", fontSize:"14px", outline:"none", fontFamily:"'Poppins',sans-serif", color:THEME.text, resize:"vertical" }}
                    onFocus={e => e.target.style.borderColor = THEME.crimson}
                    onBlur={e => e.target.style.borderColor = THEME.border}
                  />
                </div>

                {/* Submit Button */}
                <BtnPrimary
                  onClick={handleSubmit}
                  disabled={status === "sending"}
                  style={{ width:"100%", borderRadius:"12px", justifyContent:"center", opacity: status === "sending" ? 0.7 : 1 }}
                >
                  {status === "sending" ? "⏳ Sending..." : "Send Message →"}
                </BtnPrimary>

                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textLight, textAlign:"center", marginTop:"12px" }}>
                  We reply within 24 hours 🌸
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
