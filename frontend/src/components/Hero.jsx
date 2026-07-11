import heroImg from "../assets/images/banner.png";

export default function Hero({ setPage }) {
  return (
    <section className="nvz-hero-wrapper">
      <style>{`
        .nvz-hero-wrapper {
          position: relative;
          width: 100%;
          min-height: auto;
          background: linear-gradient(135deg, #FFB3C7 0%, #FFE0B2 20%, #E1F5FE 45%, #C8E6C9 70%, #E1BEE7 100%);
          display: flex;
          align-items: stretch;
          overflow: hidden;
          color: #2b2233;
        }

        .nvz-hero-bg-container {
          position: absolute;
          inset: 0;
          z-index: 0;
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
          mask-image: linear-gradient(to right, transparent 0%, black 25%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 25%);
          filter: saturate(0.94) contrast(0.92) brightness(0.92);
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
          color: #f7f2ea;
        }

        .nvz-highlight {
          display: block;
          font-size: clamp(34px, 5vw, 62px);
          color: #d8b97d;
          font-style: italic;
          margin-top: 6px;
          letter-spacing: -0.5px;
        }

        .nvz-subtitle {
          font-family: 'Inter', 'Poppins', sans-serif;
          font-size: clamp(12px, 1.2vw, 15px);
          font-weight: 500;
          letter-spacing: 4px;
          color: #d8b97d;
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
          line-height: 1.7;
          color: rgba(247,242,234,0.9);
          margin: 0 0 40px 0;
          max-width: 520px;
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
          background: linear-gradient(135deg, #ff6ec4 0%, #f5d76e 55%, #6dd5ed 100%);
          color: #2b2233;
          border: none;
          box-shadow: 0 10px 28px rgba(97, 57, 110, 0.22);
        }

        .nvz-btn-shop:hover {
          background: linear-gradient(135deg, #ff7eb3 0%, #f7d18c 55%, #76d8f8 100%);
          transform: translateY(-2px);
          box-shadow: 0 14px 34px rgba(97, 57, 110, 0.26);
        }

        .nvz-btn-secondary {
          background: rgba(255, 255, 255, 0.18);
          border: 1.5px solid rgba(255, 255, 255, 0.85);
          color: #2b2233;
        }

        .nvz-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.28);
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
            background: #1a261f;
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
            margin-top: -48px;
            align-items: center;
            text-align: center;
            z-index: 10;
          }
          
          .nvz-logo-top-left {
            margin-bottom: 24px;
          }
          
          .nvz-hero-content {
            margin-top: 0;
            margin-bottom: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          
          .nvz-badge { margin-bottom: 14px; }
          
          .nvz-main-title {
            font-size: clamp(40px, 10vw, 52px);
            margin-bottom: 14px;
          }

          .nvz-highlight {
            font-size: clamp(28px, 8vw, 42px);
          }
          
          .nvz-subtitle {
            justify-content: center;
            letter-spacing: 2px;
            font-size: 10px;
            margin-bottom: 16px;
          }
          
          .nvz-description {
            font-size: 15px;
            margin-bottom: 28px;
            max-width: 100%;
          }
          
          .nvz-hero-actions {
            flex-direction: column;
            width: 100%;
            margin-bottom: 40px;
          }
          
          .nvz-btn-shop,
          .nvz-btn-secondary {
            width: 100%;
            max-width: 340px;
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

      <div className="nvz-hero-main">
        <div className="nvz-logo-top-left">
          <span className="nvz-logo-text">nouveau<span className="nvz-tm">™</span></span>
        </div>

        <div className="nvz-hero-content">
          <p className="nvz-badge">NEW COLLECTION</p>

          <h1 className="nvz-main-title">
            Wear your aura
            <span className="nvz-highlight">This monsoon</span>
          </h1>
          
          <p className="nvz-subtitle">
            Timeless ethnic wear crafted for rainy days and festive evenings <span className="nvz-star-icon">✦</span>
          </p>

          <p className="nvz-description">
            Discover modern silhouettes and rich textures inspired by tradition, made for every celebration.
          </p>

          <div className="nvz-hero-actions">
            <button className="nvz-btn-shop" onClick={() => setPage("Shop")}>
              Shop Now
            </button>
            <button className="nvz-btn-secondary" onClick={() => setPage("Shop")}>
              Explore Collection
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