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
        'cosmic-accent': '#3b82f6', // Changed from Purple (#7b2cbf) to Cosmic Blue
        'cosmic-text': '#e0e1dd',
        'trade-win': '#00ff41',
        'trade-loss': '#ff0033',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
      boxShadow: {
        'neon': '0 0 5px theme("colors.cosmic-accent"), 0 0 20px theme("colors.cosmic-accent")',
      }
    },
  },
  plugins: [],
}