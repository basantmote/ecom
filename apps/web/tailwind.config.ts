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
        'card-hover': '0 8px 24px rgba(26,20,16,0.14), 0 2px 8px rgba(26,20,16,0.08)',
        glow: '0 0 24px rgba(185,28,28,0.25)',
        'glow-gold': '0 0 24px rgba(201,138,43,0.3)',
        float: '0 20px 60px rgba(26,20,16,0.2)',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmerSlide: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(100%)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-up-1': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both',
        'fade-up-2': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both',
        'fade-up-3': 'fadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.35s both',
        'fade-in': 'fadeIn 0.4s ease both',
        marquee: 'marquee 35s linear infinite',
        'marquee-slow': 'marquee 55s linear infinite',
        shimmer: 'shimmerSlide 3s linear infinite',
        'pulse-ring': 'pulseRing 1.5s ease-out infinite',
        float: 'float 3s ease-in-out infinite',
        'slide-up': 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}

export default config
