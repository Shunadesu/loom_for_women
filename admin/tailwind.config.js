/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E60067',
          50: '#fff0f7',
          100: '#ffd9eb',
          200: '#ffb3d6',
          300: '#ff7fb3',
          400: '#ff3385',
          500: '#E60067',
          600: '#c50058',
          700: '#a30047',
          800: '#800039',
          900: '#5d002a',
        },
      },
    },
  },
  plugins: [],
};
