import heroImg from "../assets/images/banner.png";

export default function Hero({ setPage }) {
  return (
    <section className="nvz-hero-wrapper">
      <style>{`
        .nvz-hero-wrapper {
          position: relative;
          width: 100%;
          min-height: 100vh;
          background: linear-gradient(180deg, #e9edce 0%, #d8e2aa 32%, #cfd5a8 100%);
          display: flex;
          align-items: center;
          overflow: hidden;
          color: #28331f;
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
          background: radial-gradient(circle at 20% 25%, rgba(255,255,255,0.5), transparent 20%),
                      radial-gradient(circle at 75% 15%, rgba(255,255,255,0.28), transparent 16%),
                      linear-gradient(180deg, rgba(255,255,255,0.32), transparent 55%, rgba(49,62,37,0.08));
          pointer-events: none;
        }

        .nvz-hero-bg-image {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 58%;
          object-fit: cover;
          object-position: center right;
          mask-image: linear-gradient(to left, transparent 0%, black 38%);
          -webkit-mask-image: linear-gradient(to left, transparent 0%, black 38%);
          filter: saturate(0.9) contrast(0.98) brightness(0.95);
        }

        .nvz-hero-rain {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image: linear-gradient(120deg, rgba(255,255,255,0.18) 1px, transparent 22px);
          background-size: 6px 40px;
          opacity: 0.22;
          transform: skewX(-16deg);
          animation: nvz-rain 0.85s linear infinite;
        }

        @keyframes nvz-rain {
          from { background-position: 0 0; }
          to { background-position: -12px 40px; }
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
          max-width: 530px;
        }

        .nvz-badge {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #7d7a5d;
          margin-bottom: 14px;
        }

        .nvz-main-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(52px, 6vw, 92px);
          line-height: 0.98;
          font-weight: 700;
          margin: 0 0 16px 0;
          color: #273523;
          letter-spacing: -0.05em;
        }

        .nvz-highlight {
          display: block;
          font-size: clamp(38px, 6vw, 70px);
          color: #7e7b5f;
          font-style: italic;
          margin-top: 4px;
          letter-spacing: -0.4px;
        }

        .nvz-description {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: clamp(16px, 1.2vw, 18px);
          line-height: 1.8;
          color: #4a503d;
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
        }

        .nvz-btn-shop {
          background: #475b30;
          color: #f7f1dd;
          border: none;
          box-shadow: 0 12px 30px rgba(58, 69, 34, 0.22);
        }

        .nvz-btn-shop:hover {
          background: #394a27;
          transform: translateY(-2px);
          box-shadow: 0 14px 36px rgba(58, 69, 34, 0.28);
        }

        .nvz-btn-secondary {
          background: rgba(255, 255, 255, 0.92);
          border: 1.5px solid rgba(84, 94, 54, 0.18);
          color: #3d452d;
        }

        .nvz-btn-secondary:hover {
          background: rgba(255, 255, 255, 1);
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
            background: linear-gradient(180deg, #ffeff8, #fff8e8, #e8f7ff);
          }
          
          .nvz-desktop-only { display: none; }
          
          .nvz-hero-bg-container {
            position: relative;
            width: 100%;
            height: min(72vh, 500px);
            min-height: 340px;
            order: 1;
            z-index: 0;
          }

          .nvz-hero-bg-container::after {
            content: '';
            position: absolute;
            bottom: -2px;
            left: 0;
            width: 100%;
            height: 140px;
            background: linear-gradient(to top, rgba(26,38,31,1) 10%, transparent 100%);
            z-index: 1;
            pointer-events: none;
          }
          
          .nvz-hero-bg-image {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            object-position: 65% center !important;
            mask-image: none !important;
            -webkit-mask-image: none !important;
            left: 0 !important;
          }
          
          .nvz-hero-main {
            padding-top: 0;
            padding-bottom: 40px;
            order: 2;
            margin-top: -24px;
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
            padding: 0 16px;
          }
          
          .nvz-badge { margin-bottom: 12px; }
          
          .nvz-main-title {
            font-size: clamp(34px, 10vw, 48px);
            margin-bottom: 12px;
          }

          .nvz-highlight {
            font-size: clamp(24px, 10vw, 36px);
          }
          
          .nvz-subtitle {
            justify-content: center;
            letter-spacing: 2px;
            font-size: 11px;
            margin-bottom: 18px;
          }
          
          .nvz-description {
            font-size: 15px;
            margin-bottom: 28px;
            max-width: 100%;
            line-height: 1.8;
          }
          
          .nvz-hero-actions {
            flex-direction: column;
            width: 100%;
            margin-bottom: 40px;
          }
          
          .nvz-btn-shop,
          .nvz-btn-secondary {
            width: 100%;
            max-width: 360px;
          }
          
          .nvz-features-row {
            justify-content: center;
            gap: 16px;
          }
          
          .nvz-feature {
            flex-direction: row;
            text-align: center;
            gap: 12px;
            width: auto;
          }
          
          .nvz-feature:not(:last-child)::after {
            height: 12px;
            margin-left: 6px;
          }
          
          .nvz-feature-text {
            font-size: 9px;
            letter-spacing: 1px;
          }
        }
      `}</style>

      <div className="nvz-hero-bg-container" aria-hidden="true">
        <img className="nvz-hero-bg-image" src={heroImg} alt="Hero background" />
      </div>
      <div className="nvz-hero-rain" aria-hidden="true" />

      <div className="nvz-hero-main">
        <div className="nvz-hero-content">
          <p className="nvz-badge">NEW COLLECTION</p>

          <h1 className="nvz-main-title">
            Wear Your Aura
            <span className="nvz-highlight">This Monsoon</span>
          </h1>

          <p className="nvz-description">
            Timeless ethnic wear crafted for rainy days, festive evenings and every beautiful moment.
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