import { THEME } from "../styles/theme";

const CRIMSON = "#B71C1C";
const GOLD    = "#C9A227";

export function BtnPrimary({ onClick, children, style={}, disabled=false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:"inline-flex",alignItems:"center",gap:"8px",
      padding:"13px 28px",
      background:disabled?THEME.border:`linear-gradient(135deg,${CRIMSON},#8B0000)`,
      color:"#fff",border:"none",borderRadius:"99px",
      fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",fontWeight:700,
      cursor:disabled?"not-allowed":"pointer",transition:"all 0.3s ease",
      boxShadow:disabled?"none":`0 6px 20px ${CRIMSON}35`,
      whiteSpace:"nowrap",...style,
    }}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${CRIMSON}50`;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=disabled?"none":`0 6px 20px ${CRIMSON}35`;}}>
      {children}
    </button>
  );
}

export function BtnOutline({ onClick, children, color, style={} }) {
  const c = color || CRIMSON;
  return (
    <button onClick={onClick} style={{
      display:"inline-flex",alignItems:"center",gap:"8px",
      padding:"12px 26px",background:"transparent",color:c,
      border:`1.5px solid ${c}`,borderRadius:"99px",
      fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",fontWeight:600,
      cursor:"pointer",transition:"all 0.3s ease",whiteSpace:"nowrap",...style,
    }}
      onMouseEnter={e=>{e.currentTarget.style.background=c+"15";e.currentTarget.style.transform="translateY(-2px)";}}
      onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.transform="";}}>
      {children}
    </button>
  );
}

export function BtnGold({ onClick, children, style={} }) {
  return (
    <button onClick={onClick} style={{
      display:"inline-flex",alignItems:"center",gap:"8px",
      padding:"13px 28px",
      background:`linear-gradient(135deg,${GOLD},#a07d15)`,
      color:"#fff",border:"none",borderRadius:"99px",
      fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",fontWeight:700,
      cursor:"pointer",transition:"all 0.3s",
      boxShadow:`0 6px 20px ${GOLD}40`,whiteSpace:"nowrap",...style,
    }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${GOLD}55`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 6px 20px ${GOLD}40`;}}>
      {children}
    </button>
  );
}
