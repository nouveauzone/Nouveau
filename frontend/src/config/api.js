const envApiUrl = String(process.env.REACT_APP_API_URL || "").trim().replace(/\/api\/?$/i, "");
const API_URL = envApiUrl;

export default API_URL;
