/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
        display: ['var(--font-playfair)']
      },
      colors: {
        // Cocktail-inspired color palette
        mixology: {
          dark: '#121212',
          surface: '#1e1e1e',
          elevated: '#2a2a2a',
          whiskey: '#d4b483',
          copper: '#7b5e57',
          bitters: '#c75146',
          botanicals: '#618985',
          ice: '#e8f1f2'
        },
        blue: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        indigo: {
          50: '#eef2ff',
          100: '#e0e7ff', 
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        purple: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff', 
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
      },
      backgroundImage: {
        'cocktail-pattern': "url('/images/cocktail-pattern.png')",
        'bar-texture': "url('/images/bar-texture.jpg')",
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        pour: {
          '0%': { height: '0%', opacity: '0.7' },
          '100%': { height: '100%', opacity: '1' },
        },
        bubble: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '1' },
          '100%': { transform: 'translateY(-50px) scale(0)', opacity: '0' },
        },
        messageIn: {
          '0%': { opacity: '0', transform: 'scale(0.95) translateY(5px)' },
          '50%': { opacity: '1' },
          '100%': { opacity: '1', transform: 'scale(1) translateY(0)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards',
        shimmer: 'shimmer 3s infinite linear',
        pour: 'pour 1.5s ease-out forwards',
        bubble: 'bubble 2s ease-out infinite',
        messageIn: 'messageIn 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
        fadeOut: 'fadeOut 0.3s ease-out forwards',
        spin: 'spin 1.5s linear infinite',
      },
      boxShadow: {
        'inner-glow': 'inset 0 0 20px rgba(255, 255, 255, 0.05)',
        'glossy': '0 10px 30px -10px rgba(0, 0, 0, 0.8)',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionTimingFunction: {
        'bounce': 'cubic-bezier(0.2, 0.8, 0.2, 1)',
      },
    },
  },
  plugins: [],
} 