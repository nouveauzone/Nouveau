import { useContext, useEffect, useState } from "react";
import { AppDataContext } from "../context/Providers";
import { THEME } from "../styles/theme";
import { BtnOutline, BtnPrimary } from "../components/Buttons";
import Footer from "../components/Footer";
import { fixImageUrl } from "../utils/imageUrl";

const GOLD    = "#C9A227";
const CRIMSON = "#B71C1C";

export default function OrderSuccessPage({ setPage }) {
  const { myOrders } = useContext(AppDataContext)||{};
  const [orderId, setOrderId] = useState("");
  const [showEmailNotice, setShowEmailNotice] = useState(false);

  useEffect(()=>{
    const id = localStorage.getItem("lastOrderId")||"";
    setOrderId(id);
  },[]);

  const order = myOrders?.find(o=>o._id===orderId);
  const trackingId = order?.trackingId || localStorage.getItem("lastTrackingId") || "";
  const isAwaitingPayment =
    order?.orderStatus === "Awaiting Payment Verification" &&
    String(order?.paymentMethod || "").toUpperCase() === "UPI";
  const isPaidOrder = !isAwaitingPayment;

  useEffect(() => {
    setShowEmailNotice(isPaidOrder);
  }, [isPaidOrder]);

  return (
    <div style={{background:THEME.bg,minHeight:"100vh",color:THEME.text,display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 20px"}}>
        <div style={{maxWidth:"560px",width:"100%",textAlign:"center"}}>

          {/* Success circle */}
          <div style={{
            width:"90px",height:"90px",borderRadius:"50%",margin:"0 auto 28px",
            background:`linear-gradient(135deg,${CRIMSON},${GOLD})`,
            display:"flex",alignItems:"center",justifyContent:"center",
            boxShadow:`0 12px 40px ${GOLD}40`,
          }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>

          {/* Logo */}
          <div style={{width:"50px",height:"64px",background:"#fff",borderRadius:"12px",padding:"5px",display:"inline-flex",alignItems:"center",justifyContent:"center",marginBottom:"20px",boxShadow:`0 4px 16px ${GOLD}25`}}>
            <img src={fixImageUrl("/nouveau-logo.png")} alt="Nouveau" style={{width:"100%",height:"100%",objectFit:"contain"}} />
          </div>

          <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:700,color:THEME.text,marginBottom:"12px",lineHeight:1.2}}>
            {isAwaitingPayment ? "Order Received!" : "Order Placed Successfully! 🎉"}
          </h1>
          <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"14px",color:THEME.textMuted,lineHeight:1.8,marginBottom:"8px"}}>
            {isAwaitingPayment
              ? <>Thank you for shopping with <strong style={{color:GOLD}}>Nouveau™</strong>. Your UPI payment is under verification. Order confirmation will be shared once payment is verified.</>
              : <>Thank you for shopping with <strong style={{color:GOLD}}>Nouveau™</strong>. Your order has been confirmed.</>}
          </p>

          {showEmailNotice && (
            <div style={{background:"#e8f5e9",border:"1px solid #81c784",borderRadius:"10px",padding:"12px 16px",margin:"16px 0 10px",textAlign:"left"}}>
              <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:"#1b5e20",lineHeight:1.7}}>
                ✅ Order confirmation email has been sent to your registered Gmail ID. Please check your <strong>Inbox</strong>. If not found, check your <strong>Spam</strong> folder.
              </p>
            </div>
          )}

          {(orderId || trackingId) && (
            <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"14px",padding:"20px",margin:"28px 0",textAlign:"left",width:"100%"}}>
              {trackingId && (
                <div style={{background:"#D4AF3710",border:"1px solid #D4AF3740",borderRadius:"10px",padding:"14px 18px",marginBottom:"14px"}}>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"9px",letterSpacing:"3px",color:"#b8962e",marginBottom:"6px",textTransform:"uppercase",fontWeight:700}}>🎯 Tracking ID (Share this!)</p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"20px",fontWeight:700,color:"#b8962e",letterSpacing:"1px"}}>{trackingId}</p>
                  <button onClick={()=>navigator.clipboard?.writeText(trackingId)} style={{background:"none",border:"1px solid #D4AF3760",color:"#b8962e",padding:"4px 12px",borderRadius:"6px",cursor:"pointer",fontFamily:"'Poppins',sans-serif",fontSize:"11px",marginTop:"8px",fontWeight:600}}>📋 Copy Tracking ID</button>
                </div>
              )}
              <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"9px",letterSpacing:"3px",color:THEME.textMuted,marginBottom:"6px",textTransform:"uppercase"}}>Order ID</p>
              <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"14px",fontWeight:700,color:GOLD,letterSpacing:"1px"}}>{orderId}</p>
              {order && (
                <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:THEME.textMuted,marginTop:"8px"}}>
                  {order.product || ""} · ₹{(order.price||order.total||0).toLocaleString("en-IN")}
                </p>
              )}
            </div>
          )}

          {/* What's next */}
          <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"16px",padding:"24px",marginBottom:"32px",textAlign:"left"}}>
            <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"10px",letterSpacing:"3px",color:GOLD,marginBottom:"18px",fontWeight:700,textAlign:"center"}}>WHAT HAPPENS NEXT</p>
            {(
              isAwaitingPayment
                ? [
                    ["⏳","Payment Verification","Our team verifies your UPI payment"],
                    ["📦","Order Confirmation","Order gets confirmed after payment verification"],
                    ["🚚","Dispatch","After confirmation, dispatch starts in 1-3 business days"],
                  ]
                : [
                    ["📦","Order Confirmed","Your order is confirmed and being prepared"],
                    ["🚚","Dispatch","Will be dispatched within 1-3 business days"],
                    ["🏠","Delivery","Expected delivery in 5-7 business days"],
                  ]
            ).map(([ic,title,desc],i)=>(
              <div key={i} style={{display:"flex",gap:"14px",alignItems:"flex-start",marginBottom:i<2?"16px":0}}>
                <div style={{width:"40px",height:"40px",borderRadius:"10px",background:"#fffbf0",border:`1px solid rgba(201,162,39,0.2)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px",flexShrink:0}}>{ic}</div>
                <div>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"13px",fontWeight:600,color:THEME.text,marginBottom:"3px"}}>{title}</p>
                  <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:THEME.textMuted}}>{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Policy reminder */}
          <div style={{background:"#fff5f5",border:`1px solid ${CRIMSON}30`,borderRadius:"10px",padding:"14px 18px",marginBottom:"32px",textAlign:"left"}}>
            <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textMuted,lineHeight:1.7}}>
              <strong style={{color:CRIMSON}}>⚠️ No Return / No Exchange:</strong> All sales are final. For queries, WhatsApp <strong style={{color:GOLD}}>+91 7733881577</strong>
            </p>
          </div>

          <div style={{display:"flex",gap:"14px",justifyContent:"center",flexWrap:"wrap"}}>
            <BtnPrimary onClick={()=>setPage("TrackOrder")} style={{borderRadius:"99px"}}>Track Order</BtnPrimary>
            <BtnOutline onClick={()=>setPage("Shop")} color={GOLD} style={{borderRadius:"99px"}}>Continue Shopping</BtnOutline>
          </div>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
