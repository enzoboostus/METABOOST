export const Colors = {
  background: '#0A1128',        // Deep Night Blue
  card: '#1C2541',              // Dark Slate Blue
  surface: '#243057',           // slightly lighter card
  cardBorder: 'rgba(255,255,255,0.08)',
  text: 'rgba(255,255,255,0.92)',
  textSecondary: 'rgba(255,255,255,0.50)',
  textTertiary: 'rgba(255,255,255,0.28)',
  accent: '#E2D1B3',            // Champagne Métallisé
  accentLight: 'rgba(226,209,179,0.15)',
  teal: '#00C8D4',
  tealLight: 'rgba(0,200,212,0.12)',
  red: '#FF3B30',
  success: '#2DC674',
  warning: '#FF9A00',
  avatarDark: '#060E1C',
  // legacy compat
  primary: 'rgba(255,255,255,0.92)',
  primaryLight: 'rgba(255,255,255,0.50)',
  cyan: '#00C8D4',
  cyan2: '#00C8D4',
  gold: '#F5C542',
  accentGreen: '#2DC674',
  accentOrange: '#FF9A00',
  error: '#FF3B30',
  textMuted: 'rgba(255,255,255,0.28)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 999,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 14,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.14,
    shadowRadius: 28,
    elevation: 10,
  },
};
