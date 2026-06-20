import { Component } from "react";
import { THEME } from "../styles/theme";

export default class AppErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("App Error:", error, info);

    const message = String(error?.message || error || "");
    const isChunkOrCacheError = /(ChunkLoadError|Loading chunk [0-9]+ failed|Failed to fetch dynamically imported module|Importing a module script failed)/i.test(message);

    // One-time self-recovery for stale cached assets after a deployment.
    if (isChunkOrCacheError && typeof window !== "undefined") {
      const retryKey = "nouveau_chunk_retry_once";
      const retried = window.sessionStorage.getItem(retryKey) === "1";
      if (!retried) {
        window.sessionStorage.setItem(retryKey, "1");
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          minHeight: "100vh", 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center", 
          flexDirection: "column", 
          gap: "28px", 
          background: `linear-gradient(135deg, ${THEME.bg} 0%, ${THEME.bgDark} 100%)`,
          fontFamily: "'Poppins', sans-serif", 
          padding: "clamp(20px, 5vw, 40px)",
          textAlign: "center",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Background ornament */}
          <div style={{ 
            position: "absolute", 
            top: "-100px", 
            right: "0", 
            maxWidth: "100%",
            width: "300px", 
            height: "300px", 
            borderRadius: "50%", 
            background: `radial-gradient(circle, ${THEME.gold}15, transparent)`,
            pointerEvents: "none"
          }} />
          <div style={{ 
            position: "absolute", 
            bottom: "-80px", 
            left: "-80px", 
            width: "250px", 
            height: "250px", 
            borderRadius: "50%", 
            background: `radial-gradient(circle, ${THEME.crimson}10, transparent)`,
            pointerEvents: "none"
          }} />

          {/* Content */}
          <div style={{ position: "relative", zIndex: 10 }}>
            <div style={{ fontSize: "clamp(48px, 12vw, 72px)", marginBottom: "16px" }}>🪷</div>
            
            <h2 style={{ 
              fontFamily: "'Playfair Display', serif", 
              fontSize: "clamp(26px, 5vw, 44px)", 
              color: THEME.text, 
              margin: "0 0 12px 0",
              fontWeight: 700,
              letterSpacing: "-0.5px"
            }}>
              Something Went Wrong
            </h2>

            <p style={{ 
              color: THEME.textMuted, 
              fontSize: "clamp(13px, 2vw, 16px)", 
              maxWidth: "480px", 
              lineHeight: 1.8, 
              margin: "0 auto 8px",
              letterSpacing: "0.3px"
            }}>
              We encountered an unexpected error loading this page.
            </p>
            
            <p style={{ 
              color: THEME.textLight, 
              fontSize: "clamp(12px, 1.5vw, 13px)", 
              maxWidth: "480px", 
              lineHeight: 1.6, 
              margin: "0 auto 32px",
              letterSpacing: "0.5px"
            }}>
              This is usually caused by cached files. Try refreshing below.
            </p>

            <div style={{ display: "flex", gap: "12px", flexDirection: "column", alignItems: "center" }}>
              <button
                onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
                style={{ 
                  background: `linear-gradient(135deg, ${THEME.crimson}, ${THEME.crimsonDark})`,
                  color: "#fff", 
                  border: "none", 
                  padding: "clamp(12px, 2vw, 16px) clamp(24px, 5vw, 40px)", 
                  borderRadius: "99px", 
                  fontSize: "clamp(12px, 1.5vw, 14px)", 
                  letterSpacing: "2px", 
                  cursor: "pointer", 
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 700,
                  textTransform: "uppercase",
                  boxShadow: `0 12px 28px ${THEME.crimson}28`,
                  transition: "all 0.3s ease",
                  minHeight: "44px",
                  minWidth: "200px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = `0 16px 36px ${THEME.crimson}35`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = `0 12px 28px ${THEME.crimson}28`;
                }}
              >
                ↻ REFRESH PAGE
              </button>

              <button
                onClick={() => { window.location.href = "/"; }}
                style={{ 
                  background: "transparent",
                  color: THEME.crimson, 
                  border: `1.5px solid ${THEME.crimson}`,
                  padding: "clamp(11px, 2vw, 15px) clamp(22px, 5vw, 38px)", 
                  borderRadius: "99px", 
                  fontSize: "clamp(12px, 1.5vw, 14px)", 
                  letterSpacing: "2px", 
                  cursor: "pointer", 
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 700,
                  textTransform: "uppercase",
                  transition: "all 0.3s ease",
                  minHeight: "44px",
                  minWidth: "200px"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = `${THEME.crimson}08`;
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                ← BACK HOME
              </button>
            </div>

            {/* Debug info for admins */}
            {this.state.error && (
              <details style={{ 
                marginTop: "32px", 
                padding: "16px", 
                background: "rgba(0,0,0,0.04)", 
                borderRadius: "10px",
                border: `1px solid ${THEME.border}`,
                maxWidth: "500px",
                margin: "32px auto 0"
              }}>
                <summary style={{ 
                  cursor: "pointer", 
                  fontFamily: "'Poppins', sans-serif", 
                  fontSize: "12px",
                  fontWeight: 600,
                  color: THEME.textLight,
                  letterSpacing: "1px"
                }}>
                  ERROR DETAILS (DEV)
                </summary>
                <pre style={{ 
                  fontSize: "11px", 
                  color: THEME.textMuted, 
                  overflow: "auto",
                  marginTop: "10px",
                  padding: "10px",
                  background: "rgba(0,0,0,0.02)",
                  borderRadius: "6px"
                }}>
                  {this.state.error.toString()}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
