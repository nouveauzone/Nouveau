const AUTH_STORAGE_KEY = "nouveau_auth";
const TOKEN_STORAGE_KEY = "token";
const ADMIN_STORAGE_KEY = "admin";
const COOKIE_NAME = "nouveau_auth_token";

const isBrowser = () => typeof window !== "undefined" && typeof document !== "undefined";

const isSecureContext = () => {
  if (typeof window === "undefined") {
    return Boolean(import.meta.env.PROD);
  }

  return window.location.protocol === "https:" || Boolean(import.meta.env.PROD);
};

const readCookie = (name) => {
  if (!isBrowser()) return "";

  const cookies = document.cookie ? document.cookie.split(";") : [];
  for (const cookie of cookies) {
    const [rawKey, ...rawValue] = cookie.trim().split("=");
    if (decodeURIComponent(rawKey) !== name) continue;
    return decodeURIComponent(rawValue.join("=") || "");
  }

  return "";
};

const writeCookie = (name, value, maxAgeSeconds = 60 * 60 * 24 * 30) => {
  if (!isBrowser()) return;

  const parts = [
    `${encodeURIComponent(name)}=${encodeURIComponent(value)}`,
    "path=/",
    `max-age=${maxAgeSeconds}`,
    `samesite=${import.meta.env.PROD ? "none" : "lax"}`,
  ];

  if (isSecureContext()) {
    parts.push("secure");
  }

  document.cookie = parts.join("; ");
};

const deleteCookie = (name) => {
  if (!isBrowser()) return;

  const parts = [
    `${encodeURIComponent(name)}=`,
    "path=/",
    "max-age=0",
    `samesite=${import.meta.env.PROD ? "none" : "lax"}`,
  ];

  if (isSecureContext()) {
    parts.push("secure");
  }

  document.cookie = parts.join("; ");
};

const readJson = (key, fallback = null) => {
  if (!isBrowser()) return fallback;

  try {
    return JSON.parse(localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
};

const getStoredToken = () => {
  const cookieToken = readCookie(COOKIE_NAME).trim();
  if (cookieToken) return cookieToken;

  const directToken = isBrowser() ? String(localStorage.getItem(TOKEN_STORAGE_KEY) || "").trim() : "";
  if (directToken) return directToken;

  const authToken = String(readJson(AUTH_STORAGE_KEY)?.token || "").trim();
  if (authToken) return authToken;

  const adminSession = readJson(ADMIN_STORAGE_KEY, null);
  const adminToken = String(adminSession?.token || adminSession?.user?.token || "").trim();
  if (adminToken) return adminToken;

  return "";
};

const persistAuthSession = (authPayload) => {
  if (!isBrowser()) return;

  const token = String(authPayload?.token || "").trim();
  const nextPayload = {
    user: authPayload?.user || null,
    token,
    isAuthenticated: Boolean(authPayload?.isAuthenticated ?? token),
  };

  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextPayload));
  localStorage.setItem(TOKEN_STORAGE_KEY, token);

  if (nextPayload.user && String(nextPayload.user.role || "").toLowerCase() === "admin") {
    localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(nextPayload));
  } else {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
  }

  if (token) {
    writeCookie(COOKIE_NAME, token);
  } else {
    deleteCookie(COOKIE_NAME);
  }
};

const clearAuthSession = () => {
  if (!isBrowser()) return;

  localStorage.removeItem(AUTH_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(ADMIN_STORAGE_KEY);
  deleteCookie(COOKIE_NAME);
};

const hydrateAuthSession = () => {
  if (!isBrowser()) {
    return { user: null, token: "", isAuthenticated: false };
  }

  const stored = readJson(AUTH_STORAGE_KEY, { user: null, token: "", isAuthenticated: false });
  const token = String(stored?.token || getStoredToken()).trim();
  const hasUser = Boolean(stored?.user?._id);

  if (stored?.isAuthenticated && hasUser && token) {
    return { ...stored, token };
  }

  try {
    const legacyAdmin = JSON.parse(localStorage.getItem(ADMIN_STORAGE_KEY) || "null");
    const adminUser = legacyAdmin?.user || legacyAdmin;
    const adminToken = String(legacyAdmin?.token || "").trim();
    const adminRole = String(adminUser?.role || legacyAdmin?.role || "").toLowerCase();
    if (adminUser && adminToken && adminRole === "admin") {
      return { user: adminUser, token: adminToken, isAuthenticated: true };
    }
  } catch {
  }

  return { user: stored?.user || null, token, isAuthenticated: Boolean(token && hasUser) };
};

export {
  AUTH_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  COOKIE_NAME,
  clearAuthSession,
  getStoredToken,
  hydrateAuthSession,
  persistAuthSession,
};