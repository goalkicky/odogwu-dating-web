export const theme = {
  colors: {
    primary: '#FF375F',
    primaryDark: '#E03050',
    primaryLight: '#FF6B8A',
    secondary: '#6C63FF',
    secondaryDark: '#5A52E0',
    accent: '#FFD700',

    background: '#0D0D0D',
    surface: '#1A1A1A',
    surfaceLight: '#242424',
    card: '#1E1E1E',

    text: '#FFFFFF',
    textSecondary: '#ABABAB',
    textTertiary: '#6B6B6B',
    textInverse: '#000000',

    success: '#34C759',
    error: '#FF3B30',
    warning: '#FF9500',
    info: '#007AFF',

    like: '#34C759',
    dislike: '#FF3B30',
    superlike: '#007AFF',
    boost: '#AF52DE',

    border: '#2A2A2A',
    divider: '#1C1C1C',
    overlay: 'rgba(0,0,0,0.6)',
    glass: 'rgba(255,255,255,0.08)',
    glassBorder: 'rgba(255,255,255,0.12)',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  typography: {
    huge: { fontSize: 48, lineHeight: 56, fontWeight: '800' as const },
    heading1: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const },
    heading2: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const },
    heading3: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
    body: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
    bodyBold: { fontSize: 16, lineHeight: 24, fontWeight: '600' as const },
    caption: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
    captionBold: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
    small: { fontSize: 12, lineHeight: 16, fontWeight: '400' as const },
    button: { fontSize: 17, lineHeight: 22, fontWeight: '600' as const },
  },

  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 3,
    },
    md: {
      shadowColor: '#FF375F',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 6,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 10,
    },
    glow: {
      shadowColor: '#FF375F',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 8,
    },
  },
};

export type Theme = typeof theme;
export default theme;
