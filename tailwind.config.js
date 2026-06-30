/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        'electric-orange': {
          light: '#FF8533',
          DEFAULT: '#FF6B00',
          dark: '#E05E00',
          '10': 'rgba(255,107,0,0.10)',
          '20': 'rgba(255,107,0,0.20)',
        },
        'anthracite-grey': {
          light: '#3A3A48',
          DEFAULT: '#1E1E24',
          dark: '#121216',
          '60': 'rgba(30,30,36,0.60)',
          '30': 'rgba(30,30,36,0.30)',
          '10': 'rgba(30,30,36,0.10)',
        },
        'pure-white': '#FFFFFF',
        'off-white': '#F8F8FA',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'orange-glow': '0 4px 20px rgba(255, 107, 0, 0.35)',
        'orange-glow-lg': '0 8px 30px rgba(255, 107, 0, 0.45)',
        'card': '0 8px 32px rgba(30, 30, 36, 0.08), 0 2px 8px rgba(30, 30, 36, 0.04)',
        'card-hover': '0 16px 48px rgba(30, 30, 36, 0.14), 0 4px 12px rgba(30, 30, 36, 0.06)',
        'nav': '0 -4px 20px rgba(30, 30, 36, 0.06)',
      },
      backgroundImage: {
        'gradient-orange': 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(30,30,36,0) 40%, rgba(30,30,36,0.85) 100%)',
        'gradient-hero': 'linear-gradient(180deg, rgba(255,107,0,0.06) 0%, rgba(248,248,250,0) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-orange': 'pulseOrange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.8)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulseOrange: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255,107,0,0.4)' },
          '50%': { opacity: '0.9', boxShadow: '0 0 0 8px rgba(255,107,0,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
