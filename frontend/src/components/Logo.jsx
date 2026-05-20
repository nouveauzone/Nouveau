import { fixImageUrl } from "../utils/imageUrl";

export default function NouveauLogo({ size = 44, bg = false }) {
  return (
    <div style={{
      width: size,
      height: size * 1.3,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: 0,
    }}>
      <img
        src={fixImageUrl("/nouveau-logo.png")}
        alt="Nouveau™ Logo"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          display: "block",
        }}
      />
    </div>
  );
}
