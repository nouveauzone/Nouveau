import React, { useContext, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { AuthContext } from '../context/AuthContext';
import { BUSINESS_UPI_ID, isValidUpiId } from '../config/payment';

// ============================================================
// NOUVEAUZ — DYNAMIC UPI PAYMENT
// Generates a dynamic QR code based on the order total
// Uses upi://pay?pa=... logic for mobile and QR for desktop
// ============================================================

const UPI_APPS = [
  {
    id: 'phonepe',
    name: 'PhonePe',
    icon: '🟣',
    intentScheme: (upiId, amount, txnNote) =>
      `phonepe://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
  },
  {
    id: 'gpay',
    name: 'Google Pay',
    icon: '🔵',
    intentScheme: (upiId, amount, txnNote) =>
      `tez://upi/pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
  },
  {
    id: 'paytm',
    name: 'Paytm',
    icon: '🟦',
    intentScheme: (upiId, amount, txnNote) =>
      `paytmmp://pay?pa=${upiId}&pn=Nouveauz&am=${amount}&cu=INR&tn=${encodeURIComponent(txnNote)}`,
  },
];

const DirectUPIPayment = ({
  amount = 0,
  orderId = '',
  upiId = BUSINESS_UPI_ID,
  merchantName = 'Nouveauz',
  onSuccess,
  onPending,
}) => {
  const { isAuthenticated } = useContext(AuthContext);
  const [isMobile, setIsMobile] = useState(false);
  const [activeApp, setActiveApp] = useState(null);
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [utrError, setUtrError] = useState('');

  useEffect(() => {
    setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
  }, []);

  const formattedAmount = Number(amount).toFixed(2);
  const txnNote = `Order ${orderId || 'Nouveauz'}`;
  const normalizedUpiId = String(upiId || BUSINESS_UPI_ID).trim().toLowerCase();
  const upiIdValid = isValidUpiId(normalizedUpiId);

  // DYNAMIC UPI LINK (USER REQUESTED FORMAT)
  const upiLink = `upi://pay?pa=${normalizedUpiId}&pn=Nouveauz&am=${formattedAmount}&cu=INR`;

  const handleAppClick = (app) => {
    if (!isAuthenticated) {
      const message = 'Please login first to use UPI payment.';
      alert(message);
      if (onPending) onPending({ method: app?.id, status: 'auth_required', note: txnNote });
      return;
    }

    if (!upiIdValid) {
      alert('Configured UPI ID is invalid. Please contact support.');
      return;
    }

    setActiveApp(app.id);

    if (isMobile) {
      const intentUrl = app.intentScheme(normalizedUpiId, formattedAmount, txnNote);
      window.location.href = intentUrl;
      setTimeout(() => setShowConfirm(true), 4000);
    } else {
      navigator.clipboard?.writeText(normalizedUpiId).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
      });
    }
  };

  const handlePaymentDone = () => {
    if (!isAuthenticated) {
      setUtrError('Please login first to continue.');
      return;
    }

    const normalizedUtr = String(utrNumber || '').replace(/\D/g, '');
    if (!/^\d{12}$/.test(normalizedUtr)) {
      setUtrError('Please enter a valid 12-digit UTR/Reference number.');
      return;
    }

    setShowConfirm(false);
    setUtrError('');
    if (onSuccess) onSuccess({ method: activeApp, upiId: normalizedUpiId, amount, orderId, reference: normalizedUtr, note: txnNote, merchantName });
    if (onPending) onPending({ method: activeApp, status: 'pending_verification', reference: normalizedUtr, note: txnNote });
  };

  const styles = {
    wrapper: { fontFamily: "'Poppins', sans-serif", maxWidth: '400px', margin: '0 auto' },
    heading: { fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#C9A227', marginBottom: 24, textAlign: 'center' },
    appsGrid: { display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: 32 },
    appIcon: (app, active) => ({
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer',
      opacity: active ? 1 : 0.85, transform: active ? 'scale(1.1)' : 'scale(1)', transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', padding: '8px',
    }),
    qrCard: {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '30px 24px', borderRadius: 20,
      border: '1px solid #C9A22725', background: '#fff', boxShadow: '0 10px 40px rgba(201,162,39,0.05)', marginBottom: 28,
    },
    qrTitle: { fontSize: 14, fontWeight: 600, color: '#1a1a1a', margin: 0, letterSpacing: '-0.01em' },
    qrWrapper: { padding: '15px', background: '#fff', borderRadius: '12px', border: '1.2px solid #f0f0f0' },
    upiIdBox: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f9f9fb', border: '1.2px solid #e9eaef', borderRadius: 14, padding: '12px 16px', marginBottom: 24 },
    copyBtn: { background: '#1a1a1a', color: '#fff', border: 'none', borderRadius: 10, padding: '8px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' },
    toast: { position: 'absolute', top: -45, left: '50%', transform: 'translateX(-50%)', background: '#2ecc71', color: '#fff', padding: '8px 18px', borderRadius: 30, fontSize: 12, fontWeight: 600, boxShadow: '0 5px 20px rgba(46,204,113,0.3)', whiteSpace: 'nowrap', zIndex: 10 },
    amountBox: { textAlign: 'center', padding: '20px 0', borderTop: '1px solid #f0f0f0', marginTop: 8 },
    confirmOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 1000 },
    confirmSheet: { width: '100%', maxWidth: '500px', background: '#fff', padding: '30px 24px', borderRadius: '24px 24px 0 0', textAlign: 'center' },
    confirmBtn: { width: '100%', background: '#C9A227', color: '#fff', border: 'none', borderRadius: 12, padding: '16px', fontSize: 16, fontWeight: 600, cursor: 'pointer', marginBottom: 12 },
    cancelBtn: { width: '100%', background: 'none', color: '#888', border: 'none', padding: '12px', fontSize: 14, cursor: 'pointer' },
  };

  if (!isAuthenticated) {
    return (
      <div style={{ padding: '20px', borderRadius: '16px', border: '1px solid #f1d99a', background: '#fff8e8', textAlign: 'center' }}>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#7a5a00' }}>Login required for UPI payment</p>
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#8a6d3b' }}>Please sign in before opening PhonePe, GPay, or Paytm.</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <p style={styles.heading}>Secure UPI Checkout</p>

      {/* UPI Apps for Mobile */}
      {isMobile && (
        <div style={styles.appsGrid}>
          {UPI_APPS.map((app) => (
            <button key={app.id} style={styles.appIcon(app, activeApp === app.id)} onClick={() => handleAppClick(app)}>
              <span style={{ fontSize: '24px' }}>{app.icon}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#444' }}>{app.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* QR Code Section - Dynamic */}
      <div style={styles.qrCard}>
        <p style={styles.qrTitle}>Scan & Pay via UPI</p>
        <div style={styles.qrWrapper}>
          <QRCodeSVG value={upiLink} size={180} level="M" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <p style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1a1a1a' }}>₹{Number(amount).toLocaleString('en-IN')}</p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#888' }}>Total Payable Amount</p>
        </div>
      </div>

      {/* UPI ID Section */}
      <div style={{ position: 'relative' }}>
        {copied && <div style={styles.toast}>✓ UPI ID Copied!</div>}
        <div style={styles.upiIdBox}>
          <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
            <p style={{ margin: 0, fontSize: 10, color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Merchant UPI ID</p>
            <p style={{ margin: '3px 0 0', fontSize: 14, fontWeight: 600, color: '#1a1a1a', overflow: 'hidden', textOverflow: 'ellipsis' }}>{normalizedUpiId}</p>
          </div>
          <button
            onClick={() => {
              navigator.clipboard?.writeText(normalizedUpiId);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{ ...styles.copyBtn, background: copied ? '#2ecc71' : '#1a1a1a' }}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      {showConfirm && (
        <div style={styles.confirmOverlay} onClick={() => setShowConfirm(false)}>
          <div style={styles.confirmSheet} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>💳</div>
            <h3 style={{ margin: '0 0 8px', fontSize: 18 }}>Confirm Payment</h3>
            <p style={{ margin: '0 0 20px', fontSize: 14, color: '#666' }}>
              Have you paid <strong>₹{Number(amount).toLocaleString('en-IN')}</strong> to {merchantName}?
            </p>
            <div style={{ marginBottom: 12, textAlign: 'left' }}>
              <label style={{ display: 'block', marginBottom: 6, fontSize: 12, color: '#666' }}>
                UTR / Ref No (12 digits)
              </label>
              <input
                type="text"
                value={utrNumber}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                  setUtrNumber(val);
                  setUtrError('');
                }}
                placeholder="e.g. 123456789012"
                style={{
                  width: '100%', border: `1.5px solid ${utrError ? '#d32f2f' : '#eee'}`,
                  borderRadius: 10, padding: '12px', fontSize: 14, outline: 'none'
                }}
              />
              {utrError && <p style={{ color: '#d32f2f', fontSize: 11, marginTop: 4 }}>{utrError}</p>}
            </div>
            <button style={styles.confirmBtn} onClick={handlePaymentDone}>Yes, Payment Done</button>
            <button style={styles.cancelBtn} onClick={() => setShowConfirm(false)}>No, Try Again</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DirectUPIPayment;