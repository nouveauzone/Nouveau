import { useEffect, useState } from "react";
import NouveauLogo from "./Logo";
import { THEME } from "../styles/theme";
import API from "../services/apiService";
import { TrustWhatsApp, TrustEmail } from "./TrustIcons";

function VisitorCount() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const loadMonthlyViews = async () => {
      try {
        const now = new Date();
        const monthKey = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
        const sessionKey = `nouveau_monthly_viewed_${monthKey}`;

        let response;
        if (!sessionStorage.getItem(sessionKey)) {
          const incrementRes = await fetch("/api/metrics/views", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ month: monthKey }),
          });

          if (!incrementRes.ok) {
            throw new Error("Failed to increment monthly views");
          }

          response = await incrementRes.json();
          sessionStorage.setItem(sessionKey, "true");
        } else {
          response = await API.getMonthlyViews(monthKey);
        }

        setCount(Number(response?.views || 0));
      } catch {
        setCount(null);
      }
    };

    loadMonthlyViews();
  }, []);

  if (count == null) return null;

  return (
    <span
      style={{
        fontFamily: "'Poppins', sans-serif",
        fontSize: "11px",
        color: "rgba(255,255,255,0.5)",
        letterSpacing: "1px",
        display: "flex",
        alignItems: "center",
        gap: "5px",
      }}
    >
      <span
        style={{
          width: "7px",
          height: "7px",
          borderRadius: "50%",
          background: "#22c55e",
          display: "inline-block",
          boxShadow: "0 0 5px #22c55e",
        }}
      />
      {count.toLocaleString("en-IN")} views this month
    </span>
  );
}

export default function Footer({ setPage }) {
  const quickLinks = [
    { label: "Home", page: "Home" },
    { label: "Shop", page: "Shop" },
    { label: "Indian Ethnic Wear", page: "EthnicWear" },
    { label: "Premium Western Wear", page: "WesternWear" },
    { label: "About Us", page: "About" },
    { label: "Contact", page: "Contact" },
  ];

  const customerLinks = [
    { label: "Size Guide", page: "SizeGuide" },
    { label: "Shipping Information", page: "Shipping" },
    { label: "Track Order", page: "TrackOrder" },
    { label: "FAQ", page: "FAQ" },
  ];

  const connectLinks = [
    { label: "Instagram", href: "https://www.instagram.com/nouveauzon?igsh=aWc4bGltMGxkOWU2" },
    { label: "Facebook", href: "https://www.facebook.com/nouveauzone" },
    { label: "WhatsApp", href: "https://wa.me/917733881577" },
    { label: "Email Us", href: "mailto:nouveauzone@email.com" },
  ];

  const linkStyle = {
    color: "rgba(255,255,255,0.75)",
    fontSize: "13px",
    marginBottom: "6px",
    cursor: "pointer",
    fontFamily: "'Poppins',sans-serif",
    transition: "color 0.2s",
    display: "block",
    textDecoration: "none",
  };

  return (
    <footer style={{ background: THEME.crimson, padding: "42px 32px 24px", borderTop: `1px solid ${THEME.gold}55` }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "32px", paddingBottom: "24px", borderBottom: "1px solid rgba(255,255,255,0.12)" }}>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <NouveauLogo size={40} />
          </div>
          <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", color: "#fff", letterSpacing: "3px", margin: "12px 0 4px" }}>
            nouveau<span style={{ color: "#C9A227" }}>™</span>
          </div>
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "8px", letterSpacing: "5px", color: THEME.gold }}>Wear Your Aura</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "28px", marginBottom: "28px" }} className="footer-grid">
          <div>
            <p className="footer-intro" style={{ color: "rgba(255,255,255,0.6)", fontSize: "13px", lineHeight: 1.65, fontFamily: "'Poppins',sans-serif", fontStyle: "italic" }}>
              Premium women's wear crafted for the modern Indian. Celebrating the finest ethnic traditions alongside contemporary elegance.
            </p>
            <div className="footer-social" style={{ marginTop: "14px" }}>
              {[
                [<TrustWhatsApp size={16} />, "WhatsApp", "https://wa.me/917733881577"],
                [<TrustEmail size={16} />, "Email", "mailto:nouveauzone@email.com"]
              ].map(([Icon, label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "rgba(255,255,255,0.8)", fontSize: "12px", fontFamily: "'Poppins',sans-serif", marginRight: "18px", marginBottom: "6px", textDecoration: "none", borderBottom: "1px solid transparent", transition: "all 0.2s" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = THEME.gold;
                    e.currentTarget.style.borderBottomColor = THEME.gold;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                    e.currentTarget.style.borderBottomColor = "transparent";
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>Quick Links</p>
            {quickLinks.map(({ label, page }) => (
              <span
                key={label}
                onClick={() => setPage(page)}
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.target.style.color = THEME.gold;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255,255,255,0.75)";
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>Customer</p>
            {customerLinks.map(({ label, page }) => (
              <span
                key={label}
                onClick={() => setPage(page)}
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.target.style.color = THEME.gold;
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = "rgba(255,255,255,0.75)";
                }}
              >
                {label}
              </span>
            ))}
          </div>

          <div>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "4px", color: THEME.gold, textTransform: "uppercase", marginBottom: "14px", fontWeight: 600 }}>Connect</p>
            {connectLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                style={linkStyle}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = THEME.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(255,255,255,0.75)";
                }}
              >
                {label}
              </a>
            ))}
          </div>
        </div>

        <div className="footer-bottom-row" style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "'Poppins',sans-serif" }}>© 2026 Nouveau™. All rights reserved. Women's Wear Only.</p>
          <VisitorCount />
          <div style={{ display: "flex", gap: "16px" }}>
            <span
              style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "'Poppins',sans-serif", cursor: "pointer" }}
              onClick={() => setPage("Terms")}
              onMouseEnter={(e) => {
                e.target.style.color = "rgba(255,255,255,0.8)";
              }}
              onMouseLeave={(e) => {
                e.target.style.color = "rgba(255,255,255,0.4)";
              }}
            >
              Terms & Conditions
            </span>
          </div>
          <p className="footer-made" style={{ color: "rgba(255,255,255,0.4)", fontSize: "11px", fontFamily: "'Poppins',sans-serif" }}>Made with ♥ in India</p>
        </div>
      </div>
    </footer>
  );
}
