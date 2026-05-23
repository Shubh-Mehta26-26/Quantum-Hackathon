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
        background: '#030014',
        cardBackground: 'rgba(10, 5, 30, 0.4)',
        neonCyan: '#00f0ff',
        neonPurple: '#d946ef',
        deepPurple: '#1e1b4b',
        glowCyan: 'rgba(0, 240, 255, 0.15)',
        glowPurple: 'rgba(217, 70, 239, 0.15)',
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'cyan-glow': '0 0 15px rgba(0, 240, 255, 0.5)',
        'purple-glow': '0 0 15px rgba(217, 70, 239, 0.5)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        mono: ['Fira Code', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
