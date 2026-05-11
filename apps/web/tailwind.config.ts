import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1a1410',
          2: '#4a4239',
          3: '#8a8378',
        },
        paper: {
          DEFAULT: '#fdfbf7',
          2: '#f5f1e8',
          3: '#ebe5d6',
        },
        line: { soft: '#d9d2c2' },
        crimson: {
          DEFAULT: '#b91c1c',
          deep: '#8b0a0a',
        },
        gold: { DEFAULT: '#c98a2b' },
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(26,20,16,0.08)',
        'card-hover': '0 8px 24px rgba(26,20,16,0.16)',
        nav: '0 1px 0 #d9d2c2',
      },
    },
  },
  plugins: [],
}

export default config
