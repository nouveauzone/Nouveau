import { THEME } from "../styles/theme";

const BURGUNDY = THEME.burgundy;
const BLUSH = THEME.blushPink;
const GOLD = THEME.gold;

export function BtnPrimary({ onClick, children, style={}, disabled=false }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display:"inline-flex",alignItems:"center",gap:"8px",
      padding:"13px 28px",
      background:disabled?THEME.border:BURGUNDY,
      color:"#FFFFFF",border:"none",borderRadius:"12px",
      fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",fontWeight:700,
      cursor:disabled?"not-allowed":"pointer",transition:"all 0.3s ease",
      boxShadow:disabled?"none":`0 6px 20px ${BURGUNDY}35`,
      whiteSpace:"nowrap",...style,
    }}
      onMouseEnter={e=>{if(!disabled){e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${BURGUNDY}45`;}}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=disabled?"none":`0 6px 20px ${BURGUNDY}35`;}}>
      {children}
    </button>
  );
}

export function BtnOutline({ onClick, children, color, style={} }) {
  const c = color || BURGUNDY;
  return (
    <button onClick={onClick} style={{
      display:"inline-flex",alignItems:"center",gap:"8px",
      padding:"12px 26px",background:"transparent",color:c,
      border:`2px solid ${c}`,borderRadius:"12px",
      fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",fontWeight:600,
      cursor:"pointer",transition:"all 0.3s ease",whiteSpace:"nowrap",...style,
    }}
      onMouseEnter={e=>{e.currentTarget.style.background=c+"15";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 6px 16px ${c}25`;}}
      onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.transform="";e.currentTarget.style.boxShadow="";}}>
      {children}
    </button>
  );
}

export function BtnGold({ onClick, children, style={} }) {
  return (
    <button onClick={onClick} style={{
      display:"inline-flex",alignItems:"center",gap:"8px",
      padding:"13px 28px",
      background:`linear-gradient(135deg,${GOLD},${THEME.goldLight})`,
      color:"#fff",border:"none",borderRadius:"12px",
      fontFamily:"'Poppins',sans-serif",fontSize:"11px",letterSpacing:"2px",fontWeight:700,
      cursor:"pointer",transition:"all 0.3s",
      boxShadow:`0 6px 20px ${GOLD}35`,whiteSpace:"nowrap",...style,
    }}
      onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow=`0 10px 28px ${GOLD}45`;}}
      onMouseLeave={e=>{e.currentTarget.style.transform="";e.currentTarget.style.boxShadow=`0 6px 20px ${GOLD}35`;}}>
      {children}
    </button>
  );
}
