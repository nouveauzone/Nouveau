import React, { useContext, useMemo, useState } from "react";
import apiService from "../services/apiService";
import CardPayment from "./CardPayment";
import DirectUPIPayment from "./DirectUPIPayment";
import { AuthContext } from "../context/AuthContext";
import { BUSINESS_UPI_ID } from "../config/payment";
import { loadRazorpayScript } from "../utils/loadRazorpay";

const BANKS = [
  { id: "sbi", name: "State Bank of India", short: "SBI" },
  { id: "hdfc", name: "HDFC Bank", short: "HDFC" },
  { id: "icici", name: "ICICI Bank", short: "ICICI" },
  { id: "axis", name: "Axis Bank", short: "Axis" },
  { id: "kotak", name: "Kotak Mahindra", short: "Kotak" },
  { id: "yes", name: "Yes Bank", short: "Yes" },
  { id: "bob", name: "Bank of Baroda", short: "BoB" },
  { id: "pnb", name: "Punjab National", short: "PNB" },
];

const Spinner = () => (
  <span style={{
    display: "inline-block",
    width: 16,
    height: 16,
    border: "2px solid rgba(255,255,255,0.35)",
    borderTopColor: "#fff",
    borderRadius: "50%",
    animation: "nvz-spin 0.75s linear infinite",
  }}>
    <style>{"@keyframes nvz-spin { to { transform: rotate(360deg); } }"}</style>
  </span>
);

const isMongoId = (value) => typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const PaymentPage = ({
  amount = 1426,
  orderId,
  cartItems = [],
  customerInfo = {},
  upiId = BUSINESS_UPI_ID,
  merchantName = "Nouveauz",
  onSuccess,
  onFailure,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("upi");
  const [paid, setPaid] = useState(false);
  const [paymentData, setPaymentData] = useState(null);
  const [selectedBank, setSelectedBank] = useState("");
  const [bankLoading, setBankLoading] = useState(false);

  const amountNumber = Number(amount) || 0;
  const formattedAmount = useMemo(() => amountNumber.toLocaleString("en-IN"), [amountNumber]);

  const handleSuccess = (data) => {
    setPaid(true);
    setPaymentData(data);
    onSuccess?.(data);
  };

  const handleFailure = (error) => {
    onFailure?.(error);
  };

  const startNetBanking = async () => {
    if (!selectedBank) {
      const message = "Please select a bank.";
      alert(message);
      handleFailure({ reason: "validation_failed", description: message });
      return;
    }

    const keyId = process.env.REACT_APP_RAZORPAY_KEY_ID;
    if (!keyId) {
      const message = "Razorpay key missing. Add REACT_APP_RAZORPAY_KEY_ID in frontend environment.";
      alert(message);
      handleFailure({ reason: "missing-key", description: message });
      return;
    }

    setBankLoading(true);

    try {
      await loadRazorpayScript();
      const gatewayOrder = await apiService.createRazorpayOrder({ amount: amountNumber });
      const verificationOrderId = isMongoId(orderId) ? orderId : undefined;

      const options = {
        key: keyId,
        amount: gatewayOrder.amount,
        currency: gatewayOrder.currency || "INR",
        order_id: gatewayOrder.orderId,
        name: merchantName || "Nouveauz",
        description: `Net banking payment for ${orderId || "order"}`,
        prefill: {
          name: customerInfo.name || "",
          email: customerInfo.email || "",
          contact: customerInfo.phone || "",
        },
        method: { netbanking: true, upi: true, card: false, wallet: false },
        upi: { vpa: upiId, timeout: 120 },
        theme: { color: "#111827" },
        modal: {
          backdropclose: false,
          escape: true,
          handleback: true,
          ondismiss: () => {
            setBankLoading(false);
            handleFailure({ reason: "cancelled", description: "Payment cancelled" });
          },
        },
        handler: async (response) => {
          try {
            const payload = {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            };

            if (verificationOrderId) {
              payload.orderId = verificationOrderId;
            }

            await apiService.verifyRazorpayPayment(payload);

            handleSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              paymentMethod: "netbanking",
              bank: selectedBank,
            });
          } catch (error) {
            const message = error?.message || "Payment verification failed";
            handleFailure({ reason: "verification_failed", description: message });
            alert(message);
          } finally {
            setBankLoading(false);
          }
        },
      };

      const checkout = new window.Razorpay(options);
      checkout.on("payment.failed", (response) => {
        setBankLoading(false);
        handleFailure({
          reason: response?.error?.reason || "failed",
          description: response?.error?.description || "Payment failed",
          code: response?.error?.code,
        });
      });
      checkout.open();
    } catch (error) {
      setBankLoading(false);
      const message = error?.message || "Unable to start payment";
      alert(message);
      handleFailure({ reason: "start_failed", description: message });
    }
  };

  const tabs = [
    { id: "upi", label: "UPI", icon: "📱" },
    { id: "card", label: "Card", icon: "💳" },
    { id: "netbanking", label: "Net Banking", icon: "🏦" },
  ];

  if (!isAuthenticated) {
    return (
      <div style={{ padding: 20, borderRadius: 20, border: "1px solid #f1d99a", background: "#fff8e8", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#7a5a00" }}>Login required for payment</p>
        <p style={{ margin: "8px 0 0", fontSize: 12, color: "#8a6d3b" }}>Please sign in before using UPI, card, or net banking.</p>
      </div>
    );
  }

  const styles = {
    overlay: {
      position: "fixed",
      inset: 0,
      background: "rgba(10, 14, 20, 0.58)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
      padding: 16,
      backdropFilter: "blur(10px)",
      fontFamily: "'Segoe UI', Arial, sans-serif",
    },
    sheet: {
      width: "100%",
      maxWidth: 560,
      maxHeight: "92vh",
      overflowY: "auto",
      background: "linear-gradient(180deg, #fff 0%, #fafafa 100%)",
      borderRadius: 24,
      boxShadow: "0 30px 90px rgba(0,0,0,0.28)",
      border: "1px solid rgba(255,255,255,0.72)",
    },
    header: {
      padding: "22px 24px 0",
      borderBottom: "1px solid #eef2f6",
    },
    titleRow: {
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: 16,
      marginBottom: 18,
    },
    eyebrow: {
      margin: 0,
      fontSize: 11,
      letterSpacing: "0.14em",
      textTransform: "uppercase",
      color: "#98a2b3",
    },
    title: {
      margin: "6px 0 0",
      fontSize: 22,
      fontWeight: 800,
      color: "#111827",
    },
    totalBadge: {
      background: "#111827",
      color: "#fff",
      borderRadius: 999,
      padding: "10px 14px",
      fontSize: 14,
      fontWeight: 800,
      whiteSpace: "nowrap",
    },
    tabRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, 1fr)",
      gap: 8,
      paddingBottom: 16,
    },
    tab: (active) => ({
      padding: "12px 10px",
      borderRadius: 14,
      border: `1px solid ${active ? "#111827" : "#e5e7eb"}`,
      background: active ? "#111827" : "#fff",
      color: active ? "#fff" : "#4b5563",
      cursor: "pointer",
      fontSize: 13,
      fontWeight: active ? 700 : 600,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      transition: "all 0.2s ease",
    }),
    body: {
      padding: 24,
      display: "grid",
      gap: 18,
    },
    summary: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "14px 16px",
      borderRadius: 16,
      background: "#f8fafc",
      border: "1px solid #e5e7eb",
      gap: 14,
    },
    summaryText: {
      margin: 0,
      fontSize: 12,
      color: "#667085",
      lineHeight: 1.6,
    },
    emptyList: {
      display: "grid",
      gap: 10,
      padding: 16,
      border: "1px dashed #d0d5dd",
      borderRadius: 16,
      color: "#667085",
      fontSize: 13,
    },
  };

  if (paid) {
    return (
      <div style={styles.overlay}>
        <div style={styles.sheet}>
          <div style={{ padding: 32, textAlign: "center" }}>
            <div style={{ fontSize: 58, marginBottom: 12 }}>✅</div>
            <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", color: "#111827" }}>Payment Successful</h2>
            <p style={{ color: "#6b7280", fontSize: 14, margin: "0 0 8px" }}>
              ₹{formattedAmount} successfully paid
            </p>
            {paymentData?.paymentId ? (
              <p style={{ color: "#98a2b3", fontSize: 12, margin: "0 0 20px", fontFamily: "monospace" }}>
                ID: {paymentData.paymentId}
              </p>
            ) : null}
            <p style={{ fontSize: 13, color: "#475467", lineHeight: 1.7, marginBottom: 24 }}>
              You will receive confirmation on WhatsApp. The order is usually dispatched within 24-48 hours.
            </p>
            <a href="/orders" style={{
              display: "inline-block",
              padding: "12px 28px",
              background: "#111827",
              color: "#fff",
              borderRadius: 12,
              textDecoration: "none",
              fontSize: 13,
              fontWeight: 700,
            }}>
              Track Order →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.sheet}>
        <div style={styles.header}>
          <div style={styles.titleRow}>
            <div>
              <p style={styles.eyebrow}>Secure Payment</p>
              <p style={styles.title}>{merchantName || "Nouveauz"}</p>
            </div>
            <div style={styles.totalBadge}>₹{formattedAmount}</div>
          </div>

          <div style={styles.tabRow}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                style={styles.tab(activeTab === tab.id)}
                onClick={() => setActiveTab(tab.id)}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.body}>
          {activeTab === "upi" && (
            <div style={{ display: "grid", gap: 16 }}>
              <DirectUPIPayment
                amount={amountNumber}
                orderId={orderId}
                upiId={upiId}
                merchantName={merchantName}
                onSuccess={handleSuccess}
                onPending={() => {}}
              />
            </div>
          )}

          {activeTab === "card" && (
            <CardPayment
              amount={amountNumber}
              orderId={orderId}
              customerInfo={customerInfo}
              merchantName={merchantName}
              onSuccess={handleSuccess}
              onFailure={handleFailure}
            />
          )}

          {activeTab === "netbanking" && (
            <div style={{ display: "grid", gap: 16 }}>
              <p style={{ margin: 0, fontSize: 13, color: "#475467", lineHeight: 1.6 }}>
                Select your bank. Secure Razorpay checkout will open and payment will be verified on the server.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                {BANKS.map((bank) => (
                  <button
                    key={bank.id}
                    onClick={() => setSelectedBank(bank.id)}
                    style={{
                      padding: "12px 14px",
                      textAlign: "left",
                      background: selectedBank === bank.id ? "#f3f4f6" : "#fff",
                      border: `1.5px solid ${selectedBank === bank.id ? "#111827" : "#e5e7eb"}`,
                      borderRadius: 12,
                      cursor: "pointer",
                      fontSize: 13,
                      fontWeight: selectedBank === bank.id ? 700 : 500,
                      color: "#111827",
                    }}
                  >
                    🏦 {bank.short}
                  </button>
                ))}
              </div>

              <button
                onClick={startNetBanking}
                disabled={!selectedBank || bankLoading}
                style={{
                  width: "100%",
                  padding: "15px 18px",
                  background: !selectedBank ? "#cbd5e1" : "#111827",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  cursor: !selectedBank || bankLoading ? "not-allowed" : "pointer",
                  fontSize: 15,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 10,
                }}
              >
                {bankLoading ? (
                  <>
                    <Spinner />
                    Opening...
                  </>
                ) : (
                  <>
                    <span>🏦</span>
                    Pay ₹{formattedAmount} via Net Banking
                  </>
                )}
              </button>
            </div>
          )}

          <div style={styles.summary}>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: "#111827" }}>Order Summary</p>
              <p style={styles.summaryText}>
                {cartItems.length > 0
                  ? `${cartItems.length} item(s) selected`
                  : "Safe checkout through UPI, Card, or Net Banking"}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: 0, fontSize: 11, color: "#98a2b3", letterSpacing: "0.08em", textTransform: "uppercase" }}>Total</p>
              <p style={{ margin: "4px 0 0", fontSize: 18, fontWeight: 800, color: "#111827" }}>₹{formattedAmount}</p>
            </div>
          </div>

          <div style={styles.emptyList}>
            {[
              "🔒 Secure checkout",
              "✅ Server-side payment verification",
              "📲 UPI intent opens PhonePe/GPay/Paytm/BHIM",
              "💳 Card number, expiry, and CVV are validated before payment opens",
            ].map((item) => (
              <div key={item}>{item}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
