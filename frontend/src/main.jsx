import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import Providers from "./context/Providers";

if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    const error = event?.error || event?.message || event;
    console.error("[global] error", error);
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event?.reason || event;
    console.error("[global] unhandledrejection", reason);
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Providers>
      <App />
    </Providers>
  </React.StrictMode>
);
