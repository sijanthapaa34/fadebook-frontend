// src/theme/theme.ts
// Centralized theme for Barber Reservation App

import { Platform } from 'react-native';

export const theme = {
  colors: {
    // Backgrounds
    background: '#0A0A0A',
    card: 'rgba(24, 24, 27, 0.4)',
    surface: 'rgba(39, 39, 42, 0.3)',
    border: '#27272A',

    // Text
    text: '#FFFFFF',
    textSecondary: '#A1A1AA',
    muted: '#9A9AA3',      // Added for muted text
    placeholder: '#71717A',

    // Brand (barber gold accent)
    primary: '#D4AF37',
    primaryText: '#000000',

    // Status
    success: '#22C55E',
    error: '#EF4444',
    warning: '#F59E0B',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
  },

  radius: {
    sm: 6,
    md: 8,
    lg: 12,
  },

  fonts: {
    sans: Platform.OS === 'ios' ? 'Helvetica' : 'Roboto',
    serif: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    mono: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },

  typography: {
    h1: { fontSize: 28, fontWeight: '700' as const },
    h2: { fontSize: 22, fontWeight: '700' as const },
    h3: { fontSize: 18, fontWeight: '600' as const },
    body: { fontSize: 14, fontWeight: '400' as const },
    small: { fontSize: 12, fontWeight: '400' as const },
    button: { fontSize: 14, fontWeight: '600' as const },
  },

  layout: {
    maxWidth: 448,
  },
} as const;

export type AppTheme = typeof theme;
