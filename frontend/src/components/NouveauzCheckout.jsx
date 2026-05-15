import { useState } from "react";
import apiService from "../services/apiService";
import { loadRazorpayScript } from "../utils/loadRazorpay";

const METHOD_BADGES = ["UPI", "PhonePe", "GPay", "Cards", "NetBanking", "Wallets"];

const getItemLabel = (item) => item?.title || item?.name || "Item";

const Spinner = () => (
  <span style={{
    display: "inline-block",
    width: "16px",
    height: "16px",
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "nvz-spin 0.7s linear infinite",
  }}>
    <style>{`@keyframes nvz-spin { to { transform: rotate(360deg); } }`}</style>
  </span>
);

export default function NouveauzCheckout({ amount, cartItems = [], customerInfo = {}, onSuccess, onFailure }) {
  const [loading, setLoading] = useState(false);

  const hasAuthToken = () => {
    try {
      const direct = String(localStorage.getItem("token") || "").trim();
      if (direct) return true;
      const nested = JSON.parse(localStorage.getItem("nouveau_auth") || "{}");
      return Boolean(String(nested?.token || "").trim());
    } catch {
      return false;
    }
  };

  const getAuthToken = () => {
    try {
      const direct = String(localStorage.getItem("token") || "").trim();
      if (direct) return direct;
      const nested = JSON.parse(localStorage.getItem("nouveau_auth") || "{}");
      return String(nested?.token || "").trim();
    } catch {
      return "";
    }
  };

  const openRazorpay = async () => {
    const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID || "rzp_live_ShIb6CLyEFQUrG";

    if (!keyId) {
      const message = "Razorpay key missing. Add REACT_APP_RAZORPAY_KEY_ID in frontend environment.";
      alert(message);
      onFailure?.({ reason: "missing-key", description: message });
      return;
    }

    if (!hasAuthToken()) {
      const message = "Please login again to continue checkout.";
      alert(message);
      onFailure?.({ reason: "auth", description: message });
      return;
    }

    setLoading(true);

    try {
      await loadRazorpayScript();
      const token = getAuthToken();
      const gatewayOrder = await apiService.createRazorpayOrder({ amount: Number(amount) }, token);

      const options = {
        key: keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency || "INR",
        order_id: gatewayOrder.orderId,
        name: "Nouveau™",
        description: cartItems.length > 0
          ? `${cartItems.length} item(s) — ${cartItems.map(getItemLabel).join(", ")}`
          : "Fashion Order",
        image: `${window.location.origin}/nouveau-logo.png`,
        prefill: {
          name: customerInfo.name || "",
          email: customerInfo.email || "",
          contact: customerInfo.phone || "",
        },
        notes: {
          website: "nouveauz.com",
          items: cartItems.map(getItemLabel).join(", "),
        },
        theme: {
          color: "#1a1a1a",
          hide_topbar: false,
        },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          ondismiss: () => {
            setLoading(false);
            onFailure?.({ reason: "cancelled", description: "Payment cancelled" });
          },
        },
        handler: async (response) => {
          try {
            await apiService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }, token);

            onSuccess?.({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
          } catch (error) {
            const message = error?.message || "Payment verification failed";
            onFailure?.({ reason: "verification_failed", description: message });
            alert(message);
          } finally {
            setLoading(false);
          }
        },
      };

      const checkout = new window.Razorpay(options);

      checkout.on("payment.failed", (response) => {
        setLoading(false);
        const message = response?.error?.description || "Payment failed";
        onFailure?.({
          reason: response?.error?.reason || "failed",
          description: message,
          code: response?.error?.code,
        });
      });

      checkout.open();
    } catch (error) {
      setLoading(false);
      const message = error?.message || "Unable to start payment";
      alert(message);
      onFailure?.({ reason: "start_failed", description: message });
    }
  };

  return (
    <div>
      <button
        onClick={openRazorpay}
        disabled={loading || !amount}
        style={{
          width: "100%",
          padding: "16px 24px",
          background: loading ? "#555" : "#1a1a1a",
          color: "#fff",
          border: "none",
          borderRadius: "12px",
          fontSize: "15px",
          fontWeight: 600,
          letterSpacing: "0.04em",
          cursor: loading ? "not-allowed" : "pointer",
          transition: "background 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        {loading ? (
          <>
            <Spinner />
            Processing...
          </>
        ) : (
          <>
            <span>🔒</span>
            Pay ₹{Number(amount).toLocaleString("en-IN")}
          </>
        )}
      </button>

      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        marginTop: "12px",
        flexWrap: "wrap",
      }}>
        {METHOD_BADGES.map((method) => (
          <span
            key={method}
            style={{
              fontSize: "11px",
              padding: "3px 8px",
              border: "1px solid #e0e0e0",
              borderRadius: "4px",
              color: "#666",
              background: "#fafafa",
            }}
          >
            {method}
          </span>
        ))}
      </div>

      <p style={{ textAlign: "center", fontSize: "12px", color: "#666", marginTop: "8px" }}>
        Secure checkout powered by Razorpay
      </p>
    </div>
  );
}