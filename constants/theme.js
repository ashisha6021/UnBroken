// // Dark, minimal, premium theme

// export const COLORS = {
//   // Primary colors
//   background: '#000000',
//   // background:'#FFFFFF',
//   surface: '#0A0A0A',
//   surfaceElevated: '#1A1A1A',
  
//   // Text colors
//   textPrimary: '#FFFFFF', 
//   // textPrimary:'#000000',
//   textSecondary: '#A0A0A0',
//   textMuted: '#606060',
  
//   // Accent colors
//   accent: '#00FF88', // Bright green for success
//   accentDark: '#00CC6F',
  
//   // Status colors
//   success: '#00FF88',
//   successDark: '#00CC6F',
//   warning: '#FFAA00',
//   error: '#FF4444',
//   guilt: '#FF6B6B', // Muted red for partial completion
  
//   // Borders
//   border: '#1F1F1F',
//   borderLight: '#2F2F2F',
  
//   // Overlay
//   overlay: 'rgba(0, 0, 0, 0.8)',
// };

// export const TYPOGRAPHY = {
//   h1: {
//     fontSize: 32,
//     fontWeight: '700',
//     letterSpacing: -0.5,
//   },
//   h2: {
//     fontSize: 24,
//     fontWeight: '700',
//     letterSpacing: -0.3,
//   },
//   h3: {
//     fontSize: 20,
//     fontWeight: '600',
//     letterSpacing: -0.2,
//   },
//   body: {
//     fontSize: 16,
//     fontWeight: '400',
//     lineHeight: 24,
//   },
//   bodySmall: {
//     fontSize: 14,
//     fontWeight: '400',
//     lineHeight: 20,
//   },
//   caption: {
//     fontSize: 12,
//     fontWeight: '400',
//     lineHeight: 16,
//   },
//   button: {
//     fontSize: 16,
//     fontWeight: '600',
//     letterSpacing: 0.5,
//   },
// };

// export const SPACING = {
//   xs: 4,
//   sm: 8,
//   md: 16,
//   lg: 24,
//   xl: 32,
//   xxl: 48,
// };

// export const BORDER_RADIUS = {
//   sm: 4,
//   md: 8,
//   lg: 12,
//   xl: 16,
//   full: 9999,
// };
// ================================
// 🌑 Premium Dark Theme (Luxury UI)
// ================================

export const COLORS = {
  // Backgrounds
  background: "#000000", // AMOLED true black
  surface: "#0D0D0D", // slightly lifted surface
  surfaceElevated: "#151515", // cards & modals
  surfaceSoft: "#1C1C1C", // extra depth layer

  // Text
  textPrimary: "#FFFFFF",
  textSecondary: "rgba(255,255,255,0.72)", // soft premium grey
  textMuted: "rgba(255,255,255,0.45)",

  // Accent (Luxury Green)
  accent: "#00E676", // premium softer green
  accentDark: "#00B85C",

  // Status Colors
  success: "#00E676",
  warning: "#FFB020",
  error: "#FF4D4D",

  guilt: "rgba(255,77,77,0.75)",

  // Borders (Very Subtle)
  border: "rgba(255,255,255,0.08)",
  borderLight: "rgba(255,255,255,0.14)",

  // Overlay
  overlay: "rgba(0,0,0,0.85)",

  // Shadow Helper
  shadow: "rgba(0,0,0,0.6)",
};

// ================================
// ✍️ Premium Typography System
// ================================

export const TYPOGRAPHY = {
  h1: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -1,
  },
  h2: {
    fontSize: 26,
    fontWeight: "700",
    letterSpacing: -0.6,
  },
  h3: {
    fontSize: 21,
    fontWeight: "600",
    letterSpacing: -0.3,
  },

  body: {
    fontSize: 16,
    fontWeight: "400",
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: "400",
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: "500", // premium bold captions
    lineHeight: 16,
    letterSpacing: 0.2,
  },

  button: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
};

// ================================
// 📏 Spacing Scale (Premium Rhythm)
// ================================

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 14, // tighter than 16 = modern look
  lg: 22,
  xl: 30,
  xxl: 44,
};

// ================================
// 🔲 Border Radius (Modern Rounded)
// ================================

export const BORDER_RADIUS = {
  sm: 6,
  md: 12,
  lg: 18,
  xl: 24,
  full: 9999,
};
