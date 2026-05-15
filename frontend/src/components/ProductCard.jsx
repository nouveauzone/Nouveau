import { memo, useContext, useMemo } from "react";
import { WishlistContext } from "../context/WishlistContext";
import { CartContext } from "../context/CartContext";
import { AuthContext } from "../context/AuthContext";
import { CurrencyContext } from "../context/CurrencyContext";
import { ToastContext } from "../context/Providers";
import Icons from "./Icons";
import StarRating from "./StarRating";
import { fixImageUrl } from "../utils/imageUrl";

const BAD_TEXT_RE = /(\/static\/media|\.(jpeg|jpg|png|webp|svg)$|\.[a-f0-9]{8,}$|^https?:\/\/|\\)/i;

const safeText = (value, fallback = "") => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || BAD_TEXT_RE.test(raw)) return fallback;
  return raw;
};

function ProductCard({ product, setPage, setSelectedProduct }) {
  const { wishlist, toggleWishlist } = useContext(WishlistContext);
  const { dispatch: cartDispatch } = useContext(CartContext);
  const { isAuthenticated } = useContext(AuthContext);
  const { formatPrice } = useContext(CurrencyContext);
  const toast = useContext(ToastContext);

  const wished = wishlist.some((item) => item._id === product._id);
  const sizeInventory = Array.isArray(product.sizes) && product.sizes.length
    ? product.sizes.map((entry) => ({
        size: String(entry?.size || "").trim(),
        quantity: Math.max(0, Number(entry?.quantity ?? entry?.stock) || 0),
      })).filter((entry) => entry.size)
    : [];
  const safeStock = sizeInventory.reduce((sum, entry) => sum + entry.quantity, 0);
  const isOutOfStock = safeStock <= 0;

  const { title, subtitle, category, image, price, originalPrice, rating, reviewCount, hasDiscount } = useMemo(() => {
    const nextTitle = safeText(product.title, "Nouveau Signature Piece");
    const nextSubtitle = safeText(product.subcategory, "Womenswear");
    const nextCategory = safeText(product.category, "Nouveau Collection");
    const nextImage = fixImageUrl(product.images?.[0]);
    const nextPrice = Number(product.price) || 0;
    const nextOriginalPrice = Number(product.originalPrice) || nextPrice;
    const nextRating = Number(product.rating) || 0;
    const nextReviewCount = Array.isArray(product.reviews) ? product.reviews.length : Number(product.reviews) || 0;

    return {
      title: nextTitle,
      subtitle: nextSubtitle,
      category: nextCategory,
      image: nextImage,
      price: nextPrice,
      originalPrice: nextOriginalPrice,
      rating: nextRating,
      reviewCount: nextReviewCount,
      hasDiscount: nextOriginalPrice > nextPrice,
    };
  }, [product]);

  const goToProduct = () => {
    setSelectedProduct(product);
    try {
      window.localStorage.setItem("nouveau_last_product", JSON.stringify(product));
    } catch {
    }
    setPage("Product");
  };

  const addToCart = () => {
    if (!isAuthenticated) {
      toast("Please login first to add items to cart", "error");
      setPage("Auth");
      return;
    }
    if (isOutOfStock) return;
    const firstSize = sizeInventory.find((entry) => entry.quantity > 0) || sizeInventory[0];
    const fallbackSize = typeof product.sizes?.[0] === "string" ? String(product.sizes[0]) : "Free Size";
    const normalizedSize = firstSize?.size || fallbackSize;
    const sizeStock = firstSize?.quantity ?? 0;
    cartDispatch({ type: "ADD", item: { ...product, size: normalizedSize, stockQuantity: sizeStock, qty: 1 } });
  };

  return (
    <article className="sf-product-card">
      <div className="sf-product-media" onClick={goToProduct} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && goToProduct()}>
        <img
          src={image}
          alt={title}
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/product1.jpeg";
          }}
        />

        {isOutOfStock && <span className="sf-out-stock">Sold Out</span>}
        <button
          type="button"
          className="sf-wishlist-btn"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          aria-label="Toggle wishlist">
          <Icons.Heart filled={wished} />
        </button>
      </div>

      <div className="sf-product-body">
        <p className="sf-product-cat">{category}</p>
        <StarRating rating={rating} count={reviewCount} />

        <h3 className="sf-product-title" onClick={goToProduct}>{title}</h3>
        <p className="sf-product-sub">{subtitle}</p>

        <div className="sf-product-price">
          <span className="sf-product-price-current">{formatPrice(price)}</span>
          {hasDiscount && <span className="sf-product-price-original">{formatPrice(originalPrice)}</span>}
        </div>

        <div className="sf-product-actions">
          <button type="button" className="sf-btn" onClick={goToProduct}>View</button>
          <button type="button" className="sf-btn sf-btn-primary" onClick={addToCart} disabled={isOutOfStock} style={isOutOfStock ? { opacity: 0.55, cursor: "not-allowed" } : {}}>{isOutOfStock ? "Sold Out" : "Quick Add"}</button>
        </div>
      </div>
    </article>
  );
}

export default memo(ProductCard);
