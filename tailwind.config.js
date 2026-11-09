/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        haven: {
          50: '#fdfbf7',
          100: '#f7f2e7',
          200: '#eee3cd',
          300: '#dfcfa7',
          400: '#cbb37a',
          500: '#b89955',
          600: '#9d7c41',
          700: '#7e6135',
          800: '#674f30',
          900: '#56422b',
          950: '#322517',
        },
        cozyGreen: {
          50: '#f2f9f4',
          100: '#e1f2e6',
          200: '#c5e5cf',
          300: '#98d1a8',
          400: '#64b67b',
          500: '#3f9a58',
          600: '#2f7d45',
          700: '#276339',
          800: '#234f30',
          900: '#1e4129',
        },
        cozyWood: {
          light: '#d2b48c',
          DEFAULT: '#8b5a2b',
          dark: '#5c3a1e',
          board: '#f5deb3',
        },
      },
      fontFamily: {
        cozy: ['Quicksand', 'Nunito', 'Segoe UI', 'sans-serif'],
        pixel: ['"Press Start 2P"', 'monospace'],
      },
      boxShadow: {
        cozy: '0 8px 30px rgba(92, 58, 30, 0.12)',
        'cozy-lg': '0 12px 40px rgba(92, 58, 30, 0.18)',
        pixel: '3px 3px 0px rgba(60, 40, 20, 0.8)',
      },
    },
  },
  plugins: [],
};
