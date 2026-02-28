/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      colors: {
        jiu: {
          primary: '#1e3a8a', // Blue 900
          secondary: '#171717', // Neutral 900
          accent: '#dc2626', // Red 600
          light: '#f3f4f6', // Gray 100
          dark: '#0f172a', // Slate 900 (Dark Mode BG)
          surface: '#1e293b', // Slate 800 (Dark Mode Surface)
        }
      }
    }
  },
  plugins: [],
}
