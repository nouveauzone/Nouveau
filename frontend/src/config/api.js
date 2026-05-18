const readEnv = (...keys) => {
	for (const key of keys) {
		const value = String(process.env[key] || "").trim();
		if (value) return value;
	}
	return "";
};

const envApiUrl = readEnv(
	"REACT_APP_API_URL",
	"REACT_APP_BASE_URL",
	"REACT_APP_API_FALLBACK_URL",
	"VITE_API_URL",
	"VITE_BASE_URL"
);

const runtimeApiUrl = typeof window !== "undefined"
	? String(window.__NOUVEAU_API_URL || window.__API_URL || "").trim()
	: "";

const API_URL = (envApiUrl || runtimeApiUrl).replace(/\/api\/?$/i, "");

export default API_URL;
