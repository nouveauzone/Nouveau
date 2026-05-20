import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { THEME } from "../styles/theme";
import Footer from "../components/Footer";
import API from "../config/api";
import { fixImageUrl } from "../utils/imageUrl";

// Use same API base as rest of app - no axios needed
const API_BASE = API;

const buildApiUrl = (path = "") => {
  const base = String(API_BASE || "").trim().replace(/\/+$/g, "");
  const suffix = String(path || "").trim().replace(/^\/+/, "");
  return base ? `${base}/${suffix}` : `/${suffix}`;
};

const getAuthHeader = () => {
  try {
    const auth = JSON.parse(localStorage.getItem("nouveau_auth") || "{}");
    const token = String(auth?.token || localStorage.getItem("token") || "").trim();
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch { return {}; }
};

const STATUS_STEPS = ["Placed", "Processing", "Shipped", "Out for Delivery", "Delivered"];

const STATUS_CONFIG = {
  "Awaiting Payment Verification": { color: "#d97706", bg: "#d9770615", icon: "⏳", label: "Awaiting Payment Verification" },
  Placed:             { color: "#D4AF37", bg: "#D4AF3715", icon: "📋", label: "Placed" },
  Processing:         { color: "#2196F3", bg: "#2196F315", icon: "⚙️",  label: "Processing" },
  Shipped:            { color: "#9C27B0", bg: "#9C27B015", icon: "🚀", label: "Shipped" },
  "Out for Delivery": { color: "#FF9800", bg: "#FF980015", icon: "🛵", label: "Out for Delivery" },
  Delivered:          { color: "#22c55e", bg: "#22c55e15", icon: "✅", label: "Delivered" },
  Cancelled:          { color: "#B76E79", bg: "#B76E7915", icon: "❌", label: "Cancelled" },
};

function getStepIndex(status) {
  if (status === "Awaiting Payment Verification") return -1;
  const idx = STATUS_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
}

// ── Progress Bar ──────────────────────────────────────────────────────────────
function ProgressBar({ status }) {
  const currentIdx  = getStepIndex(status);
  const progressIdx = Math.max(currentIdx, 0);
  const isCancelled = status === "Cancelled";
  const isAwaitingPayment = status === "Awaiting Payment Verification";
  return (
    <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", padding: "32px 28px", marginBottom: "20px" }}>
      <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"3px", color:THEME.crimson, fontWeight:700, marginBottom:"28px" }}>ORDER PROGRESS</p>
      {isCancelled ? (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <span style={{ fontSize:"40px" }}>❌</span>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:THEME.crimson, marginTop:"12px" }}>Order Cancelled</p>
        </div>
      ) : isAwaitingPayment ? (
        <div style={{ textAlign:"center", padding:"20px 0" }}>
          <span style={{ fontSize:"40px" }}>⏳</span>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#d97706", marginTop:"12px" }}>Awaiting Payment Verification</p>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted, marginTop:"6px" }}>Order will be confirmed after UPI payment is verified.</p>
        </div>
      ) : (
        <div style={{ position:"relative" }}>
          <div style={{ position:"absolute", top:"18px", left:"0", right:"0", height:"4px", background:THEME.border, zIndex:0, borderRadius:"99px", margin:"0 32px" }}>
            <div style={{ height:"100%", width:`${(progressIdx/(STATUS_STEPS.length-1))*100}%`, background:`linear-gradient(to right,${THEME.crimson},#D4AF37)`, borderRadius:"99px", transition:"width 1s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between", position:"relative", zIndex:1 }}>
            {STATUS_STEPS.map((step, i) => {
              const done    = currentIdx >= i;
              const current = currentIdx === i;
              return (
                <div key={step} style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:"10px", flex:1 }}>
                  <div style={{ width:"36px", height:"36px", borderRadius:"50%", background: done?(current?"#D4AF37":THEME.crimson):"#fff", border:`3px solid ${done?(current?"#D4AF37":THEME.crimson):THEME.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", boxShadow:current?`0 0 0 6px #D4AF3730`:done?`0 0 0 3px ${THEME.crimson}20`:"none", transition:"all 0.4s" }}>
                    {done
                      ? (current ? "●" : <svg viewBox="0 0 10 8" width="14" height="14"><path d="M1 4L3.5 7L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/></svg>)
                      : "○"}
                  </div>
                  <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", fontWeight:current?700:done?600:400, color:current?"#D4AF37":done?THEME.crimson:THEME.textLight, whiteSpace:"pre-line", lineHeight:1.3, maxWidth:"70px" }}>
                    {step === "Out for Delivery" ? "Out for\nDelivery" : step}
                    {current && <span style={{ display:"block", fontSize:"7px", background:"#D4AF3720", color:"#D4AF37", padding:"1px 5px", borderRadius:"99px", marginTop:"3px" }}>NOW</span>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Status History ────────────────────────────────────────────────────────────
function StatusTimeline({ history }) {
  if (!history?.length) return null;
  return (
    <div style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"16px", padding:"28px", marginBottom:"20px" }}>
      <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"3px", color:THEME.crimson, fontWeight:700, marginBottom:"24px" }}>STATUS HISTORY</p>
      <div style={{ position:"relative", paddingLeft:"32px" }}>
        {[...history].reverse().map((entry, i) => {
          const cfg    = STATUS_CONFIG[entry.status] || STATUS_CONFIG.Placed;
          const isLast = i === history.length - 1;
          const isFirst= i === 0;
          return (
            <div key={i} style={{ display:"flex", gap:"16px", marginBottom:isLast?0:"28px", position:"relative" }}>
              <div style={{ position:"absolute", left:"-32px", top:"2px", width:"24px", height:"24px", borderRadius:"50%", background:isFirst?cfg.color:cfg.bg, border:`2px solid ${cfg.color}`, display:"flex", alignItems:"center", justifyContent:"center", zIndex:1, boxShadow:isFirst?`0 0 0 5px ${cfg.color}25`:"none" }}>
                {isFirst
                  ? <span style={{ fontSize:"9px", color:"#fff" }}>●</span>
                  : <svg viewBox="0 0 10 8" width="12" height="12"><path d="M1 4L3.5 7L9 1" stroke={cfg.color} strokeWidth="2" strokeLinecap="round" fill="none"/></svg>
                }
              </div>
              {!isLast && <div style={{ position:"absolute", left:"-21px", top:"28px", width:"2px", height:"28px", background:`${cfg.color}40` }} />}
              <div>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"14px", fontWeight:isFirst?700:500, color:isFirst?cfg.color:THEME.text }}>
                  {cfg.icon} {entry.status}
                  {isFirst && <span style={{ fontSize:"9px", background:`${cfg.color}20`, color:cfg.color, padding:"2px 8px", borderRadius:"99px", marginLeft:"8px" }}>LATEST</span>}
                </p>
                {entry.message && <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted, marginTop:"2px" }}>{entry.message}</p>}
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textLight, marginTop:"3px" }}>
                  {entry.updatedAt ? new Date(entry.updatedAt).toLocaleString("en-IN", { dateStyle:"medium", timeStyle:"short" }) : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Order Info ────────────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const cfg     = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.Placed;
  const isAwaitingPayment = order.orderStatus === "Awaiting Payment Verification";
  const estDate = order.estimatedDelivery
    ? new Date(order.estimatedDelivery).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })
    : "5–7 business days";

  return (
    <>
      {/* Status Banner */}
      <div style={{ background:`linear-gradient(135deg,${cfg.color}25,${cfg.color}08)`, border:`1.5px solid ${cfg.color}50`, borderRadius:"16px", padding:"20px 24px", display:"flex", alignItems:"center", gap:"16px", marginBottom:"20px" }}>
        <div style={{ flex:1 }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"2px", color:cfg.color, fontWeight:700 }}>ORDER STATUS</p>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", fontWeight:700, color:cfg.color }}>{cfg.label.toUpperCase()}</p>
        </div>
        <div style={{ textAlign:"right" }}>
          <button onClick={() => navigator.clipboard?.writeText(order.trackingId)} title="Copy Tracking ID"
            style={{ background:THEME.bgDark, border:`1px solid ${THEME.border}`, color:THEME.crimson, padding:"8px 14px", borderRadius:"10px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:700 }}>
            📋 {order.trackingId}
          </button>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", color:THEME.textLight, marginTop:"4px" }}>Tap to copy</p>
        </div>
      </div>

      {/* Info Grid */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"12px", marginBottom:"20px" }}>
        {[
          ["👤 Customer",   order.shippingAddress?.name || order.user?.name || "—"],
          ["💰 Total",      `₹${(order.total||0).toLocaleString("en-IN")}`],
          ["💳 Payment",    order.paymentMethod || "COD"],
          ["📅 Ordered",    new Date(order.createdAt).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})],
          ["🚚 Est. Delivery", isAwaitingPayment ? "After payment verification" : order.orderStatus==="Delivered"?"✅ Delivered":estDate],
          ["📦 Items",      `${order.items?.length||0} item(s)`],
        ].map(([label, value]) => (
          <div key={label} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"12px", padding:"14px 18px" }}>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", letterSpacing:"1px", color:THEME.textLight, marginBottom:"4px" }}>{label}</p>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:THEME.text, fontWeight:600 }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Address */}
      {order.shippingAddress && (
        <div style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"12px", padding:"16px 20px", marginBottom:"20px" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", letterSpacing:"1px", color:THEME.textLight, marginBottom:"8px" }}>📍 SHIPPING ADDRESS</p>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:THEME.text, fontWeight:600 }}>{order.shippingAddress.name}</p>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted, lineHeight:1.6 }}>
            {[order.shippingAddress.street, order.shippingAddress.city, order.shippingAddress.state, order.shippingAddress.pincode].filter(Boolean).join(", ")}
          </p>
          {order.shippingAddress.phone && <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted }}>📞 {order.shippingAddress.phone}</p>}
        </div>
      )}

      {/* Items */}
      {order.items?.length > 0 && (
        <div style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"12px", padding:"16px 20px", marginBottom:"20px" }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", letterSpacing:"1px", color:THEME.textLight, marginBottom:"12px" }}>🛍️ ITEMS</p>
          {order.items.map((item, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 0", borderBottom: i<order.items.length-1?`1px solid ${THEME.border}`:"none" }}>
              {item.image && <img src={fixImageUrl(item.image)} alt={item.title} style={{ width:"48px", height:"48px", objectFit:"cover", borderRadius:"8px" }} onError={e=>e.target.style.display="none"} />}
              <div style={{ flex:1 }}>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:600, color:THEME.text }}>{item.title||"Product"}</p>
                <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textMuted }}>Qty: {item.qty}{item.size?` · Size: ${typeof item.size === 'object' ? item.size.size : item.size}`:""}</p>
              </div>
              <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", fontWeight:700, color:THEME.crimson }}>₹{(item.price||0).toLocaleString("en-IN")}</span>
            </div>
          ))}
        </div>
      )}

      {/* WhatsApp share */}
      {order.whatsappMessage && (
        <a href={`https://wa.me/?text=${encodeURIComponent(order.whatsappMessage)}`} target="_blank" rel="noopener noreferrer"
          style={{ display:"flex", alignItems:"center", gap:"10px", background:"#25D36615", border:"1px solid #25D36640", borderRadius:"12px", padding:"14px 20px", textDecoration:"none", marginBottom:"20px" }}>
          <span style={{ fontSize:"24px" }}>💬</span>
          <div>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#128C7E", fontSize:"13px" }}>Share on WhatsApp</p>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textMuted }}>Send tracking ID to friends or family</p>
          </div>
        </a>
      )}

      {/* Delivery callout */}
      {isAwaitingPayment && (
        <div style={{ background:"#fff7e6", border:"1px solid #ffd8a8", borderRadius:"12px", padding:"16px 20px", display:"flex", gap:"14px", alignItems:"center" }}>
          <span style={{ fontSize:"24px" }}>⏳</span>
          <div>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#d97706", fontSize:"13px" }}>Payment Verification Pending</p>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted }}>Once payment is verified, order confirmation and dispatch timeline will begin.</p>
          </div>
        </div>
      )}
      {!isAwaitingPayment && order.orderStatus!=="Delivered" && order.orderStatus!=="Cancelled" && (
        <div style={{ background:"#D4AF3710", border:"1px solid #D4AF3735", borderRadius:"12px", padding:"16px 20px", display:"flex", gap:"14px", alignItems:"center" }}>
          <span style={{ fontSize:"24px" }}>🚚</span>
          <div>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#b8962e", fontSize:"13px" }}>Expected Delivery</p>
            <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:THEME.textMuted }}>{estDate}</p>
          </div>
        </div>
      )}
      {order.orderStatus==="Delivered" && (
        <div style={{ background:"#d4edda", border:"1px solid #c3e6cb", borderRadius:"12px", padding:"16px 20px", display:"flex", gap:"14px", alignItems:"center" }}>
          <span style={{ fontSize:"24px" }}>🎉</span>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#155724", fontSize:"13px" }}>Order Delivered! We hope you love your Nouveau™ purchase!</p>
        </div>
      )}
    </>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TrackOrderPage({ setPage }) {
  const { isAuthenticated, token } = useContext(AuthContext);
  const [trackingId, setTrackingId] = useState("");
  const [order,      setOrder]      = useState(null);
  const [myOrders,   setMyOrders]   = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState("");
  const [activeTab,  setActiveTab]  = useState("track");

  useEffect(() => {
    const saved = localStorage.getItem("lastTrackingId");
    if (saved) setTrackingId(saved);
  }, []);

  useEffect(() => {
    if (activeTab !== "myorders") return;
    if (!isAuthenticated || !token) return;
    fetchMyOrders();
  }, [activeTab, isAuthenticated, token]);

  const fetchMyOrders = async () => {
    const headers = { ...getAuthHeader() };
    if (!headers.Authorization) return;

    try {
      const res  = await fetch(buildApiUrl("api/orders/my"), { headers });
      const data = await res.json();
      if (!res.ok) {
        console.error("Failed to fetch my orders", { status: res.status, body: data });
        return;
      }
      if (Array.isArray(data)) { setMyOrders(data); if (data.length > 0) setActiveTab("myorders"); }
    } catch (e) {
      console.error("my orders error:", e);
    }
  };

  const handleTrack = async (id) => {
    const tid = (id || trackingId).trim();
    if (!tid) return;
    setLoading(true); setError(""); setOrder(null);
    try {
      // Public endpoint — no auth header needed
      const res  = await fetch(buildApiUrl(`api/orders/track/${encodeURIComponent(tid)}`));
      const data = await res.json();
      if (!res.ok) {
        console.error("Track order failed", { status: res.status, body: data });
        throw new Error(data.message || "Order not found");
      }
      setOrder(data);
      localStorage.setItem("lastTrackingId", tid);
      setActiveTab("track");
      window.scrollTo({ top:0, behavior:"smooth" });
    } catch (err) {
      setError(err.message || `No order found with tracking ID: ${tid}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh" }}>
      {/* Hero */}
      <div style={{ background:`linear-gradient(135deg,${THEME.crimsonDark} 0%,#7b2d3e 50%,#9f5b65 100%)`, padding:"60px 40px 0", position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", inset:0, backgroundImage:`radial-gradient(circle at 20% 50%,rgba(212,175,55,0.08) 0%,transparent 60%)` }} />
        <div style={{ maxWidth:"960px", margin:"0 auto", position:"relative", zIndex:1 }}>
          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"10px", letterSpacing:"6px", color:"#D4AF37", marginBottom:"10px" }}>REAL-TIME STATUS</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(28px,5vw,48px)", fontWeight:700, color:"#fff", marginBottom:"8px" }}>Track Your Order</h1>
          <p style={{ color:"rgba(255,255,255,0.6)", fontSize:"14px", fontFamily:"'Poppins',sans-serif", marginBottom:"32px" }}>Enter your Tracking ID — format: ORD followed by numbers</p>

          {/* Search */}
          <div style={{ background:"rgba(255,255,255,0.10)", backdropFilter:"blur(12px)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:"16px 16px 0 0", padding:"24px 28px" }}>
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
              <input value={trackingId} onChange={e=>setTrackingId(e.target.value)}
                placeholder="Enter Tracking ID e.g. ORD1748000000000"
                onKeyDown={e=>e.key==="Enter"&&handleTrack()}
                style={{ flex:1, minWidth:"220px", padding:"14px 20px", background:"rgba(255,255,255,0.95)", border:"none", borderRadius:"12px", fontSize:"15px", outline:"none", fontFamily:"'Poppins',sans-serif", color:"#1a1a1a" }} />
              <button onClick={()=>handleTrack()} disabled={loading}
                style={{ padding:"14px 28px", background:"#D4AF37", border:"none", borderRadius:"12px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"14px", fontWeight:700, color:"#1a1a1a", opacity:loading?0.7:1, minWidth:"130px" }}>
                {loading ? "Searching..." : "🔍 Track"}
              </button>
            </div>
            {/* Recent tracking IDs hint */}
            {localStorage.getItem("lastTrackingId") && !order && (
              <div style={{ marginTop:"12px" }}>
                <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:"rgba(255,255,255,0.5)" }}>Last searched: </span>
                <button onClick={()=>handleTrack(localStorage.getItem("lastTrackingId"))}
                  style={{ background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)", color:"rgba(255,255,255,0.85)", padding:"3px 12px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:600 }}>
                  {localStorage.getItem("lastTrackingId")}
                </button>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display:"flex", gap:"4px", marginTop:"2px" }}>
            {[{id:"track",label:"📦 Track Order"},{id:"myorders",label:`🛍️ My Orders${myOrders.length>0?` (${myOrders.length})`:""}`}].map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                style={{ padding:"12px 24px", background:activeTab===tab.id?THEME.bgCard:"rgba(255,255,255,0.08)", border:"none", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:activeTab===tab.id?700:400, color:activeTab===tab.id?THEME.crimson:"rgba(255,255,255,0.7)", borderRadius:"10px 10px 0 0", transition:"all 0.2s" }}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:"960px", margin:"0 auto", padding:"40px 24px 60px" }}>

        {/* TRACK TAB */}
        {activeTab==="track" && (
          <div>
            {error && (
              <div style={{ background:"#fff3cd", border:"1px solid #ffc107", borderRadius:"14px", padding:"20px 24px", display:"flex", gap:"14px", alignItems:"center", marginBottom:"24px" }}>
                <span style={{ fontSize:"24px" }}>⚠️</span>
                <div>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, color:"#856404", marginBottom:"4px" }}>Order Not Found</p>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:"#856404" }}>{error}</p>
                  <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", color:"#856404", marginTop:"6px" }}>
                    💡 Tip: Tracking ID starts with <strong>ORD</strong> — check your Order Success page or WhatsApp message
                  </p>
                </div>
              </div>
            )}

            {order && (
              <>
                <OrderCard order={order} />
                <ProgressBar status={order.orderStatus} />
                <StatusTimeline history={order.statusHistory} />
              </>
            )}

            {!order && !error && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"16px" }}>
                {[["📋","Order Placed","Confirmed within minutes"],["⚙️","Processing","Prepared & quality checked"],["🚀","Shipped","Dispatched with courier"],["🛵","Out for Delivery","On the way to you!"],["✅","Delivered","Arrived at your door"]].map(([icon,title,desc])=>(
                  <div key={title} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"14px", padding:"24px 16px", textAlign:"center", transition:"all 0.3s" }}
                    onMouseEnter={e=>e.currentTarget.style.borderColor=THEME.crimson}
                    onMouseLeave={e=>e.currentTarget.style.borderColor=THEME.border}>
                    <div style={{ fontSize:"32px", marginBottom:"12px" }}>{icon}</div>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"13px", color:THEME.text, marginBottom:"6px" }}>{title}</p>
                    <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"11px", color:THEME.textMuted, lineHeight:1.6 }}>{desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY ORDERS TAB */}
        {activeTab==="myorders" && (
          <div>
            {!isAuthenticated ? (
              <div style={{ textAlign:"center", padding:"60px 20px", background:THEME.bgCard, borderRadius:"16px", border:`1px solid ${THEME.border}` }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>🔐</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", marginBottom:"8px" }}>Login to View Your Orders</h3>
                <button onClick={()=>setPage("Auth")} style={{ background:THEME.crimson, color:"#fff", border:"none", padding:"12px 28px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"14px", marginTop:"16px" }}>
                  Login / Sign Up →
                </button>
              </div>
            ) : myOrders.length===0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px", background:THEME.bgCard, borderRadius:"16px", border:`1px solid ${THEME.border}` }}>
                <div style={{ fontSize:"48px", marginBottom:"16px" }}>📭</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", marginBottom:"8px" }}>No Orders Yet</h3>
                <button onClick={()=>setPage("Shop")} style={{ background:THEME.crimson, color:"#fff", border:"none", padding:"12px 28px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontWeight:700, fontSize:"14px", marginTop:"16px" }}>
                  Shop Now →
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
                {myOrders.map(o=>{
                  const cfg     = STATUS_CONFIG[o.orderStatus] || STATUS_CONFIG.Placed;
                  const idx     = getStepIndex(o.orderStatus);
                  const progress= (idx/(STATUS_STEPS.length-1))*100;
                  return (
                    <div key={o._id} style={{ background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"16px", padding:"24px", borderLeft:`4px solid ${cfg.color}`, transition:"all 0.3s" }}
                      onMouseEnter={e=>e.currentTarget.style.boxShadow="0 8px 32px rgba(0,0,0,0.08)"}
                      onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"10px", marginBottom:"16px" }}>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:"8px", marginBottom:"4px" }}>
                            <span style={{ fontSize:"18px" }}>{cfg.icon}</span>
                            <code style={{ fontFamily:"'Poppins',sans-serif", fontSize:"12px", fontWeight:700, color:THEME.crimson }}>{o.trackingId||o._id}</code>
                          </div>
                          <p style={{ fontFamily:"'Poppins',sans-serif", fontSize:"13px", color:THEME.textMuted }}>
                            {new Date(o.createdAt).toLocaleDateString("en-IN")} · ₹{(o.total||0).toLocaleString("en-IN")}
                          </p>
                        </div>
                        <div style={{ display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"8px" }}>
                          <span style={{ background:cfg.bg, color:cfg.color, padding:"5px 14px", borderRadius:"99px", fontSize:"10px", fontFamily:"'Poppins',sans-serif", fontWeight:700, textTransform:"uppercase" }}>{cfg.label}</span>
                          <button onClick={()=>{ setTrackingId(o.trackingId||o._id); handleTrack(o.trackingId||o._id); }}
                            style={{ background:"none", border:`1px solid ${THEME.crimson}`, color:THEME.crimson, padding:"5px 14px", borderRadius:"99px", cursor:"pointer", fontFamily:"'Poppins',sans-serif", fontSize:"11px", fontWeight:600 }}>
                            Track →
                          </button>
                        </div>
                      </div>
                      {o.orderStatus!=="Cancelled" && (
                        <div>
                          <div style={{ height:"4px", background:THEME.border, borderRadius:"99px", overflow:"hidden" }}>
                            <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(to right,${THEME.crimson},#D4AF37)`, borderRadius:"99px", transition:"width 0.5s" }} />
                          </div>
                          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
                            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", color:THEME.crimson }}>Placed</span>
                            <span style={{ fontFamily:"'Poppins',sans-serif", fontSize:"9px", color:progress===100?THEME.crimson:THEME.textLight }}>Delivered</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
