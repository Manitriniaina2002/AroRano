/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e6f0ff',
          200: '#bfe0ff',
          300: '#99caff',
          400: '#4d94ff',
          500: '#0066cc',
          600: '#0052a3',
          700: '#003d7a',
          800: '#002a52',
          900: '#001a33',
        },
        secondary: {
          50: '#f0fdf4',
          100: '#e6f5e6',
          200: '#ccebcc',
          300: '#99d799',
          400: '#66b366',
          500: '#388e3c',
          600: '#2e7d32',
          700: '#1b5e20',
          800: '#0d3b0f',
          900: '#051a05',
        },
      },
      fontFamily: {
        sans: ['system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
