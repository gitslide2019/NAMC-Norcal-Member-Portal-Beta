/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: '',
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        
        // NAMC Brand Colors
        'namc-blue': {
          50: '#eff6ff',   // lightest blue
          100: '#dbeafe',  // very light blue
          200: '#bfdbfe',  // light blue
          300: '#93c5fd',  // medium light blue
          400: '#60a5fa',  // medium blue
          500: '#3b82f6',  // base blue
          600: '#2563eb',  // NAMC primary blue
          700: '#1d4ed8',  // dark blue
          800: '#1e40af',  // darker blue
          900: '#1e3a8a',  // darkest blue
        },
        'namc-gray': {
          50: '#f9fafb',   // lightest gray
          100: '#f3f4f6',  // very light gray
          200: '#e5e7eb',  // light gray
          300: '#d1d5db',  // medium light gray
          400: '#9ca3af',  // medium gray
          500: '#6b7280',  // base gray
          600: '#4b5563',  // dark gray
          700: '#374151',  // darker gray
          800: '#1f2937',  // very dark gray
          900: '#111827',  // darkest gray
        },
        'namc-green': {
          50: '#f0fdf4',   // lightest green
          100: '#dcfce7',  // very light green
          200: '#bbf7d0',  // light green
          300: '#86efac',  // medium light green
          400: '#4ade80',  // medium green
          500: '#22c55e',  // base green
          600: '#16a34a',  // NAMC success green
          700: '#15803d',  // dark green
          800: '#166534',  // darker green
          900: '#14532d',  // darkest green
        },
        'namc-gold': {
          50: '#fffbeb',   // lightest gold
          100: '#fef3c7',  // very light gold
          200: '#fde68a',  // light gold
          300: '#fcd34d',  // medium light gold
          400: '#fbbf24',  // medium gold
          500: '#f59e0b',  // base gold
          600: '#d97706',  // NAMC accent gold
          700: '#b45309',  // dark gold
          800: '#92400e',  // darker gold
          900: '#78350f',  // darkest gold
        },
        'namc-red': {
          50: '#fef2f2',   // lightest red
          100: '#fee2e2',  // very light red
          200: '#fecaca',  // light red
          300: '#fca5a5',  // medium light red
          400: '#f87171',  // medium red
          500: '#ef4444',  // base red
          600: '#dc2626',  // NAMC error red
          700: '#b91c1c',  // dark red
          800: '#991b1b',  // darker red
          900: '#7f1d1d',  // darkest red
        },
        'namc-purple': {
          50: '#faf5ff',   // lightest purple
          100: '#f3e8ff',  // very light purple
          200: '#e9d5ff',  // light purple
          300: '#d8b4fe',  // medium light purple
          400: '#c084fc',  // medium purple
          500: '#a855f7',  // base purple
          600: '#9333ea',  // NAMC accent purple
          700: '#7c3aed',  // dark purple
          800: '#6b21a8',  // darker purple
          900: '#581c87',  // darkest purple
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        'slide-in': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-out': {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'scale-out': {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' },
        },
        'bounce-in': {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        'shimmer': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-in',
        'fade-out': 'fade-out 0.2s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'slide-out': 'slide-out 0.2s ease-in',
        'scale-in': 'scale-in 0.2s ease-out',
        'scale-out': 'scale-out 0.2s ease-in',
        'bounce-in': 'bounce-in 0.6s ease-out',
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
      boxShadow: {
        'namc-sm': '0 1px 2px 0 rgba(37, 99, 235, 0.05)',
        'namc': '0 1px 3px 0 rgba(37, 99, 235, 0.1), 0 1px 2px 0 rgba(37, 99, 235, 0.06)',
        'namc-md': '0 4px 6px -1px rgba(37, 99, 235, 0.1), 0 2px 4px -1px rgba(37, 99, 235, 0.06)',
        'namc-lg': '0 10px 15px -3px rgba(37, 99, 235, 0.1), 0 4px 6px -2px rgba(37, 99, 235, 0.05)',
        'namc-xl': '0 20px 25px -5px rgba(37, 99, 235, 0.1), 0 10px 10px -5px rgba(37, 99, 235, 0.04)',
        'namc-2xl': '0 25px 50px -12px rgba(37, 99, 235, 0.25)',
        'namc-inner': 'inset 0 2px 4px 0 rgba(37, 99, 235, 0.06)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
        '144': '36rem',
      },
      minWidth: {
        '0': '0',
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
        'full': '100%',
      },
      zIndex: {
        '60': '60',
        '70': '70',
        '80': '80',
        '90': '90',
        '100': '100',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    // Custom plugin for NAMC utilities
    function({ addUtilities, theme }) {
      const namcUtilities = {
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.namc-gradient': {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        },
        '.namc-gradient-gold': {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        },
        '.namc-text-gradient': {
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
        '.focus-visible-namc': {
          '&:focus-visible': {
            outline: 'none',
            'box-shadow': '0 0 0 2px ' + theme('colors.namc-blue.500'),
          },
        },
      }
      addUtilities(namcUtilities)
    },
  ],
}