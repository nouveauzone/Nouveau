import { useState, useEffect, lazy, Suspense, useContext } from "react";
import Navbar from "./components/Navbar";
import AppErrorBoundary from "./components/AppErrorBoundary";
import { THEME } from "./styles/theme";
import { GLOBAL_CSS } from "./styles/globalStyles";
import "./styles/storefront.css";
import { AuthContext } from "./context/AuthContext";
import { AUTH_EXPIRED_EVENT } from "./services/apiService";
import apiService from "./services/apiService";

const HomePage        = lazy(() => import("./pages/HomePage"));
const ShopPage        = lazy(() => import("./pages/ShopPage"));
const ProductPage     = lazy(() => import("./pages/ProductPage"));
const CartPage        = lazy(() => import("./pages/CartPage"));
const CheckoutPage    = lazy(() => import("./pages/CheckoutPage"));
const OrderSuccessPage= lazy(() => import("./pages/OrderSuccessPage"));
const AuthPage        = lazy(() => import("./pages/AuthPage"));
const AccountPage     = lazy(() => import("./pages/AccountPage"));
const WishlistPage    = lazy(() => import("./pages/WishlistPage"));
const AdminPage       = lazy(() => import("./pages/AdminPage"));
const AboutPage       = lazy(() => import("./pages/AboutPage"));
const ContactPage     = lazy(() => import("./pages/ContactPage"));
const SizeGuidePage   = lazy(() => import("./pages/SizeGuidePage"));
const ShippingPage    = lazy(() => import("./pages/ShippingPage"));
const TrackOrderPage  = lazy(() => import("./pages/TrackOrderPage"));
const FAQPage         = lazy(() => import("./pages/FAQPage"));
const TermsPage       = lazy(() => import("./pages/TermsPage"));

const ROUTES = {
  Home: "/",
  Shop: "/shop",
  Product: "/product",
  Cart: "/cart",
  Checkout: "/checkout",
  OrderSuccess: "/order-success",
  Auth: "/auth",
  Account: "/account",
  Wishlist: "/wishlist",
  Admin: "/admin",
  About: "/about",
  Contact: "/contact",
  SizeGuide: "/size-guide",
  Shipping: "/shipping",
  TrackOrder: "/track-order",
  FAQ: "/faq",
  Terms: "/terms",
};

const getPathPage = (pathname) => {
  const path = String(pathname || "").toLowerCase().replace(/\/+$/, "");
  if (path === "" || path === "/" || path === "/home") return "Home";
  if (path === "/shop") return "Shop";
  if (path === "/product") return "Product";
  if (path === "/cart") return "Cart";
  if (path === "/checkout") return "Checkout";
  if (path === "/order-success") return "OrderSuccess";
  if (path === "/auth") return "Auth";
  if (path === "/account") return "Account";
  if (path === "/wishlist") return "Wishlist";
  if (path === "/admin") return "Admin";
  if (path === "/about") return "About";
  if (path === "/contact") return "Contact";
  if (path === "/size-guide") return "SizeGuide";
  if (path === "/shipping") return "Shipping";
  if (path === "/track-order") return "TrackOrder";
  if (path === "/faq") return "FAQ";
  if (path === "/terms") return "Terms";
  return "Home";
};

const getShopCategory = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");
  if (category === "Indian Ethnic Wear" || category === "Indian Western Wear") return category;
  return null;
};

const restoreProductFromUrl = () => {
  if (typeof window === "undefined") return null;
  const params = new URLSearchParams(window.location.search);
  const productId = params.get("productId");
  if (!productId) return null;
  try {
    const stored = window.localStorage.getItem("nouveau_last_product");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (parsed && String(parsed._id) === productId) return parsed;
  } catch {
  }
  return null;
};

const LoadingSpinner = () => (
  <main style={{ minHeight:"60vh", display:"grid", placeItems:"center", background:THEME.bg }}>
    <div style={{ textAlign:"center" }}>
      <div style={{ width:"40px", height:"40px", border:`3px solid ${THEME.border}`, borderTop:`3px solid ${THEME.gold}`, borderRadius:"50%", animation:"spin 0.8s linear infinite", margin:"0 auto 16px" }} />
      <p style={{ color:THEME.textMuted, fontFamily:"'Poppins',sans-serif", fontSize:"12px", letterSpacing:"2px" }}>LOADING...</p>
    </div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </main>
);

export default function App() {
  const [page, setAppPage] = useState(() => getPathPage(window.location.pathname));
  const [routeCategory, setRouteCategory] = useState(() => getShopCategory());
  const [selectedProduct, setSelectedProduct] = useState(() => (getPathPage(window.location.pathname) === "Product" ? restoreProductFromUrl() : null));
  const { isAuthenticated } = useContext(AuthContext);

  const navigateTo = (nextPage) => {
    const pageKey = String(nextPage || "");

    if (pageKey === "EthnicWear" || pageKey === "WesternWear") {
      const category = pageKey === "EthnicWear" ? "Indian Ethnic Wear" : "Indian Western Wear";
      setRouteCategory(category);
      setAppPage("Shop");
      window.history.pushState({}, "", `${ROUTES.Shop}?category=${encodeURIComponent(category)}`);
      return;
    }

    const actualPage = pageKey === "Home" ? "Home" : Object.keys(ROUTES).includes(pageKey) ? pageKey : "Home";
    const path = ROUTES[actualPage] || ROUTES.Home;

    if (actualPage !== "Product") {
      setSelectedProduct(null);
    }

    if (actualPage === "Shop") {
      setRouteCategory(null);
    }

    setAppPage(actualPage);
    window.history.pushState({}, "", path);
  };

  useEffect(() => {
    const handlePopState = () => {
      const nextPage = getPathPage(window.location.pathname);
      setAppPage(nextPage);
      setRouteCategory(nextPage === "Shop" ? getShopCategory() : null);
      if (nextPage === "Product") {
        setSelectedProduct(restoreProductFromUrl());
      } else {
        setSelectedProduct(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (page === "Product" && selectedProduct && selectedProduct._id) {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get("productId") !== String(selectedProduct._id)) {
          params.set("productId", String(selectedProduct._id));
          window.history.replaceState({}, "", `${ROUTES.Product}?${params.toString()}`);
        }
        window.localStorage.setItem("nouveau_last_product", JSON.stringify(selectedProduct));
      } catch {
      }
    }
  }, [page, selectedProduct]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const dayKey = new Date().toISOString().slice(0, 10);
    const sessionKey = `nouveau_view_${dayKey}`;
    if (sessionStorage.getItem(sessionKey)) return;

    sessionStorage.setItem(sessionKey, "1");
    apiService.incrementSiteView().catch(() => {});
  }, []);

  useEffect(() => {
    const handleAuthExpired = () => {
      navigateTo("Auth");
      setSelectedProduct(null);
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, []);

  const setPage = (nextPage) => {
    navigateTo(nextPage);
  };

  const renderPage = () => {
    switch (page) {
      case "Home":         return <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "Shop":         return <ShopPage setPage={setPage} setSelectedProduct={setSelectedProduct} initialCategory={routeCategory} />;
      case "Product":      return <ProductPage product={selectedProduct} setPage={setPage} />;
      case "Cart":         return <CartPage setPage={setPage} />;
      case "Checkout":     return <CheckoutPage setPage={setPage} />;
      case "OrderSuccess": return <OrderSuccessPage setPage={setPage} />;
      case "Auth":         return <AuthPage setPage={setPage} />;
      case "Account":      return <AccountPage setPage={setPage} />;
      case "Wishlist":     return <WishlistPage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
      case "Admin":        return <AdminPage setPage={setPage} />;
      case "About":        return <AboutPage setPage={setPage} />;
      case "Contact":      return <ContactPage setPage={setPage} />;
      case "SizeGuide":    return <SizeGuidePage setPage={setPage} />;
      case "Shipping":     return <ShippingPage setPage={setPage} />;
      case "TrackOrder":   return <TrackOrderPage setPage={setPage} />;
      case "FAQ":          return <FAQPage setPage={setPage} />;
      case "Terms":        return <TermsPage setPage={setPage} />;
      default:             return <HomePage setPage={setPage} setSelectedProduct={setSelectedProduct} />;
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <AppErrorBoundary>
        <Navbar page={page} setPage={setPage} />
        <Suspense fallback={<LoadingSpinner />}>
          <main>{renderPage()}</main>
        </Suspense>

      </AppErrorBoundary>
    </>
  );
}
