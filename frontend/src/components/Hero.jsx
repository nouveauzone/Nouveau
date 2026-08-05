import bannerImage from "../assets/images/banner.jpeg";
import { fixImageUrl } from "../utils/imageUrl";
export default function Hero({ setPage }) {
  const features = [
  ];

  const decorativeParticles = [
    { className: "nvz-particle nvz-particle--saffron", style: { top: "10%", left: "8%", width: "8px", height: "8px", animationDelay: "0s" } },
    { className: "nvz-particle nvz-particle--sparkle", style: { top: "18%", right: "12%", width: "6px", height: "6px", animationDelay: "0.8s" } },
    { className: "nvz-particle nvz-particle--leaf", style: { top: "34%", left: "16%", width: "10px", height: "6px", animationDelay: "1.4s" } },
    { className: "nvz-particle nvz-particle--saffron", style: { bottom: "18%", right: "18%", width: "7px", height: "7px", animationDelay: "1.1s" } },
    { className: "nvz-particle nvz-particle--sparkle", style: { bottom: "34%", left: "11%", width: "5px", height: "5px", animationDelay: "1.8s" } },
  ];

  return (
    <section className="nvz-hero-banner" aria-label="Featured banner">
      <style>{`
        .nvz-hero-banner {
          position: relative;
          width: 100%;
          height: 650px;
          overflow: hidden;
          background: #111111;
        }

        .nvz-hero-banner::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(255,153,51,.08), rgba(255,255,255,.03), rgba(19,136,8,.08));
          pointer-events: none;
          z-index: 1;
        }

        .nvz-hero-particles {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 2;
          overflow: hidden;
        }

        .nvz-particle {
          position: absolute;
          border-radius: 999px;
          opacity: 0.15;
          animation: nvz-hero-float 7s ease-in-out infinite;
        }

        .nvz-particle--saffron {
          background: #FF9933;
          box-shadow: 0 0 16px rgba(255, 153, 51, 0.18);
        }

        .nvz-particle--sparkle {
          background: #FFF8F0;
          box-shadow: 0 0 12px rgba(255, 248, 240, 0.3);
        }

        .nvz-particle--leaf {
          background: #138808;
          border-radius: 999px 0 999px 0;
          transform: rotate(-18deg);
          box-shadow: 0 0 16px rgba(19, 136, 8, 0.16);
        }

        .nvz-hero-banner__image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          background-color: #111111;
        }

        .nvz-hero-banner__imageWrap {
          position: absolute;
          inset: 0;
          z-index: 0;
        }

        .nvz-hero-overlay {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 48px 56px;
          pointer-events: none;
          z-index: 3;
        }

        .nvz-hero-brand {
          display: flex;
          align-items: center;
          gap: 20px;
          margin-bottom: 25px;
        }

        .nvz-hero-logo {
          width: 110px;
          height: 110px;
          object-fit: contain;
          filter: drop-shadow(0 8px 18px rgba(45, 36, 29, 0.08));
          transform: translateY(-33px);
        }

        .nvz-hero-brand-text {
          display: flex;
          flex-direction: column;
          justify-content: center;
          transform: translateY(-25px);
        }

        .nvz-hero-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: clamp(55px, 5vw, 80px);
          font-weight: 700;
          color: #7A1E1E;
          letter-spacing: 3px;
          line-height: 0.85;
        }

        .nvz-hero-brand-name span {
          color: #D4AF37;
        }

        .nvz-hero-brand-tagline {
          font-family: 'Poppins', sans-serif;
          font-size: 19px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #E8CD77;
          font-weight: 700;
          margin-top: 6px;
          margin-left: 12px;        
        }

        .nvz-hero-content {
          max-width: 420px;
          width: 100%;
          padding-left: 24px;
          pointer-events: auto;
          opacity: 0;
          transform: translateY(24px);
          animation: nvz-hero-fade-up 700ms ease forwards;
        }

        .nvz-hero-badge {
          display: inline-block;
          margin-bottom: 14px;
          padding: 8px 14px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(255,153,51,0.95), rgba(255,255,255,0.92), rgba(19,136,8,0.95));
          color: #1A1A1A;
          font-size: 11px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          font-weight: 600;
          font-family: 'Poppins', 'Inter', sans-serif;
          box-shadow: 0 8px 24px rgba(255, 153, 51, 0.18), 0 0 18px rgba(19, 136, 8, 0.12);
        }

        .nvz-hero-title {
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          font-size: clamp(34px, 3.2vw, 54px);
          line-height: 1.02;
          margin: 0 0 16px;
          color: #FFF8F0;
          font-weight: 700;
        }

        .nvz-hero-title .nvz-hero-celebrate {
          color: #7A1E1E;
          display: inline;
        }

        .nvz-hero-title .nvz-hero-every-moment {
          color: #FF9933;
          display: inline;
        }

        .nvz-hero-title .nvz-hero-highlight {
          color: #138808;
          display: inline-block;
        }

        .nvz-hero-subtitle {
          font-family: 'Poppins', 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.75;
          color: #4B3B2B;
          margin: 0 0 18px;
        }

        .nvz-hero-features {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 0 0 24px;
          padding: 0;
          list-style: none;
        }

        .nvz-hero-features li {
          display: flex;
          align-items: center;
          gap: 10px;
          font-family: 'Poppins', 'Inter', sans-serif;
          font-size: 14px;
          color: #3B2A1F;
          font-weight: 600;
          transition: color 220ms ease;
        }

        .nvz-hero-features li span {
          color: #FF9933;
          font-size: 14px;
          transition: color 220ms ease;
        }

        .nvz-hero-features li:hover {
          color: #138808;
        }

        .nvz-hero-features li:hover span {
          color: #138808;
        }

        .nvz-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .nvz-hero-mobile-panel {
          display: none;
        }

        .nvz-hero-btn {
          border-radius: 9999px;
          padding: 12px 20px;
          font-family: 'Poppins', 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          transition: transform 300ms ease, background 300ms ease, color 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
          cursor: pointer;
        }

        .nvz-hero-btn--primary {
          background: linear-gradient(90deg, #FF9933, #FFFFFF, #138808);
          color: #1A1A1A;
          border: 1px solid rgba(255,255,255,0.35);
        }

        .nvz-hero-btn--secondary {
          background: transparent;
          color: #138808;
          border: 2px solid #138808;
        }

        .nvz-hero-btn:hover {
          transform: translateY(-2px) scale(1.03);
        }

        .nvz-hero-btn--primary:hover {
          box-shadow: 0 12px 28px rgba(255, 153, 51, 0.22), 0 10px 24px rgba(19, 136, 8, 0.18);
        }

        .nvz-hero-btn--secondary:hover {
          background: #138808;
          color: #fff;
        }

        @keyframes nvz-hero-fade-up {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes nvz-hero-float {
          0% {
            transform: translateY(0) translateX(0);
          }
          50% {
            transform: translateY(-8px) translateX(3px);
          }
          100% {
            transform: translateY(0) translateX(0);
          }
        }

        @media (min-width: 768px) and (max-width: 1199px) {
          .nvz-hero-banner {
            height: auto;
            min-height: 600px;
          }

          .nvz-hero-overlay {
            padding: 32px 32px 40px;
            align-items: center;
          }

          .nvz-hero-content {
            max-width: 60%;
            padding-left: 8px;
          }

          .nvz-hero-title {
            font-size: 48px;
            line-height: 1.05;
          }

          .nvz-hero-subtitle {
            font-size: 18px;
            line-height: 1.65;
          }

          .nvz-hero-actions {
            flex-wrap: nowrap;
            gap: 12px;
          }
        }

        @media (max-width: 767px) {
          .nvz-hero-banner {
            height: auto;
            min-height: 540px;
            display: flex;
            flex-direction: column;
            overflow-x: hidden;
            background: #111111;
          }

          .nvz-hero-banner__image {
            width: 100%;
            height: 230px;
            object-fit: cover;
            object-position: right center;
            border-radius: 0;
            z-index: 0;
            filter: brightness(0.9) contrast(0.98) saturate(0.96);
          }

          .nvz-hero-banner__imageWrap {
            position: relative;
            inset: auto;
            width: 100%;
            height: 230px;
            z-index: 0;
          }

          .nvz-hero-overlay {
            display: none;
          }

          .nvz-hero-mobile-panel {
            display: block;
            position: relative;
            width: 100%;
            margin-top: 0;
            padding: 22px 18px 38px;
            background: linear-gradient(180deg, rgba(255,248,240,0.94) 0%, rgba(255,248,240,0.98) 100%);
            backdrop-filter: blur(14px) saturate(120%);
            -webkit-backdrop-filter: blur(14px) saturate(120%);
            border-radius: 28px 28px 0 0;
            z-index: 2;
            margin-top: -20px;
            box-shadow: 0 -14px 32px rgba(26, 60, 139, 0.08);
            border-top: 1px solid rgba(26, 60, 139, 0.12);
          }

          .nvz-hero-mobile-panel__inner {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 8px;
            max-width: 360px;
            margin: 0 auto;
            opacity: 0;
            transform: translateY(18px);
            animation: nvz-hero-fade-up 700ms ease forwards;
          }

          .nvz-hero-badge {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            margin-bottom: 2px;
            letter-spacing: 2px;
            background: linear-gradient(90deg, rgba(255,153,51,0.95), rgba(255,255,255,0.96), rgba(19,136,8,0.95));
            color: #1A1A1A;
          }

          .nvz-hero-title {
            font-family: 'Playfair Display', serif;
            font-size: 23px;
            line-height: 1.15;
            text-align: center;
            max-width: 100%;
            margin: 0;
            color: #3B2A1F;
            white-space: normal;
          }

          .nvz-hero-title .nvz-hero-celebrate {
            color: #7A1E1E;
            display: inline;
          }

          .nvz-hero-title .nvz-hero-every-moment {
            color: #FF9933;
            display: inline;
          }

          .nvz-hero-title .nvz-hero-highlight {
            display: inline;
            color: #138808;
            font-style: italic;
          }

          .nvz-hero-subtitle {
            font-size: 13px;
            line-height: 1.6;
            color: #4B3B2B;
            width: 100%;
            margin: 0;
            max-width: 28ch;
          }

          .nvz-hero-features {
            display: flex;
            flex-direction: column;
            gap: 8px;
            margin: 0 0 10px;
            padding: 0;
            list-style: none;
            width: 100%;
          }

          .nvz-hero-features li {
            justify-content: center;
            font-size: 13px;
            color: #3B2A1F;
            width: 100%;
            line-height: 1.4;
          }

          .nvz-hero-features li span {
            color: #FF9933;
          }

          .nvz-hero-features li:hover span {
            color: #138808;
          }

          .nvz-hero-actions {
            width: 100%;
            flex-direction: column;
            align-items: center;
            gap: 9px;
            margin-top: 4px;
          }

          .nvz-hero-btn {
            width: 100%;
            max-width: none;
            height: 46px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 999px;
            font-size: 12px;
            letter-spacing: 0.18em;
          }

          .nvz-hero-btn--primary {
            background: linear-gradient(90deg, #FF9933, #FFFFFF, #138808);
            border-color: rgba(255,255,255,0.55);
            box-shadow: 0 12px 24px rgba(255, 153, 51, 0.18), 0 12px 24px rgba(19, 136, 8, 0.12);
            color: #1A1A1A;
          }

          .nvz-hero-btn--secondary {
            color: #138808;
            border-color: #138808;
            box-shadow: inset 0 0 0 1px rgba(19, 136, 8, 0.08);
          }

          .nvz-hero-btn:hover {
            transform: translateY(-2px) scale(1.02);
          }

          .nvz-hero-btn--secondary:hover {
            background: #138808;
            color: #fff;
          }

          .nvz-hero-btn--primary:hover {
            box-shadow: 0 14px 28px rgba(255, 153, 51, 0.2), 0 14px 28px rgba(19, 136, 8, 0.16);
          }

          .nvz-hero-mobile-panel {
            padding-bottom: 32px;
          }

          .nvz-hero-mobile-panel .nvz-hero-actions .nvz-hero-btn--secondary {
            margin-top: 0;
          }
        }
      `}</style>

      <div className="nvz-hero-banner__imageWrap">
        <img
          className="nvz-hero-banner__image"
          src={bannerImage}
          alt="Raksha Bandhan and Independence Day special collection"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="nvz-hero-particles" aria-hidden="true">
        {decorativeParticles.map((particle, index) => (
          <span key={index} className={particle.className} style={particle.style} />
        ))}
      </div>

      <div className="nvz-hero-overlay">
        <div className="nvz-hero-content">
          
              <div className="nvz-hero-brand">
                <img
                   src={fixImageUrl("/nouveau-logo.png")}
                     alt="Nouveau Logo"
                 className="nvz-hero-logo"
                />

                <div className="nvz-hero-brand-text">
                 <div className="nvz-hero-brand-name">
                    nouveau<span>™</span>
                  </div>

                 <div className="nvz-hero-brand-tagline">
                          Wear Your Aura
                       </div>
                </div>
              </div>
          
          <h1 className="nvz-hero-title">
            <span className="nvz-hero-celebrate">Celebrate</span>{" "}
            <span className="nvz-hero-every-moment">Freedom.</span>
            <br />
            <span className="nvz-hero-highlight">Cherish Family.</span>
          </h1>
          <p className="nvz-hero-subtitle">
            Discover handcrafted ethnic wear for Raksha Bandhan, Independence Day, and every special celebration.
          </p>
          <ul className="nvz-hero-features">
            {features.map((feature, index) => (
              <li key={feature}>
                <span>{index === 0 ? "✓" : index === 1 ? "✓" : "✓"}</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="nvz-hero-actions">
            <button className="nvz-hero-btn nvz-hero-btn--primary" onClick={() => setPage("Shop")}>SHOP NOW</button>
            <button className="nvz-hero-btn nvz-hero-btn--secondary" onClick={() => setPage("Shop")}>Explore Collection</button>
          </div>
        </div>
      </div>

      <div className="nvz-hero-mobile-panel" aria-hidden="false">
        <div className="nvz-hero-mobile-panel__inner">
          <div className="nvz-hero-badge">🇮🇳 FESTIVE COLLECTION 2026</div>
          <h1 className="nvz-hero-title">
            <span className="nvz-hero-celebrate">Celebrate</span>{" "}
            <span className="nvz-hero-every-moment">Freedom.</span>
            <br />
            <span className="nvz-hero-highlight">Cherish Family.</span>
          </h1>
          <p className="nvz-hero-subtitle">
            Discover handcrafted ethnic wear for Raksha Bandhan and Independence Dayspecial celebration.
          </p>
          <ul className="nvz-hero-features">
            {features.map((feature) => (
              <li key={feature}>
                <span>✓</span>
                {feature}
              </li>
            ))}
          </ul>
          <div className="nvz-hero-actions">
            <button className="nvz-hero-btn nvz-hero-btn--primary" onClick={() => setPage("Shop")}>SHOP NOW</button>
            <button className="nvz-hero-btn nvz-hero-btn--secondary" onClick={() => setPage("Shop")}>EXPLORE COLLECTION</button>
          </div>
        </div>
      </div>
    </section>
  );
}