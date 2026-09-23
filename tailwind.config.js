/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        clay: {
          bg: '#F5F3FF',
          card: '#FFFFFF',
          purple: '#7C3AED',
          indigo: '#6366F1',
          lavender: '#EDE9FE',
          blue: '#DBEAFE',
          mint: '#DCFCE7',
          peach: '#FFEDD5',
          rose: '#FEE2E2',
          text: '#1E293B',
          muted: '#64748B',
        },
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'clay-card': '8px 8px 16px rgba(180, 175, 205, 0.35), -8px -8px 20px rgba(255, 255, 255, 0.95)',
        'clay-card-hover': '12px 12px 24px rgba(170, 165, 200, 0.45), -10px -10px 24px rgba(255, 255, 255, 1)',
        'clay-sm': '4px 4px 10px rgba(180, 175, 205, 0.3), -4px -4px 10px rgba(255, 255, 255, 0.9)',
        'clay-btn': '6px 6px 12px rgba(170, 165, 195, 0.35), -5px -5px 10px rgba(255, 255, 255, 0.9)',
        'clay-btn-active': 'inset 3px 3px 6px rgba(170, 165, 195, 0.4), inset -3px -3px 6px rgba(255, 255, 255, 0.8)',
        'clay-input': 'inset 3px 3px 6px rgba(180, 175, 205, 0.25), inset -3px -3px 6px rgba(255, 255, 255, 0.9)',
        'clay-badge': '3px 3px 6px rgba(180, 175, 205, 0.2), -3px -3px 6px rgba(255, 255, 255, 0.8)',
      },
    },
  },
  plugins: [],
};
