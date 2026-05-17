const API_URL = String(
	(typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_URL) ||
	(typeof process !== "undefined" && process.env && process.env.REACT_APP_API_URL) ||
	""
).trim();

export default API_URL;
