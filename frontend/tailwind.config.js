/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        slate: {
          950: '#020617',
        },
        brand: {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1.1rem', letterSpacing: '0.01em' }],
        sm: ['0.8125rem', { lineHeight: '1.25rem', letterSpacing: '0.005em' }],
        base: ['0.875rem', { lineHeight: '1.5rem' }],
        lg: ['1rem', { lineHeight: '1.6rem' }],
        xl: ['1.125rem', { lineHeight: '1.7rem', letterSpacing: '-0.006em' }],
        '2xl': ['1.375rem', { lineHeight: '1.85rem', letterSpacing: '-0.012em' }],
        '3xl': ['1.75rem', { lineHeight: '2.1rem', letterSpacing: '-0.016em' }],
        '4xl': ['2.25rem', { lineHeight: '2.6rem', letterSpacing: '-0.02em' }],
      },
      boxShadow: {
        soft: '0 10px 40px -18px rgba(15, 23, 42, 0.35)',
        xs: '0 1px 2px rgba(15, 23, 42, 0.06)',
        card: '0 1px 2px rgba(15, 23, 42, 0.04), 0 8px 24px -12px rgba(15, 23, 42, 0.12)',
        'card-hover': '0 4px 10px rgba(15, 23, 42, 0.06), 0 16px 36px -14px rgba(15, 23, 42, 0.18)',
        glow: '0 0 0 1px rgba(79, 70, 229, 0.12), 0 8px 24px -8px rgba(79, 70, 229, 0.35)',
        'focus-ring': '0 0 0 3px rgba(99, 102, 241, 0.28)',
      },
      borderRadius: {
        xl2: '0.875rem',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        shimmer: 'shimmer 1.6s linear infinite',
      },
      backgroundImage: {
        'grid-slate': 'linear-gradient(to right, rgba(15,23,42,0.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.035) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
