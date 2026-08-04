import { THEME } from "../styles/theme";

const SAFFRON = THEME.crimson;
const GREEN = THEME.crimsonDark;
const GOLD = THEME.gold;

export function BtnPrimary({ onClick, children, style={}, disabled=false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:"inline-flex",alignItems:"center",gap:"8px",
      padding:"13px 28px",
      background:disabled?THEME.border:`linear-gradient(90deg,${SAFFRON},${THEME.accent},${GREEN})`,
      color:"#1A1A1A",border:"none",borderRadius:"99px",
      fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",fontWeight:700,
      cursor:disabled?"not-allowed":"pointer",transition:"all 0.3s ease",
      boxShadow:disabled?"none":`0 6px 20px ${SAFFRON}35`,
      whiteSpace:"nowrap",...style,
    }}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${SAFFRON}40, 0 10px 28px ${GREEN}25`;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=disabled?"none":`0 6px 20px ${SAFFRON}35`;}}>
      {children}
    </button>
  );
}

export function BtnOutline({ onClick, children, color, style={} }) {
  const c = color || GREEN;
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
