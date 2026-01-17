// Dark, minimal, premium theme

export const COLORS = {
  // Primary colors
  background: '#000000',
  surface: '#0A0A0A',
  surfaceElevated: '#1A1A1A',
  
  // Text colors
  textPrimary: '#FFFFFF',
  textSecondary: '#A0A0A0',
  textMuted: '#606060',
  
  // Accent colors
  accent: '#00FF88', // Bright green for success
  accentDark: '#00CC6F',
  
  // Status colors
  success: '#00FF88',
  successDark: '#00CC6F',
  warning: '#FFAA00',
  error: '#FF4444',
  guilt: '#FF6B6B', // Muted red for partial completion
  
  // Borders
  border: '#1F1F1F',
  borderLight: '#2F2F2F',
  
  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
};

export const TYPOGRAPHY = {
  h1: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    lineHeight: 24,
  },
  bodySmall: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 20,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 16,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};
