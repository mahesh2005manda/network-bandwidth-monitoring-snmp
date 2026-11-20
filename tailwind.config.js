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
        network: {
          bg: '#0a0f1d',
          card: '#111827',
          cardHover: '#1f2937',
          border: '#1e293b',
          muted: '#94a3b8',
          cyan: '#06b6d4',
          blue: '#3b82f6',
          normal: '#10b981',
          warning: '#f59e0b',
          critical: '#ef4444'
        }
      },
      fontFamily: {
        mono: ['Fira Code', 'JetBrains Mono', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
