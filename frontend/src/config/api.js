const envApiUrl = String(process.env.REACT_APP_API_URL || "").trim();
const injectedApiUrl = typeof window !== "undefined" ? String(window.__API_URL__ || window.__ENV__?.REACT_APP_API_URL || "").trim() : "";
const sameOriginApiUrl = typeof window !== "undefined" ? `${window.location.origin}/api` : "/api";

const API_URL = envApiUrl || injectedApiUrl || sameOriginApiUrl;

export default API_URL;
