import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";
import { AuthContext } from "../context/AuthContext";
import Icons from "./Icons";
import CurrencySelector from "./CurrencySelector";
import { fixImageUrl } from "../utils/imageUrl";
import logoImg from "../assets/images/nouveau-logo.png";

export default function Navbar({ page, setPage }) {
  const { cart } = useContext(CartContext);
  const { wishlist } = useContext(WishlistContext);
  const { isAuthenticated, user, dispatch } = useContext(AuthContext);

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [query, setQuery] = useState("");
  const profileRef = useRef(null);

  const safeCart = Array.isArray(cart) ? cart : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const cartCount = useMemo(() => safeCart.reduce((sum, item) => sum + Number(item?.qty || 0), 0), [safeCart]);
  const isAdmin = isAuthenticated && user?.role === "admin";
  const firstName = String(user?.name || "").trim().split(/\s+/)[0] || "User";
  const initials = String(user?.name || "U")
    .split(" ")
    .map((part) => part.trim()[0])
    .filter(Boolean)
    .join("")
    .toUpperCase()
    .slice(0, 2) || "U";

  const desktopLinks = isAdmin
    ? ["Home", "Shop", "About", "Contact", "Admin"]
    : ["Home", "Shop", "About", "Contact"];

  const mobileLinks = isAdmin
    ? ["Home", "Shop", "About", "Contact", "Admin", "Wishlist", "Cart"]
    : ["Home", "Shop", "About", "Contact", "Wishlist", "Cart"];

  const openShop = () => {
    setPage("Shop");
    setMenuOpen(false);
    try {
      const q = String(query || "").trim();
      if (q) window.dispatchEvent(new CustomEvent("nouveau:shop-search", { detail: { query: q } }));
    } catch (err) { }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
    setProfileOpen(false);
    setMenuOpen(false);
    setPage("Home");
  };

  useEffect(() => {
    const handleDocClick = (event) => {
      if (!profileRef.current?.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleDocClick);
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, []);

  return (
    <>
      <nav className="sf-navbar" aria-label="Main navigation">
        <div className="sf-container sf-navbar-inner">
          <button type="button" className="sf-logo" onClick={() => setPage("Home")}>
            <img src={logoImg} alt="Nouveau" className="sf-logo-mark" />
            <span
              className="sf-logo-word"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "1px",
                fontFamily: "'Playfair Display',serif",
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "2px",
                color: "#1A1A1A",
              }}
            >
              nouveau<span style={{ color: "#C9A227" }}>™</span>
            </span>
          </button>

          <div className="sf-nav-links">
            {desktopLinks.map((label) => (
              <button
                key={label}
                type="button"
                className={`sf-nav-link ${page === label ? "active" : ""}`}
                onClick={() => setPage(label)}>
                {label}
              </button>
            ))}
          </div>

          <div className="sf-search-wrap">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") openShop();
              }}
              className="sf-search"
              placeholder="Search products"
              aria-label="Search products"
            />
          </div>

          <div className="sf-nav-actions">
            <CurrencySelector className="sf-currency-switcher" />

            <button type="button" className="sf-icon-btn" onClick={openShop} aria-label="Open shop search">
              <Icons.Search />
            </button>

            {isAuthenticated ? (
              <div className="sf-profile-wrap" ref={profileRef}>
                <button
                  type="button"
                  className="sf-profile-trigger"
                  onClick={() => setProfileOpen((open) => !open)}
                  aria-label="Open profile menu">
                  <span className="sf-user-avatar" aria-hidden="true">
                    {initials}
                    <span className="sf-user-online-dot" />
                  </span>
                  <span className="sf-user-name">{firstName}</span>
                </button>
                {profileOpen && (
                  <div className="sf-profile-menu" role="menu" aria-label="Profile menu">
                    <button type="button" className="sf-profile-item" onClick={() => { setPage("Account"); setProfileOpen(false); }}>
                      <Icons.User /> <span>My Profile</span>
                    </button>
                    <button type="button" className="sf-profile-item" onClick={() => { setPage("Account"); setProfileOpen(false); }}>
                      <Icons.Package /> <span>My Orders</span>
                    </button>
                    <button type="button" className="sf-profile-item" onClick={() => { setPage("Wishlist"); setProfileOpen(false); }}>
                      <Icons.Heart /> <span>Wishlist</span>
                    </button>
                    <button type="button" className="sf-profile-item sf-profile-item-danger" onClick={logout}>
                      <Icons.Logout /> <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="sf-icon-btn"
                onClick={() => setPage("Auth")}
                aria-label="Open login">
                <Icons.User />
              </button>
            )}

            <button type="button" className="sf-icon-btn" onClick={() => setPage("Wishlist")} aria-label="Open wishlist">
              <Icons.Heart />
              {safeWishlist.length > 0 && <span className="sf-badge">{safeWishlist.length}</span>}
            </button>

            <button type="button" className="sf-icon-btn" onClick={() => setPage("Cart")} aria-label="Open cart">
              <Icons.Cart />
              {cartCount > 0 && <span className="sf-badge">{cartCount}</span>}
            </button>

            <button type="button" className="sf-icon-btn sf-menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Icons.Menu />
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="sf-mobile-menu" role="dialog" aria-modal="true" aria-label="Mobile menu">
          <div className="sf-mobile-menu-panel">
            <div className="sf-mobile-top">
              <strong className="sf-logo-word">Menu</strong>
              <button type="button" className="sf-icon-btn" onClick={() => setMenuOpen(false)} aria-label="Close menu">
                <Icons.X />
              </button>
            </div>

            {isAuthenticated ? (
              <div className="sf-mobile-user-card">
                <span className="sf-user-avatar" aria-hidden="true">
                  {initials}
                  <span className="sf-user-online-dot" />
                </span>
                <div>
                  <p className="sf-mobile-user-name">{user?.name || "User"}</p>
                  <p className="sf-mobile-user-state">Logged in</p>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="sf-mobile-nav-btn"
                onClick={() => {
                  setPage("Auth");
                  setMenuOpen(false);
                }}>
                Login
              </button>
            )}

            {mobileLinks.map((label) => (
              <button
                key={label}
                type="button"
                className="sf-mobile-nav-btn"
                onClick={() => {
                  setPage(label);
                  setMenuOpen(false);
                }}>
                {label}
              </button>
            ))}

            {isAuthenticated && (
              <>
                <button
                  type="button"
                  className="sf-mobile-nav-btn"
                  onClick={() => {
                    setPage("Account");
                    setMenuOpen(false);
                  }}>
                  My Profile
                </button>
                <button
                  type="button"
                  className="sf-mobile-nav-btn"
                  onClick={() => {
                    setPage("Account");
                    setMenuOpen(false);
                  }}>
                  My Orders
                </button>
                <button
                  type="button"
                  className="sf-mobile-nav-btn"
                  onClick={logout}>
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
