import Icons from "./Icons";
import { THEME } from "../styles/theme";

export default function StarRating({ rating, count }) {
  const safeRating = Number.isFinite(Number(rating)) ? Number(rating) : 0;
  const safeCount = Array.isArray(count)
    ? count.length
    : Number.isFinite(Number(count))
      ? Number(count)
      : undefined;

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"3px" }}>
      {[1, 2, 3, 4, 5].map((s) => <Icons.Star key={s} filled={s <= Math.round(safeRating)} />)}
      {safeCount !== undefined && <span style={{ fontSize:"12px", color:THEME.textLight, marginLeft:"4px", fontFamily:"'Poppins', sans-serif" }}>({safeCount})</span>}
    </div>
  );
}
