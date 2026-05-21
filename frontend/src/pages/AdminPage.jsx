import { useState, useContext, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { AppDataContext, ToastContext } from "../context/Providers";
import { THEME } from "../styles/theme";
import { PRODUCTS as INITIAL_PRODUCTS } from "../data/products";
import { normalizeCategory } from "../data/constants";
import NouveauLogo from "../components/Logo";
import { BtnPrimary } from "../components/Buttons";
import API from "../services/apiService";
import { fixImageUrl } from "../utils/imageUrl";
const ORDER_STATUSES = ["Awaiting Payment Verification", "Placed", "Processing", "Shipped", "Out for Delivery", "Delivered", "Cancelled"];
const STATUS_COLORS = {
  pending: { bg: "#fff7e6", text: "#d97706" },
  shipped: { bg: "#d4edda", text: "#155724" },
  delivered: { bg: "#d1ecf1", text: "#0c5460" },
  cancelled: { bg: "#f8d7da", text: "#721c24" },
  "Awaiting Payment Verification": { bg: "#fff7e6", text: "#d97706" },
  Placed: { bg: "#fff3cd", text: "#856404" },
  Processing: { bg: "#cce5ff", text: "#004085" },
  Shipped: { bg: "#d4edda", text: "#155724" },
  "Out for Delivery": { bg: "#ffe8cc", text: "#7a4100" },
  Delivered: { bg: "#d1ecf1", text: "#0c5460" },
  Cancelled: { bg: "#f8d7da", text: "#721c24" }
};
function StatusBadge({ status }) {
  const safeStatus = typeof status === 'object' ? status?.status || "Placed" : String(status || "Placed");
  const key = safeStatus.trim();
  const c = STATUS_COLORS[key] || STATUS_COLORS[key.toLowerCase()] || { bg: "#eee", text: "#333" };
  return <span style={{ background: c.bg, color: c.text, padding: "4px 12px", borderRadius: "99px", fontSize: "10px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", whiteSpace: "nowrap" }}>{safeStatus}</span>;
}

function SalesChart({ orders }) {
  // last 7 days revenue
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), date: d.toDateString() };
  });

  const data = days.map((d) => ({
    ...d,
    revenue: orders
      .filter((o) => new Date(o.dateRaw || o.date || o.createdAt).toDateString() === d.date)
      .reduce((sum, o) => sum + (o.price || o.total || 0), 0),
    count: orders.filter((o) => new Date(o.dateRaw || o.date || o.createdAt).toDateString() === d.date).length,
  }));

  const maxRev = Math.max(...data.map((d) => d.revenue), 1);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "140px", marginBottom: "10px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
            <div style={{ fontSize: "10px", fontFamily: "'Poppins',sans-serif", color: THEME.textLight, marginBottom: "4px" }}>
              {d.revenue > 0 ? "₹" + Math.round(d.revenue / 1000) + "k" : ""}
            </div>
            <div style={{ width: "100%", background: d.revenue > 0 ? THEME.crimson : THEME.bgDark, borderRadius: "6px 6px 0 0", height: `${Math.max((d.revenue / maxRev) * 110, 4)}px`, transition: "height 0.4s ease", position: "relative" }}>
              {d.count > 0 && <div style={{ position: "absolute", top: "-18px", left: "50%", transform: "translateX(-50%)", fontSize: "10px", color: THEME.crimson, fontWeight: 700, fontFamily: "'Poppins',sans-serif", whiteSpace: "nowrap" }}>{d.count}</div>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: "8px" }}>
        {data.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center", fontFamily: "'Poppins',sans-serif", fontSize: "10px", color: THEME.textLight }}>{d.label}</div>
        ))}
      </div>
    </div>
  );
}

// ── Donut chart for category split ────────────────────────────────────────────
function CategoryDonut({ products }) {
  const ethnic = products.filter(p => p.category === "Indian Ethnic Wear").length;
  const western = products.filter(p => p.category === "Indian Western Wear").length;
  const total = ethnic + western || 1;
  const ethnicPct = Math.round(ethnic / total * 100);
  const westernPct = 100 - ethnicPct;
  const r = 42, cx = 60, cy = 60, circ = 2 * Math.PI * r;
  const ethnicDash = circ * (ethnicPct / 100);
  const westernDash = circ * (westernPct / 100);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
      <svg width="120" height="120" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={THEME.bgDark} strokeWidth="14" />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={THEME.crimson} strokeWidth="14"
          strokeDasharray={`${ethnicDash} ${circ}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={THEME.gold} strokeWidth="14"
          strokeDasharray={`${westernDash} ${circ}`} strokeDashoffset={circ * 0.25 - ethnicDash} strokeLinecap="round" style={{ transition: "stroke-dasharray 0.6s ease" }} />
        <text x={cx} y={cy - 6} textAnchor="middle" style={{ fontFamily: "'Playfair Display',serif", fontSize: "16px", fontWeight: 700, fill: THEME.text }}>{total}</text>
        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", fill: THEME.textLight }}>products</text>
      </svg>
      <div>
        {[
          { label: "Indian Ethnic", count: ethnic, color: THEME.crimson },
          { label: " Premium Western", count: western, color: THEME.gold },
        ].map((item) => (
          <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted }}>{item.label}</span>
            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 700, color: THEME.text, marginLeft: "auto" }}>{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const BAD_TEXT_RE = /(\/static\/media|\.(jpeg|jpg|png|webp|svg)$|\.[a-f0-9]{8,}$|^https?:\/\/|\\)/i;

const cleanText = (value, fallback = "") => {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw || BAD_TEXT_RE.test(raw) || raw.length > 140) return fallback;
  return raw;
};

const cleanImages = (images) => {
  if (!Array.isArray(images) || !images.length) return ["/product1.jpeg"];
  const filtered = images.filter((img) => {
    if (typeof img !== "string") return false;
    const src = img.trim();
    if (!src || src.includes("\\")) return false;
    // Accept real image sources (absolute URL, root-relative, uploads path, data/blob URL).
    if (/^(https?:\/\/|\/|uploads\/|data:image\/|blob:)/i.test(src)) return true;
    return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(src);
  });
  return filtered.length ? filtered : ["/product1.jpeg"];
};

const SIZE_OPTIONS = ["XS", "S", "M", "L", "XL", "XXL", "XXXL", "4XL", "5XL", "6XL", "Free Size"];

const normalizeSizeLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^free\s*size$/i.test(raw)) return "Free Size";
  return raw.toUpperCase();
};

const normalizeSizeRows = (sizes = []) => {
  const rows = new Map();

  SIZE_OPTIONS.forEach((size) => {
    rows.set(size, { size, quantity: 0 });
  });

  if (Array.isArray(sizes)) {
    sizes.forEach((entry) => {
      const rawSize = typeof entry === "string" ? entry : entry?.size;
      const size = normalizeSizeLabel(rawSize);
      if (!size) return;
      const quantity = Math.max(0, Number(typeof entry === "string" ? 0 : entry?.quantity ?? entry?.stock) || 0);
      if (!rows.has(size)) rows.set(size, { size, quantity: 0 });
      rows.set(size, { size, quantity });
    });
  }

  return SIZE_OPTIONS.map((size) => rows.get(size));
};

const EMPTY_PRODUCT = { title: "", price: "", originalPrice: "", category: "Indian Ethnic Wear", subcategory: "", sizes: normalizeSizeRows(), discount: "0", description: "", isNew: true, images: ["/product1.jpeg"] };

const getSizeStockTotal = (sizes = []) => (
  Array.isArray(sizes)
    ? sizes.reduce((sum, entry) => sum + Math.max(0, Number(entry?.quantity ?? entry?.stock) || 0), 0)
    : 0
);

const getEffectiveStock = (sizes = []) => getSizeStockTotal(sizes);

const formatSizeSummary = (sizes = []) => normalizeSizeRows(sizes)
  .filter((entry) => entry.size)
  .map((entry) => `${entry.size}:${entry.quantity}`)
  .join(" · ");

const normalizeProduct = (product) => {
  const category = normalizeCategory(product.category);
  const sizes = normalizeSizeRows(product.sizes);
  return {
    ...product,
    title: cleanText(product.title, "Nouveau Signature Piece"),
    subcategory: cleanText(product.subcategory, "Women's Wear"),
    description: cleanText(product.description, "Elegant premium womenswear crafted with attention to detail and all-day comfort."),
    images: cleanImages(product.images),
    category: category === "Indian Ethnic Wear" || category === "Indian Western Wear" ? category : "Indian Ethnic Wear",
    price: Number(product.price) || 0,
    originalPrice: Number(product.originalPrice) || Number(product.price) || 0,
    discount: Number(product.discount) || 0,
    sizes,
  };
};

const ADMIN_ORDER_PAGE_SIZE = 10;
const ADMIN_USER_PAGE_SIZE = 10;
const ADMIN_ORDER_FILTERS = ["all", "pending", "shipped", "delivered"];

const getOrderTimestamp = (order) => {
  const value = order?.dateRaw || order?.date || order?.createdAt;
  const time = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(time) ? 0 : time;
};

const getSimpleOrderStatus = (order) => {
  const raw = String(order?.orderStatus || order?.status || "pending").toLowerCase();
  if (["awaiting payment verification", "placed", "processing", "pending"].includes(raw)) return "pending";
  if (["shipped", "out for delivery"].includes(raw)) return "shipped";
  if (raw === "delivered") return "delivered";
  if (raw === "cancelled" || raw === "canceled") return "cancelled";
  return raw || "pending";
};

const getOrderCustomerName = (order) => order?.customer || order?.shippingAddress?.name || order?.user?.name || "—";
const getOrderCustomerEmail = (order) => order?.email || order?.shippingAddress?.email || order?.user?.email || "—";
const getOrderAmount = (order) => Number(order?.totalAmount ?? order?.total ?? order?.price ?? 0);
const getOrderDateLabel = (order) => {
  const timestamp = getOrderTimestamp(order);
  return timestamp ? new Date(timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
};

const buildUserOrderSummary = (user, orders = []) => {
  const userId = String(user?._id || user?.id || "");
  const email = String(user?.email || "").toLowerCase();
  const name = String(user?.name || "").toLowerCase();

  const matchedOrders = orders.filter((order) => {
    const orderUserId = String(order?.user?._id || order?.user || order?.userId || "");
    const orderEmail = String(order?.email || order?.shippingAddress?.email || order?.user?.email || "").toLowerCase();
    const orderName = String(order?.customer || order?.shippingAddress?.name || order?.user?.name || "").toLowerCase();
    return (
      (userId && orderUserId === userId) ||
      (email && orderEmail === email) ||
      (name && orderName === name)
    );
  });

  const totalSpend = matchedOrders.reduce((sum, order) => sum + getOrderAmount(order), 0);
  const lastOrder = matchedOrders[0] || null;
  const latestPhone = lastOrder?.phone || lastOrder?.shippingAddress?.phone || user?.phone || "—";
  const latestCity = lastOrder?.city || lastOrder?.shippingAddress?.city || user?.addresses?.[0]?.city || "—";
  const latestState = lastOrder?.state || lastOrder?.shippingAddress?.state || user?.addresses?.[0]?.state || "—";

  return {
    totalOrders: matchedOrders.length,
    totalSpend,
    lastOrderDate: lastOrder ? getOrderDateLabel(lastOrder) : "—",
    lastOrderRaw: lastOrder?.createdAt || lastOrder?.dateRaw || null,
    phone: latestPhone,
    city: latestCity,
    state: latestState,
    orders: matchedOrders,
  };
};

const mergeById = (primary = [], secondary = []) => {
  const seen = new Set();
  const merged = [];
  [...primary, ...secondary].forEach((item) => {
    const id = String(item?._id || item?.id || "");
    if (!id || seen.has(id)) return;
    seen.add(id);
    merged.push(item);
  });
  return merged;
};

const getStoredProducts = () => {
  try {
    const saved = localStorage.getItem("nouveau_local_products");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed.map(normalizeProduct) : [];
  } catch {
    return [];
  }
};

export default function AdminPage({ setPage }) {
  const { dispatch: authDispatch, isAuthenticated, user, token } = useContext(AuthContext);
  const { allOrders: ctxAllOrders = [], updateOrderStatus: ctxUpdateStatus, deleteOrderLocal, localUsers: ctxLocalUsers = [] } = useContext(AppDataContext) || {};
  const toast = useContext(ToastContext);

  const isAdminAuthenticated = isAuthenticated && Boolean(token) && user?.role === "admin";
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);
  const [creds, setCreds] = useState({ email: "", pass: "" });
  const [tab, setTab] = useState("dashboard");
  const [trafficData, setTrafficData] = useState(null);
  const [trafficLoading, setTrafficLoading] = useState(false);
  const [siteViews, setSiteViews] = useState(null);

  useEffect(() => {
    const updateViewport = () => setIsMobile(window.innerWidth < 768);
    updateViewport();
    window.addEventListener("resize", updateViewport);
    return () => window.removeEventListener("resize", updateViewport);
  }, []);

  // ── Load products from localStorage first, fallback to INITIAL_PRODUCTS ──
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('nouveau_local_products');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(normalizeProduct);
      }
    } catch { }
    return INITIAL_PRODUCTS.map(normalizeProduct);
  });

  const productSyncRef = useRef({ lastPayload: "" });

  // ── Save products to localStorage whenever they change ───────────────────
  useEffect(() => {
    const payload = JSON.stringify(products);
    if (payload === productSyncRef.current.lastPayload) return;
    productSyncRef.current.lastPayload = payload;
    localStorage.setItem('nouveau_local_products', payload);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("nouveau:products-updated", { detail: { source: "admin", payload } }));
    }
  }, [products]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [orderPage, setOrderPage] = useState(1);
  const [userPage, setUserPage] = useState(1);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [selectedUserOrders, setSelectedUserOrders] = useState([]);
  const [selectedUserStats, setSelectedUserStats] = useState(null);
  const [selectedUserLoading, setSelectedUserLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [productForm, setProductForm] = useState(EMPTY_PRODUCT);
  const [productSearch, setProductSearch] = useState("");
  const [uploadingImg, setUploadingImg] = useState(false);
  const imgInputRef = useRef();

  const [orderSearch, setOrderSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // ── Load real data from backend ──────────────────────────────────────────
  const loadData = async () => {
    setLoadingData(true);
    try {
      const fetchAllPages = async (loader, key) => {
        const limit = 200;
        let page = 1;
        let total = Infinity;
        const collected = [];

        while (collected.length < total) {
          const response = await loader({ page, limit });
          const items = Array.isArray(response?.[key]) ? response[key] : [];
          collected.push(...items);
          total = Number(response?.total || collected.length);
          if (items.length < limit) break;
          page += 1;
        }

        return collected;
      };

      const [backendOrders, backendUsers, prodRes] = await Promise.allSettled([
        fetchAllPages(API.getAllOrders, "orders"),
        fetchAllPages(API.getAllUsers, "users"),
        API.getProducts(),
      ]);

      const backendOrderList = backendOrders.status === "fulfilled" ? backendOrders.value : [];
      const localOrderList = Array.isArray(ctxAllOrders) ? ctxAllOrders : [];
      setOrders(mergeById(backendOrderList, localOrderList));

      const backendUserList = backendUsers.status === "fulfilled" ? backendUsers.value : [];
      const localUserList = Array.isArray(ctxLocalUsers) ? ctxLocalUsers : [];
      setUsers(mergeById(backendUserList, localUserList));

      if (prodRes.status === "fulfilled") {
        const prodList = prodRes.value?.products?.length ? prodRes.value.products : (Array.isArray(prodRes.value) ? prodRes.value : []);
        if (prodList.length) {
          const backendProducts = prodList.map(normalizeProduct);
          setProducts(backendProducts);
          try { localStorage.setItem('nouveau_local_products', JSON.stringify(backendProducts)); } catch { }
        }
      }
    } catch { /* backend not available - using local data */ }
    setLoadingData(false);
  };

  useEffect(() => { if (isAdminAuthenticated) loadData(); }, [isAdminAuthenticated]);

  useEffect(() => {
    const handleProductsUpdated = (event) => {
      if (event?.detail?.source === "admin") return;
      try {
        const saved = localStorage.getItem("nouveau_local_products");
        if (!saved) return;
        const parsed = JSON.parse(saved);
        if (!Array.isArray(parsed) || !parsed.length) return;

        const nextPayload = JSON.stringify(parsed);
        if (nextPayload === productSyncRef.current.lastPayload) return;
        productSyncRef.current.lastPayload = nextPayload;
        setProducts(parsed.map(normalizeProduct));
      } catch { }
    };

    window.addEventListener("nouveau:products-updated", handleProductsUpdated);
    return () => window.removeEventListener("nouveau:products-updated", handleProductsUpdated);
  }, []);

  useEffect(() => {
    if (!isAdminAuthenticated) return;
    if (tab === "traffic" && !trafficData && !trafficLoading) {
      setTrafficLoading(true);
      Promise.all([
        API.getTraffic(),
        API.getSiteViews(),
      ])
        .then(([traffic, views]) => {
          setTrafficData(traffic);
          setSiteViews(views);
        })
        .catch(() => {
          setTrafficData({ india: 0, international: 0, unknown: 0, countryCount: {}, total: 0 });
          setSiteViews({ monthKey: "", views: 0 });
        })
        .finally(() => setTrafficLoading(false));
    }
  }, [tab, isAdminAuthenticated, trafficData, trafficLoading]);

  useEffect(() => {
    setOrderPage(1);
  }, [orderSearch, orderFilter]);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch]);

  useEffect(() => {
    if (!selectedUser) {
      setSelectedUserDetail(null);
      setSelectedUserOrders([]);
      setSelectedUserStats(null);
      setSelectedUserLoading(false);
    }
  }, [selectedUser]);

  function getOrderCustomer(order) { return getOrderCustomerName(order); }
  function getOrderEmail(order) { return getOrderCustomerEmail(order); }
  function getOrderStatus(order) { return order?.orderStatus || order?.status || "Placed"; }
  function getOrderStage(order) { return getSimpleOrderStatus(order); }
  function getOrderCity(order) { return order?.city || order?.shippingAddress?.city || "—"; }
  function getOrderAmountLabel(order) { return `₹${getOrderAmount(order).toLocaleString("en-IN")}`; }
  function getOrderDate(order) { return getOrderDateLabel(order); }

  const handleAdminLogin = async () => {
    try {
      const res = await API.login({ email: creds.email, password: creds.pass });
      if (res.role !== "admin") {
        toast("Admin access required", "error");
        return;
      }

      // Persist auth immediately so first admin API calls include token.
      const authPayload = {
        user: {
          _id: res._id,
          name: res.name,
          email: res.email,
          role: res.role,
          phone: res.phone || "",
          addresses: res.addresses || [],
        },
        token: res.token,
        isAuthenticated: true,
      };
      try {
        localStorage.setItem("nouveau_auth", JSON.stringify(authPayload));
        localStorage.setItem("token", authPayload.token || "");
        localStorage.setItem("admin", JSON.stringify(authPayload));
      } catch { }

      authDispatch({
        type: "LOGIN",
        payload: authPayload.user,
        token: res.token,
      });
      toast("Admin login successful");
    } catch (err) {
      toast(err.message || "Admin login failed", "error");
    }
  };

  // ── Login ─────────────────────────────────────────────────────────────────
  if (!isAdminAuthenticated) return (
    <div style={{ background: `linear-gradient(135deg,${THEME.crimson},${THEME.crimsonDark})`, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: isMobile ? "16px" : "0" }}>
      <div style={{ width: "min(100%, 420px)", padding: isMobile ? "28px 20px" : "52px", background: "#fff", borderRadius: isMobile ? "18px" : "20px", boxShadow: "0 24px 80px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <NouveauLogo size={44} bg={true} />
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: isMobile ? "22px" : "24px", color: THEME.text, margin: 0 }}>Admin Panel</h1>
            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.crimson, marginTop: "2px" }}>NOUVEAU™ MANAGEMENT</p>
          </div>
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, display: "block", marginBottom: "7px", fontWeight: 700 }}>EMAIL</label>
          <input
            type="email"
            value={creds.email}
            onChange={e => setCreds(c => ({ ...c, email: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
            autoComplete="email"
            inputMode="email"
            style={{ width: "100%", background: THEME.bg, border: `1.5px solid ${THEME.border}`, color: THEME.text, padding: isMobile ? "14px 14px" : "13px 16px", fontSize: "16px", outline: "none", fontFamily: "'Poppins',sans-serif", borderRadius: "10px" }}
          />
        </div>
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, display: "block", marginBottom: "7px", fontWeight: 700 }}>PASSWORD</label>
          <input
            type="password"
            value={creds.pass}
            onChange={e => setCreds(c => ({ ...c, pass: e.target.value }))}
            onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
            autoComplete="current-password"
            style={{ width: "100%", background: THEME.bg, border: `1.5px solid ${THEME.border}`, color: THEME.text, padding: isMobile ? "14px 14px" : "13px 16px", fontSize: "16px", outline: "none", fontFamily: "'Poppins',sans-serif", borderRadius: "10px" }}
          />
        </div>
        <BtnPrimary onClick={handleAdminLogin} style={{ width: "100%", borderRadius: "12px", justifyContent: "center", marginTop: "8px", minHeight: "48px" }}>Access Dashboard →</BtnPrimary>
      </div>
    </div>
  );

  // ── Computed data ─────────────────────────────────────────────────────────
  const allOrders = (() => {
    const combined = mergeById(orders, ctxAllOrders);
    return combined.sort((left, right) => getOrderTimestamp(right) - getOrderTimestamp(left));
  })();

  const totalRevenue = allOrders.reduce((sum, order) => sum + getOrderAmount(order), 0);

  const filteredOrders = allOrders.filter((order) => {
    const q = orderSearch.toLowerCase().trim();
    const matchQ = !q || [
      order._id,
      order.trackingId,
      getOrderCustomerName(order),
      getOrderCustomerEmail(order),
      order.shippingAddress?.city,
      order.city,
    ].some((value) => String(value || "").toLowerCase().includes(q));

    const status = getOrderStage(order);
    const matchStatus = orderFilter === "all" || status === orderFilter;
    return matchQ && matchStatus;
  });

  const filteredProducts = products.filter((product) => !productSearch || product.title.toLowerCase().includes(productSearch.toLowerCase()) || product.category.toLowerCase().includes(productSearch.toLowerCase()));
  const filteredUsers = users.filter((userItem) => !userSearch || userItem.name?.toLowerCase().includes(userSearch.toLowerCase()) || userItem.email?.toLowerCase().includes(userSearch.toLowerCase()));

  const orderPageCount = Math.max(1, Math.ceil(filteredOrders.length / ADMIN_ORDER_PAGE_SIZE));
  const userPageCount = Math.max(1, Math.ceil(filteredUsers.length / ADMIN_USER_PAGE_SIZE));
  const visibleOrders = filteredOrders.slice((orderPage - 1) * ADMIN_ORDER_PAGE_SIZE, orderPage * ADMIN_ORDER_PAGE_SIZE);
  const visibleUsers = filteredUsers.slice((userPage - 1) * ADMIN_USER_PAGE_SIZE, userPage * ADMIN_USER_PAGE_SIZE);
  const selectedUserComputed = selectedUser ? buildUserOrderSummary(selectedUser, allOrders) : null;

  const handleSelectUser = async (userItem) => {
    setSelectedUser(userItem);
    setSelectedUserDetail(userItem);
    setSelectedUserOrders([]);
    setSelectedUserStats(null);
    setSelectedUserLoading(true);
    try {
      const response = await API.getUserDetail(userItem._id);
      if (response?.user) setSelectedUserDetail(response.user);
      if (Array.isArray(response?.orders)) setSelectedUserOrders(response.orders);
      if (response?.stats) setSelectedUserStats(response.stats);
    } catch {
      const computed = buildUserOrderSummary(userItem, allOrders);
      setSelectedUserOrders(computed.orders);
      setSelectedUserStats({
        totalOrders: computed.totalOrders,
        totalSpend: computed.totalSpend,
        lastOrderDate: computed.lastOrderRaw,
        phone: computed.phone,
        city: computed.city,
        state: computed.state,
      });
    } finally {
      setSelectedUserLoading(false);
    }
  };

  // ── Product helpers ───────────────────────────────────────────────────────
  const openEdit = (p) => { const safe = normalizeProduct(p); setProductForm({ ...safe, price: String(safe.price), originalPrice: String(safe.originalPrice), discount: String(safe.discount || 0), sizes: normalizeSizeRows(safe.sizes) }); setEditingId(p._id); setShowAddForm(true); };
  const openAdd = () => { setProductForm(EMPTY_PRODUCT); setEditingId(null); setShowAddForm(true); };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    try {
      const fd = new FormData(); fd.append("images", file);
      const res = await API.uploadImages(fd);
      setProductForm(f => ({ ...f, images: [res.urls?.[0] || f.images[0]] }));
      toast("Image uploaded!");
    } catch (err) { toast(err.message || "Upload failed - using default image", "error"); }
    setUploadingImg(false);
  };

  // Handler function to update size quantities
  const handleSizeQuantityChange = (sizeLabel, newQuantity) => {
    const validQuantity = Math.max(0, Number(newQuantity) || 0);
    setProductForm((current) => ({
      ...current,
      sizes: normalizeSizeRows(current.sizes).map((entry) =>
        entry.size === sizeLabel
          ? { ...entry, quantity: validQuantity }
          : entry
      ),
    }));
    console.log(`[admin] Updated size "${sizeLabel}" to quantity: ${validQuantity}`);
  };

  const saveProduct = async () => {
    if (!productForm.title || !productForm.price) { toast("Title and price are required", "error"); return; }
    const isEdit = Boolean(editingId);
    const tempId = "tmp_" + Date.now();
    const previousProducts = products;
    const safeForm = normalizeProduct(productForm);
    
    // Build sizes array in clean backend-safe format.
    const allSizes = normalizeSizeRows(safeForm.sizes);
    const finalSizes = allSizes
      .map((row) => {
        const size = normalizeSizeLabel(row.size);
        const quantity = Math.max(0, Number(row.quantity) || 0);
        if (!size || quantity <= 0) return null;
        return {
          size: String(size).trim(),
          quantity: Number(quantity),
        };
      })
      .filter(Boolean);

    // Validate: at least one size with quantity > 0 is required.
    if (!Array.isArray(finalSizes) || finalSizes.length === 0) {
      toast("Please add at least one size with quantity > 0", "error");
      return;
    }

    console.log("[admin:saveProduct] Built sizes array:", finalSizes);
    console.log("[admin:saveProduct] Total stock:", finalSizes.reduce((sum, s) => sum + s.quantity, 0));

    const cleaned = {
      ...safeForm,
      price: Number(safeForm.price),
      originalPrice: Number(safeForm.originalPrice) || Number(safeForm.price),
      discount: Number(safeForm.discount) || 0,
      gender: "Women",
      images: safeForm.images?.length ? safeForm.images : ["/product1.jpeg"],
      _id: editingId || tempId,
      rating: safeForm.rating || 4.5,
      reviews: safeForm.reviews || 0,
      sizes: finalSizes, // Only valid sizes with quantity > 0
    };

    const normalizePayloadSizes = (rawSizes) => {
      let list = [];

      if (Array.isArray(rawSizes)) {
        list = rawSizes;
      } else if (rawSizes && typeof rawSizes === "object") {
        list = Object.entries(rawSizes).map(([size, quantity]) => ({ size, quantity }));
      } else if (typeof rawSizes === "string") {
        try {
          const parsed = JSON.parse(rawSizes);
          if (Array.isArray(parsed)) list = parsed;
        } catch {
          list = [];
        }
      }

      return list
        .map((entry) => {
          const size = normalizeSizeLabel(entry?.size);
          const quantity = Math.max(0, Number(entry?.quantity ?? entry?.stock) || 0);
          if (!size || quantity <= 0) return null;
          return { size, quantity };
        })
        .filter(Boolean);
    };

    // Remove UI-only fields before hitting backend and enforce strict sizes format.
    const toBackendPayload = ({ _id, rating, reviews, avgRating, numReviews, stock, ...rest }) => ({
      ...rest,
      sizes: normalizePayloadSizes(rest.sizes),
    });
    
    // Update frontend state immediately (works without backend)
    if (isEdit) {
      setProducts(prev => prev.map(p => p._id === editingId ? cleaned : p));
    } else {
      setProducts(prev => [cleaned, ...prev]);
    }
    
    let savedOnBackend = false;
    // Try backend in background (don't block UI)
    try {
      const payload = toBackendPayload(cleaned);
      
      // ✅ DEBUG: Log the exact payload being sent
      console.log("═══════════════════════════════════════════════");
      console.log("🚀 FINAL PAYLOAD BEING SENT TO BACKEND:");
      console.log("═══════════════════════════════════════════════");
      console.log(JSON.stringify(payload, null, 2));
      console.log("═══════════════════════════════════════════════");
      
      // Validate sizes before sending
      if (!Array.isArray(payload.sizes)) {
        throw new Error("Sizes must be an array");
      }
      const hasInvalidSize = payload.sizes.some(s => 
        !s.size || typeof s.quantity !== "number" || s.quantity <= 0
      );
      if (hasInvalidSize) {
        throw new Error("Invalid size format. Each size must have: { size: string, quantity: number > 0 }");
      }
      
      if (isEdit) {
        await API.updateProduct(editingId, payload);
        savedOnBackend = true;
      } else {
        // Do not send local temp _id to backend; MongoDB will generate a valid ObjectId.
        const created = await API.createProduct(payload);
        if (created?._id) {
          setProducts(prev => prev.map(p => p._id === tempId ? created : p));
          savedOnBackend = true;
        }
      }
    } catch (err) {
      console.error("[admin:saveProduct] ❌ Error:", err.message, err);
      toast(`❌ Error: ${err.message || 'Failed to save product'}`, "error");
      // Keep UI and backend in sync by rolling back optimistic changes.
      setProducts(previousProducts);
    }

    if (!savedOnBackend) {
      return;
    }

    toast(editingId ? "✅ Product update ho gaya! ✅" : "🆕 Product add ho gaya! 🆕");
    setShowAddForm(false); setEditingId(null);
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Kya aap is product ko delete karna chahte hain?")) return;
    const previousProducts = products;
    // Delete from frontend immediately
    setProducts(prev => prev.filter(p => p._id !== id));
    toast("Product delete ho gaya 🗑️");
    // Try backend in background
    try {
      await API.deleteProduct(id);
    } catch (err) {
      setProducts(previousProducts);
      toast(`Backend error: ${err.message || "Failed to delete product"}`, "error");
    }
  };

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const updated = await API.updateOrderStatus(orderId, status);
      if (updated?._id) {
        setOrders(prev => prev.map(o => o._id === orderId ? updated : o));
        if (selectedOrder?._id === orderId) setSelectedOrder(updated);
        if (ctxUpdateStatus) ctxUpdateStatus(orderId, status);
        toast(`✅ Status updated → ${status}`);
        return;
      }
    } catch { }
    const newHistory = { status, message: `Status updated to ${status}`, updatedAt: new Date().toISOString() };
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, orderStatus: status, status, statusHistory: [...(o.statusHistory || []), newHistory] } : o));
    if (ctxUpdateStatus) ctxUpdateStatus(orderId, status);
    if (selectedOrder?._id === orderId) setSelectedOrder(o => ({ ...o, orderStatus: status, status, statusHistory: [...(o.statusHistory || []), newHistory] }));
    toast(`Order status → ${status}`);
  };

  const handleDeleteOrder = async (id) => {
    if (!window.confirm("Kya aap is order ko delete karna chahte hain?")) return;
    setOrders(prev => prev.filter(o => o._id !== id));
    if (deleteOrderLocal) deleteOrderLocal(id);
    if (selectedOrder?._id === id) setSelectedOrder(null);
    toast("Order delete ho gaya 🗑️");
    try { await API.deleteOrder(id); } catch { /* backend not connected */ }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Kya aap is user ko remove karna chahte hain?")) return;
    setUsers(prev => prev.filter(u => u._id !== id));
    if (selectedUser?._id === id) setSelectedUser(null);
    if (selectedUserDetail?._id === id) setSelectedUserDetail(null);
    toast("User remove ho gaya");
    try { await API.deleteUser(id); } catch { /* backend not connected */ }
  };

  const iStyle = { width: "100%", background: THEME.bg, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "11px 14px", fontSize: "13px", outline: "none", fontFamily: "'Poppins',sans-serif", borderRadius: "8px" };
  const navItems = [["dashboard", "Dashboard", "📊"], ["products", "Products", "📦"], ["orders", "Orders", "📋"], ["users", "Users", "👩"], ["traffic", "Traffic", "🌍"]];
  const pagePadding = isMobile ? "16px" : "36px 44px";
  const sectionPadding = isMobile ? "18px" : "24px";
  const twoCol = isMobile ? "1fr" : "1fr 1fr";
  const dashboardSplit = isMobile ? "1fr" : "2fr 1fr";
  const fourCol = isMobile ? "1fr" : "repeat(4, 1fr)";

  const getNavButtonStyle = (isActive) => {
    const baseStyle = {
      display: "flex",
      alignItems: "center",
      gap: "10px",
      width: isMobile ? "auto" : "100%",
      minWidth: isMobile ? "120px" : "auto",
      padding: isMobile ? "11px 14px" : "13px 20px",
      background: isActive ? `${THEME.crimson}10` : "none",
      color: isActive ? THEME.crimson : THEME.textMuted,
      cursor: "pointer",
      fontSize: "12px",
      letterSpacing: "1px",
      fontFamily: "'Poppins',sans-serif",
      textAlign: "left",
      transition: "all 0.2s",
      fontWeight: isActive ? 700 : 400,
      flexShrink: 0,
    };

    if (isMobile) {
      return {
        ...baseStyle,
        border: `1px solid ${isActive ? THEME.crimson : THEME.border}`,
        borderRadius: "999px",
      };
    }

    return {
      ...baseStyle,
      border: "none",
      borderLeft: isActive ? `3px solid ${THEME.crimson}` : "3px solid transparent",
      borderRadius: "0",
    };
  };

  return (
    <div style={{ background: THEME.bgDark, minHeight: "100vh", display: "flex", flexDirection: isMobile ? "column" : "row" }}>
      {/* ── SIDEBAR ────────────────────────────────────────────────────────── */}
      <aside style={{ width: isMobile ? "100%" : "220px", background: THEME.bgCard, borderRight: isMobile ? "none" : `1px solid ${THEME.border}`, borderBottom: isMobile ? `1px solid ${THEME.border}` : "none", padding: isMobile ? "14px 16px" : "24px 0", flexShrink: 0, position: isMobile ? "relative" : "sticky", top: 0, height: isMobile ? "auto" : "100vh", overflowY: "visible", overflowX: isMobile ? "auto" : "auto", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: isMobile ? "0 0 14px" : "0 20px 20px", borderBottom: `1px solid ${THEME.border}`, marginBottom: "12px" }}>
          <NouveauLogo size={34} />
          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "3px", color: THEME.crimson, marginTop: "8px", fontWeight: 700 }}>NOUVEAU™ ADMIN</p>
        </div>
        <div style={{ display: isMobile ? "flex" : "block", gap: isMobile ? "10px" : "0", overflowX: isMobile ? "auto" : "visible" }}>
          {navItems.map(([id, label, icon]) => (
            <button key={id} onClick={() => setTab(id)}
              style={getNavButtonStyle(tab === id)}>
              <span style={{ fontSize: "15px" }}>{icon}</span> {label}
              {id === "orders" && allOrders.filter(o => getOrderStage(o) === "pending").length > 0 && (
                <span style={{ marginLeft: "auto", background: THEME.crimson, color: "#fff", borderRadius: "99px", width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", fontWeight: 700 }}>{allOrders.filter(o => getOrderStage(o) === "pending").length}</span>
              )}
            </button>
          ))}
        </div>
        <div style={{ marginTop: isMobile ? "12px" : "auto", padding: isMobile ? "12px 0 0" : "16px 20px", borderTop: `1px solid ${THEME.border}` }}>
          <button onClick={() => setPage && setPage("Home")} style={{ background: "none", border: "none", color: THEME.textLight, cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>← Back to Store</button>
        </div>
      </aside>

      {/* ── MAIN ───────────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, padding: pagePadding, overflowY: "auto", maxHeight: isMobile ? "none" : "100vh" }}>

        {/* ══ DASHBOARD ══════════════════════════════════════════════════════ */}
        {tab === "dashboard" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", marginBottom: "4px" }}>Dashboard</h1>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textLight }}>{new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
            </div>

            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: fourCol, gap: "14px", marginBottom: "28px" }}>
              {[
                ["₹" + totalRevenue.toLocaleString("en-IN"), "Total Revenue", THEME.crimson, "📈"],
                [allOrders.length, "Total Orders", THEME.gold, "📦"],
                [products.length, "Products", THEME.crimsonDark, "🛍️"],
                [users.length, "Customers", "#2d6a4f", "👩"],
              ].map(([val, label, color, icon]) => (
                <div key={label} style={{ background: THEME.bgCard, padding: "22px 20px", border: `1px solid ${THEME.border}`, borderRadius: "14px", borderTop: `3px solid ${color}` }}>
                  <div style={{ fontSize: "20px", marginBottom: "6px" }}>{icon}</div>
                  <div style={{ fontFamily: "'Playfair Display',serif", fontSize: "24px", color, fontWeight: 900, marginBottom: "4px", lineHeight: 1 }}>{val}</div>
                  <div style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", color: THEME.textLight, letterSpacing: "1.5px", textTransform: "uppercase" }}>{label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: dashboardSplit, gap: "20px", marginBottom: "20px" }}>
              {/* Sales chart */}
              <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", padding: sectionPadding }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "3px", color: THEME.crimson, fontWeight: 700 }}>REVENUE — LAST 7 DAYS</h3>
                  <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>₹{totalRevenue.toLocaleString("en-IN")} total</span>
                </div>
                <SalesChart orders={allOrders} />
              </div>
              {/* Category donut */}
              <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", padding: sectionPadding }}>
                <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "3px", color: THEME.crimson, fontWeight: 700, marginBottom: "20px" }}>PRODUCTS BY CATEGORY</h3>
                <CategoryDonut products={products} />
              </div>
            </div>

            {/* Status breakdown */}
            <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: "20px", marginBottom: "20px" }}>
              <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", padding: sectionPadding }}>
                <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "3px", color: THEME.crimson, fontWeight: 700, marginBottom: "20px" }}>ORDER STATUS</h3>
                {ORDER_STATUSES.map(st => {
                  const count = allOrders.filter(o => getOrderStatus(o) === st).length;
                  const pct = allOrders.length ? Math.round(count / allOrders.length * 100) : 0;
                  const c = STATUS_COLORS[st];
                  return (
                    <div key={st} style={{ marginBottom: "12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.text, textTransform: "capitalize" }}>{st}</span>
                        <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted }}>{count}</span>
                      </div>
                      <div style={{ background: THEME.bgDark, borderRadius: "99px", height: "5px" }}>
                        <div style={{ background: c.text, borderRadius: "99px", height: "5px", width: `${pct}%`, transition: "width 0.5s" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
              {/* Recent orders mini */}
              <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", padding: sectionPadding }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h3 style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "3px", color: THEME.crimson, fontWeight: 700 }}>RECENT ORDERS</h3>
                  <button onClick={() => setTab("orders")} style={{ background: "none", border: "none", color: THEME.crimson, cursor: "pointer", fontSize: "11px", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>View all →</button>
                </div>
                {allOrders.slice(0, 5).map((o, idx) => (
                  <div key={`${o._id || o.createdAt || "order"}-${idx}`} onClick={() => { setSelectedOrder(o); setTab("orders"); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${THEME.border}`, cursor: "pointer" }}>
                    <div>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 700, color: THEME.crimson }}>{(o._id || "").slice(-8)}</p>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>{getOrderCustomer(o)}</p>
                    </div>
                    <StatusBadge status={getOrderStatus(o)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══ PRODUCTS ═══════════════════════════════════════════════════════ */}
        {tab === "products" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px", flexDirection: isMobile ? "column" : "row" }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", marginBottom: "2px" }}>Products</h1>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textLight }}>{products.length} total</p>
              </div>
              <BtnPrimary onClick={openAdd} style={{ borderRadius: "10px", fontSize: "12px", width: isMobile ? "100%" : "auto" }}>+ Add Product</BtnPrimary>
            </div>
            <input placeholder="🔍 Search products..." value={productSearch} onChange={e => setProductSearch(e.target.value)} style={{ ...iStyle, marginBottom: "18px", padding: "12px 16px", fontSize: "16px" }} />

            {/* Add/Edit form */}
            {showAddForm && (
              <div style={{ background: THEME.bgCard, border: `1.5px solid ${THEME.crimson}40`, borderRadius: "14px", padding: isMobile ? "18px" : "28px", marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                  <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px" }}>{editingId ? "Edit Product" : "Add New Product"}</h3>
                  <button onClick={() => setShowAddForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.textLight, fontSize: "20px" }}>×</button>
                </div>

                {/* Image upload */}
                <div style={{ marginBottom: "18px" }}>
                  <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, display: "block", marginBottom: "8px", fontWeight: 700 }}>PRODUCT IMAGE</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src={fixImageUrl(productForm.images?.[0])} alt="" style={{ width: "64px", height: "80px", objectFit: "cover", borderRadius: "8px", border: `1px solid ${THEME.border}` }} onError={e => e.target.src = "/product1.jpeg"} />
                    <div>
                      <input ref={imgInputRef} type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} />
                      <button onClick={() => imgInputRef.current?.click()}
                        style={{ background: THEME.crimson, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 600, marginRight: "8px" }}>
                        {uploadingImg ? "Uploading..." : "📤 Upload Image"}
                      </button>
                      <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>or select below</span>
                      <div style={{ marginTop: "6px" }}>
                        <select value={productForm.images?.[0]} onChange={e => setProductForm(f => ({ ...f, images: [e.target.value] }))} style={{ ...iStyle, width: "auto", fontSize: "12px" }}>
                          {["/product1.jpeg", "/product2.jpeg", "/product3.jpeg"].map((img, idx) => <option key={`${img}-${idx}`} value={img}>{img}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: "14px" }}>
                  {[
                    { field: "title", label: "Product Title", inputType: "text", fullWidth: true },
                    { field: "price", label: "Selling Price (₹)", inputType: "number", fullWidth: false },
                    { field: "originalPrice", label: "Original / MRP (₹)", inputType: "number", fullWidth: false },
                    { field: "discount", label: "Discount %", inputType: "number", fullWidth: false },
                    { field: "subcategory", label: "Subcategory (Kurta, Dress…)", inputType: "text", fullWidth: false },
                  ].map((item) => (
                    <div key={item.field} style={{ gridColumn: item.fullWidth ? "1/-1" : "auto" }}>
                      <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, display: "block", marginBottom: "6px", fontWeight: 700 }}>{item.label.toUpperCase()}</label>
                      <input type={item.inputType} value={productForm[item.field]} onChange={e => setProductForm(f => ({ ...f, [item.field]: e.target.value }))} style={iStyle} />
                    </div>
                  ))}
                  <div>
                    <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, display: "block", marginBottom: "6px", fontWeight: 700 }}>CATEGORY</label>
                    <select value={productForm.category} onChange={e => setProductForm(f => ({ ...f, category: e.target.value }))} style={iStyle}>
                      <option>Indian Ethnic Wear</option>
                      <option>Indian Western Wear</option>
                    </select>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, display: "block", marginBottom: "10px", fontWeight: 700 }}>SIZE-WISE STOCK</label>
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(5, minmax(0, 1fr))", gap: "12px" }}>
                      {normalizeSizeRows(productForm.sizes).map((sizeRow) => (
                        <div key={sizeRow.size}>
                          <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: THEME.textLight, display: "block", marginBottom: "6px", fontWeight: 700 }}>{sizeRow.size}</label>
                          <input
                            type="number"
                            min="0"
                            value={sizeRow.quantity}
                            onChange={(event) => handleSizeQuantityChange(sizeRow.size, event.target.value)}
                            style={iStyle}
                            placeholder="0"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ gridColumn: "1/-1" }}>
                    <label style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, display: "block", marginBottom: "6px", fontWeight: 700 }}>DESCRIPTION</label>
                    <textarea rows={3} value={productForm.description} onChange={e => setProductForm(f => ({ ...f, description: e.target.value }))} style={{ ...iStyle, resize: "vertical" }} />
                  </div>
                  <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: "10px" }}>
                    <input type="checkbox" id="isnew" checked={productForm.isNew} onChange={e => setProductForm(f => ({ ...f, isNew: e.target.checked }))} style={{ accentColor: THEME.crimson, width: "16px", height: "16px" }} />
                    <label htmlFor="isnew" style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text, cursor: "pointer" }}>Mark as New Arrival</label>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexDirection: isMobile ? "column" : "row" }}>
                  <BtnPrimary onClick={saveProduct} style={{ borderRadius: "10px", width: isMobile ? "100%" : "auto" }}>{editingId ? "Update Product ✅" : "Add Product 🆕"}</BtnPrimary>
                  <button onClick={() => setShowAddForm(false)} style={{ background: "none", border: `1px solid ${THEME.border}`, color: THEME.textMuted, padding: "13px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "12px", width: isMobile ? "100%" : "auto" }}>Cancel</button>
                </div>
              </div>
            )}

            {filteredProducts.map((p, idx) => (
              <div key={`${p._id || p.title || "product"}-${idx}`} style={{ display: "flex", gap: "14px", background: THEME.bgCard, padding: isMobile ? "14px" : "14px 18px", marginBottom: "10px", alignItems: isMobile ? "flex-start" : "center", border: `1px solid ${THEME.border}`, borderRadius: "12px", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
                <img src={fixImageUrl(p.images?.[0])} alt={p.title} style={{ width: "60px", height: "76px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }} onError={e => e.target.src = "/product1.jpeg"} />
                <div style={{ flex: 1, minWidth: "140px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                    <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "15px", fontWeight: 700, color: THEME.text }}>{p.title}</p>
                    {p.isNew && <span style={{ background: `${THEME.crimson}15`, color: THEME.crimson, fontSize: "9px", letterSpacing: "2px", padding: "2px 8px", borderRadius: "99px", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>NEW</span>}
                    {(getEffectiveStock(p.sizes) <= 0) && <span style={{ background: `${THEME.textMuted}20`, color: THEME.textMuted, fontSize: "9px", letterSpacing: "2px", padding: "2px 8px", borderRadius: "99px", fontFamily: "'Poppins',sans-serif", fontWeight: 700, border: `1px solid ${THEME.border}` }}>SOLD OUT</span>}
                  </div>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight, marginTop: "3px" }}>{p.category} · {p.subcategory || "—"} · Stock: {getEffectiveStock(p.sizes)}</p>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>Sizes: {formatSizeSummary(p.sizes)}</p>
                </div>
                <div style={{ textAlign: isMobile ? "left" : "right", minWidth: "80px" }}>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, fontSize: "15px", color: THEME.crimson }}>₹{p.price?.toLocaleString("en-IN")}</p>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight, textDecoration: "line-through" }}>₹{p.originalPrice?.toLocaleString("en-IN")}</p>
                  {p.discount > 0 && <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: "#2d6a4f", fontWeight: 600 }}>-{p.discount}%</p>}
                </div>
                <div style={{ display: "flex", gap: "8px", flexShrink: 0, width: isMobile ? "100%" : "auto", flexWrap: "wrap" }}>
                  <button onClick={() => openEdit(p)} style={{ background: `${THEME.gold}15`, border: `1px solid ${THEME.gold}40`, color: THEME.goldDark, padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Poppins',sans-serif", fontWeight: 600, flex: 1, minWidth: isMobile ? "120px" : "auto" }}>✏️ Edit</button>
                  <button onClick={() => handleDeleteProduct(p._id)} style={{ background: `${THEME.crimson}10`, border: `1px solid ${THEME.crimson}30`, color: THEME.crimson, padding: "7px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Poppins',sans-serif", fontWeight: 600, flex: 1, minWidth: isMobile ? "120px" : "auto" }}>🗑️</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ══ ORDERS ═════════════════════════════════════════════════════════ */}
        {tab === "orders" && (
          <div>
            {selectedOrder && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? "0" : "20px" }}>
                <div style={{ background: "#fff", borderRadius: isMobile ? "20px 20px 0 0" : "20px", padding: isMobile ? "22px 18px 24px" : "32px", maxWidth: isMobile ? "100%" : "580px", width: "100%", maxHeight: isMobile ? "90vh" : "85vh", overflowY: "auto", position: "relative" }}>
                  <button onClick={() => setSelectedOrder(null)} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: THEME.textLight }}>×</button>
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "3px", color: THEME.crimson, fontWeight: 700, marginBottom: "4px" }}>ORDER DETAILS</p>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", marginBottom: "4px" }}>{selectedOrder._id}</h2>
                  {selectedOrder.trackingId && (
                    <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", background: `${THEME.gold}15`, border: `1px solid ${THEME.gold}40`, borderRadius: "8px", padding: "6px 14px", marginBottom: "12px" }}>
                      <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", color: THEME.textLight, letterSpacing: "1px" }}>TRACKING ID</span>
                      <code style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: 700, color: "#b8962e" }}>{selectedOrder.trackingId}</code>
                      <button onClick={() => navigator.clipboard?.writeText(selectedOrder.trackingId)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px" }} title="Copy">📋</button>
                    </div>
                  )}
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textLight, marginBottom: "20px" }}>{getOrderDate(selectedOrder)}</p>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                    {[
                      { label: "Customer", value: getOrderCustomer(selectedOrder) },
                      { label: "Amount", value: "₹" + getOrderAmount(selectedOrder) },
                      { label: "Payment", value: selectedOrder.paymentMethod || "—" },
                      { label: "Pay ID / UTR", value: selectedOrder.paymentId || "—" },
                      { label: "Items", value: selectedOrder.items?.length || selectedOrder.qty || "—" },
                      { label: "City", value: getOrderCity(selectedOrder) },
                      { label: "Status", value: getOrderStatus(selectedOrder) },
                    ].map((item) => (
                      <div key={item.label} style={{ background: THEME.bg, borderRadius: "8px", padding: "12px 14px" }}>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: THEME.textLight, marginBottom: "3px" }}>{item.label.toUpperCase()}</p>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text, fontWeight: 600 }}>{item.value}</p>
                      </div>
                    ))}
                    {(selectedOrder.shippingAddress || selectedOrder.address) && (
                      <div style={{ gridColumn: "1/-1", background: THEME.bg, borderRadius: "8px", padding: "12px 14px" }}>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: THEME.textLight, marginBottom: "3px" }}>DELIVERY ADDRESS</p>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text, fontWeight: 600 }}>
                          {selectedOrder.shippingAddress?.street || selectedOrder.address || "—"}, {getOrderCity(selectedOrder)}, {selectedOrder.shippingAddress?.state || selectedOrder.state || "—"} – {selectedOrder.shippingAddress?.pincode || selectedOrder.pincode || "—"}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* Items list */}
                  {selectedOrder.items?.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, fontWeight: 700, marginBottom: "10px" }}>ORDER ITEMS</p>
                      {selectedOrder.items.map((item, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${THEME.border}` }}>
                          <img src={fixImageUrl(item.image)} alt={item.title} style={{ width: "44px", height: "56px", objectFit: "cover", borderRadius: "6px" }} onError={e => e.target.src = "/product1.jpeg"} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text, fontWeight: 600 }}>{item.title}</p>
                            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>Size: {item.size} · ×{item.qty}</p>
                          </div>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontWeight: 700, color: THEME.crimson }}>₹{(item.price * item.qty).toLocaleString("en-IN")}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {/* Status History */}
                  {selectedOrder.statusHistory?.length > 0 && (
                    <div style={{ marginBottom: "20px" }}>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, fontWeight: 700, marginBottom: "10px" }}>STATUS HISTORY</p>
                      {[...selectedOrder.statusHistory].reverse().map((h, i) => (
                        <div key={i} style={{ display: "flex", gap: "10px", alignItems: "flex-start", padding: "8px 0", borderBottom: `1px solid ${THEME.border}` }}>
                          <span style={{ fontSize: "16px" }}>{{
                            "Awaiting Payment Verification": "⏳",
                            Placed: "📋",
                            Processing: "⚙️",
                            Shipped: "🚀",
                            "Out for Delivery": "🛵",
                            Delivered: "✅",
                            Cancelled: "❌",
                          }[h.status] || "📋"}</span>
                          <div style={{ flex: 1 }}>
                            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 700, color: THEME.text }}>{h.status}</p>
                            {h.message && <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textMuted }}>{h.message}</p>}
                          </div>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", color: THEME.textLight, whiteSpace: "nowrap" }}>{h.updatedAt ? new Date(h.updatedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.crimson, fontWeight: 700, marginBottom: "10px" }}>UPDATE STATUS</p>
                  <select
                    value={getOrderStatus(selectedOrder)}
                    onChange={e => handleUpdateOrderStatus(selectedOrder._id, e.target.value)}
                    style={{ width: "100%", background: THEME.bg, border: `1.5px solid ${THEME.crimson}`, color: THEME.text, padding: "11px 14px", fontSize: "13px", outline: "none", fontFamily: "'Poppins',sans-serif", borderRadius: "8px", marginBottom: "12px", cursor: "pointer" }}
                  >
                    {ORDER_STATUSES.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "12px" }}>
                    {ORDER_STATUSES.map(st => (
                      <button key={st} onClick={() => handleUpdateOrderStatus(selectedOrder._id, st)}
                        style={{ background: getOrderStatus(selectedOrder) === st ? THEME.crimson : "transparent", color: getOrderStatus(selectedOrder) === st ? "#fff" : THEME.textMuted, border: `1.5px solid ${getOrderStatus(selectedOrder) === st ? THEME.crimson : THEME.border}`, padding: "7px 12px", borderRadius: "99px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "10px", fontWeight: 600 }}>
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: isMobile ? "flex-start" : "center", gap: "12px", flexWrap: "wrap" }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", marginBottom: "2px" }}>Orders</h1>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textLight }}>{filteredOrders.length} orders found</p>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                <span style={{ background: `${THEME.crimson}10`, color: THEME.crimson, border: `1px solid ${THEME.crimson}20`, borderRadius: "99px", padding: "8px 12px", fontFamily: "'Poppins',sans-serif", fontSize: "11px", fontWeight: 700 }}>Total: {allOrders.length}</span>
                <span style={{ background: `${THEME.gold}15`, color: THEME.goldDark, border: `1px solid ${THEME.gold}25`, borderRadius: "99px", padding: "8px 12px", fontFamily: "'Poppins',sans-serif", fontSize: "11px", fontWeight: 700 }}>Revenue: ₹{totalRevenue.toLocaleString("en-IN")}</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", marginBottom: "18px", flexWrap: "wrap", flexDirection: isMobile ? "column" : "row" }}>
              <input placeholder="🔍 Search order ID or customer…" value={orderSearch} onChange={e => setOrderSearch(e.target.value)} style={{ ...iStyle, flex: 1, minWidth: isMobile ? "0" : "220px", fontSize: "16px" }} />
              <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)} style={{ ...iStyle, width: isMobile ? "100%" : "180px" }}>
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
            <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", overflow: "hidden" }}>
              {isMobile ? (
                <div style={{ padding: "12px" }}>
                  {visibleOrders.map((o, idx) => (
                    <div
                      key={`${o._id || o.createdAt || "order-card"}-${idx}`}
                      onClick={() => setSelectedOrder(o)}
                      style={{
                        background: idx % 2 === 0 ? THEME.bg : "#fff",
                        border: `1px solid ${THEME.border}`,
                        borderRadius: "14px",
                        padding: "14px",
                        marginBottom: "12px",
                        cursor: "pointer",
                        boxShadow: "0 4px 18px rgba(0,0,0,0.03)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "flex-start", marginBottom: "10px" }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.textLight, textTransform: "uppercase", marginBottom: "4px" }}>Order</p>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: 700, color: THEME.crimson, wordBreak: "break-all" }}>{(o._id || "").slice(-10) || "Pending"}</p>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.text, marginTop: "4px", wordBreak: "break-word" }}>{getOrderCustomer(o)}</p>
                        </div>
                        <StatusBadge status={getOrderStatus(o)} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
                        <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "10px", padding: "10px 12px" }}>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: THEME.textLight, marginBottom: "3px" }}>AMOUNT</p>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: 700, color: THEME.text }}>₹{getOrderAmount(o).toLocaleString("en-IN")}</p>
                        </div>
                        <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "10px", padding: "10px 12px" }}>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: THEME.textLight, marginBottom: "3px" }}>DATE</p>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 600, color: THEME.text }}>{getOrderDate(o)}</p>
                        </div>
                      </div>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, marginBottom: "10px", wordBreak: "break-word" }}>{getOrderEmail(o)}</p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }} style={{ flex: 1, background: `${THEME.gold}15`, border: `1px solid ${THEME.gold}40`, color: THEME.goldDark, padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Poppins',sans-serif", fontWeight: 600 }}>View</button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(o._id); }} style={{ flex: 1, background: `${THEME.crimson}10`, border: `1px solid ${THEME.crimson}30`, color: THEME.crimson, padding: "8px 10px", borderRadius: "8px", cursor: "pointer", fontSize: "12px", fontFamily: "'Poppins',sans-serif", fontWeight: 600 }}>Del</button>
                      </div>
                    </div>
                  ))}
                  {visibleOrders.length === 0 && <div style={{ textAlign: "center", padding: "36px 12px", color: THEME.textLight, fontFamily: "'Poppins',sans-serif" }}>{loadingData ? "Loading orders..." : "No orders found"}</div>}
                </div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: THEME.bgDark }}>
                        {["Order ID", "Customer", "Email", "Amount", "Status", "Date", "Actions"].map((h) => (
                          <th key={h} style={{ padding: "11px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: THEME.textLight, textAlign: "left", borderBottom: `1px solid ${THEME.border}`, whiteSpace: "nowrap" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {visibleOrders.map((o, idx) => (
                        <tr key={`${o._id || o.createdAt || "order-row"}-${idx}`} style={{ background: idx % 2 === 0 ? "transparent" : THEME.bg, transition: "background 0.15s", cursor: "pointer" }}
                          onClick={() => setSelectedOrder(o)}
                          onMouseEnter={e => e.currentTarget.style.background = `${THEME.crimson}06`}
                          onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : THEME.bg}>
                          <td style={{ padding: "12px 14px" }}>
                            <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }} style={{ background: "none", border: "none", cursor: "pointer", color: THEME.crimson, fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 700, textDecoration: "underline" }}>{(o._id || "").slice(-10)}</button>
                          </td>
                          <td style={{ padding: "12px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.text, whiteSpace: "nowrap" }}>{getOrderCustomer(o)}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, whiteSpace: "nowrap" }}>{getOrderEmail(o)}</td>
                          <td style={{ padding: "12px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "13px", fontWeight: 700, color: THEME.text, whiteSpace: "nowrap" }}>₹{getOrderAmount(o).toLocaleString("en-IN")}</td>
                          <td style={{ padding: "12px 14px" }}><StatusBadge status={getOrderStatus(o)} /></td>
                          <td style={{ padding: "12px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight, whiteSpace: "nowrap" }}>{getOrderDate(o)}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                              <button onClick={(e) => { e.stopPropagation(); setSelectedOrder(o); }} style={{ background: `${THEME.gold}15`, border: `1px solid ${THEME.gold}40`, color: THEME.goldDark, padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontFamily: "'Poppins',sans-serif" }}>View</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteOrder(o._id); }} style={{ background: `${THEME.crimson}10`, border: `1px solid ${THEME.crimson}30`, color: THEME.crimson, padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontFamily: "'Poppins',sans-serif" }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {visibleOrders.length === 0 && <div style={{ textAlign: "center", padding: "48px", color: THEME.textLight, fontFamily: "'Poppins',sans-serif" }}>{loadingData ? "Loading orders..." : "No orders found"}</div>}
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "14px 16px", borderTop: `1px solid ${THEME.border}`, flexWrap: "wrap" }}>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>
                  Page {orderPage} of {orderPageCount}
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage === 1} style={{ background: orderPage === 1 ? THEME.bgDark : THEME.bg, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "8px 12px", borderRadius: "8px", cursor: orderPage === 1 ? "not-allowed" : "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "11px" }}>Prev</button>
                  <button onClick={() => setOrderPage(p => Math.min(orderPageCount, p + 1))} disabled={orderPage === orderPageCount} style={{ background: orderPage === orderPageCount ? THEME.bgDark : THEME.bg, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "8px 12px", borderRadius: "8px", cursor: orderPage === orderPageCount ? "not-allowed" : "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "11px" }}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══ USERS ══════════════════════════════════════════════════════════ */}
        {tab === "users" && (
          <div>
            {selectedUser && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? "0" : "20px" }}>
                <div style={{ background: "#fff", borderRadius: isMobile ? "20px 20px 0 0" : "20px", padding: isMobile ? "22px 18px 24px" : "32px", maxWidth: isMobile ? "100%" : "680px", width: "100%", position: "relative", maxHeight: isMobile ? "90vh" : "85vh", overflowY: "auto" }}>
                  <button onClick={() => setSelectedUser(null)} style={{ position: "absolute", top: "18px", right: "18px", background: "none", border: "none", cursor: "pointer", fontSize: "22px", color: THEME.textLight }}>×</button>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                    <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: `linear-gradient(135deg,${THEME.crimson},${THEME.gold})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "20px", fontWeight: 700, fontFamily: "'Playfair Display',serif", flexShrink: 0 }}>{(selectedUserDetail?.name || selectedUser.name || "?").charAt(0)}</div>
                    <div>
                      <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: "20px", marginBottom: "2px" }}>{selectedUserDetail?.name || selectedUser.name}</h2>
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>{selectedUserDetail?._id || selectedUser._id}</p>
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, minmax(0, 1fr))", gap: "10px", marginBottom: "14px" }}>
                    {(() => {
                      const primaryAddress = selectedUserDetail?.addresses?.[0] || selectedUser.addresses?.[0] || null;
                      const savedAddress = primaryAddress ? [primaryAddress.street, primaryAddress.city, primaryAddress.state, primaryAddress.pincode].filter(Boolean).join(", ") : "—";
                      return [
                        { label: "Email", value: selectedUserDetail?.email || selectedUser.email },
                        { label: "Phone", value: selectedUserDetail?.phone || selectedUser.phone || "—" },
                        { label: "City", value: selectedUserStats?.city || selectedUserComputed?.city || selectedUserDetail?.addresses?.[0]?.city || selectedUser.addresses?.[0]?.city || "—" },
                        { label: "State", value: selectedUserStats?.state || selectedUserComputed?.state || selectedUserDetail?.addresses?.[0]?.state || selectedUser.addresses?.[0]?.state || "—" },
                        { label: "Saved Address", value: savedAddress },
                        { label: "Member Since", value: selectedUserDetail?.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—" },
                        { label: "Last Login", value: selectedUserDetail?.lastLogin ? new Date(selectedUserDetail.lastLogin).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—" },
                        { label: "Login Count", value: Number(selectedUserDetail?.loginCount ?? selectedUser.loginCount ?? 0).toLocaleString("en-IN") },
                        { label: "Role", value: (selectedUserDetail?.role || selectedUser.role || "user").toUpperCase() },
                      ];
                    })().map((item) => (
                      <div key={item.label} style={{ background: THEME.bg, borderRadius: "8px", padding: "12px 14px" }}>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: THEME.textLight, marginBottom: "3px" }}>{item.label.toUpperCase()}</p>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text, fontWeight: 600, wordBreak: "break-all" }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3, minmax(0, 1fr))", gap: "10px", marginBottom: "14px" }}>
                    {[
                      { label: "Total Orders", value: selectedUserStats?.totalOrders ?? selectedUserComputed?.totalOrders ?? 0 },
                      { label: "Last Order", value: selectedUserStats?.lastOrderDate ? new Date(selectedUserStats.lastOrderDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : selectedUserComputed?.lastOrderDate || "—" },
                      { label: "Total Spend", value: `₹${Number(selectedUserStats?.totalSpend ?? selectedUserComputed?.totalSpend ?? 0).toLocaleString("en-IN")}` },
                    ].map((item) => (
                      <div key={item.label} style={{ background: `${THEME.gold}10`, border: `1px solid ${THEME.gold}20`, borderRadius: "10px", padding: "12px 14px" }}>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", color: THEME.textLight, marginBottom: "3px" }}>{item.label.toUpperCase()}</p>
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text, fontWeight: 700 }}>{item.value}</p>
                      </div>
                    ))}
                  </div>

                  <div style={{ background: THEME.bg, borderRadius: "12px", padding: "14px", marginBottom: "14px" }}>
                    <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", letterSpacing: "2px", color: THEME.textLight, marginBottom: "10px", fontWeight: 700 }}>ORDER HISTORY</p>
                    {selectedUserLoading && <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textLight }}>Loading history…</p>}
                    {!selectedUserLoading && (selectedUserOrders.length > 0 ? selectedUserOrders : (selectedUserComputed?.orders || [])).map((order) => (
                      <div key={order._id} style={{ display: "flex", justifyContent: "space-between", gap: "10px", padding: "10px 0", borderBottom: `1px solid ${THEME.border}` }}>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.crimson, fontWeight: 700 }}>{(order.trackingId || order._id || "").slice(-10)}</p>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>{getOrderDate(order)}</p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.text, fontWeight: 700 }}>₹{getOrderAmount(order).toLocaleString("en-IN")}</p>
                          <StatusBadge status={getOrderStatus(order)} />
                        </div>
                      </div>
                    ))}
                    {!selectedUserLoading && !(selectedUserOrders.length > 0 || (selectedUserComputed?.orders || []).length > 0) && (
                      <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.textLight }}>No order history found for this user.</p>
                    )}
                  </div>

                  <button onClick={() => handleDeleteUser(selectedUser._id)} style={{ marginTop: "4px", width: "100%", background: `${THEME.crimson}10`, border: `1px solid ${THEME.crimson}40`, color: THEME.crimson, padding: "11px", borderRadius: "10px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "12px", fontWeight: 700 }}>🗑️ Remove User</button>
                </div>
              </div>
            )}
            <div style={{ marginBottom: "20px" }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", marginBottom: "2px" }}>Users</h1>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textLight }}>{filteredUsers.length} registered customers</p>
            </div>
            <input placeholder="🔍 Search by name or email…" value={userSearch} onChange={e => setUserSearch(e.target.value)} style={{ ...iStyle, marginBottom: "18px", padding: "12px 16px", fontSize: "16px" }} />
            <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "14px", overflow: "hidden" }}>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: THEME.bgDark }}>
                      {["Customer", "Email", "Orders", "Last Order", "Total Spend", "Phone", "Location", "Role", "Actions"].map(h => (
                        <th key={h} style={{ padding: "11px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "9px", letterSpacing: "2px", textTransform: "uppercase", color: THEME.textLight, textAlign: "left", borderBottom: `1px solid ${THEME.border}`, whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleUsers.map((u, idx) => {
                      const summary = buildUserOrderSummary(u, allOrders);
                      return (
                        <tr key={`${u._id || u.email || "user-row"}-${idx}`} style={{ background: idx % 2 === 0 ? "transparent" : THEME.bg, cursor: "pointer" }}
                          onClick={() => handleSelectUser(u)}
                          onMouseEnter={e => e.currentTarget.style.background = `${THEME.crimson}06`}
                          onMouseLeave={e => e.currentTarget.style.background = idx % 2 === 0 ? "transparent" : THEME.bg}>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: `linear-gradient(135deg,${THEME.crimson},${THEME.gold})`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700, fontFamily: "'Playfair Display',serif", flexShrink: 0 }}>{u.name?.charAt(0)}</div>
                              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text, fontWeight: 600, whiteSpace: "nowrap" }}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{ padding: "13px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted }}>{u.email}</td>
                          <td style={{ padding: "13px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, whiteSpace: "nowrap", fontWeight: 700 }}>{summary.totalOrders}</td>
                          <td style={{ padding: "13px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, whiteSpace: "nowrap" }}>{summary.lastOrderDate}</td>
                          <td style={{ padding: "13px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, whiteSpace: "nowrap", fontWeight: 700 }}>₹{summary.totalSpend.toLocaleString("en-IN")}</td>
                          <td style={{ padding: "13px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, whiteSpace: "nowrap" }}>{u.phone || "—"}</td>
                          <td style={{ padding: "13px 14px", fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted, whiteSpace: "nowrap" }}>{summary.city !== "—" ? `${summary.city}, ${summary.state}` : "—"}</td>
                          <td style={{ padding: "13px 14px" }}><span style={{ background: u.role === "admin" ? `${THEME.crimson}15` : `${THEME.gold}15`, color: u.role === "admin" ? THEME.crimson : THEME.goldDark, padding: "3px 10px", borderRadius: "99px", fontSize: "10px", fontFamily: "'Poppins',sans-serif", fontWeight: 700 }}>{u.role?.toUpperCase() || "USER"}</span></td>
                          <td style={{ padding: "13px 14px" }}>
                            <div style={{ display: "flex", gap: "5px" }}>
                              <button onClick={(e) => { e.stopPropagation(); handleSelectUser(u); }} style={{ background: `${THEME.gold}15`, border: `1px solid ${THEME.gold}40`, color: THEME.goldDark, padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontFamily: "'Poppins',sans-serif" }}>View</button>
                              <button onClick={(e) => { e.stopPropagation(); handleDeleteUser(u._id); }} style={{ background: `${THEME.crimson}10`, border: `1px solid ${THEME.crimson}30`, color: THEME.crimson, padding: "5px 10px", borderRadius: "6px", cursor: "pointer", fontSize: "11px", fontFamily: "'Poppins',sans-serif" }}>Del</button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {visibleUsers.length === 0 && <div style={{ textAlign: "center", padding: "48px", color: THEME.textLight, fontFamily: "'Poppins',sans-serif" }}>{loadingData ? "Loading..." : "No users found"}</div>}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", padding: "14px 16px", borderTop: `1px solid ${THEME.border}`, flexWrap: "wrap" }}>
                <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textLight }}>
                  Page {userPage} of {userPageCount}
                </p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button onClick={() => setUserPage(p => Math.max(1, p - 1))} disabled={userPage === 1} style={{ background: userPage === 1 ? THEME.bgDark : THEME.bg, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "8px 12px", borderRadius: "8px", cursor: userPage === 1 ? "not-allowed" : "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "11px" }}>Prev</button>
                  <button onClick={() => setUserPage(p => Math.min(userPageCount, p + 1))} disabled={userPage === userPageCount} style={{ background: userPage === userPageCount ? THEME.bgDark : THEME.bg, border: `1px solid ${THEME.border}`, color: THEME.text, padding: "8px 12px", borderRadius: "8px", cursor: userPage === userPageCount ? "not-allowed" : "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "11px" }}>Next</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {tab === "traffic" && (
          <div>
            <div style={{ marginBottom: "28px" }}>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: "30px", marginBottom: "4px" }}>🌍 Traffic Analytics</h1>
              <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textLight }}>India vs International user breakdown</p>
            </div>

            {trafficLoading ? (
              <div style={{ textAlign: "center", padding: "72px", fontFamily: "'Poppins',sans-serif", color: THEME.textMuted }}>Loading traffic data...</div>
            ) : trafficData ? (() => {
              const total = trafficData.total || 1;
              const viewCount = Number(siteViews?.views || 0);
              const indiaPct = Math.round((trafficData.india / total) * 100) || 0;
              const intlPct = Math.round((trafficData.international / total) * 100) || 0;
              const unknPct = 100 - indiaPct - intlPct;
              const r = 70, cx = 90, cy = 90, circ = 2 * Math.PI * r;
              const indiaDash = circ * (indiaPct / 100);
              const intlDash = circ * (intlPct / 100);
              const unknDash = circ * (unknPct / 100);
              const topCountries = Object.entries(trafficData.countryCount || {}).sort((a, b) => b[1] - a[1]).slice(0, 8);
              return (
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                  <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", padding: "28px" }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", marginBottom: "24px" }}>User Distribution</h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "28px", flexWrap: "wrap" }}>
                      <svg width="180" height="180" style={{ flexShrink: 0 }}>
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke={THEME.bgDark} strokeWidth="18" />
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke={THEME.crimson} strokeWidth="18"
                          strokeDasharray={`${indiaDash} ${circ}`} strokeDashoffset={circ * 0.25} strokeLinecap="round" />
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#4ECDC4" strokeWidth="18"
                          strokeDasharray={`${intlDash} ${circ}`} strokeDashoffset={circ * 0.25 - indiaDash} strokeLinecap="round" />
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#95A5A6" strokeWidth="18"
                          strokeDasharray={`${unknDash} ${circ}`} strokeDashoffset={circ * 0.25 - indiaDash - intlDash} strokeLinecap="round" />
                        <text x={cx} y={cy - 8} textAnchor="middle" style={{ fontFamily: "'Playfair Display',serif", fontSize: "22px", fontWeight: 700, fill: THEME.text }}>{total}</text>
                        <text x={cx} y={cy + 12} textAnchor="middle" style={{ fontFamily: "'Poppins',sans-serif", fontSize: "10px", fill: THEME.textLight }}>total users</text>
                      </svg>
                      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                        {[
                          { label: "🇮🇳 India", count: trafficData.india, pct: indiaPct, color: THEME.crimson },
                          { label: "🌍 International", count: trafficData.international, pct: intlPct, color: "#4ECDC4" },
                          { label: "❓ Unknown", count: trafficData.unknown, pct: unknPct, color: "#95A5A6" },
                        ].map(item => (
                          <div key={item.label}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                              <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.text, fontWeight: 600 }}>{item.label}</span>
                            </div>
                            <div style={{ marginLeft: "18px" }}>
                              <div style={{ background: THEME.bgDark, borderRadius: "99px", height: "6px", width: "120px", overflow: "hidden" }}>
                                <div style={{ background: item.color, width: `${item.pct}%`, height: "100%", borderRadius: "99px" }} />
                              </div>
                              <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", color: THEME.textMuted }}>{item.count} users ({item.pct}%)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ background: THEME.bgCard, border: `1px solid ${THEME.border}`, borderRadius: "16px", padding: "28px" }}>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: "18px", marginBottom: "24px" }}>Top Countries</h3>
                    {topCountries.length === 0 ? (
                      <p style={{ fontFamily: "'Poppins',sans-serif", color: THEME.textMuted, fontSize: "13px" }}>No data yet. Users will appear after login/register.</p>
                    ) : topCountries.map(([country, count], i) => {
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={country} style={{ marginBottom: "16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "5px" }}>
                            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "13px", color: THEME.text, fontWeight: 600 }}>{i + 1}. {country}</span>
                            <span style={{ fontFamily: "'Poppins',sans-serif", fontSize: "12px", color: THEME.textMuted }}>{count} · {pct}%</span>
                          </div>
                          <div style={{ background: THEME.bgDark, borderRadius: "99px", height: "7px", overflow: "hidden" }}>
                            <div style={{ background: country === "India" ? THEME.crimson : country === "Unknown" ? "#95A5A6" : "#4ECDC4", width: `${pct}%`, height: "100%", borderRadius: "99px" }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div style={{ gridColumn: isMobile ? "auto" : "1/-1", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: "16px" }}>
                    {[ 
                      { label: "Total Registered Users", value: total, icon: "👥", color: THEME.crimson },
                      { label: "India Users", value: trafficData.india, icon: "🇮🇳", color: THEME.crimson },
                      { label: "International Users", value: trafficData.international, icon: "🌍", color: "#4ECDC4" },
                      { label: "Site Views (All Time)", value: viewCount, icon: "👁️", color: THEME.goldDark },
                    ].map(s => (
                      <div
                        key={s.label}
                        style={{
                          background: THEME.bgCard,
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderColor: THEME.border,
                          borderLeftWidth: "3px",
                          borderLeftColor: s.color,
                          borderRadius: "14px",
                          padding: "20px 24px",
                        }}
                      >
                        <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "11px", letterSpacing: "2px", color: THEME.textLight, marginBottom: "8px" }}>{s.icon} {s.label.toUpperCase()}</p>
                        <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "32px", fontWeight: 700, color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })() : (
              <div style={{ textAlign: "center", padding: "72px", fontFamily: "'Poppins',sans-serif", color: THEME.textMuted }}>
                Failed to load.
                <button onClick={() => { setTrafficData(null); setTab("dashboard"); setTimeout(() => setTab("traffic"), 100); }}
                  style={{ display: "block", margin: "16px auto 0", background: THEME.crimson, color: "#fff", border: "none", padding: "10px 20px", borderRadius: "10px", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "12px" }}>
                  Retry
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
