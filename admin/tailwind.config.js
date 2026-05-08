/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: '#D4AF37',
          light: '#F9E29C',
          dark: '#B8860B',
        },
        black: {
          DEFAULT: '#0A0A0A',
          soft: '#1A1A1A',
        }
      },
    },
  },
  plugins: [],
}
