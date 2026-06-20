import { useReducer, useState, useEffect, useCallback, createContext } from "react";
import { AuthContext }     from "./AuthContext";
import { CartContext }     from "./CartContext";
import { WishlistContext } from "./WishlistContext";
import { CurrencyProvider } from "./CurrencyContext";
import { getShippingCharge } from "../data/constants";
import { AUTH_EXPIRED_EVENT } from "../services/apiService";
import { clearAuthSession, hydrateAuthSession, persistAuthSession } from "../utils/authSession";
import { fixImageUrl } from "../utils/imageUrl";

export const AppDataContext = createContext(null);
export const ToastContext   = createContext(null);

// ── Reducers ──────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":  return { user:action.payload, token:action.token, isAuthenticated:true };
    case "LOGOUT": return { user:null, token:null, isAuthenticated:false };
    case "UPDATE": return { ...state, user:{ ...state.user, ...action.payload } };
    default:       return state;
  }
}
function cartReducer(state, action) {
  switch (action.type) {
    case "ADD": {
      const addQty = action.item.qty || 1;
      const ex = state.find(i => i._id===action.item._id && i.size===action.item.size);
      if (ex) return state.map(i => i._id===action.item._id && i.size===action.item.size ? {...i, qty:i.qty+addQty} : i);
      return [...state, {...action.item, qty:addQty}];
    }
    case "REMOVE":     return state.filter(i => !(i._id===action.id && i.size===action.size));
    case "UPDATE_QTY": return state.map(i => i._id===action.id && i.size===action.size ? {...i, qty:action.qty} : i);
    case "CLEAR":      return [];
    default:           return state;
  }
}

// ── Safe localStorage helpers ─────────────────────────────────────────────────
const ls = {
  get: (k, def) => { try { return JSON.parse(localStorage.getItem(k) || "null") ?? def; } catch { return def; } },
  set: (k, v)   => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

const asArray = (value) => (Array.isArray(value) ? value : []);

const hydrateAuthState = () => {
  return hydrateAuthSession();
};

// ── GLOBAL shared orders store (single source of truth) ──────────────────────
// Both checkout (placeOrder) and admin panel read/write this same array
const loadStoredOrders = () => asArray(ls.get("nouveau_all_orders", []));

const normalizeOrder = (order, fallback = {}) => {
  const shippingAddress = order?.shippingAddress || fallback.shippingAddress || {};
  // Backend stores order lines as `products`; frontend may use `items` — support both
  const items =
    Array.isArray(order?.items) && order.items.length > 0
      ? order.items
      : Array.isArray(order?.products) && order.products.length > 0
      ? order.products
      : Array.isArray(fallback.items) && fallback.items.length > 0
      ? fallback.items
      : Array.isArray(fallback.products)
      ? fallback.products
      : [];
  // Backend returns `totalAmount`; keep `total` as an alias for legacy UI code
  const total =
    order?.totalAmount ??
    order?.total ??
    fallback.totalAmount ??
    fallback.total ??
    order?.price ??
    fallback.price ??
    0;

  const normalizedItems = items.map(item => ({
    ...item,
    // Ensure size and qty are primitives to prevent React Error #31
    size: typeof item.size === 'object' ? item.size?.size || "" : String(item.size || ""),
    qty:  Number(item.qty || item.quantity || 0)
  }));

  return {
    ...order,
    _id: order?._id || fallback._id,
    user: order?.user?._id || order?.user || order?.userId || fallback.user || "",
    userId: order?.userId || order?.user?._id || order?.user || fallback.user || "",
    userEmail: order?.userEmail || order?.email || shippingAddress.email || fallback.email || "",
    email: order?.email || shippingAddress.email || fallback.email || "",
    customer: order?.customer || shippingAddress.name || fallback.customer || "",
    phone: order?.phone || shippingAddress.phone || fallback.phone || "",
    product: order?.product || normalizedItems.map((item) => item.title).join(", ") || fallback.product || "",
    qty: order?.qty ?? normalizedItems.reduce((sum, item) => sum + Number(item.qty || 0), 0) ?? fallback.qty ?? 0,
    price: total,
    city: order?.city || shippingAddress.city || fallback.city || "",
    state: order?.state || shippingAddress.state || fallback.state || "",
    pincode: order?.pincode || shippingAddress.pincode || fallback.pincode || "",
    address: order?.address || shippingAddress.street || fallback.address || "",
    shippingAddress,
    // Provide both field names so AccountPage + TrackOrderPage always work
    items: normalizedItems,
    products: normalizedItems,
    status: typeof order?.status === 'object' ? order.status?.status || "Placed" : (order?.status || order?.orderStatus || fallback.status || "Placed"),
    orderStatus: typeof order?.orderStatus === 'object' ? order.orderStatus?.status || "Placed" : (order?.orderStatus || order?.status || fallback.orderStatus || "Placed"),
    subtotal: order?.subtotal ?? fallback.subtotal ?? 0,
    shippingCharge: order?.shippingCharge ?? fallback.shippingCharge ?? 0,
    total,
    totalAmount: total,
    trackingId: order?.trackingId || fallback.trackingId || "",
    statusHistory: (order?.statusHistory || fallback.statusHistory || []).map(h => ({
      ...h,
      status: typeof h.status === 'object' ? h.status?.status || "" : String(h.status || "")
    })),
    estimatedDelivery: order?.estimatedDelivery || fallback.estimatedDelivery || "",
    dateRaw: order?.dateRaw || order?.createdAt || fallback.dateRaw || new Date().toISOString(),
    date: order?.date || fallback.date || "",
    steps: (order?.steps || fallback.steps || []).map(s => ({
      ...s,
      label: typeof s.label === 'object' ? s.label?.label || "" : String(s.label || "")
    })),
  };
};

const normalizeSizeLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^free\s*size$/i.test(raw)) return "Free Size";
  return raw.toUpperCase();
};

const syncCachedProductInventory = (items = []) => {
  try {
    const saved = localStorage.getItem("nouveau_local_products");
    if (!saved) return;

    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed) || !parsed.length) return;

    const updates = new Map();

    items.forEach((item) => {
      const productId = String(item?._id || item?.product || item?.productId || "");
      const size = normalizeSizeLabel(item?.size?.size || item?.size || item?.selectedSize || "");
      const quantity = Math.max(1, Number(item?.qty ?? item?.quantity) || 1);
      if (!productId || !size) return;

      updates.set(productId, { size, quantity });
    });

    if (!updates.size) return;

    const nextProducts = parsed.map((product) => {
      const productId = String(product?._id || product?.id || "");
      const update = updates.get(productId);
      if (!update) return product;

      const sizes = Array.isArray(product.sizes)
        ? product.sizes.map((entry) => {
            const entrySize = normalizeSizeLabel(entry?.size);
            const currentQty = Math.max(0, Number(entry?.quantity ?? entry?.stock) || 0);
            if (entrySize !== update.size) {
              return { ...entry, size: entrySize || entry?.size || "", quantity: currentQty };
            }

            return {
              ...entry,
              size: entrySize,
              quantity: Math.max(0, currentQty - update.quantity),
            };
          })
        : [];

      return { ...product, sizes };
    });

    localStorage.setItem("nouveau_local_products", JSON.stringify(nextProducts));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nouveau:products-updated"));
    }
  } catch {
    // Ignore cache-sync failures; the backend remains the source of truth.
  }
};

export default function Providers({ children }) {
  const [authState, authDispatch] = useReducer(authReducer, hydrateAuthState());
  const [cart,      cartDispatch] = useReducer(cartReducer, asArray(ls.get("nouveau_cart", [])));
  const [wishlist,  setWishlist]  = useState(() => asArray(ls.get("nouveau_wish", [])));

  useEffect(() => {
    try {
      const storedProducts = JSON.parse(localStorage.getItem("nouveau_local_products") || "[]");
      if (Array.isArray(storedProducts) && storedProducts.length) {
        const sanitized = storedProducts.map((product) => ({
          ...product,
          images: Array.isArray(product?.images)
            ? product.images.map((image) => fixImageUrl(image))
            : product.images,
        }));
        localStorage.setItem("nouveau_local_products", JSON.stringify(sanitized));
      }

      const storedCart = JSON.parse(localStorage.getItem("nouveau_cart") || "[]");
      if (Array.isArray(storedCart) && storedCart.length) {
        const sanitizedCart = storedCart.map((item) => ({
          ...item,
          images: Array.isArray(item?.images)
            ? item.images.map((image) => fixImageUrl(image))
            : item.images,
        }));
        localStorage.setItem("nouveau_cart", JSON.stringify(sanitizedCart));
      }
    } catch {
      // Ignore local cache cleanup errors.
    }
  }, []);

  const dispatchAuth = useCallback((action) => {
    if (action?.type === "LOGOUT") {
      clearAuthSession();
      import("../services/apiService")
        .then(({ default: API }) => API.logout?.())
        .catch(() => {});
      cartDispatch({ type: "CLEAR" });
      // ✅ CRITICAL: clear cached orders on logout so the next user never
      // sees orders left over from a previous session.
      setAllOrders([]);
      try { localStorage.removeItem("nouveau_all_orders"); } catch {}
    }
    if (action?.type === "LOGIN") {
      persistAuthSession({
        user: action.payload,
        token: action.token,
        isAuthenticated: true,
      });
    }
    authDispatch(action);
  }, []);

  // ── ALL orders — shared between checkout, account, admin, track ────────────
  const [allOrders, setAllOrders] = useState(() => asArray(loadStoredOrders()));

  // ── Registered users (local — syncs with backend when available) ──────────
  const [localUsers, setLocalUsers] = useState(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem("nouveau_demo_users") || "[]");
      return asArray(parsed);
    } catch {
      return [];
    }
  });

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([]);
  const toast = (msg, type="success") => {
    const id = Date.now();
    setToasts(t => [...t, {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };

  const dispatchCart = (action) => {
    cartDispatch(action);
    if (action?.type === "ADD") {
      toast("Added to cart! 🛒");
    }
  };

  // ── Persist ───────────────────────────────────────────────────────────────
  useEffect(() => { persistAuthSession(authState); }, [authState]);
  useEffect(() => { ls.set("nouveau_cart",   cart);      }, [cart]);
  useEffect(() => { ls.set("nouveau_wish",   wishlist);  }, [wishlist]);
  useEffect(() => { ls.set("nouveau_all_orders", allOrders); }, [allOrders]);

  useEffect(() => {
    const handleAuthExpired = () => {
      dispatchAuth({ type:"LOGOUT" });
    };

    window.addEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleAuthExpired);
  }, [dispatchAuth]);

  // ── On login: fetch orders from backend and REPLACE allOrders ───────────
  // Never merge with stale localStorage — always use the authoritative backend list.
  useEffect(() => {
    if (!authState.isAuthenticated || !authState.token) return;
    (async () => {
      try {
        const API = (await import("../services/apiService")).default;
        const data = await API.getMyOrders();
        if (Array.isArray(data)) {
          setAllOrders(data.map((order) => normalizeOrder(order)));
        }
      } catch { /* backend not connected — keep whatever is in state */ }
    })();
  }, [authState.isAuthenticated, authState.token]);

  const toggleWishlist = (product) =>
    setWishlist(prev => prev.find(p => p._id===product._id) ? prev.filter(p => p._id!==product._id) : [...prev, product]);

  // ── placeOrder — saves to backend AND local state ─────────────────────────
  const placeOrder = async (address, items, paymentMethod, paymentReference = "") => {
    if (!authState.isAuthenticated || !authState.token) {
      throw new Error("Authentication required to place order.");
    }

    const subtotal       = items.reduce((s,i) => s + i.price*i.qty, 0);
    const shippingCharge = getShippingCharge(subtotal);
    const total          = subtotal + shippingCharge;
    const now            = new Date();
    const fmt = (d) => d.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"});

    // Build tracking steps
    const proc    = new Date(now.getTime() + 86400000);
    const shipped = new Date(proc.getTime() + 86400000*2);
    const ofd     = new Date(shipped.getTime() + 86400000*3);
    const deliv   = new Date(ofd.getTime() + 86400000);

    const steps = [
      { label:"Order Placed",     done:true,  date:fmt(now)    },
      { label:"Processing",       done:false, date:fmt(proc)   },
      { label:"Shipped",          done:false, date:"Expected "+fmt(shipped) },
      { label:"Out for Delivery", done:false, date:"Expected "+fmt(ofd)    },
      { label:"Delivered",        done:false, date:""          },
    ];

    let orderId = "NVU" + Date.now().toString().slice(-8);

    // Try backend first
    try {
      const API = (await import("../services/apiService")).default;
      const orderData = {
        items: items.map(i => ({ product:i._id, title:i.title, image:i.images?.[0]||"", price:i.price, size:i.size, qty:i.qty })),
        shippingAddress: address,
        userId: authState.user?._id,
        userEmail: authState.user?.email,
        paymentMethod: paymentMethod || "COD",
        paymentReference,
        subtotal, shippingCharge, total,
      };
      const backendOrder = await API.placeOrder(orderData);
      orderId = backendOrder._id;
      if (backendOrder.trackingId) {
        localStorage.setItem("lastTrackingId", backendOrder.trackingId);
      }

      syncCachedProductInventory(items);

      // Save backend order to local state too
      const enriched = normalizeOrder(backendOrder, {
        // extra fields for display
        user:        authState.user?._id || backendOrder.user || "",
        email:       address.email,
        customer:    address.name,
        phone:       address.phone,
        city:        address.city,
        state:       address.state,
        pincode:     address.pincode,
        address:     address.street,
        shippingAddress: address,
        dateRaw:     now,
        date:        fmt(now),
        status:      backendOrder.orderStatus || "Placed",
        orderStatus: backendOrder.orderStatus || "Placed",
        trackingId:  backendOrder.trackingId || "",
        statusHistory: backendOrder.statusHistory || [],
        estimatedDelivery: backendOrder.estimatedDelivery || "",
        steps,
        items:       orderData.items,
        subtotal,
        shippingCharge,
        total,
      });
      setAllOrders(prev => [enriched, ...prev]);

      // Keep the cart in sync with a completed purchase, regardless of which
      // checkout flow triggered the order creation.
      cartDispatch({ type: "CLEAR" });

      // NEW: Refresh product list after order to update stock in localStorage and UI
      try {
        const products = await API.getProducts();
        if (products && products.length > 0) {
          localStorage.setItem("nouveau_local_products", JSON.stringify(products));
          // Optionally, dispatch a custom event to notify listeners
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("nouveau:products-updated"));
          }
        }
      } catch (e) {
        // Ignore errors, fallback to previous local products
      }
    } catch (err) {
      // Never create local-only orders for paid checkouts; backend must confirm order creation.
      throw err;
    }

    localStorage.setItem("lastOrderId", orderId);
    return orderId;
  };

  // ── Admin actions — update/delete in shared state ─────────────────────────
  const updateOrderStatus = (orderId, newStatus) => {
    setAllOrders(prev => prev.map(o => {
      if (o._id !== orderId) return o;
      const doneUpTo = { pending:0, processing:1, shipped:2, delivered:4, cancelled:-1 }[newStatus] ?? 0;
      const steps = (o.steps||[]).map((s,i) => ({ ...s, done: newStatus==="cancelled" ? false : i <= doneUpTo }));
      return { ...o, status:newStatus, orderStatus:newStatus, steps };
    }));
  };

  const deleteOrderLocal = (orderId) => setAllOrders(prev => prev.filter(o => o._id !== orderId));

  // ── My orders = orders strictly belonging to the current user ────────────
  // ONLY match on userId or email — never on customer name (too loose and
  // would show other users' orders if they share the same name).
  const myOrders = allOrders.filter(o => {
    if (!authState.user) return false;
    const userId    = String(authState.user._id  || "");
    const userEmail = String(authState.user.email || "").toLowerCase().trim();
    const orderUserId = String(o.userId || o.user?._id || o.user || "");
    const orderEmail  = String(o.userEmail || o.email || o.shippingAddress?.email || "").toLowerCase().trim();
    // Must match on a real identifier — never guess by name
    if (userId && orderUserId && orderUserId === userId) return true;
    if (userEmail && orderEmail && orderEmail === userEmail) return true;
    return false;
  });

  const refreshMyOrders = useCallback(async () => {
    const API = (await import("../services/apiService")).default;
    // Always replace with the authoritative backend list — never merge with stale cache
    const data = await API.getMyOrders();
    if (Array.isArray(data)) {
      setAllOrders(data.map((order) => normalizeOrder(order)));
    }
  }, []);

  const appData = {
    allOrders,
    myOrders,
    refreshMyOrders,
    placeOrder,
    updateOrderStatus,
    deleteOrderLocal,
    localUsers,
  };

  return (
    <CurrencyProvider>
    <AuthContext.Provider value={{ ...authState, dispatch:dispatchAuth }}>
      <CartContext.Provider value={{ cart, dispatch:dispatchCart }}>
        <WishlistContext.Provider value={{ wishlist, toggleWishlist }}>
          <AppDataContext.Provider value={appData}>
            <ToastContext.Provider value={toast}>
              {children}
              {/* Toast UI */}
              <style>{`
                @keyframes toastSlideIn {
                  from { opacity: 0; transform: translateY(20px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                @keyframes toastSlideOut {
                  from { opacity: 1; transform: translateY(0); }
                  to { opacity: 0; transform: translateY(20px); }
                }
              `}</style>
              <div style={{ position:"fixed", bottom:"28px", left:"50%", transform:"translateX(-50%)", zIndex:9999, display:"flex", flexDirection:"column", gap:"12px", alignItems:"center", pointerEvents:"none" }}>
                {toasts.map((t, idx) => {
                  const isSuccess = t.type === "success";
                  const isError = t.type === "error";
                  const isWarning = t.type === "warning";
                  
                  return (
                    <div key={t.id} style={{
                      background: isError ? "#c71f3e" : isWarning ? "#d97706" : "#D4AF37",
                      color: "#fff",
                      padding: "14px 32px",
                      fontSize: "14px",
                      letterSpacing: "0.5px",
                      fontFamily: "'Poppins', sans-serif",
                      fontWeight: 600,
                      borderRadius: "8px",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.25)",
                      whiteSpace: "nowrap",
                      animation: "toastSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      backdropFilter: "blur(10px)",
                      border: `1px solid ${isError ? "#ff6b7a" : isWarning ? "#f59e0b" : "#E5C158"}`,
                    }}>
                      <span style={{ fontSize: "18px" }}>
                        {isSuccess ? "🛒" : isError ? "❌" : "⚠️"}
                      </span>
                      <span>{t.msg}</span>
                    </div>
                  );
                })}
              </div>
            </ToastContext.Provider>
          </AppDataContext.Provider>
        </WishlistContext.Provider>
      </CartContext.Provider>
    </AuthContext.Provider>
    </CurrencyProvider>
  );
}
