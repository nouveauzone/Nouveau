import { useContext } from "react";
import Footer from "../components/Footer";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { THEME } from "../styles/theme";
import NouveauLogo from "../components/Logo";
import Icons from "../components/Icons";
import StarRating from "../components/StarRating";
import { BtnPrimary } from "../components/Buttons";
import { fixImageUrl } from "../utils/imageUrl";

export default function WishlistPage({ setPage, setSelectedProduct }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { dispatch: cartDispatch } = useContext(CartContext);

  return (
    <div style={{ background:THEME.bg, minHeight:"100vh", color:THEME.text, display:"flex", flexDirection:"column" }}>
      <div style={{ maxWidth:"1200px", width:"100%", margin:"0 auto", padding:"84px 40px 96px", flex:1, display:"flex", flexDirection:"column" }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(36px, 5vw, 48px)", marginBottom:"36px", textAlign:"center" }}>Wishlist</h1>
        {wishlist.length === 0 ? (
          <div style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px 0 24px" }}>
            <div style={{ textAlign:"center", maxWidth:"560px", width:"100%", padding:"52px 30px", background:THEME.bgCard, border:`1px solid ${THEME.border}`, borderRadius:"32px", boxShadow:"0 18px 36px rgba(26,26,26,0.06)" }}>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:"14px" }}>
                <NouveauLogo size={64} />
              </div>
              <p style={{ fontFamily:"'Poppins', sans-serif", fontSize:"20px", color:THEME.textMuted, marginTop:"20px", fontStyle:"italic", lineHeight:1.7 }}>Your wishlist is empty. Start exploring!</p>
              <div style={{ marginTop:"28px", display:"flex", justifyContent:"center" }}>
                <BtnPrimary onClick={() => setPage("Shop")}>Explore Collection <Icons.Arrow /></BtnPrimary>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(250px,1fr))", gap:"20px", alignContent:"start" }}>
            {wishlist.map((p) => (
              <div key={p._id} style={{ background:THEME.bgCard, position:"relative", border:`1px solid ${THEME.border}` }}>
                <img
                  src={fixImageUrl(p.images?.[0])}
                  alt={p.title}
                  style={{ width:"100%", aspectRatio:"3/4", objectFit:"cover", display:"block" }}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/product1.jpeg";
                  }}
                />
                <button
                  onClick={() => toggleWishlist(p)}
                  aria-label="Remove from wishlist"
                  style={{
                    position:"absolute",
                    top:"12px",
                    right:"12px",
                    background:THEME.crimson,
                    border:"none",
                    color:"#fff",
                    cursor:"pointer",
                    width:"36px",
                    height:"36px",
                    borderRadius:"10px",
                    display:"inline-flex",
                    alignItems:"center",
                    justifyContent:"center",
                    boxShadow:"0 8px 16px rgba(0,0,0,0.16)",
                  }}>
                  <Icons.Heart filled={false} />
                </button>
                <div style={{ padding:"18px" }}>
                  <StarRating rating={p.rating} count={p.reviews} />
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", margin:"8px 0 4px" }}>{p.title}</p>
                  <p style={{ color:THEME.crimson, fontWeight:700, marginBottom:"16px", fontFamily:"'Poppins', sans-serif", fontSize:"17px" }}>{p.price.toLocaleString()}</p>
                  <BtnPrimary onClick={() => {
                    const sizeEntry = Array.isArray(p.sizes)
                      ? p.sizes.find((entry) => (entry?.quantity ?? entry?.stock ?? 0) > 0) || p.sizes[0]
                      : null;
                    const sizeValue = typeof sizeEntry === "object" ? sizeEntry?.size : String(sizeEntry || "Free Size");
                    const sizeStock = typeof sizeEntry === "object" ? Number(sizeEntry?.quantity ?? sizeEntry?.stock ?? 0) : 0;
                    cartDispatch({ type:"ADD", item:{ ...p, size:sizeValue, stockQuantity:sizeStock } });
                  }} style={{ width:"100%", justifyContent:"center" }}>Add to Cart</BtnPrimary>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
