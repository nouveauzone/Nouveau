import { useState } from "react";
import { THEME } from "../styles/theme";
import Footer from "../components/Footer";
import { SHIPPING_FREE_THRESHOLD, SHIPPING_FEE } from "../data/constants";

const FAQS = [
  { q:"What are the two categories Nouveau™ offers?", a:"We offer Indian Ethnic Wear (kurtas, sarees, anarkalis, lehengas, sharara, suits, palazzos) and Indian Western Wear (dresses, blazers, trousers, jumpsuits, co-ords, tops) — all exclusively for women." },
  { q:"Do you offer free shipping?", a:`Yes! We offer free standard shipping on all orders above ₹${SHIPPING_FREE_THRESHOLD.toLocaleString("en-IN")}. Orders below that attract a flat shipping fee of ₹${SHIPPING_FEE.toLocaleString("en-IN")}.` },
  { q:"Can I return or exchange my order?", a:"Return: In case of returning the product, 30% restocking fees will be deducted from the product price paid by the customer. Exchange: In case of exchange, one-side courier charges will be borne by the customer. Products must be returned unused and in original packaging. Refunds will be processed after quality inspection of the returned product." },
  { q:"How long does delivery take?", a:"Standard delivery takes 5–7 business days. Express delivery (2–3 days) is available at ₹500. Same-day delivery is available in select cities for orders placed before 12 PM." },
  { q:"Are your products authentic?", a:"Absolutely. All our fabrics are sourced directly from weavers across India — from Chanderi silk to Rajasthani block prints. We work with artisan communities to ensure authenticity and fair trade." },
  { q:"Can I get custom sizing?", a:"Yes! Lehengas and select ethnic wear are available in custom sizing. Please WhatsApp us at 7733881577 with your measurements for a made-to-measure quote." },
  { q:"What payment methods do you accept?", a:"We currently accept direct UPI intent payments (PhonePe, Google Pay, Paytm, BHIM) and Cash on Delivery (COD)." },
  { q:"How do I track my order?", a:"Once shipped, you'll receive a tracking link via SMS and WhatsApp. You can also use our Track Order page with your Order ID." },
  { q:"Do you ship internationally?", a:"Currently we ship to select international destinations. Please WhatsApp us for availability and shipping rates to your country." },
  { q:"What is the Aura Circle?", a:"The Aura Circle is our loyalty programme. Subscribe to our newsletter for early access to new collections, exclusive discount codes, and invitations to private sale events." },
];

export default function FAQPage({ setPage }) {
  const [open, setOpen] = useState(null);

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh" }}>
      <div style={{ background:`linear-gradient(135deg,#0a0a0a,#1a0500)`, padding:"72px 40px 48px" }}>
        <div style={{ maxWidth:"800px", margin:"0 auto" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:THEME.gold, marginBottom:"10px", textTransform:"uppercase" }}>Got Questions?</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(32px,5vw,52px)", fontWeight:700, color:"#fff" }}>Frequently Asked Questions</h1>
        </div>
      </div>

      <div style={{ maxWidth:"800px", margin:"0 auto", padding:"60px 40px" }}>
        {FAQS.map((faq, i) => (
          <div key={i} style={{ borderBottom:`1px solid ${THEME.border}`, overflow:"hidden" }}>
            <button onClick={() => setOpen(open === i ? null : i)}
              style={{ width:"100%", background:"none", border:"none", padding:"22px 0", display:"flex", alignItems:"center", justifyContent:"space-between", cursor:"pointer", gap:"16px" }}>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"17px", color: open===i ? THEME.crimson : THEME.text, textAlign:"left", fontWeight: open===i ? 700 : 400, transition:"color 0.2s" }}>{faq.q}</p>
              <span style={{ color:THEME.crimson, fontSize:"22px", lineHeight:1, flexShrink:0, transition:"transform 0.3s", transform: open===i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
            </button>
            <div style={{ maxHeight: open===i ? "300px" : "0", overflow:"hidden", transition:"max-height 0.4s ease" }}>
              <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, lineHeight:1.8, paddingBottom:"22px" }}>{faq.a}</p>
            </div>
          </div>
        ))}

        <div style={{ marginTop:"56px", background:`linear-gradient(135deg, ${THEME.crimson}12, ${THEME.gold}10)`, border:`1px solid ${THEME.border}`, borderRadius:"16px", padding:"36px", textAlign:"center" }}>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"24px", color:THEME.text, marginBottom:"8px" }}>Still have questions?</p>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", color:THEME.textMuted, marginBottom:"24px" }}>Our team is available Monday–Saturday, 10 AM – 7 PM IST</p>
          <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
            <a href="https://wa.me/917733881577" target="_blank" rel="noreferrer"
              style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"#25D366", color:"#fff", padding:"12px 24px", borderRadius:"99px", fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:600, textDecoration:"none" }}>
              💬 WhatsApp Us
            </a>
            <a href="mailto:nouveauzone@email.com"
              style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:THEME.crimson, color:"#fff", padding:"12px 24px", borderRadius:"99px", fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:600, textDecoration:"none" }}>
              ✉️ Email Us
            </a>
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
