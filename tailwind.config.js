/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
          950: '#022c22',
        },
        gold: {
          50: '#fbf9f1',
          100: '#f5f0dc',
          200: '#ece1b9',
          300: '#dfcc8e',
          400: '#d1b463',
          500: '#c59d43',
          600: '#aa8035',
          700: '#88622c',
          800: '#714f29',
          900: '#5f4227',
        },
        parchment: {
          50: '#fdfcf7',
          100: '#faf7ee',
          200: '#f4eedb',
          300: '#ebe0c2',
        }
      },
      fontFamily: {
        arabic: ['"Amiri"', '"Scheherazade New"', 'Traditional Arabic', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
