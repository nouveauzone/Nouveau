import axios from "axios";
import API_URL from "../config/api";
import { PRODUCTS as INITIAL_PRODUCTS } from "../data/products";
import { clearAuthSession } from "../utils/authSession";

const isProd = process.env.NODE_ENV === "production";
const logDebug = (...args) => { if (!isProd) console.debug(...args); };
const logInfo = (...args) => { if (!isProd) console.log(...args); };
const logError = (...args) => { if (!isProd) console.error(...args); };

const normalizeSizeLabel = (value) => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^free\s*size$/i.test(raw)) return "Free Size";
  return raw.toUpperCase();
};

const normalizeSizes = (product) => {
  const rawSizes = Array.isArray(product?.sizes) ? product.sizes : [];
  const normalized = rawSizes
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const size = normalizeSizeLabel(entry.size);
      if (!size) return null;
      const quantity = Math.max(0, Number(entry.quantity ?? entry.stock) || 0);
      return { size, quantity };
    })
    .filter(Boolean);

  if (normalized.length) return normalized;

  const legacyStock = product?.stock != null ? Math.max(0, Number(product.stock) || 0) : 0;
  return [{ size: "Free Size", quantity: legacyStock }];
};

const normalizeProduct = (product) => ({
  ...product,
  images: Array.isArray(product?.images) && product.images.length ? product.images : ["/ethnic1.jpeg"],
  price: Number(product?.price) || 0,
  originalPrice: Number(product?.originalPrice) || Number(product?.price) || 0,
  rating: Number(product?.rating) || 0,
  discount: Number(product?.discount) || 0,
  sizes: normalizeSizes(product),
});

const dedupeProducts = (items = []) => {
  const seen = new Set();
  const merged = [];

  items.forEach((item) => {
    const normalized = normalizeProduct(item);
    const id = String(normalized?._id || normalized?.id || "");
    const fingerprint = id || `${normalized?.title || ""}-${normalized?.price || 0}-${normalized?.category || ""}-${normalized?.subcategory || ""}-${String(normalized?.images?.[0] || "")}`;
    if (!fingerprint || seen.has(fingerprint)) return;
    seen.add(fingerprint);
    merged.push(normalized);
  });

  return merged;
};

const prepareProductWritePayload = (data = {}) => {
  const normalized = normalizeProduct(data);
  const { _id, id, rating, reviews, avgRating, numReviews, stock, createdAt, updatedAt, __v, ...rest } = normalized;

  const sizes = normalizeSizes({ sizes: rest.sizes })
    .map((entry) => ({
      size: normalizeSizeLabel(entry?.size),
      quantity: Math.max(0, Number(entry?.quantity ?? entry?.stock) || 0),
    }))
    .filter((entry) => entry.size && Number.isFinite(entry.quantity));

  const images = Array.isArray(rest.images)
    ? rest.images.map((image) => String(image || "").trim()).filter(Boolean)
    : [];

  return {
    ...rest,
    images: images.length ? images : ["/ethnic1.jpeg"],
    sizes,
  };
};

const normalizeFallback = (value) => {
  const raw = String(value || "").trim();
  if (!raw || raw === "/api" || raw.startsWith("/")) return "";

  let normalized = raw.replace(/\/+$/, "");
  if (typeof window !== "undefined" && window.location.protocol === "https:" && normalized.startsWith("http://")) {
    normalized = normalized.replace(/^http:\/\//i, "https://");
  }

  return normalized.replace(/\/api$/i, "");
};

let cachedRazorpayKeyId = null;

const getRazorpayKeyId = async () => {
  const reactEnvKey = String(process.env.REACT_APP_RAZORPAY_KEY_ID || "").trim();
  const viteEnvKey = String(process.env.VITE_RAZORPAY_KEY_ID || "").trim();
  const envKey = reactEnvKey || viteEnvKey;

  if (envKey) {
    cachedRazorpayKeyId = envKey;
    logDebug("[razorpay] using env key");
    return envKey;
  }

  if (cachedRazorpayKeyId) {
    logDebug("[razorpay] using cached key");
    return cachedRazorpayKeyId;
  }

  const configPaths = [
    "/razorpay/config",
    "/config",
    "/payments/razorpay/config",
    "/payment/razorpay/config",
    "/payments/config",
    "/payment/config",
  ];

  let data;
  let lastError;

  for (const url of configPaths) {
    try {
      data = await request({ url, method: "GET" });
      logDebug("[razorpay] fetched from", url, data);
      break;
    } catch (error) {
      logDebug("[razorpay] fetch failed for", url, error.message);
      lastError = error;
    }
  }

  if (data) {
    const keyId = String(data?.keyId || data?.key_id || data?.razorpayKeyId || data?.razorpay_key_id || "").trim();
    if (keyId) {
      cachedRazorpayKeyId = keyId;
      return keyId;
    }
  }

  try {
    logDebug("[razorpay] trying direct fetch from root /razorpay/config");
    const res = await fetch("/razorpay/config");
    if (res.ok) {
      const json = await res.json();
      const keyId = String(json?.keyId || json?.key_id || json?.razorpayKeyId || json?.razorpay_key_id || "").trim();
      if (keyId) {
        cachedRazorpayKeyId = keyId;
        logDebug("[razorpay] got key from direct fetch");
        return keyId;
      }
    }
  } catch (err) {
    logDebug("[razorpay] direct fetch also failed:", err.message);
  }

  const message = lastError?.message || "Razorpay public key unavailable. Set REACT_APP_RAZORPAY_KEY_ID or enable /razorpay/config on the API server.";
  throw new Error(message);
};

const API_FALLBACK = normalizeFallback(process.env.REACT_APP_API_FALLBACK_URL || "");
const AUTH_EXPIRED_EVENT = "nouveau:auth-expired";

const buildApiBase = (base) => {
  const normalized = String(base || "").replace(/\/+$/, "");
  if (!normalized) return "/api";
  if (/\/(api|payment|payments|razorpay)$/i.test(normalized)) return normalized;
  return `${normalized}/api`;
};

const isLikelyServerFailure = (status) => status === 404 || status === 500 || status === 502 || status === 503 || status === 504 || status >= 520;

const isSameOriginBase = (baseURL) => {
  if (!baseURL) return true;
  if (baseURL.startsWith("/")) return true;

  try {
    const currentOrigin = typeof window !== "undefined" ? window.location.origin : "";
    if (!currentOrigin) return false;
    return new URL(baseURL, currentOrigin).origin === currentOrigin;
  } catch {
    return false;
  }
};

const getStoredAuth = () => {
  try {
    return JSON.parse(localStorage.getItem("nouveau_auth") || "{}");
  } catch {
    return {};
  }
};

const getStoredToken = () => {
  try {
    const directToken = String(localStorage.getItem("token") || "").trim();
    if (directToken) return directToken;
  } catch { }

  const nestedToken = String(getStoredAuth()?.token || "").trim();
  if (nestedToken) return nestedToken;

  try {
    const adminSession = JSON.parse(localStorage.getItem("admin") || "null");
    const adminToken = String(adminSession?.token || adminSession?.user?.token || "").trim();
    if (adminToken) return adminToken;
  } catch { }

  return nestedToken;
};

const clearStoredAuth = async () => {
  clearAuthSession();

  try {
    await primaryClient.post("/auth/logout");
  } catch {
  }
};

const emitAuthExpired = (message = "Session expired. Please login again.") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(AUTH_EXPIRED_EVENT, { detail: { message } }));
};

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 20000,
    withCredentials: true,
  });

  client.interceptors.request.use((config) => {
    const explicitAuth = String(config.headers?.Authorization || config.headers?.authorization || "").trim();
    const token = getStoredToken();
    if (!explicitAuth && token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return client;
};

const primaryClient = createClient(buildApiBase(API_URL || API_FALLBACK));
const fallbackClient = API_URL && API_FALLBACK ? createClient(buildApiBase(API_FALLBACK)) : null;

const requestWithClient = async (client, config) => {
  const safeConfig = { ...config, headers: { ...(config?.headers || {}) } };
  const isFormData = typeof FormData !== "undefined" && safeConfig?.data instanceof FormData;

  if (safeConfig?.data !== undefined && !isFormData) {
    if (!safeConfig.headers["Content-Type"]) {
      safeConfig.headers["Content-Type"] = "application/json";
    }
    if (!safeConfig.headers.Accept) {
      safeConfig.headers.Accept = "application/json";
    }
  }

  logDebug("[api] request", {
    url: safeConfig.url,
    method: safeConfig.method,
    baseURL: client.defaults.baseURL,
    params: safeConfig.params,
  });

  const response = await client.request(safeConfig);
  return response.data;
};

const shouldRetryWithFallback = (error, client) => {
  if (!fallbackClient) return false;
  if (!error?.response) return false;
  if (client !== primaryClient) return false;
  const status = Number(error.response.status);
  const message = String(error?.response?.data?.message || "").toLowerCase();

  const isLegacySizeValidation =
    status === 400 &&
    (message.includes("sizes must be an array") || message.includes("sizes must be an array of { size, quantity }"));

  if (!isLikelyServerFailure(status) && !isLegacySizeValidation) return false;
  return isSameOriginBase(primaryClient.defaults.baseURL || "");
};

const request = async (config) => {
  try {
    return await requestWithClient(primaryClient, config);
  } catch (error) {
    if (shouldRetryWithFallback(error, primaryClient)) {
      return requestWithClient(fallbackClient, config);
    }

    const status = Number(error?.response?.status || 0);
    const message = error?.response?.data?.message || error?.message || "Request failed";

    const requestUrl = `${primaryClient?.defaults?.baseURL || ""}${String(config?.url || "")}`;
    logError("[api] request failed", {
      requestUrl,
      status,
      message,
      url: config?.url,
      data: config?.data,
      response: error?.response?.data,
    });

    if (status === 401) {
      const url = String(config?.url || "");
      const skipAuthReset = Boolean(config?.skipAuthResetOn401) || /\/razorpay\//i.test(url);

      if (!skipAuthReset) {
        await clearStoredAuth();
        emitAuthExpired(message || "Token invalid or expired");
      }
    }

    throw new Error(message);
  }
};

const apiService = {
  register: (data) => {
    logInfo("[auth] register request", { email: data?.email });
    return request({ url: "/auth/register", method: "POST", data });
  },
  login: (data) => {
    logInfo("[auth] login request", { email: data?.email });
    return request({ url: "/auth/login", method: "POST", data });
  },
  logout: () => request({ url: "/auth/logout", method: "POST" }),
  getMe: () => request({ url: "/auth/me", method: "GET" }),

  getProducts: async (params = {}) => {
    try {
      const data = await request({ url: "/products", method: "GET", params });
      const backendProducts = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
          ? data.products
          : [];

      if (backendProducts.length > 0) {
        return dedupeProducts(backendProducts);
      }

      return dedupeProducts(INITIAL_PRODUCTS);
    } catch {
      return dedupeProducts(INITIAL_PRODUCTS);
    }
  },
  getProduct: (id) => request({ url: `/products/${id}`, method: "GET" }),
  getRazorpayKeyId: () => getRazorpayKeyId(),
  createProduct: (data) => request({ url: "/products", method: "POST", data: prepareProductWritePayload(data) }),
  updateProduct: (id, data) => request({ url: `/products/${id}`, method: "PUT", data: prepareProductWritePayload(data) }),
  deleteProduct: (id) => request({ url: `/products/${id}`, method: "DELETE" }),
  addReview: (id, data) => request({ url: `/reviews/${id}`, method: "POST", data }),
  uploadImages: (formData) => request({ url: "/upload", method: "POST", data: formData }),
  getCurrencyInfo: async () => {
    const response = await fetch("/api/currency", {
      method: "GET",
      credentials: "include",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`Currency lookup failed (${response.status})`);
    }

    return response.json();
  },
  createRazorpayOrder: (data, tokenOverride) => request({
    url: "/razorpay/create-order",
    method: "POST",
    data,
    skipAuthResetOn401: true,
    headers: tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : undefined,
  }),
  verifyRazorpayPayment: (data, tokenOverride) => request({
    url: "/razorpay/verify",
    method: "POST",
    data,
    skipAuthResetOn401: true,
    headers: tokenOverride ? { Authorization: `Bearer ${tokenOverride}` } : undefined,
  }),

  placeOrder: (data) => request({ url: "/orders", method: "POST", data }),
  getMyOrders: () => request({ url: "/orders/my", method: "GET" }),
  getOrder: (id) => request({ url: `/orders/${id}`, method: "GET" }),
  getAllOrders: (params = {}) => request({ url: "/orders/all", method: "GET", params }),
  trackOrder: (trackingId) => request({ url: `/orders/track/${trackingId}`, method: "GET" }),
  updateOrderStatus: (id, status, message) => request({ url: `/orders/update/${id}`, method: "PUT", data: { status, message } }),
  deleteOrder: (id) => request({ url: `/orders/${id}`, method: "DELETE" }),

  getAllUsers: (params = {}) => request({ url: "/users", method: "GET", params }),
  getUserDetail: (id) => request({ url: `/users/${id}/detail`, method: "GET" }),
  deleteUser: (id) => request({ url: `/users/${id}`, method: "DELETE" }),

  updateProfile: (data) => request({ url: "/auth/profile", method: "PUT", data }),
  addAddress: (data) => request({ url: "/auth/addresses", method: "POST", data }),
  deleteAddress: (addressId) => request({ url: `/auth/addresses/${addressId}`, method: "DELETE" }),

  getTraffic: () => request({ url: "/auth/traffic", method: "GET" }),
  getSiteViews: (month) => request({
    url: "/metrics/views",
    method: "GET",
    params: month ? { month } : undefined,
  }),
  incrementSiteView: (month) => request({
    url: "/metrics/views",
    method: "POST",
    data: month ? { month } : {},
  }),
};

export { AUTH_EXPIRED_EVENT };
export default apiService;