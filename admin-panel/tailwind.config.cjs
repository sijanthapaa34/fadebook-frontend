/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Backgrounds
        background: '#0A0A0A',
        card: 'rgba(24, 24, 27, 0.4)',
        surface: 'rgba(39, 39, 42, 0.3)',
        border: '#27272A',

        // Text
        foreground: '#FFFFFF',
        muted: '#9A9AA3',
        
        // Brand (Barber Gold)
        primary: {
          DEFAULT: '#D4AF37',
          foreground: '#000000',
        },

        // Status
        destructive: '#EF4444',
        success: '#22C55E',
        warning: '#F59E0B',
      },
      borderRadius: {
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
    },
  },
  plugins: [],
};