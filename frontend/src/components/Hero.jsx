import { useState, useEffect, useRef } from "react";
import bannerClozzet from "../assets/images/banner-clozzet.jpeg";
import bannerClozzetMobile from "../assets/images/banner-clozzet-mobile.jpeg";
import bannerImage from "../assets/images/banner.jpeg";
import bannerImageMobile from "../assets/images/banner-mobile.jpeg";
import { fixImageUrl } from "../utils/imageUrl";

// Add / remove images here to control what shows in the rotating banner.
// Order matters: this is the order they'll cycle through.
// showTextOverlay: false for images (like the Clozzet banner) that already
// have their own text/branding baked in — set true only for plain photo
// banners that need the "Celebrate Ganesh Chaturthi..." text drawn on top on DESKTOP.
// mobileSrc: optional — a separate image shown only on small screens
// (<=767px). On mobile every slide is cropped to the same fixed height so
// the two slide types look consistent, and mobilePanel (below) supplies
// the on-mobile badge/title/subtitle/buttons for that slide.
// mobilePanel: content shown in the rounded card under the image on mobile.
// Every slide should define this so mobile always looks consistent.
const BANNER_SLIDES = [
  {
    // FIRST — GANESH CHATURTHI
    src: bannerImage,
    mobileSrc: bannerImageMobile,
    showTextOverlay: true,
    alt: "Ganesh Chaturthi festive collection",
    // Full uncropped photo on mobile. The photo itself already fades to
    // blank cream near the bottom, so the solid card floats over that
    // fade instead of sitting after it (avoids double blank space).
    mobileImageFit: "natural",
    mobilePanelVariant: "overlay-solid",
    mobilePanel: {
      badge: "🐘 GANESH CHATURTHI SPECIAL 2026",
      title: (
        <>
          <span className="nvz-hero-celebrate">Celebrate</span>{" "}
          <span className="nvz-hero-every-moment">Ganesh Chaturthi.</span>
          <br />
          <span className="nvz-hero-highlight">Cherish Traditions.</span>
        </>
      ),
      subtitle:
        "Discover handcrafted ethnic wear to celebrate Ganesh Chaturthi and every festive occasion.",
      primaryLabel: "SHOP NOW",
      secondaryLabel: "EXPLORE COLLECTION",
    },
  },
  {
    // SECOND — CLOZZET
    src: bannerClozzet,
    mobileSrc: bannerClozzetMobile,
    showTextOverlay: false,
    alt: "Nouveau x Clozzet - your style delivered in 60 minutes",
    // Full, uncropped photo on mobile. No overlay panel/buttons here —
    // the photo already has its own "Download Clozzet App" CTA baked
    // in, so a second button set just clashed with it.
    mobileImageFit: "natural",
  },
];
const BANNER_INTERVAL_MS = 5000;
const SLIDE_TRANSITION_MS = 550;

export default function Hero({ setPage }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 767
  );
  const [mobileHeight, setMobileHeight] = useState(null);
  const slideRefs = useRef([]);
  const imageRefs = useRef([]);
  const panelRefs = useRef([]);
  const timerRef = useRef(null);
  const currentSlide = BANNER_SLIDES[activeSlide];
  const hasMultipleSlides = BANNER_SLIDES.length > 1;

  // Track viewport so we know whether to use each slide's mobileSrc.
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(max-width: 767px)");
    const handleChange = (e) => setIsMobile(e.matches);
    setIsMobile(mq.matches);
    if (mq.addEventListener) mq.addEventListener("change", handleChange);
    else mq.addListener(handleChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", handleChange);
      else mq.removeListener(handleChange);
    };
  }, []);

  // Auto-rotate. Restarted (not just left running) whenever the user
  // navigates manually, so a click doesn't get immediately undone by the
  // timer firing a moment later.
  const startTimer = () => {
    clearInterval(timerRef.current);
    if (!hasMultipleSlides) return;
    timerRef.current = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % BANNER_SLIDES.length);
    }, BANNER_INTERVAL_MS);
  };

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const goToSlide = (index) => {
    setActiveSlide(index);
    startTimer();
  };
  const goPrev = () => goToSlide((activeSlide - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length);
  const goNext = () => goToSlide((activeSlide + 1) % BANNER_SLIDES.length);

  // On mobile, each slide can have a very different height. For overlay
  // slides, the panel is position:absolute (floats over the image) so it
  // does NOT add to normal document flow — if we only measured the
  // container, a panel taller than its image would get clipped and end
  // up covering the whole image. So we measure the image and the panel
  // separately and use whichever is taller (for overlay slides), or
  // their sum (for normal-flow "solid panel below image" slides).
  useEffect(() => {
    if (!isMobile) {
      setMobileHeight(null);
      return undefined;
    }
    const slide = BANNER_SLIDES[activeSlide];
    const imgEl = imageRefs.current[activeSlide];
    const panelEl = panelRefs.current[activeSlide];
    const isOverlay = slide.mobilePanelVariant === "overlay" || slide.mobilePanelVariant === "overlay-solid";

    const measure = () => {
      const imgHeight = imgEl ? imgEl.getBoundingClientRect().height : 0;
      const panelHeight = panelEl ? panelEl.scrollHeight : 0;
      const total = isOverlay ? Math.max(imgHeight, panelHeight) : imgHeight + panelHeight;
      if (total > 0) setMobileHeight(total);
    };
    measure();

    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(measure);
    if (imgEl) ro.observe(imgEl);
    if (panelEl) ro.observe(panelEl);
    return () => ro.disconnect();
  }, [activeSlide, isMobile]);

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
    <section
      className="nvz-hero-banner"
      aria-label="Featured banner"
      style={
        isMobile
          ? {
              height: mobileHeight ? `${mobileHeight}px` : undefined,
              transition: `height ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`,
              overflow: "hidden",
            }
          : undefined
      }
    >
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
          background: linear-gradient(90deg, rgba(139,30,45,.08), rgba(248,227,229,.08), rgba(198,161,91,.05));
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
          background: #E58AA8;
          box-shadow: 0 0 16px rgba(139, 30, 45, 0.18);
        }

        .nvz-particle--sparkle {
          background: #FDE7F0;
          box-shadow: 0 0 12px rgba(248, 221, 225, 0.3);
        }

        .nvz-particle--leaf {
          background: #C6A15B;
          border-radius: 999px 0 999px 0;
          transform: rotate(-18deg);
          box-shadow: 0 0 16px rgba(79, 138, 69, 0.16);
        }

        .nvz-hero-track {
          display: flex;
          width: 100%;
          height: 100%;
          transition: transform ${SLIDE_TRANSITION_MS}ms cubic-bezier(0.65, 0, 0.35, 1);
        }

        .nvz-hero-slide {
          position: relative;
          flex: 0 0 100%;
          width: 100%;
          height: 100%;
        }

        .nvz-hero-banner__image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          object-position: center;
          background-color: #111111;
        }

        .nvz-hero-dots {
          position: absolute;
          bottom: 18px;
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          gap: 8px;
          z-index: 5;
        }

        .nvz-hero-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: rgba(255,255,255,0.45);
          cursor: pointer;
          padding: 0;
          border: none;
          transition: background 220ms ease, transform 220ms ease;
        }

        .nvz-hero-dot.is-active {
          background: #FFFFFF;
          transform: scale(1.2);
        }

        .nvz-hero-arrow {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 5;
          width: 40px;
          height: 40px;
          border-radius: 999px;
          border: none;
          background: rgba(17, 17, 17, 0.35);
          color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          transition: background 220ms ease, transform 220ms ease;
        }

        .nvz-hero-arrow:hover {
          background: rgba(17, 17, 17, 0.6);
        }

        .nvz-hero-arrow:active {
          transform: translateY(-50%) scale(0.92);
        }

        .nvz-hero-arrow svg {
          width: 20px;
          height: 20px;
        }

        .nvz-hero-arrow--prev {
          left: 16px;
        }

        .nvz-hero-arrow--next {
          right: 16px;
        }

        .nvz-hero-quick-actions {
          position: absolute;
          left: 56px;
          bottom: 44px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          padding: 8px;
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 18px;
          background: rgba(255, 238, 246, 0.78);
          box-shadow: 0 12px 28px rgba(92, 59, 77, 0.16);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          z-index: 6;
        }

        .nvz-hero-quick-actions .nvz-hero-btn {
          min-width: 148px;
          min-height: 48px;
          box-shadow: 0 6px 16px rgba(92, 59, 77, 0.15);
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
          color: #E58AA8;
          letter-spacing: 3px;
          line-height: 0.85;
        }

        .nvz-hero-brand-name span {
          color: #C6A15B;
        }

        .nvz-hero-brand-tagline {
          font-family: 'Poppins', sans-serif;
          font-size: 19px;
          letter-spacing: 4px;
          text-transform: uppercase;
          color: #D8BD7A;
          font-weight: 700;
          margin-top: 6px;
          margin-left: 12px;        
        }

        /* Wraps the desktop text block so we can drop a soft scrim
           behind it — the banner photo underneath is busy (drums,
           florals, illustration), so raw text on top of it loses
           contrast. The scrim fades out toward the right so it
           doesn't cover the rest of the artwork. */
        .nvz-hero-content {
          position: relative;
          max-width: 420px;
          width: 100%;
          padding-left: 24px;
          pointer-events: auto;
          opacity: 0;
          transform: translateY(24px);
          animation: nvz-hero-fade-up 700ms ease forwards;
        }

        .nvz-hero-content::before {
          content: '';
          position: absolute;
          inset: -28px -40px -28px -28px;
          background: linear-gradient(
            90deg,
              rgba(250, 242, 240, 0.96) 0%,
              rgba(249, 232, 237, 0.88) 55%,
              rgba(250, 242, 240, 0) 100%
          display: inline-block;
          margin-bottom: 14px;
          padding: 8px 14px;
          border-radius: 999px;
          background: linear-gradient(90deg, rgba(139,30,45,0.95), rgba(248,227,229,0.92), rgba(198,161,91,0.95));
          color: #FFFFFF;
          font-size: 11px;
          letter-spacing: 1.6px;
          text-transform: uppercase;
          font-weight: 600;
          font-family: 'Poppins', 'Inter', sans-serif;
          box-shadow: 0 8px 24px rgba(139, 30, 45, 0.18), 0 0 18px rgba(79, 138, 69, 0.12);
        }

        .nvz-hero-title {
          font-family: 'Cormorant Garamond', 'Playfair Display', serif;
          font-size: clamp(34px, 3.2vw, 54px);
          line-height: 1.02;
          margin: 0 0 16px;
          color: #3A2525;
          font-weight: 700;
        }

        .nvz-hero-title .nvz-hero-celebrate {
          color: #8B1E2D;
          display: inline;
        }

        .nvz-hero-title .nvz-hero-every-moment {
          color: #C6A15B;
          display: inline;
        }

        .nvz-hero-title .nvz-hero-highlight {
          color: #C6A15B;
          display: inline-block;
        }

        .nvz-hero-subtitle {
          font-family: 'Poppins', 'Inter', sans-serif;
          font-size: 15px;
          line-height: 1.75;
          color: #3A2525;
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
          color: #3A2525;
          font-weight: 600;
          transition: color 220ms ease;
        }

        .nvz-hero-features li span {
          color: #C6A15B;
          font-size: 14px;
          transition: color 220ms ease;
        }

        .nvz-hero-features li:hover {
          color: #C6A15B;
        }

        .nvz-hero-features li:hover span {
          color: #C6A15B;
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
          padding: 14px 24px;
          font-family: 'Poppins', 'Inter', sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: transform 300ms ease, background 300ms ease, color 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
          cursor: pointer;
        }

        .nvz-hero-btn--primary {
          background: linear-gradient(135deg, #C95780, #E58AA8);
          color: #FFFFFF;
          border: 1px solid rgba(255,255,255,0.65);
          text-shadow: 0 1px 2px rgba(92, 59, 77, 0.22);
        }

        .nvz-hero-btn--secondary {
          background: rgba(255, 255, 255, 0.96);
          color: #B94D76;
          border: 2px solid #D76E96;
        }

        .nvz-hero-btn:hover {
          transform: translateY(-2px) scale(1.03);
        }

        .nvz-hero-btn--primary:hover {
          box-shadow: 0 14px 30px rgba(185, 77, 118, 0.3);
        }

        .nvz-hero-btn--secondary:hover {
          background: #E58AA8;
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
            background: #111111;
          }

          .nvz-hero-track {
            height: auto;
            align-items: flex-start;
          }

          .nvz-hero-slide {
            height: auto;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }

          .nvz-hero-banner__image {
            position: static;
            width: 100%;
            height: 230px;
            object-fit: cover;
            object-position: right center;
            border-radius: 0;
            filter: brightness(0.9) contrast(0.98) saturate(0.96);
          }

          .nvz-hero-banner__image--natural {
            height: auto;
            filter: none;
            object-fit: contain;
            object-position: top center;
            padding-top: 16px;
            background: #FAF2F0;
            box-sizing: border-box;
          }

          .nvz-hero-arrow {
            width: 34px;
            height: 34px;
          }

          .nvz-hero-arrow svg {
            width: 16px;
            height: 16px;
          }

          .nvz-hero-overlay {
            display: none;
          }

          .nvz-hero-quick-actions {
            left: 16px;
            right: 16px;
            bottom: 18px;
            display: flex;
            gap: 10px;
            padding: 7px;
            border-radius: 18px;
          }

          .nvz-hero-quick-actions .nvz-hero-btn {
            flex: 1 1 0;
            min-width: 0;
            min-height: 46px;
            padding: 12px 10px;
            font-size: 11px;
            letter-spacing: 0.06em;
          }

          .nvz-hero-mobile-panel {
            display: block;
            position: relative;
            width: 100%;
            margin-top: 0;
            padding: 22px 18px 38px;
            background: linear-gradient(180deg, rgba(248,227,229,0.96) 0%, rgba(242,205,210,0.98) 100%);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border-radius: 28px 28px 0 0;
            z-index: 2;
            margin-top: -20px;
            box-shadow: 0 -14px 32px rgba(139, 30, 45, 0.08);
            border-top: 1px solid rgba(139, 30, 45, 0.12);
          }

          /* Floats over the bottom of a --natural image instead of
             pushing it down, so the full photo stays visible behind it. */
          .nvz-hero-mobile-panel--overlay {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            margin-top: 0;
            padding: 40px 18px 22px;
            background: linear-gradient(180deg, rgba(35,22,14,0) 0%, rgba(35,22,14,0.55) 40%, rgba(35,22,14,0.8) 75%, rgba(35,22,14,0.85) 100%);
            backdrop-filter: none;
            -webkit-backdrop-filter: none;
            border-radius: 0;
            box-shadow: none;
            border-top: none;
          }

          .nvz-hero-mobile-panel--overlay .nvz-hero-title,
          .nvz-hero-mobile-panel--overlay .nvz-hero-subtitle {
            color: #FFFFFF;
          }

          .nvz-hero-mobile-panel--overlay .nvz-hero-title .nvz-hero-celebrate {
            color: #F8E3E5;
          }

          /* Floats over the bottom of a --natural image (which already
             fades to blank cream) with the same solid rounded-card look
             as the normal-flow panel, so there's no double blank gap. */
          .nvz-hero-mobile-panel--overlay-solid {
            position: absolute;
            left: 0;
            right: 0;
            bottom: 0;
            margin-top: 0;
            padding: 22px 18px 38px;
            background: linear-gradient(180deg, rgba(255,249,243,0) 0%, rgba(255,249,243,0.85) 18%, rgba(248,227,229,0.98) 45%, rgba(248,227,229,0.99) 100%);
            border-radius: 0;
            box-shadow: none;
            border-top: none;
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
            background: linear-gradient(90deg, rgba(139,30,45,0.95), rgba(252,236,239,0.96), rgba(79,138,69,0.95));
            color: #FFFFFF;
          }

          .nvz-hero-title {
            font-family: 'Playfair Display', serif;
            font-size: 23px;
            line-height: 1.15;
            text-align: center;
            max-width: 100%;
            margin: 0;
            color: #3A2525;
            white-space: normal;
          }

          .nvz-hero-title .nvz-hero-celebrate {
            color: #E58AA8;
            display: inline;
          }

          .nvz-hero-title .nvz-hero-every-moment {
            color: #C6A15B;
            display: inline;
          }

          .nvz-hero-title .nvz-hero-highlight {
            display: inline;
            color: #C6A15B;
            font-style: italic;
          }

          .nvz-hero-subtitle {
            font-size: 13px;
            line-height: 1.6;
            color: #3A2525;
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
            color: #C6A15B;
          }

          .nvz-hero-features li:hover span {
            color: #C6A15B;
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
            background: linear-gradient(135deg, #C95780, #E58AA8) !important;
            border-color: rgba(255,255,255,0.75);
            box-shadow: 0 8px 18px rgba(185, 77, 118, 0.28);
            color: #FFFFFF;
          }

          .nvz-hero-btn--secondary {
            background: rgba(255, 255, 255, 0.96) !important;
            color: #B94D76 !important;
            border-color: #D76E96;
            box-shadow: inset 0 0 0 1px rgba(215, 110, 150, 0.12);
          }

          .nvz-hero-btn:hover {
            transform: translateY(-2px) scale(1.02);
          }

          .nvz-hero-btn--secondary:hover {
            background: #E58AA8;
            color: #fff;
          }

          .nvz-hero-btn--primary:hover {
            box-shadow: 0 12px 24px rgba(185, 77, 118, 0.34);
          }

          .nvz-hero-quick-actions .nvz-hero-btn {
            height: 44px;
            min-height: 44px;
            padding: 10px 8px;
            font-size: 10px;
            letter-spacing: 0.05em;
          }

          .nvz-hero-mobile-panel {
            padding-bottom: 32px;
          }

          .nvz-hero-mobile-panel .nvz-hero-actions .nvz-hero-btn--secondary {
            margin-top: 0;
          }
        }
      `}</style>

      <div
        className="nvz-hero-track"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {BANNER_SLIDES.map((slide, index) => {
          // On mobile every slide uses its mobileSrc (if provided) but is
          // always cropped to the same fixed-height treatment, so slides
          // look consistent regardless of the source image's own aspect
          // ratio. The distinguishing content lives in mobilePanel below.
          const effectiveSrc = isMobile && slide.mobileSrc ? slide.mobileSrc : slide.src;
          const isNaturalMobileImage = isMobile && slide.mobileImageFit === "natural";
          const isOverlayPanel = slide.mobilePanelVariant === "overlay";
          const isOverlaySolidPanel = slide.mobilePanelVariant === "overlay-solid";
          return (
            <div
              key={index}
              ref={(el) => (slideRefs.current[index] = el)}
              className="nvz-hero-slide"
            >
              <img
                ref={(el) => (imageRefs.current[index] = el)}
                className={`nvz-hero-banner__image${isNaturalMobileImage ? " nvz-hero-banner__image--natural" : ""}`}
                src={effectiveSrc}
                alt={slide.alt}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
              />

              <div className="nvz-hero-particles" aria-hidden="true">
                {decorativeParticles.map((particle, pIndex) => (
                  <span key={pIndex} className={particle.className} style={particle.style} />
                ))}
              </div>

              {slide.showTextOverlay && (
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
                        <div className="nvz-hero-brand-tagline">Wear Your Aura</div>
                      </div>
                    </div>

                    <h1 className="nvz-hero-title">
                      <span className="nvz-hero-celebrate">Celebrate</span>{" "}
                      <span className="nvz-hero-every-moment">Ganesh Chaturthi.</span>
                      <br />
                      <span className="nvz-hero-highlight">Cherish Traditions.</span>
                    </h1>
                    <p className="nvz-hero-subtitle">
                      Discover handcrafted ethnic wear to celebrate Ganesh Chaturthi and every festive occasion.
                    </p>
                    <ul className="nvz-hero-features">
                      {features.map((feature) => (
                        <li key={feature}>
                          <span>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              <div className="nvz-hero-quick-actions">
                <button className="nvz-hero-btn nvz-hero-btn--primary" onClick={() => setPage("Shop")}>
                  SHOP NOW
                </button>
                <button className="nvz-hero-btn nvz-hero-btn--secondary" onClick={() => setPage("Shop")}>
                  EXPLORE NOW
                </button>
              </div>

              {slide.mobilePanel && (
                <div
                  ref={(el) => (panelRefs.current[index] = el)}
                  className={`nvz-hero-mobile-panel${isOverlayPanel ? " nvz-hero-mobile-panel--overlay" : ""}${isOverlaySolidPanel ? " nvz-hero-mobile-panel--overlay-solid" : ""}`}
                  aria-hidden="false"
                >
                  <div className="nvz-hero-mobile-panel__inner">
                    {slide.mobilePanel.badge && (
                      <div className="nvz-hero-badge">{slide.mobilePanel.badge}</div>
                    )}
                    {slide.mobilePanel.title && (
                      <h1 className="nvz-hero-title">{slide.mobilePanel.title}</h1>
                    )}
                    {slide.mobilePanel.subtitle && (
                      <p className="nvz-hero-subtitle">{slide.mobilePanel.subtitle}</p>
                    )}
                    <ul className="nvz-hero-features">
                      {features.map((feature) => (
                        <li key={feature}>
                          <span>✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <div className="nvz-hero-actions">
                      <button className="nvz-hero-btn nvz-hero-btn--primary" onClick={() => setPage("Shop")}>{slide.mobilePanel.primaryLabel}</button>
                      <button className="nvz-hero-btn nvz-hero-btn--secondary" onClick={() => setPage("Shop")}>{slide.mobilePanel.secondaryLabel}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {hasMultipleSlides && (
        <>
          <button
            type="button"
            className="nvz-hero-arrow nvz-hero-arrow--prev"
            aria-label="Previous banner"
            onClick={goPrev}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            className="nvz-hero-arrow nvz-hero-arrow--next"
            aria-label="Next banner"
            onClick={goNext}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="nvz-hero-dots" role="tablist" aria-label="Banner slides">
            {BANNER_SLIDES.map((_, index) => (
              <button
                key={index}
                type="button"
                className={`nvz-hero-dot${index === activeSlide ? " is-active" : ""}`}
                aria-label={`Show banner ${index + 1}`}
                aria-selected={index === activeSlide}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
