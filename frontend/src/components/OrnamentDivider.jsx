import { THEME } from "../styles/theme";

export default function OrnamentDivider({ color = THEME.gold }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"12px", margin:"12px 0" }}>
      <div style={{ flex:1, height:"1px", background:`linear-gradient(to right, transparent, ${color}60)` }} />
      <svg width="20" height="20" viewBox="0 0 24 24">
        <path d="M12 2L13.5 9H21L15 13.5L17.5 21L12 17L6.5 21L9 13.5L3 9H10.5L12 2Z" fill={color} opacity="0.8" />
      </svg>
      <div style={{ flex:1, height:"1px", background:`linear-gradient(to left, transparent, ${color}60)` }} />
    </div>
  );
}
