import { useEffect, useState } from "react";
import bannerImage from "../assets/images/banner.png";

export default function Hero({ setPage }) {
  const [rains, setRains] = useState([]);
  const [petals, setPetals] = useState([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  useEffect(() => {
    const motionMq = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(prefers-reduced-motion: reduce)")
      : null;
    const mobileMq = typeof window !== "undefined" && window.matchMedia
      ? window.matchMedia("(max-width: 768px)")
      : null;

    const buildEffects = () => {
      const reduced = motionMq ? motionMq.matches : false;
      const mobile = mobileMq ? mobileMq.matches : false;
      setReduceMotion(reduced);
      setIsMobile(mobile);

      if (reduced) {
        setRains([]);
        setPetals([]);
        return;
      }

      const rainCount = mobile ? 22 : 36;
      const petalCount = mobile ? 6 : 10;

      setRains(
        Array.from({ length: rainCount }).map(() => ({
          height: Math.round((mobile ? 36 : 48) + Math.random() * (mobile ? 48 : 64)),
          duration: (0.55 + Math.random() * (mobile ? 0.65 : 0.85)).toFixed(2),
          delay: (Math.random() * 3.5).toFixed(2),
          left: mobile
            ? 8 + Math.random() * 92
            : Math.random() < 0.72 ? 28 + Math.random() * 72 : Math.random() * 28,
          skew: -8 + Math.random() * 16,
          opacity: (mobile ? 0.22 : 0.18) + Math.random() * (mobile ? 0.18 : 0.22),
        }))
      );

      setPetals(
        Array.from({ length: petalCount }).map(() => ({
          size: Math.round((mobile ? 5 : 6) + Math.random() * (mobile ? 4 : 5)),
          duration: Math.round((mobile ? 8 : 9) + Math.random() * (mobile ? 5 : 7)),
          delay: (Math.random() * 6).toFixed(2),
          left: Math.round(Math.random() * 100),
          dx: (Math.random() < 0.5 ? -1 : 1) * ((mobile ? 16 : 24) + Math.random() * (mobile ? 24 : 36)),
          rotate: Math.round(160 + Math.random() * 120),
        }))
      );
    };

    buildEffects();

    const onMotionChange = () => buildEffects();
    const onMobileChange = () => buildEffects();
    motionMq?.addEventListener("change", onMotionChange);
    mobileMq?.addEventListener("change", onMobileChange);

    return () => {
      motionMq?.removeEventListener("change", onMotionChange);
      mobileMq?.removeEventListener("change", onMobileChange);
    };
  }, []);

  return (
    <section className="nvz-hero-wrapper">
      <style>{`
        .nvz-hero-wrapper {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(180deg, #1c2117 0%, #23281d 46%, #2c3224 100%);
          display: flex;
          align-items: center;
          overflow: hidden;
          color: #f6f2e7;
        }

        .nvz-hero-bg-container {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }

        .nvz-hero-bg-container::before {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 2;
          background:
            linear-gradient(90deg, rgba(7,12,10,0.9) 0%, rgba(12,20,16,0.84) 28%, rgba(14,24,20,0.42) 54%, rgba(16,28,24,0.12) 74%, rgba(16,28,24,0) 100%),
            radial-gradient(circle at 72% 18%, rgba(201,169,97,0.12), transparent 22%),
            radial-gradient(circle at 18% 28%, rgba(74, 108, 92, 0.28), transparent 30%);
          pointer-events: none;
        }

        .nvz-hero-bg-container::after {
          content: '';
          position: absolute;
          inset: 0;
          z-index: 3;
          background:
            linear-gradient(180deg, rgba(18, 28, 24, 0.18) 0%, rgba(12, 20, 16, 0.08) 42%, rgba(8, 14, 12, 0.28) 100%),
            radial-gradient(circle at 50% 0%, rgba(233, 239, 234, 0.08), transparent 48%);
          pointer-events: none;
          animation: nvz-mist-drift 24s ease-in-out infinite;
        }

        .nvz-hero-bg-image {
          position: absolute;
          inset: 0;
          height: 100%;
          width: 100%;
          object-fit: cover;
          object-position: 52% center;
          filter: saturate(0.78) contrast(1.02) brightness(0.84) hue-rotate(8deg);
          animation: nvz-monsoon-breathe 28s ease-in-out infinite;
        }

        .nvz-monsoon-rain-layer,
        .nvz-monsoon-petal-layer,
        .nvz-monsoon-mist {
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        .nvz-monsoon-rain-layer {
          z-index: 4;
          overflow: hidden;
        }

        .nvz-monsoon-petal-layer {
          z-index: 5;
          overflow: hidden;
        }

        .nvz-monsoon-mist {
          z-index: 6;
          background:
            radial-gradient(circle at 20% 80%, rgba(233, 239, 234, 0.08), transparent 34%),
            radial-gradient(circle at 82% 70%, rgba(255, 255, 255, 0.06), transparent 28%);
          mix-blend-mode: screen;
          animation: nvz-mist-drift 18s ease-in-out infinite reverse;
        }

        .nvz-hero-mobile-fade {
          display: none;
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 150px;
          background: linear-gradient(to top, rgba(28,33,23,1) 8%, rgba(28,33,23,0.72) 42%, transparent 100%);
          z-index: 7;
          pointer-events: none;
        }

        .nvz-rain-streak {
          position: absolute;
          top: -60px;
          width: 1px;
          border-radius: 999px;
          background: linear-gradient(180deg, transparent, rgba(233, 239, 234, 0.55), rgba(255, 255, 255, 0.18), transparent);
          transform: translateY(0);
        }

        .nvz-petal {
          position: absolute;
          top: -16px;
          background: linear-gradient(135deg, #d4a5a5 0%, #b87a7a 100%);
          border-radius: 100% 0 100% 0;
          opacity: 0;
          box-shadow: 0 0 8px rgba(184, 122, 122, 0.18);
        }

        @keyframes nvz-rain-fall {
          0% { transform: translateY(-60px); }
          100% { transform: translateY(calc(100vh + 80px)); }
        }

        @keyframes nvz-rain-fall-mobile {
          0% { transform: translateY(-40px); }
          100% { transform: translateY(calc(72vh + 80px)); }
        }

        @keyframes nvz-petal-fall {
          0% { transform: translateX(0) translateY(-8vh) rotate(0deg); opacity: 0; }
          8% { opacity: 0.85; }
          100% { transform: translateX(var(--petal-dx)) translateY(110vh) rotate(var(--petal-rot)); opacity: 0; }
        }

        @keyframes nvz-petal-fall-mobile {
          0% { transform: translateX(0) translateY(-24px) rotate(0deg); opacity: 0; }
          8% { opacity: 0.75; }
          100% { transform: translateX(var(--petal-dx)) translateY(calc(72vh + 40px)) rotate(var(--petal-rot)); opacity: 0; }
        }

        @keyframes nvz-monsoon-breathe {
          0%, 100% { filter: saturate(0.78) contrast(1.02) brightness(0.84) hue-rotate(8deg); }
          50% { filter: saturate(0.82) contrast(1.04) brightness(0.88) hue-rotate(8deg); }
        }

        @keyframes nvz-mist-drift {
          0%, 100% { transform: translateY(0); opacity: 0.92; }
          50% { transform: translateY(-10px); opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .nvz-rain-streak,
          .nvz-petal,
          .nvz-hero-bg-image,
          .nvz-hero-bg-container::after,
          .nvz-monsoon-mist {
            animation: none !important;
          }
        }

        .nvz-hero-main {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 1380px;
          margin: 0 auto;
          padding: clamp(32px, 4vw, 72px) clamp(24px, 5vw, 80px);
          display: flex;
          align-items: center;
          justify-content: flex-start;
          min-height: 100vh;
          pointer-events: none;
        }

        .nvz-hero-main > * {
          pointer-events: auto;
        }

        .nvz-logo-top-left {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 32px;
        }

        .nvz-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 28px;
          color: #343e24;
          font-weight: 600;
        }

        .nvz-tm {
          font-family: sans-serif;
          font-size: 11px;
          vertical-align: super;
          color: #8f7a43;
          margin-left: 2px;
          font-weight: 700;
        }

        .nvz-hero-content {
          margin-top: 0;
          margin-bottom: 0;
          max-width: 520px;
          padding: clamp(12px, 1vw, 20px) 0;
        }

        .nvz-badge {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 13px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #d7b56f;
          margin-bottom: 22px;
        }

        .nvz-main-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(50px, 5.2vw, 86px);
          line-height: 0.95;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #f4f1e8;
          letter-spacing: -0.04em;
        }

        .nvz-highlight {
          display: block;
          font-size: clamp(36px, 5.1vw, 66px);
          color: #d4b264;
          font-style: italic;
          margin-top: 12px;
          letter-spacing: -0.02em;
          line-height: 1.05;
        }

        .nvz-highlight-line {
          display: block;
        }

        .nvz-description {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: clamp(16px, 1.2vw, 18px);
          line-height: 1.8;
          color: rgba(255, 255, 255, 0.84);
          margin: 0 0 38px 0;
          max-width: 520px;
        }

        .nvz-hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: 0;
          flex-wrap: wrap;
        }

        .nvz-btn-shop,
        .nvz-btn-secondary {
          padding: 0 40px;
          height: 56px;
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 700;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s ease;
          min-width: 200px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .nvz-btn-shop {
          background: rgba(93, 112, 70, 0.78);
          color: #f6f2e7;
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
        }

        .nvz-btn-shop:hover {
          background: rgba(82, 99, 61, 0.92);
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(0, 0, 0, 0.34);
        }

        .nvz-btn-secondary {
          background: transparent;
          border: 1.5px solid rgba(255, 255, 255, 0.22);
          color: rgba(255, 255, 255, 0.88);
        }

        .nvz-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          transform: translateY(-2px);
        }

        .nvz-desktop-only {
          display: inline;
        }

        /* --- MOBILE SPECIFIC FIXES --- */
        @media (max-width: 768px) {
          .nvz-hero-wrapper {
            flex-direction: column;
            min-height: auto;
            position: relative;
            padding-top: 0;
            overflow: hidden;
            background: linear-gradient(180deg, #1c2117 0%, #23281d 46%, #2c3224 100%);
          }
          
          .nvz-desktop-only { display: none; }
          
          .nvz-hero-bg-container {
            position: relative;
            width: 100%;
            height: clamp(420px, 72vh, 620px);
            min-height: 420px;
            order: 1;
            z-index: 0;
          }

          .nvz-hero-bg-container::before {
            background:
              linear-gradient(180deg, rgba(8,12,10,0.18) 0%, rgba(10,16,13,0.08) 34%, rgba(12,18,15,0.42) 72%, rgba(14,20,17,0.72) 100%),
              linear-gradient(90deg, rgba(7,12,10,0.42) 0%, rgba(12,20,16,0.18) 42%, rgba(16,28,24,0.04) 100%),
              radial-gradient(circle at 50% 18%, rgba(201,169,97,0.14), transparent 28%);
          }

          .nvz-hero-bg-container::after {
            background:
              linear-gradient(180deg, rgba(18, 28, 24, 0.12) 0%, rgba(12, 20, 16, 0.06) 38%, rgba(8, 14, 12, 0.22) 100%),
              radial-gradient(circle at 50% 0%, rgba(233, 239, 234, 0.1), transparent 42%);
            animation: nvz-mist-drift 20s ease-in-out infinite;
          }

          .nvz-hero-mobile-fade {
            display: block;
          }

          .nvz-monsoon-mist {
            background:
              radial-gradient(circle at 18% 78%, rgba(233, 239, 234, 0.1), transparent 36%),
              radial-gradient(circle at 84% 68%, rgba(255, 255, 255, 0.08), transparent 30%);
            opacity: 0.85;
          }

          .nvz-rain-streak {
            width: 1.5px;
          }
          
          .nvz-hero-bg-image {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: 66% center !important;
            left: 0 !important;
            filter: saturate(0.74) contrast(1.04) brightness(0.8) hue-rotate(8deg) !important;
          }
          
          .nvz-hero-main {
            width: 100%;
            min-height: auto;
            padding: 0 14px 30px;
            order: 2;
            margin-top: -68px;
            align-items: center;
            text-align: center;
            z-index: 10;
          }
          
          .nvz-logo-top-left {
            margin-bottom: 18px;
          }
          
          .nvz-hero-content {
            margin-top: 0;
            margin-bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            width: min(100%, 420px);
            padding: 20px 16px 22px;
            border-radius: 20px;
            background: rgba(11, 15, 11, 0.5);
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 18px 42px rgba(0, 0, 0, 0.34);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }
          
          .nvz-badge {
            margin-bottom: 10px;
            font-size: 10px;
            letter-spacing: 3px;
          }
          
          .nvz-main-title {
            font-size: clamp(26px, 9vw, 40px);
            line-height: 0.96;
            margin-bottom: 10px;
          }

          .nvz-highlight {
            font-size: clamp(20px, 7.5vw, 30px);
            margin-top: 10px;
            line-height: 1.08;
          }
          
          .nvz-description {
            font-size: 13px;
            margin-bottom: 20px;
            max-width: 100%;
            line-height: 1.7;
          }
          
          .nvz-hero-actions {
            flex-direction: column;
            width: 100%;
            align-items: center;
            margin-bottom: 0;
            gap: 12px;
          }
          
          .nvz-btn-shop,
          .nvz-btn-secondary {
            width: 100%;
            max-width: 360px;
            height: 48px;
            min-width: 0;
            font-size: 13px;
          }

        }
      `}</style>

      <div className="nvz-hero-bg-container" aria-hidden="true">
        <img className="nvz-hero-bg-image" src={bannerImage} alt="Hero background" />

        {!reduceMotion && (
          <>
            <div className="nvz-monsoon-rain-layer">
              {rains.map((rain, index) => (
                <span
                  key={`rain-${index}`}
                  className="nvz-rain-streak"
                  style={{
                    left: `${rain.left}%`,
                    height: `${rain.height}px`,
                    opacity: rain.opacity,
                    transform: `skewX(${rain.skew}deg)`,
                    animation: `${isMobile ? "nvz-rain-fall-mobile" : "nvz-rain-fall"} ${rain.duration}s linear ${rain.delay}s infinite`,
                  }}
                />
              ))}
            </div>

            <div className="nvz-monsoon-petal-layer">
              {petals.map((petal, index) => (
                <span
                  key={`petal-${index}`}
                  className="nvz-petal"
                  style={{
                    left: `${petal.left}%`,
                    width: `${petal.size}px`,
                    height: `${Math.round(petal.size * 1.35)}px`,
                    "--petal-dx": `${petal.dx}px`,
                    "--petal-rot": `${petal.rotate}deg`,
                    animation: `${isMobile ? "nvz-petal-fall-mobile" : "nvz-petal-fall"} ${petal.duration}s linear ${petal.delay}s infinite`,
                  }}
                />
              ))}
            </div>

            <div className="nvz-monsoon-mist" />
          </>
        )}

        <div className="nvz-hero-mobile-fade" aria-hidden="true" />
      </div>

      <div className="nvz-hero-main">
        <div className="nvz-hero-content">
          <p className="nvz-badge">NEW COLLECTION</p>

          <h1 className="nvz-main-title">
            Wear your aura
            <span className="nvz-highlight">
              <span className="nvz-highlight-line">Monsoon Mood</span>
              <span className="nvz-highlight-line">Effortless Aura</span>
            </span>
          </h1>

          <p className="nvz-description">
            Timeless ethnic wear crafted for rainy days and festive evenings.
          </p>

          <div className="nvz-hero-actions">
            <button className="nvz-btn-shop" onClick={() => setPage("Shop") }>
              Explore Collection
            </button>
            <button className="nvz-btn-secondary" onClick={() => setPage("Shop") }>
              Shop New Arrivals
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}