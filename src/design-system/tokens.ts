// Design tokens for NAMC Portal UI Component Sets
// Base foundation that supports all three design variants

export const designTokens = {
  // Base Colors (shared across all sets)
  colors: {
    // NAMC Brand Colors
    namc: {
      blue: {
        50: '#eff6ff',
        100: '#dbeafe', 
        200: '#bfdbfe',
        300: '#93c5fd',
        400: '#60a5fa',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
        800: '#1e3a8a',
        900: '#1e40af',
      },
      gold: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
      },
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827',
      },
    },
    
    // Status Colors
    status: {
      success: {
        50: '#f0fdf4',
        500: '#22c55e',
        600: '#16a34a',
        700: '#15803d',
      },
      warning: {
        50: '#fffbeb',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
      },
      error: {
        50: '#fef2f2',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
      },
      info: {
        50: '#eff6ff',
        500: '#3b82f6',
        600: '#2563eb',
        700: '#1d4ed8',
      },
    },
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      display: ['Cal Sans', 'Inter', 'sans-serif'], // For headings in dynamic set
      mono: ['JetBrains Mono', 'monospace'],
    },
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
  },

  // Spacing System (8px base grid)
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem', // 2px
    1: '0.25rem',    // 4px
    1.5: '0.375rem', // 6px
    2: '0.5rem',     // 8px
    2.5: '0.625rem', // 10px
    3: '0.75rem',    // 12px
    3.5: '0.875rem', // 14px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    11: '2.75rem',   // 44px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    none: 'none',
  },

  // Animation & Transitions
  animation: {
    none: 'none',
    spin: 'spin 1s linear infinite',
    ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
    pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    bounce: 'bounce 1s infinite',
    fadeIn: 'fadeIn 0.5s ease-in-out',
    slideUp: 'slideUp 0.3s ease-out',
    slideDown: 'slideDown 0.3s ease-out',
  },

  // Transition Durations
  transitionDuration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Transition Timing Functions
  transitionTimingFunction: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // Breakpoints for responsive design
  screens: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index layers
  zIndex: {
    0: '0',
    10: '10',
    20: '20',
    30: '30',
    40: '40',
    50: '50',
    modal: '1000',
    popover: '1010',
    tooltip: '1020',
    toast: '1030',
  },
}

// Component-specific design variants
export const componentVariants = {
  // Set A: Professional Corporate
  professional: {
    colors: {
      primary: designTokens.colors.namc.blue[800],
      primaryHover: designTokens.colors.namc.blue[900],
      secondary: designTokens.colors.namc.gray[600],
      accent: designTokens.colors.namc.gold[600],
      background: designTokens.colors.namc.gray[50],
      surface: '#ffffff',
      border: designTokens.colors.namc.gray[200],
    },
    typography: {
      fontFamily: designTokens.typography.fontFamily.sans,
      headingWeight: designTokens.typography.fontWeight.bold,
      bodyWeight: designTokens.typography.fontWeight.normal,
    },
    spacing: {
      component: designTokens.spacing[6],
      section: designTokens.spacing[8],
      page: designTokens.spacing[8],
    },
    effects: {
      borderRadius: designTokens.borderRadius.md,
      shadow: designTokens.boxShadow.sm,
      transition: `all ${designTokens.transitionDuration[200]} ${designTokens.transitionTimingFunction.out}`,
    },
  },

  // Set B: Modern Minimalist
  minimalist: {
    colors: {
      primary: designTokens.colors.namc.blue[600],
      primaryHover: designTokens.colors.namc.blue[700],
      secondary: designTokens.colors.namc.gray[500],
      accent: designTokens.colors.status.success[600],
      background: '#fafafa',
      surface: '#ffffff',
      border: designTokens.colors.namc.gray[100],
    },
    typography: {
      fontFamily: designTokens.typography.fontFamily.sans,
      headingWeight: designTokens.typography.fontWeight.semibold,
      bodyWeight: designTokens.typography.fontWeight.normal,
    },
    spacing: {
      component: designTokens.spacing[4],
      section: designTokens.spacing[6],
      page: designTokens.spacing[6],
    },
    effects: {
      borderRadius: designTokens.borderRadius.lg,
      shadow: designTokens.boxShadow.sm,
      transition: `all ${designTokens.transitionDuration[150]} ${designTokens.transitionTimingFunction.out}`,
    },
  },

  // Set C: Interactive Dynamic
  dynamic: {
    colors: {
      primary: designTokens.colors.namc.blue[600],
      primaryHover: designTokens.colors.namc.blue[700],
      secondary: designTokens.colors.namc.gray[600],
      accent: designTokens.colors.namc.gold[500],
      background: designTokens.colors.namc.gray[50],
      surface: '#ffffff',
      border: designTokens.colors.namc.gray[200],
    },
    typography: {
      fontFamily: designTokens.typography.fontFamily.sans,
      headingWeight: designTokens.typography.fontWeight.bold,
      bodyWeight: designTokens.typography.fontWeight.medium,
    },
    spacing: {
      component: designTokens.spacing[5],
      section: designTokens.spacing[8],
      page: designTokens.spacing[8],
    },
    effects: {
      borderRadius: designTokens.borderRadius.xl,
      shadow: designTokens.boxShadow.md,
      transition: `all ${designTokens.transitionDuration[300]} ${designTokens.transitionTimingFunction['in-out']}`,
    },
  },
}

// Component size variants
export const sizeVariants = {
  xs: {
    padding: `${designTokens.spacing[1]} ${designTokens.spacing[2]}`,
    fontSize: designTokens.typography.fontSize.xs,
    height: designTokens.spacing[6],
  },
  sm: {
    padding: `${designTokens.spacing[1.5]} ${designTokens.spacing[3]}`,
    fontSize: designTokens.typography.fontSize.sm,
    height: designTokens.spacing[8],
  },
  md: {
    padding: `${designTokens.spacing[2]} ${designTokens.spacing[4]}`,
    fontSize: designTokens.typography.fontSize.base,
    height: designTokens.spacing[10],
  },
  lg: {
    padding: `${designTokens.spacing[2.5]} ${designTokens.spacing[5]}`,
    fontSize: designTokens.typography.fontSize.lg,
    height: designTokens.spacing[12],
  },
  xl: {
    padding: `${designTokens.spacing[3]} ${designTokens.spacing[6]}`,
    fontSize: designTokens.typography.fontSize.xl,
    height: designTokens.spacing[14],
  },
}

export type DesignVariant = 'professional' | 'minimalist' | 'dynamic'
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'