import { useState } from "react";
import apiService from "../services/apiService";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import { getStoredToken } from "../utils/authSession";

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
  const totalPrice = Number(amount) || 0;

  const handlePayment = async () => {
    let keyId;
    try {
      keyId = await apiService.getRazorpayKeyId();
    } catch (error) {
      const message = error?.message || "Razorpay public key unavailable. Set REACT_APP_RAZORPAY_KEY_ID in the frontend build env or enable the backend /razorpay/config route.";
      onFailure?.({ reason: "missing-key", description: message });
      return;
    }

    if (!keyId) {
      const message = "Razorpay key missing. Add REACT_APP_RAZORPAY_KEY_ID in frontend environment.";
      onFailure?.({ reason: "missing-key", description: message });
      return;
    }

    const token = getStoredToken();

    if (!token) {
      const message = "Please login again to continue checkout.";
      onFailure?.({ reason: "auth", description: message });
      return;
    }

    setLoading(true);

    try {
      await loadRazorpayScript();
      const gatewayOrder = await apiService.createRazorpayOrder({ amount: totalPrice }, token);
      const orderId = gatewayOrder?.order?.id || gatewayOrder?.orderId || gatewayOrder?.id || gatewayOrder?.order?.orderId;

      if (!orderId) {
        throw new Error("Razorpay order creation failed. Missing order id.");
      }

      const orderData = gatewayOrder.order || gatewayOrder || {};

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        order_id: orderId,
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
          let verification = null;
          let verificationError = null;

          try {
            console.log("[razorpay] frontend verify request", {
              orderId: response.razorpay_order_id,
              paymentId: response.razorpay_payment_id,
              hasToken: Boolean(token),
            });

            verification = await apiService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              items: cartItems.map((item) => ({
                product: item._id,
                title: item.title,
                image: item.images?.[0] || "",
                price: item.price,
                size: item.size,
                qty: item.qty,
              })),
              shippingAddress: customerInfo,
              paymentMethod: "RAZORPAY",
              paymentReference: response.razorpay_payment_id,
              total: Number(amount),
            }, token);
          } catch (error) {
            verificationError = error;
            console.error("[razorpay] verify failed", error);
          } finally {
            try {
              await Promise.resolve(onSuccess?.({
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
                verification,
                verificationError,
              }));
            } catch (error) {
              console.error("[razorpay] post-payment handler failed", error);
            }
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
      console.error("PAYMENT ERROR:", error);
      onFailure?.({ reason: "start_failed", description: message });
    }
  };

  return (
    <div>
      <button
        onClick={handlePayment}
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