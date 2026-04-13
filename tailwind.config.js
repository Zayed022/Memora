/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        ink: {
          50:  '#f7f6f2',
          100: '#eeecea',
          200: '#d9d6d0',
          300: '#b8b3aa',
          400: '#928c82',
          500: '#716b61',
          600: '#5a5449',
          700: '#47413a',
          800: '#2e2a24',
          900: '#1a1714',
          950: '#0d0b09',
        },
        violet: {
          50:  '#f3f0ff',
          100: '#e4dcff',
          200: '#ccbdff',
          300: '#a98eff',
          400: '#8b61fd',
          500: '#7340f5',
          600: '#6325e8',
          700: '#531ccc',
          800: '#431aa6',
          900: '#361784',
        },
        sage: {
          50:  '#f0f5f0',
          100: '#ddeadd',
          200: '#b8d4b8',
          300: '#8ab98a',
          400: '#5e9c5e',
          500: '#3d7e3d',
          600: '#2e6530',
          700: '#254f27',
          800: '#1d3e1e',
          900: '#152e16',
        },
        amber: {
          50:  '#fffbeb',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'fade-in': 'fadeIn 0.3s ease forwards',
        'slide-in': 'slideIn 0.3s ease forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-10px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
