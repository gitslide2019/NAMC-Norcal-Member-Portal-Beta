'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DynamicIconProps {
  name: string
  className?: string
  size?: number
  fallback?: React.ReactNode
  'aria-hidden'?: boolean
  'aria-label'?: string
}

// Cache for loaded icons to avoid re-importing
const iconCache = new Map<string, React.ComponentType<any>>()

export function DynamicIcon({ 
  name, 
  className, 
  size = 16,
  fallback,
  'aria-hidden': ariaHidden = true,
  'aria-label': ariaLabel,
  ...props 
}: DynamicIconProps) {
  const [IconComponent, setIconComponent] = React.useState<React.ComponentType<any> | null>(null)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState(false)

  React.useEffect(() => {
    let mounted = true

    const loadIcon = async () => {
      if (iconCache.has(name)) {
        setIconComponent(iconCache.get(name)!)
        return
      }

      setLoading(true)
      setError(false)

      try {
        // Dynamic import of the specific icon
        const iconModule = await import('lucide-react')
        const Component = iconModule[name as keyof typeof iconModule] as React.ComponentType<any>
        
        if (!Component) {
          throw new Error(`Icon "${name}" not found`)
        }

        // Cache the component
        iconCache.set(name, Component)
        
        if (mounted) {
          setIconComponent(Component)
        }
      } catch (err) {
        console.warn(`Failed to load icon "${name}":`, err)
        if (mounted) {
          setError(true)
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    loadIcon()

    return () => {
      mounted = false
    }
  }, [name])

  if (loading) {
    return (
      <Loader2 
        className={cn('animate-spin', className)} 
        size={size}
        aria-hidden={ariaHidden}
        {...props}
      />
    )
  }

  if (error || !IconComponent) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    // Default fallback - a simple square
    return (
      <div 
        className={cn('border border-namc-gray-300 bg-namc-gray-100 rounded', className)}
        style={{ width: size, height: size }}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel || `Icon ${name} (fallback)`}
        {...props}
      />
    )
  }

  return (
    <IconComponent 
      className={className} 
      size={size}
      aria-hidden={ariaHidden}
      aria-label={ariaLabel}
      {...props}
    />
  )
}

// Hook for batch icon preloading
export function usePreloadIcons(iconNames: string[]) {
  React.useEffect(() => {
    const preloadIcons = async () => {
      try {
        const iconModule = await import('lucide-react')
        iconNames.forEach(name => {
          const Component = iconModule[name as keyof typeof iconModule] as React.ComponentType<any>
          if (Component && !iconCache.has(name)) {
            iconCache.set(name, Component)
          }
        })
      } catch (err) {
        console.warn('Failed to preload icons:', err)
      }
    }

    preloadIcons()
  }, [iconNames])
}

// Common icon sets for different parts of the application
export const DASHBOARD_ICONS = [
  'Building2', 'Calendar', 'MessageSquare', 'Users', 'TrendingUp', 
  'Plus', 'ArrowRight', 'Star', 'Clock', 'MapPin', 'DollarSign'
]

export const DATA_TABLE_ICONS = [
  'ChevronLeft', 'ChevronRight', 'Search', 'Filter', 'Download',
  'ArrowUpDown', 'ArrowUp', 'ArrowDown', 'Eye', 'Edit', 'MoreHorizontal'
]

export const AUTH_ICONS = [
  'Eye', 'EyeOff', 'Loader2', 'LogIn', 'AlertCircle'
]

// Utility component for common icon patterns
export function StatusIcon({ 
  status, 
  className,
  size = 16 
}: { 
  status: 'success' | 'error' | 'warning' | 'info' | 'loading'
  className?: string
  size?: number 
}) {
  const iconMap = {
    success: 'CheckCircle',
    error: 'XCircle', 
    warning: 'AlertTriangle',
    info: 'Info',
    loading: 'Loader2'
  }

  const colorMap = {
    success: 'text-green-600',
    error: 'text-red-600',
    warning: 'text-yellow-600', 
    info: 'text-blue-600',
    loading: 'text-namc-gray-400'
  }

  return (
    <DynamicIcon
      name={iconMap[status]}
      className={cn(colorMap[status], status === 'loading' && 'animate-spin', className)}
      size={size}
      aria-label={`${status} status`}
    />
  )
}

export default DynamicIcon