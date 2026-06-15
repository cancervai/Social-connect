import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        base: '#0A0A0F',
        surface: '#111118',
        raised: '#1A1A24',
        overlay: '#22222E',
        border: {
          DEFAULT: '#2A2A38',
          subtle: '#1E1E28',
          strong: '#3A3A50',
        },
        text: {
          primary: '#F1F1F7',
          secondary: '#A0A0B8',
          muted: '#6B6B82',
          inverse: '#0A0A0F',
        },
        accent: {
          purple: '#7C3AED',
          'purple-light': '#8B5CF6',
          'purple-dim': 'rgba(124,58,237,0.15)',
          cyan: '#06B6D4',
          'cyan-light': '#22D3EE',
          'cyan-dim': 'rgba(6,182,212,0.15)',
        },
        meta: '#1877F2',
        instagram: '#E1306C',
        linkedin: '#0A66C2',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        surface: '0 0 0 1px rgba(255,255,255,0.06), 0 4px 24px rgba(0,0,0,0.4)',
        raised: '0 0 0 1px rgba(255,255,255,0.08), 0 8px 40px rgba(0,0,0,0.6)',
        glow: '0 0 0 2px rgba(124,58,237,0.4)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'scale-in': { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
        shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
      },
      animation: {
        'fade-in': 'fade-in 150ms ease-out',
        'scale-in': 'scale-in 150ms ease-out',
        shimmer: 'shimmer 1.5s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
