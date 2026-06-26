/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        gold: {
          DEFAULT: '#fbbf24', // amber-400
          dim: '#d97706',
        },
        home: { DEFAULT: '#38bdf8' },  // sky-400 — home team bars
        away: { DEFAULT: '#fb7185' },  // rose-400 — away team bars
        draw: { DEFAULT: '#52525b' },  // zinc-600 — draw bars
        ink: {
          900: '#0c0e13',
          800: '#11141b',
          700: '#171b24',
        },
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}
