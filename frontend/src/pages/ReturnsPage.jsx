import { useState, useEffect } from "react";
import { THEME } from "../styles/theme";
import Footer from "../components/Footer";

export default function ReturnsPage({ setPage }) {
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const returnSteps = [
    {
      step: "01",
      title: "Raise a return or exchange request",
      desc: "Message us on WhatsApp within the allowed policy period with your order ID, item details, and reason.",
      meta: "Support on WhatsApp",
    },
    {
      step: "02",
      title: "Arrange return shipment",
      desc: "For returns, ship the product back in unused condition with original packaging after approval.",
      meta: "Secure packaging",
    },
    {
      step: "03",
      title: "Quality inspection",
      desc: "Once the item reaches us, we inspect its condition before processing.",
      meta: "Inspection required",
    },
    {
      step: "04",
      title: "Refund or exchange",
      desc: "Refunds are processed after inspection with a 30% restocking fee on returns. Exchanges require one-side courier charges borne by the customer.",
      meta: "Refunds or exchange",
    },
  ];

  const policyItems = [
    {
      title: "Return fee",
      desc: "A 30% restocking fee will be deducted from the product price paid by the customer for returns.",
    },
    {
      title: "Exchange shipping",
      desc: "In case of exchange, one-side courier charges will be borne by the customer.",
    },
    {
      title: "Return condition",
      desc: "Products must be returned unused and in original packaging.",
    },
    {
      title: "Refund processing",
      desc: "Refunds will be processed after quality inspection of the returned product.",
    },
  ];

  const quickFacts = [
    { label: "Restocking fee", value: "30%" },
    { label: "Exchange shipping", value: "One-side" },
    { label: "Condition", value: "Unused + packaging" },
    { label: "Inspection", value: "Required" },
  ];

  return (
    <div style={{ background: THEME.bg, minHeight: "100vh" }}>
      <div
        style={{
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(135deg, #100906 0%, #1a0a08 50%, #28110c 100%)",
          padding: "88px 40px 76px",
          borderBottom: `1px solid ${THEME.border}`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "auto -120px -140px auto",
            width: "360px",
            height: "360px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(212,175,55,0.16) 0%, rgba(212,175,55,0.02) 56%, transparent 72%)",
            filter: "blur(10px)",
          }}
        />
        <div style={{ maxWidth: "1180px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 14px",
              borderRadius: "999px",
              background: "rgba(212,175,55,0.12)",
              color: THEME.gold,
              fontFamily: "'Poppins',sans-serif",
              fontSize: "10px",
              letterSpacing: "4px",
              textTransform: "uppercase",
              marginBottom: "18px",
              border: `1px solid rgba(212,175,55,0.2)`,
            }}
          >
            Return & Exchange Policy
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1.45fr 0.95fr", gap: "34px", alignItems: "end" }} className="returns-hero-grid">
            <div>
              <h1
                style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: "clamp(38px, 6vw, 68px)",
                  lineHeight: 0.95,
                  fontWeight: 700,
                  color: "#fff",
                  marginBottom: "18px",
                }}
              >
                Returns & Exchanges
              </h1>
              <p style={{ color: "rgba(255,255,255,0.72)", fontSize: "15px", lineHeight: 1.85, maxWidth: "640px", fontFamily: "'Poppins',sans-serif" }}>
                We keep returns and exchanges transparent and policy-led, with clear steps and quality checks before any refund or exchange is processed.
              </p>
            </div>

            <div
              style={{
                background: "rgba(255,255,255,0.06)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: "24px",
                padding: "22px",
                boxShadow: "0 18px 50px rgba(0,0,0,0.24)",
              }}
            >
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, marginBottom: "16px", textTransform: "uppercase" }}>
                At a glance
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "14px" }}>
                {quickFacts.map((fact) => (
                  <div key={fact.label} style={{ padding: "14px 16px", borderRadius: "16px", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: "rgba(255,255,255,0.56)", textTransform: "uppercase", marginBottom: "8px" }}>
                      {fact.label}
                    </p>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px", color: "#fff", fontWeight: 700 }}>
                      {fact.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: "1180px", margin: "0 auto", padding: "44px 40px 72px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "28px", alignItems: "start" }} className="returns-main-grid">
          <section
            style={{
              background: THEME.bgCard,
              border: `1px solid ${THEME.border}`,
              borderRadius: "24px",
              padding: "28px",
              boxShadow: "0 10px 26px rgba(26,26,26,0.06)",
            }}
          >
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.crimson, textTransform: "uppercase", marginBottom: "10px", fontWeight: 700 }}>
              Return flow
            </p>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", color: THEME.text, marginBottom: "10px" }}>
              How the process works
            </h2>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", color: THEME.textMuted, lineHeight: 1.8, marginBottom: "26px", maxWidth: "640px" }}>
              A small, guided process makes it easier to resolve issues without long back-and-forth. Each step is visible and time-bound.
            </p>

            <div style={{ display: "grid", gap: "16px" }}>
              {returnSteps.map((item, index) => (
                <div
                  key={item.step}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 1fr",
                    gap: "16px",
                    padding: "18px",
                    borderRadius: "18px",
                    background: index % 2 === 0 ? "#FBF7F3" : "#fff",
                    border: `1px solid ${THEME.border}`,
                  }}
                >
                  <div
                    style={{
                      width: "64px",
                      height: "64px",
                      borderRadius: "18px",
                      background: `linear-gradient(135deg, ${THEME.crimson}, ${THEME.crimsonDark})`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontFamily: "'Poppins',sans-serif",
                      fontWeight: 700,
                      letterSpacing: "2px",
                      boxShadow: `0 10px 22px ${THEME.crimson}26`,
                    }}
                  >
                    {item.step}
                  </div>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "baseline", flexWrap: "wrap" }}>
                      <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", color: THEME.text, marginBottom: "6px" }}>
                        {item.title}
                      </h3>
                      <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.gold, textTransform: "uppercase" }}>
                        {item.meta}
                      </span>
                    </div>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", color: THEME.textMuted, lineHeight: 1.8 }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <aside style={{ display: "grid", gap: "18px" }}>
            <div
              style={{
                background: `linear-gradient(180deg, ${THEME.crimson} 0%, ${THEME.crimsonDark} 100%)`,
                color: "#fff",
                borderRadius: "24px",
                padding: "26px",
                boxShadow: "0 18px 32px rgba(183, 108, 121, 0.25)",
              }}
            >
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", textTransform: "uppercase", color: THEME.gold, marginBottom: "12px" }}>
                Need help now?
              </p>
              <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "28px", lineHeight: 1.1, marginBottom: "12px" }}>
                Speak to support on WhatsApp
              </h3>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "14px", lineHeight: 1.8, color: "rgba(255,255,255,0.82)", marginBottom: "18px" }}>
                Share your order ID and issue, and our team will guide you through the next step.
              </p>
              <button
                onClick={() => setPage("Contact")}
                style={{
                  width: "100%",
                  background: "#fff",
                  color: THEME.crimson,
                  border: "none",
                  borderRadius: "999px",
                  padding: "13px 18px",
                  fontFamily: "'Poppins',sans-serif",
                  fontWeight: 700,
                  fontSize: "12px",
                  letterSpacing: "1px",
                  cursor: "pointer",
                  marginBottom: "12px",
                }}
              >
                Contact Support
              </button>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: "rgba(255,255,255,0.72)" }}>
                WhatsApp: +91 98765 43210
              </p>
            </div>

            <div
              style={{
                background: THEME.bgCard,
                border: `1px solid ${THEME.border}`,
                borderRadius: "24px",
                padding: "22px",
              }}
            >
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.crimson, textTransform: "uppercase", marginBottom: "12px", fontWeight: 700 }}>
                Policy highlights
              </p>
              <div style={{ display: "grid", gap: "14px" }}>
                {policyItems.map((item) => (
                  <div key={item.title} style={{ padding: "16px", borderRadius: "18px", background: "#FBF7F3", border: `1px solid ${THEME.border}` }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", color: THEME.text, marginBottom: "6px" }}>
                      {item.title}
                    </p>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textMuted, lineHeight: 1.75 }}>
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <section
          style={{
            marginTop: "28px",
            background: `linear-gradient(135deg, ${THEME.bgCard} 0%, #fff7f6 100%)`,
            border: `1px solid ${THEME.border}`,
            borderRadius: "24px",
            padding: "24px 26px",
            boxShadow: "0 10px 22px rgba(26,26,26,0.05)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "8px", fontWeight: 700 }}>
                Need a faster resolution?
              </p>
              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "26px", color: THEME.text }}>
                Keep your order ID handy when you reach out.
              </h2>
            </div>
            <button
              onClick={() => setPage("Shop")}
              style={{
                background: THEME.crimson,
                color: "#fff",
                border: "none",
                borderRadius: "999px",
                padding: "13px 22px",
                fontFamily: "'Poppins',sans-serif",
                fontWeight: 700,
                fontSize: "12px",
                letterSpacing: "1px",
                cursor: "pointer",
                boxShadow: `0 10px 20px ${THEME.crimson}26`,
              }}
            >
              Continue Shopping
            </button>
          </div>
        </section>
      </div>

      <Footer setPage={setPage} />
    </div>
  );
}
