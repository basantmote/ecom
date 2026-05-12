import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: { DEFAULT: '#1a1410', 2: '#4a4239', 3: '#8a8378' },
        paper: { DEFAULT: '#fdfbf7', 2: '#f5f1e8', 3: '#ebe5d6' },
        line: { soft: '#d9d2c2' },
        crimson: { DEFAULT: '#b91c1c', deep: '#8b0a0a' },
        gold: { DEFAULT: '#c98a2b' },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 4px rgba(26,20,16,0.06), 0 4px 12px rgba(26,20,16,0.06)',
        glow: '0 0 24px rgba(185,28,28,0.25)',
        'glow-green': '0 0 24px rgba(34,197,94,0.35)',
        float: '0 20px 60px rgba(26,20,16,0.2)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fadeIn 0.4s ease both',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}

export default config
