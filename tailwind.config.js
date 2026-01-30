/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cosmic-bg': '#0b0d17',
        'cosmic-card': '#161b2e',
        'cosmic-accent': '#7b2cbf',
        'cosmic-text': '#e0e1dd',
        'trade-win': '#00ff41',
        'trade-loss': '#ff0033',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}