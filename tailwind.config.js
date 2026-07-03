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
        /* ── New Nomaq palette ── */
        'nomaq': {
          navy: '#0F172A',
          indigo: '#4F46E5',
          violet: '#7C3AED',
          lavender: '#EDE9FE',
          'lavender-light': '#F5F3FF',
          coral: '#F87171',
          mint: '#059669',
          sky: '#3B82F6',
          rose: '#FDE7F3',
          'blue-light': '#DBEAFE',
        },
        /* ── Legacy (preserved for test compatibility) ── */
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
        sans: ['var(--font-inter, Inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['var(--font-dm-serif, "DM Serif Display")', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        'display-xl': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'display-lg': ['2.75rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'display-md': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
      },
      borderRadius: {
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        'soft': '0 2px 16px rgba(15, 23, 42, 0.06)',
        'card': '0 4px 24px rgba(15, 23, 42, 0.06), 0 1px 4px rgba(15, 23, 42, 0.04)',
        'card-hover': '0 8px 32px rgba(15, 23, 42, 0.1), 0 2px 8px rgba(15, 23, 42, 0.06)',
        'nav': '0 -2px 16px rgba(15, 23, 42, 0.06)',
        'button': '0 4px 16px rgba(79, 70, 229, 0.3)',
        /* Legacy */
        'orange-glow': '0 4px 20px rgba(255, 107, 0, 0.35)',
        'orange-glow-lg': '0 8px 30px rgba(255, 107, 0, 0.45)',
      },
      backgroundImage: {
        'gradient-violet': 'linear-gradient(135deg, #7C3AED 0%, #A78BFA 100%)',
        'gradient-indigo': 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)',
        'gradient-card': 'linear-gradient(180deg, rgba(30,30,36,0) 40%, rgba(30,30,36,0.85) 100%)',
        /* Legacy */
        'gradient-orange': 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
        'gradient-hero': 'linear-gradient(180deg, rgba(255,107,0,0.06) 0%, rgba(248,248,250,0) 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'bounce-in': 'bounceIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'float': 'float 6s ease-in-out infinite',
        'sparkle': 'sparkle 2s ease-in-out infinite',
        'shimmer': 'shimmer 1.5s infinite',
        /* Legacy */
        'pulse-orange': 'pulseOrange 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px) scale(0.97)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
        bounceIn: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-8px) rotate(2deg)' },
        },
        sparkle: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.9)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
        pulseOrange: {
          '0%, 100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(255,107,0,0.4)' },
          '50%': { opacity: '0.9', boxShadow: '0 0 0 8px rgba(255,107,0,0)' },
        },
      },
    },
  },
  plugins: [],
}
