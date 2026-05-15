import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { THEME } from "../styles/theme";
import API from "../services/apiService";
import Footer from "../components/Footer";
import { fixImageUrl } from "../utils/imageUrl";

const GOLD    = "#C9A227";
const CRIMSON = "#B71C1C";

export default function AuthPage({ setPage }) {
  const { dispatch } = useContext(AuthContext);
  const enableLocalAuthFallback = process.env.NODE_ENV !== "production" && process.env.REACT_APP_ENABLE_LOCAL_AUTH_FALLBACK === "true";
  const [isLogin, setIsLogin] = useState(true);
  const [form,    setForm]    = useState({ name:"", email:"", password:"", confirm:"", phone:"", city:"", state:"" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [apiErr,  setApiErr]  = useState("");

  const validate = () => {
    const e = {};
    if (!isLogin && !form.name.trim())     e.name     = "Required";
    if (!form.email.trim())                e.email    = "Required";
    if (!isLogin && !form.phone.trim())    e.phone    = "Required";
    if (!isLogin && !form.city.trim())     e.city     = "Required";
    if (!isLogin && !form.state.trim())    e.state    = "Required";
    if (!form.password)                    e.password = "Required";
    if (!isLogin && form.password !== form.confirm) e.confirm = "Passwords don't match";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true); setApiErr("");

    const goAfterAuth = () => {
      const nextPage = localStorage.getItem("nouveau_post_auth_page");
      if (nextPage) {
        localStorage.removeItem("nouveau_post_auth_page");
        setPage(nextPage);
        return;
      }
      setPage("Home");
    };

    try {
      let res;
      if (isLogin) {
        res = await API.login({ email: form.email, password: form.password });
      } else {
        res = await API.register({ name: form.name, email: form.email, password: form.password, phone: form.phone, city: form.city, state: form.state });
      }
      const authPayload = {
        user: {
          _id: res._id || res.user?._id,
          name: res.name || res.user?.name,
          email: res.email || res.user?.email,
          role: res.role || res.user?.role || "user",
          token: res.token,
        },
        token: res.token,
        isAuthenticated: true,
      };
      try {
        localStorage.setItem("nouveau_auth", JSON.stringify(authPayload));
        localStorage.setItem("token", authPayload.token || "");
      } catch {}

      dispatch({ type:"LOGIN", payload:authPayload.user, token:authPayload.token });
      goAfterAuth();
    } catch (err) {
      if (!enableLocalAuthFallback) {
        setApiErr(err.message || "Authentication failed");
      } else {
        // Local demo auth fallback for explicit local/dev testing only.
        try {
          const users = JSON.parse(localStorage.getItem("nouveau_demo_users")||"[]");
          if (isLogin) {
            const u = users.find(u=>u.email===form.email&&u.password===form.password);
            if (u) { dispatch({ type:"LOGIN", payload:u, token:"local_"+Date.now() }); goAfterAuth(); return; }
            setApiErr("Invalid email or password");
          } else {
            if (users.find(u=>u.email===form.email)) { setApiErr("Email already registered"); return; }
            const newUser = { _id:"u"+Date.now(), name:form.name, email:form.email, password:form.password, role:"user" };
            localStorage.setItem("nouveau_demo_users", JSON.stringify([...users,newUser]));
            dispatch({ type:"LOGIN", payload:newUser, token:"local_"+Date.now() });
            goAfterAuth();
          }
        } catch {
          setApiErr(err.message||"Something went wrong");
        }
      }
    } finally { setLoading(false); }
  };

  const inp = (key,label,type="text",placeholder="") => (
    <div style={{marginBottom:"18px"}}>
      <label style={{fontFamily:"'Poppins',sans-serif",fontSize:"9px",letterSpacing:"2px",color:errors[key]?CRIMSON:THEME.textMuted,display:"block",marginBottom:"7px",fontWeight:600,textTransform:"uppercase"}}>
        {label}{errors[key]&&<span style={{color:CRIMSON,marginLeft:"8px",letterSpacing:0}}>{errors[key]}</span>}
      </label>
      <input type={type} value={form[key]} placeholder={placeholder}
        onChange={e=>setForm(f=>({...f,[key]:e.target.value}))}
        onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
        style={{width:"100%",background:THEME.bgCard,border:`1.5px solid ${errors[key]?CRIMSON:THEME.border}`,color:THEME.text,padding:"14px 16px",fontSize:"14px",outline:"none",fontFamily:"'Poppins',sans-serif",borderRadius:"12px",transition:"border-color 0.2s"}}
        onFocus={e=>e.target.style.borderColor=GOLD}
        onBlur={e=>e.target.style.borderColor=errors[key]?CRIMSON:THEME.border}
      />
    </div>
  );

  return (
    <div style={{background:THEME.bg,minHeight:"100vh",color:THEME.text,display:"flex",flexDirection:"column"}}>
      <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:"60px 20px"}}>
        <div style={{width:"100%",maxWidth:"440px"}}>

          {/* Logo */}
          <div style={{textAlign:"center",marginBottom:"36px"}}>
            <div style={{width:"60px",height:"78px",background:"#fff",borderRadius:"14px",padding:"6px",display:"inline-flex",alignItems:"center",justifyContent:"center",boxShadow:`0 4px 20px ${GOLD}30`,marginBottom:"16px"}}>
              <img src={fixImageUrl("/nouveau-logo.png")} alt="Nouveau" style={{width:"100%",height:"100%",objectFit:"contain"}} />
            </div>
            <div style={{fontFamily:"'Playfair Display',serif",fontSize:"28px",color:GOLD,fontWeight:700,letterSpacing:"3px",lineHeight:1}}>nouveau™</div>
            <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textMuted,marginTop:"8px",letterSpacing:"1px"}}>
              {isLogin?"Welcome back" : "Create your account"}
            </p>
          </div>

          {/* Card */}
          <div style={{background:THEME.bgCard,border:`1px solid ${THEME.border}`,borderRadius:"20px",padding:"36px",boxShadow:"0 20px 60px rgba(0,0,0,0.4)"}}>

            {/* Toggle */}
            <div style={{display:"flex",background:THEME.bgDark,borderRadius:"12px",padding:"4px",marginBottom:"28px",border:`1px solid ${THEME.border}`}}>
              {["Login","Register"].map(t=>(
                <button key={t} onClick={()=>{setIsLogin(t==="Login");setErrors({});setApiErr("");}}
                  style={{flex:1,padding:"10px",background:(isLogin&&t==="Login")||(!isLogin&&t==="Register")?THEME.bgCard:"transparent",border:"none",borderRadius:"10px",color:(isLogin&&t==="Login")||(!isLogin&&t==="Register")?GOLD:THEME.textMuted,cursor:"pointer",fontSize:"12px",fontFamily:"'Poppins',sans-serif",fontWeight:700,transition:"all 0.25s",letterSpacing:"1px"}}>
                  {t}
                </button>
              ))}
            </div>

            {!isLogin && inp("name","Full Name","text","Your name")}
            {inp("email","Email","email","your@email.com")}
            {!isLogin && (
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                {inp("phone","Phone","tel","10-digit number")}
                {inp("city","City","text","e.g. Mumbai")}
              </div>
            )}
            {!isLogin && inp("state","State","text","e.g. Maharashtra")}
            {inp("password","Password","password",isLogin?"Enter password":"Min 6 characters")}
            {!isLogin && inp("confirm","Confirm Password","password","Re-enter password")}

            {apiErr && (
              <div style={{background:"#fff0f0",border:`1px solid ${CRIMSON}40`,borderRadius:"10px",padding:"12px 16px",marginBottom:"18px"}}>
                <p style={{fontFamily:"'Poppins',sans-serif",fontSize:"12px",color:CRIMSON}}>{apiErr}</p>
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading} style={{
              width:"100%",
              background:loading?THEME.border:`linear-gradient(135deg,${CRIMSON},${GOLD})`,
              color:"#fff",border:"none",padding:"15px",borderRadius:"12px",
              fontSize:"12px",fontFamily:"'Poppins',sans-serif",fontWeight:700,
              cursor:loading?"not-allowed":"pointer",letterSpacing:"2px",
              marginBottom:"16px",transition:"all 0.3s",
              boxShadow:loading?"none":`0 8px 24px ${CRIMSON}40`,
            }}
              onMouseEnter={e=>{if(!loading){e.target.style.transform="translateY(-2px)";e.target.style.boxShadow=`0 12px 32px ${CRIMSON}50`;}}}
              onMouseLeave={e=>{e.target.style.transform="";e.target.style.boxShadow=loading?"none":`0 8px 24px ${CRIMSON}40`;}}>
              {loading?"Please wait..." : isLogin?"LOGIN →":"CREATE ACCOUNT →"}
            </button>

            <div style={{textAlign:"center"}}>
              <button onClick={()=>setPage("Shop")} style={{background:"none",border:"none",color:THEME.textMuted,cursor:"pointer",fontFamily:"'Poppins',sans-serif",fontSize:"12px",textDecoration:"underline"}}>
                Continue as guest
              </button>
            </div>
          </div>

          {/* Admin hint */}
          <p style={{textAlign:"center",marginTop:"24px",fontFamily:"'Poppins',sans-serif",fontSize:"11px",color:THEME.textLight}}>
            Admin? Use <span style={{color:GOLD}}>Admin Panel</span> — <button onClick={()=>setPage("Admin")} style={{background:"none",border:"none",color:GOLD,cursor:"pointer",fontFamily:"'Poppins',sans-serif",fontSize:"11px",fontWeight:600,textDecoration:"underline"}}>Go to Admin</button>
          </p>
        </div>
      </div>
      <Footer setPage={setPage} />
    </div>
  );
}
