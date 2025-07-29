'use client'

import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'white' | 'gray'
}

const spinnerSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6', 
  lg: 'h-8 w-8',
  xl: 'h-10 w-10'
}

const spinnerColors = {
  primary: 'border-blue-600',
  white: 'border-white',
  gray: 'border-gray-600'
}

export function LoadingSpinner({ 
  size = 'md', 
  className,
  color = 'primary'
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-2 border-t-transparent',
        spinnerSizes[size],
        spinnerColors[color],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Inline loading spinner for buttons
export function InlineSpinner({ className }: { className?: string }) {
  return (
    <LoadingSpinner 
      size="sm" 
      color="white"
      className={cn('mr-2', className)} 
    />
  )
}

// Full page loading spinner
export function PageSpinner() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}