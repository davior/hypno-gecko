/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Nocturnal base — deep, calm, low-stimulation
        night: {
          950: '#070711',
          900: '#0c0c1a',
          800: '#13132440',
          700: '#1c1c33',
          600: '#2a2a47',
          500: '#3a3a5c',
        },
        // Entrainment accents — warm (theta/delta) → cool (beta/gamma)
        ember: '#f6a657',
        rose: '#e8748c',
        violet: '#9b8cf0',
        cyan: '#6fd6e6',
        mint: '#7fe0b8',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        'pulse-soft': {
          '0%, 100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
        breathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
      },
      animation: {
        'pulse-soft': 'pulse-soft 4s ease-in-out infinite',
        breathe: 'breathe 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
