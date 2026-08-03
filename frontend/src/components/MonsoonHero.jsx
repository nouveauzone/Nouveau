import React, { useEffect, useState } from 'react';

export default function MonsoonHero({ onExploreClick, onShopClick }) {
  const [rains, setRains] = useState([]);
  const [petals, setPetals] = useState([]);
  const [visible, setVisible] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
    const reduced = mq ? mq.matches : false;
    setReduceMotion(reduced);

    if (!reduced) {
      const rainCount = 30; // between 25-35
      const newRains = Array.from({ length: rainCount }).map(() => {
        const height = Math.round(40 + Math.random() * 50); // 40-90
        const duration = (0.6 + Math.random() * 0.7).toFixed(2); // 0.6-1.3s
        const delay = (Math.random() * 3).toFixed(2); // 0-3s
        // bias to right two-thirds
        const left = Math.random() < 0.7 ? (33 + Math.random() * 67) : (Math.random() * 33);
        const skew = -6 + Math.random() * 12; // small diagonal
        return { height, duration, delay, left, skew };
      });
      setRains(newRains);

      const petalCount = 8 + Math.floor(Math.random() * 3); // 8-10
      const newPetals = Array.from({ length: petalCount }).map(() => {
        const size = Math.round(6 + Math.random() * 4); // 6-10px
        const duration = Math.round(8 + Math.random() * 6); // 8-14s
        const delay = (Math.random() * 6).toFixed(2);
        const left = Math.round(Math.random() * 100);
        const dx = (Math.random() < 0.5 ? -1 : 1) * (20 + Math.random() * 20); // ±20-40px
        const rotate = Math.round(180 + Math.random() * 80); // ~180-260
        return { size, duration, delay, left, dx, rotate };
      });
      setPetals(newPetals);
    }

    // entrance
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className={`monsoon-hero ${visible ? 'is-visible' : ''}`} aria-label="Monsoon Hero">
      <style>{`
        .monsoon-hero{ position:relative; overflow:hidden; width:100%; box-sizing:border-box;
          background: linear-gradient(135deg,#3B4A3A 0%, #5c6b4a 100%);
          min-height:60vh; display:flex; align-items:center; color: #F5F1E6;
        }

        .monsoon-inner{ padding:64px 20px; padding-left:120px; width:100%; display:flex; align-items:center; }

        /* content */
        .monsoon-content{ max-width:680px; z-index:8; }

        .eyebrow{ color:#C9A961; font-size:12px; font-weight:700; letter-spacing:0.3em; text-transform:uppercase; margin-bottom:12px; opacity:0; transform:translateY(16px); transition:opacity .8s cubic-bezier(.22,.9,.2,1), transform .8s cubic-bezier(.22,.9,.2,1); }
        .is-visible .eyebrow{ opacity:1; transform:translateY(0); }

        .headline1{ font-family:'Cormorant Garamond', serif; color:#1f2a1e; font-size:42px; font-weight:400; margin:0 0 6px 0; opacity:0; transform:translateY(16px); transition:opacity .82s cubic-bezier(.22,.9,.2,1) .06s, transform .82s cubic-bezier(.22,.9,.2,1) .06s; }
        .is-visible .headline1{ opacity:1; transform:translateY(0); }

        .headline2{ font-family:'Marck Script', 'Brush Script MT', cursive; color:#C9A961; font-size:32px; margin:0 0 16px 0; opacity:0; transform:translateY(16px); transition:opacity .84s cubic-bezier(.22,.9,.2,1) .12s, transform .84s cubic-bezier(.22,.9,.2,1) .12s; }
        .is-visible .headline2{ opacity:1; transform:translateY(0); }

        .subtext{ color:#F5F1E6; font-weight:700; font-size:15px; line-height:1.5; max-width:340px; margin-bottom:20px; opacity:0; transform:translateY(16px); transition:opacity .86s cubic-bezier(.22,.9,.2,1) .18s, transform .86s cubic-bezier(.22,.9,.2,1) .18s; }
        .is-visible .subtext{ opacity:1; transform:translateY(0); }

        .actions{ display:flex; gap:16px; opacity:0; transform:translateY(16px); transition:opacity .88s cubic-bezier(.22,.9,.2,1) .24s, transform .88s cubic-bezier(.22,.9,.2,1) .24s; }
        .is-visible .actions{ opacity:1; transform:translateY(0); }

        .btn{ padding:10px 16px; border-radius:6px; font-weight:700; font-size:14px; cursor:pointer; }
        .btn-primary{ background:#3B4A3A; color:#F5F1E6; border:0; }
        .btn-secondary{ background:transparent; color:#F5F1E6; border:1px solid #F5F1E6; }

        .scroll-indicator{ position:absolute; left:50%; transform:translateX(-50%); bottom:-20px; width:44px; height:44px; border-radius:50%; background:#F5F1E6; box-shadow:0 8px 20px rgba(0,0,0,0.18); display:flex; align-items:center; justify-content:center; z-index:9 }
        .scroll-indicator svg{ width:14px; height:14px; stroke:#3B4A3A; stroke-width:1.6; fill:none }

        /* rain layer */
        .rain-layer{ position:absolute; inset:0; pointer-events:none; z-index:2; }
        .rain-streak{ position:absolute; top:-40px; width:1px; border-radius:1px; background:linear-gradient(180deg, transparent, rgba(255,255,255,0.25), transparent); transform:translateY(0); }
        @keyframes rain-fall{ 0%{ transform:translateY(-40px) } 100%{ transform:translateY(560px) } }

        /* petals */
        .petal-layer{ position:absolute; inset:0; pointer-events:none; z-index:3 }
        .petal{ position:absolute; top:-12px; background:#C98A8A; width:8px; height:10px; border-radius:100% 0 100% 0; opacity:0; transform:translateY(0) rotate(0deg); }
        @keyframes petal-fall{ 0%{ transform:translateX(0) translateY(-8vh) rotate(0deg); opacity:0 } 6%{ opacity:1 } 100%{ transform:translateX(var(--dx)) translateY(110vh) rotate(var(--rot)); opacity:0 } }

        /* breathing background */
        @keyframes bg-breathe{ 0%{ filter:brightness(1) } 50%{ filter:brightness(1.04) } 100%{ filter:brightness(1) } }
        .monsoon-hero{ animation: bg-breathe 28s ease-in-out infinite; }

        /* prefers reduced motion */
        @media (prefers-reduced-motion: reduce){ .rain-streak, .petal, .monsoon-hero, .eyebrow, .headline1, .headline2, .subtext, .actions { animation: none !important; transition: none !important; } }

        /* responsive */
        @media (max-width:640px){ .monsoon-inner{ padding-left:24px; padding-top:32px; padding-bottom:32px; } .headline1{ font-size:clamp(22px,6vw,36px)} .headline2{ font-size:clamp(18px,5vw,28px)} .actions{ flex-direction:column; } }
      `}</style>

      <div className="monsoon-inner">
        <div className="monsoon-content">
          <div className="eyebrow">NEW COLLECTION</div>
          <h1 className="headline1">Wear your aura</h1>
          <div className="headline2">This monsoon</div>
          <div className="subtext">Timeless ethnic wear crafted for rainy days and festive evenings.</div>
          <div className="actions">
            <button className="btn btn-primary" onClick={onExploreClick}>Explore collection</button>
            <button className="btn btn-secondary" onClick={onShopClick}>Shop new arrivals</button>
          </div>
        </div>

        <div className="rain-layer" aria-hidden={reduceMotion}>
          { !reduceMotion && rains.map((r,i)=> (
            <span key={i} className="rain-streak" style={{ left: `${r.left}%`, height: `${r.height}px`, transform:`skewX(${r.skew}deg)`, animation:`rain-fall ${r.duration}s linear ${r.delay}s infinite` }} />
          )) }
        </div>

        <div className="petal-layer" aria-hidden={reduceMotion}>
          { !reduceMotion && petals.map((p,i)=> (
            <span key={i} className="petal" style={{ left: `${p.left}%`, width:`${p.size}px`, height:`${Math.round(p.size*1.35)}px`, ['--dx']:`${p.dx}px`, ['--rot']:`${p.rotate}deg`, animation:`petal-fall ${p.duration}s linear ${p.delay}s infinite` }} />
          )) }
        </div>

        <div className="scroll-indicator" aria-hidden="true">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v8M8 12l4 4 4-4" stroke="#3B4A3A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
        </div>
      </div>
    </section>
  );
}
