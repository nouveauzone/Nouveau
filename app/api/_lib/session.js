import { createRequire } from "module";

const require = createRequire(import.meta.url);
const jwt = require("jsonwebtoken");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: 30 * 24 * 60 * 60,
};

const parseCookies = (cookieHeader = "") => {
  return String(cookieHeader || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const separator = item.indexOf("=");
      if (separator === -1) return cookies;
      const key = decodeURIComponent(item.slice(0, separator).trim());
      const value = decodeURIComponent(item.slice(separator + 1).trim());
      if (key) cookies[key] = value;
      return cookies;
    }, {});
};

const getTokenFromRequest = (request) => {
  const header = String(request.headers.get("authorization") || request.headers.get("Authorization") || "").trim();
  if (header.toLowerCase().startsWith("bearer ")) {
    return header.slice(7).trim();
  }

  const cookies = parseCookies(request.headers.get("cookie") || "");
  return String(cookies.nouveau_auth_token || cookies.token || cookies.jwt || "").trim();
};

const setAuthCookies = (response, token) => {
  response.cookies.set("nouveau_auth_token", token, cookieOptions);
  response.cookies.set("token", token, cookieOptions);
  response.cookies.set("jwt", token, cookieOptions);
  return response;
};

const clearAuthCookies = (response) => {
  const clearOptions = { ...cookieOptions, maxAge: 0 };
  response.cookies.set("nouveau_auth_token", "", clearOptions);
  response.cookies.set("token", "", clearOptions);
  response.cookies.set("jwt", "", clearOptions);
  return response;
};

const verifyJwt = (token) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing");
  }

  return jwt.verify(token, process.env.JWT_SECRET);
};

export { clearAuthCookies, cookieOptions, getTokenFromRequest, setAuthCookies, verifyJwt };