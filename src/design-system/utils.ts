import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { componentVariants, sizeVariants, type DesignVariant, type ComponentSize } from './tokens'

/**
 * Utility function to merge Tailwind CSS classes
 * Re-exported from lib/utils to maintain consistency
 */
export { cn } from '@/lib/utils'

/**
 * Get design variant styles
 */
export function getVariantStyles(variant: DesignVariant) {
  return componentVariants[variant]
}

/**
 * Get component size styles
 */
export function getSizeStyles(size: ComponentSize) {
  return sizeVariants[size]
}

/**
 * Generate CSS custom properties for design tokens
 */
export function generateCSSVariables(variant: DesignVariant) {
  const styles = getVariantStyles(variant)
  return {
    '--color-primary': styles.colors.primary,
    '--color-primary-hover': styles.colors.primaryHover,
    '--color-secondary': styles.colors.secondary,
    '--color-accent': styles.colors.accent,
    '--color-background': styles.colors.background,
    '--color-surface': styles.colors.surface,
    '--color-border': styles.colors.border,
    '--border-radius': styles.effects.borderRadius,
    '--box-shadow': styles.effects.shadow,
    '--transition': styles.effects.transition,
    '--spacing-component': styles.spacing.component,
    '--spacing-section': styles.spacing.section,
    '--spacing-page': styles.spacing.page,
  } as React.CSSProperties
}

/**
 * Common component prop types
 */
export interface BaseComponentProps {
  variant?: DesignVariant
  size?: ComponentSize
  className?: string
  children?: React.ReactNode
}

/**
 * Button variant styles for each design set
 */
export const buttonVariants = {
  professional: {
    primary: 'bg-namc-blue-800 hover:bg-namc-blue-900 text-white font-semibold border border-namc-blue-800 hover:border-namc-blue-900 transition-colors duration-200',
    secondary: 'bg-white hover:bg-namc-gray-50 text-namc-gray-700 font-medium border border-namc-gray-300 hover:border-namc-gray-400 transition-colors duration-200',
    outline: 'bg-transparent hover:bg-namc-blue-50 text-namc-blue-800 font-medium border border-namc-blue-200 hover:border-namc-blue-300 transition-colors duration-200',
    ghost: 'bg-transparent hover:bg-namc-gray-100 text-namc-gray-700 font-medium transition-colors duration-200',
    destructive: 'bg-red-600 hover:bg-red-700 text-white font-semibold border border-red-600 hover:border-red-700 transition-colors duration-200',
  },
  minimalist: {
    primary: 'bg-namc-blue-600 hover:bg-namc-blue-700 text-white font-medium border-0 shadow-sm hover:shadow transition-all duration-150',
    secondary: 'bg-namc-gray-100 hover:bg-namc-gray-200 text-namc-gray-800 font-medium border-0 transition-all duration-150',
    outline: 'bg-transparent hover:bg-namc-blue-50 text-namc-blue-600 font-medium border border-namc-gray-200 hover:border-namc-blue-300 transition-all duration-150',
    ghost: 'bg-transparent hover:bg-namc-gray-50 text-namc-gray-600 font-medium transition-all duration-150',
    destructive: 'bg-red-500 hover:bg-red-600 text-white font-medium border-0 shadow-sm hover:shadow transition-all duration-150',
  },
  dynamic: {
    primary: 'bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 hover:from-namc-blue-700 hover:to-namc-blue-800 text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300',
    secondary: 'bg-namc-gray-200 hover:bg-namc-gray-300 text-namc-gray-800 font-semibold shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-300',
    outline: 'bg-transparent hover:bg-namc-blue-50 text-namc-blue-600 font-semibold border-2 border-namc-blue-300 hover:border-namc-blue-500 transform hover:scale-105 transition-all duration-300',
    ghost: 'bg-transparent hover:bg-namc-gray-100 text-namc-gray-700 font-semibold transform hover:scale-105 transition-all duration-300',
    destructive: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300',
  },
}

/**
 * Input variant styles for each design set
 */
export const inputVariants = {
  professional: {
    base: 'block w-full px-3 py-2 border border-namc-gray-300 bg-white text-namc-gray-900 placeholder-namc-gray-500 focus:ring-2 focus:ring-namc-blue-500 focus:border-namc-blue-500 transition-colors duration-200',
    error: 'border-red-500 focus:ring-red-500 focus:border-red-500',
    success: 'border-green-500 focus:ring-green-500 focus:border-green-500',
  },
  minimalist: {
    base: 'block w-full px-4 py-3 border-0 bg-namc-gray-50 text-namc-gray-900 placeholder-namc-gray-400 focus:ring-2 focus:ring-namc-blue-500 focus:bg-white transition-all duration-150',
    error: 'bg-red-50 focus:ring-red-500',
    success: 'bg-green-50 focus:ring-green-500',
  },
  dynamic: {
    base: 'block w-full px-4 py-3 border-2 border-namc-gray-200 bg-white text-namc-gray-900 placeholder-namc-gray-400 focus:ring-4 focus:ring-namc-blue-200 focus:border-namc-blue-500 transform focus:scale-105 transition-all duration-300',
    error: 'border-red-300 focus:ring-red-200 focus:border-red-500',
    success: 'border-green-300 focus:ring-green-200 focus:border-green-500',
  },
}

/**
 * Card variant styles for each design set
 */
export const cardVariants = {
  professional: {
    base: 'bg-white border border-namc-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200',
    elevated: 'bg-white border border-namc-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200',
    interactive: 'bg-white border border-namc-gray-200 shadow-sm hover:shadow-md hover:border-namc-gray-300 cursor-pointer transition-all duration-200',
  },
  minimalist: {
    base: 'bg-white border-0 shadow-sm hover:shadow transition-shadow duration-150',
    elevated: 'bg-white border-0 shadow hover:shadow-md transition-shadow duration-150',
    interactive: 'bg-white border-0 shadow-sm hover:shadow-md hover:bg-namc-gray-50 cursor-pointer transition-all duration-150',
  },
  dynamic: {
    base: 'bg-white border border-namc-gray-100 shadow-md hover:shadow-lg transform hover:scale-102 transition-all duration-300',
    elevated: 'bg-white border border-namc-gray-100 shadow-lg hover:shadow-xl transform hover:scale-102 transition-all duration-300',
    interactive: 'bg-white border border-namc-gray-100 shadow-md hover:shadow-xl hover:border-namc-blue-200 cursor-pointer transform hover:scale-105 transition-all duration-300',
  },
}

/**
 * Badge variant styles for each design set
 */
export const badgeVariants = {
  professional: {
    default: 'bg-namc-blue-100 text-namc-blue-800 font-medium',
    secondary: 'bg-namc-gray-100 text-namc-gray-800 font-medium',
    success: 'bg-green-100 text-green-800 font-medium',
    warning: 'bg-yellow-100 text-yellow-800 font-medium',
    destructive: 'bg-red-100 text-red-800 font-medium',
  },
  minimalist: {
    default: 'bg-namc-blue-50 text-namc-blue-700 font-medium',
    secondary: 'bg-namc-gray-100 text-namc-gray-700 font-medium',
    success: 'bg-green-50 text-green-700 font-medium',
    warning: 'bg-yellow-50 text-yellow-700 font-medium',
    destructive: 'bg-red-50 text-red-700 font-medium',
  },
  dynamic: {
    default: 'bg-gradient-to-r from-namc-blue-100 to-namc-blue-200 text-namc-blue-800 font-semibold shadow-sm',
    secondary: 'bg-gradient-to-r from-namc-gray-100 to-namc-gray-200 text-namc-gray-800 font-semibold shadow-sm',
    success: 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-semibold shadow-sm',
    warning: 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 font-semibold shadow-sm',
    destructive: 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 font-semibold shadow-sm',
  },
}

/**
 * Generate component class names based on variant and other props
 */
export function generateComponentClasses(
  baseClasses: string,
  variant: DesignVariant,
  variantStyles: Record<DesignVariant, string>,
  size?: ComponentSize,
  className?: string
) {
  const sizeClasses = size ? getSizeClasses(size) : ''
  const variantClasses = variantStyles[variant] || ''
  
  return cn(baseClasses, variantClasses, sizeClasses, className)
}

/**
 * Get size-based classes
 */
function getSizeClasses(size: ComponentSize): string {
  const sizeStyle = getSizeStyles(size)
  return `h-[${sizeStyle.height}] text-[${sizeStyle.fontSize[0]}] px-[${sizeStyle.padding.split(' ')[1]}] py-[${sizeStyle.padding.split(' ')[0]}]`
}

/**
 * Common accessibility helpers
 */
export const accessibilityProps = {
  button: {
    role: 'button',
    tabIndex: 0,
  },
  link: {
    role: 'link',
    tabIndex: 0,
  },
  input: {
    'aria-required': true,
    'aria-invalid': false,
  },
  modal: {
    role: 'dialog',
    'aria-modal': true,
  },
  alert: {
    role: 'alert',
    'aria-live': 'polite',
  },
}

/**
 * Focus management utilities
 */
export const focusClasses = {
  ring: 'focus:outline-none focus:ring-2 focus:ring-offset-2',
  visible: 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
}

/**
 * Animation classes for different variants
 */
export const animationClasses = {
  professional: {
    fadeIn: 'animate-[fadeIn_0.3s_ease-out]',
    slideUp: 'animate-[slideUp_0.3s_ease-out]',
    hover: 'transition-colors duration-200',
  },
  minimalist: {
    fadeIn: 'animate-[fadeIn_0.2s_ease-out]',
    slideUp: 'animate-[slideUp_0.2s_ease-out]',
    hover: 'transition-all duration-150',
  },
  dynamic: {
    fadeIn: 'animate-[fadeIn_0.5s_ease-out]',
    slideUp: 'animate-[slideUp_0.4s_ease-out]',
    hover: 'transition-all duration-300',
  },
}