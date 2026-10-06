/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E91274',
          50: '#fff0f7',
          100: '#ffd9eb',
          200: '#ffb3d6',
          300: '#ff7fb3',
          400: '#ff3385',
          500: '#E91274',
          600: '#c50058',
          700: '#a30047',
          800: '#800039',
          900: '#5d002a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
