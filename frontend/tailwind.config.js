/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Brand primary palette - centered around brand color #E60067
        primary: {
          DEFAULT: '#E91274', // dùng cho bg-primary, text-primary, border-primary...
          50: '#fff0f7',
          100: '#ffd9eb',
          200: '#ffb3d6',
          300: '#ff7fb3',
          400: '#ff3385',
          500: '#E91274',  // ← brand chính
          600: '#c50058',
          700: '#a30047',
          800: '#800039',
          900: '#5d002a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'pulse-soft': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.03)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
