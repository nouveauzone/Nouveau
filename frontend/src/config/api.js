const reactApiUrl = String(process.env.REACT_APP_API_URL || process.env.REACT_APP_BASE_URL || "").trim();
const viteApiUrl = String(process.env.VITE_API_URL || process.env.VITE_BASE_URL || "").trim();
const envApiUrl = (reactApiUrl || viteApiUrl).replace(/\/api\/?$/i, "");
const API_URL = envApiUrl;

export default API_URL;
