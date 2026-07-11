import heroImg from "../assets/images/banner.png";

export default function Hero({ setPage }) {
  return (
    <section className="nvz-hero-wrapper">
      <style>{`
        .nvz-hero-wrapper {
          position: relative;
          width: 100%;
          min-height: 90vh;
          background: linear-gradient(135deg, #eef1d7 0%, #d8e0a9 45%, #c3cd80 100%);
          display: flex;
          align-items: stretch;
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
          background: radial-gradient(circle at 18% 22%, rgba(255,255,255,0.44), transparent 24%),
                      radial-gradient(circle at 82% 18%, rgba(255,255,255,0.18), transparent 24%),
                      linear-gradient(180deg, rgba(255,255,255,0.34), transparent 62%, rgba(40,51,31,0.16));
          pointer-events: none;
        }

        .nvz-hero-bg-image {
          position: absolute;
          top: 0;
          right: 0;
          height: 100%;
          width: 60%;
          object-fit: cover;
          object-position: center 20%;
          mask-image: linear-gradient(to right, transparent 0%, black 35%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 35%);
          filter: saturate(0.92) contrast(0.95) brightness(0.96);
        }

        .nvz-hero-rain {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background-image: linear-gradient(120deg, rgba(255,255,255,0.2) 1px, transparent 22px);
          background-size: 6px 36px;
          opacity: 0.32;
          transform: skewX(-20deg);
          animation: nvz-rain 0.8s linear infinite;
        }

        @keyframes nvz-rain {
          from { background-position: 0 0; }
          to { background-position: -12px 36px; }
        }

        .nvz-hero-main {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(24px, 4vw, 60px) clamp(24px, 5vw, 80px);
          display: flex;
          flex-direction: column;
          pointer-events: none;
        }
        
        .nvz-hero-main > * {
          pointer-events: auto;
        }

        .nvz-logo-top-left {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: auto;
        }

        .nvz-logo-text {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          color: #f7f2ea;
          font-weight: 500;
        }
        
        .nvz-tm {
          font-family: sans-serif;
          font-size: 11px;
          vertical-align: super;
          color: #dbb86d;
          margin-left: 2px;
          font-weight: 600;
        }

        .nvz-hero-content {
          margin-top: clamp(60px, 12vh, 140px);
          margin-bottom: clamp(60px, 10vh, 120px);
          max-width: 620px;
        }

        .nvz-badge {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 11px;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: #d8b97d;
          margin-bottom: 18px;
        }

        .nvz-main-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(48px, 6vw, 86px);
          line-height: 1.02;
          font-weight: 700;
          margin: 0 0 18px 0;
          color: #ffffff;
          text-shadow: 0 12px 30px rgba(15, 10, 23, 0.25);
        }

        .nvz-highlight {
          display: block;
          font-size: clamp(34px, 5vw, 62px);
          color: #9c7a45;
          font-style: italic;
          margin-top: 6px;
          letter-spacing: -0.5px;
          text-shadow: 0 8px 18px rgba(255,255,255,0.22);
        }

        .nvz-subtitle {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: clamp(12px, 1.2vw, 15px);
          font-weight: 600;
          letter-spacing: 3px;
          color: #8f7b4c;
          margin: 0 0 24px 0;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          flex-wrap: wrap;
        }
        
        .nvz-star-icon {
          margin-left: 10px;
          color: #f7f2ea;
          font-size: 16px;
        }

        .nvz-description {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: clamp(16px, 1.5vw, 19px);
          line-height: 1.72;
          color: rgba(255,255,255,0.92);
          margin: 0 0 40px 0;
          max-width: 520px;
          text-shadow: 0 12px 28px rgba(15, 10, 23, 0.14);
        }

        .nvz-desktop-only {
          display: inline;
        }

        .nvz-hero-actions {
          display: flex;
          gap: 16px;
          margin-bottom: clamp(60px, 10vh, 100px);
          flex-wrap: wrap;
        }

        .nvz-btn-shop,
        .nvz-btn-secondary {
          padding: 0 40px;
          height: 52px;
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 15px;
          font-weight: 600;
          border-radius: 999px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .nvz-btn-shop {
          background: #556739;
          color: #f6f1df;
          border: none;
          box-shadow: 0 10px 28px rgba(60, 70, 38, 0.22);
        }

        .nvz-btn-shop:hover {
          background: #43572d;
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(60, 70, 38, 0.28);
        }

        .nvz-btn-secondary {
          background: rgba(255, 255, 255, 0.12);
          border: 1.5px solid rgba(83, 108, 62, 0.9);
          color: #28331f;
        }

        .nvz-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
        }

        .nvz-features-row {
          display: flex;
          gap: clamp(24px, 4vw, 48px);
          flex-wrap: wrap;
        }

        .nvz-feature {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 0;
          position: relative;
        }

        .nvz-feature:not(:last-child)::after {
          content: "";
          width: 1px;
          height: 20px;
          background: rgba(216,184,125,0.28);
          margin-left: clamp(12px, 2vw, 24px);
        }

        .nvz-feature-text {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          letter-spacing: 1.5px;
          color: rgba(247,242,234,0.92);
          font-weight: 600;
          text-transform: uppercase;
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
        <div className="nvz-logo-top-left">
          <span className="nvz-logo-text">nouveau<span className="nvz-tm">™</span></span>
        </div>

        <div className="nvz-hero-content">
          <p className="nvz-badge">NEW COLLECTION</p>

          <h1 className="nvz-main-title">
            Monsoon Mood.
            <span className="nvz-highlight">Effortless Aura</span>
          </h1>
          
          <p className="nvz-subtitle">
            Timeless ethnic wear crafted for rainy days, festive evenings and every beautiful moment.
          </p>

          <p className="nvz-description">
            Soft linens, flowing silhouettes, and warm monsoon tones designed for comfort and celebration.
          </p>

          <div className="nvz-hero-actions">
            <button className="nvz-btn-shop" onClick={() => setPage("Shop")}>
              Explore Collection
            </button>
            <button className="nvz-btn-secondary" onClick={() => setPage("Shop") }>
              Shop New Arrivals
            </button>
          </div>

          <div className="nvz-features-row">
            <div className="nvz-feature">
              <div className="nvz-feature-text">
                PREMIUM<br/>QUALITY
              </div>
            </div>
            
            <div className="nvz-feature">
              <div className="nvz-feature-text">
                TIMELESS<br/>DESIGNS
              </div>
            </div>

            <div className="nvz-feature">
              <div className="nvz-feature-text">
                MADE FOR<br/>YOU
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}