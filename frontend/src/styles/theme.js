export const THEME = {
  // Primary greens (mapped to existing keys used across the codebase)
  crimson: "#2F4F3E",        // Primary Forest Green
  crimsonDark: "#445C48",    // Deep Moss Green
  crimsonLight: "#7A8F73",   // Sage Green

  // Golds for accents
  gold: "#C6A86B",           // Muted Gold
  goldLight: "#D8B97D",      // Champagne Gold
  goldDark: "#6A5646",       // Earth Brown (used for darker gold accents)

  // Backgrounds & surfaces
  bg: "#FAF8F4",             // Ivory White
  bgDark: "#F5F1EB",         // Soft Beige
  accent: "#E9EFEA",         // Rain Mist
  bgCard: "#FFFFFF",

  // Typography
  text: "#2E2E2E",           // Charcoal Text
  textMuted: "#6B6B6B",      // Secondary Text
  textLight: "#8d8177",

  // Borders
  border: "#E2DED6",         // Divider
  borderDark: "#D3CBBF",
};

// Responsive utilities
export const BREAKPOINTS = {
  mobile: "320px",
  mobileLg: "480px",
  tablet: "768px",
  tabletLg: "1024px",
  desktop: "1280px",
};

export const RESPONSIVE_PADDING = {
  mobile: "16px",
  mobileLg: "20px",
  tablet: "32px",
  desktop: "40px",
};

export const RESPONSIVE_GRID = {
  mobile: "repeat(2, 1fr)",
  tablet: "repeat(3, 1fr)",
  desktop: "repeat(4, 1fr)",
};
