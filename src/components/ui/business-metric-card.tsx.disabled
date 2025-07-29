'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { DynamicIcon } from '@/components/ui/dynamic-icon'

const businessMetricCardVariants = cva(
  'rounded-xl border transition-all duration-300 ease-in-out overflow-hidden relative group',
  {
    variants: {
      variant: {
        default: 'bg-white border-namc-gray-200 shadow-sm hover:shadow-lg hover:border-namc-gray-300',
        elevated: 'bg-white border-namc-gray-200 shadow-lg hover:shadow-xl',
        gradient: 'bg-gradient-to-br from-white to-namc-gray-50 border-namc-gray-200 shadow-sm hover:shadow-lg',
        glass: 'bg-white/80 backdrop-blur-sm border-namc-gray-200/50 shadow-sm hover:shadow-lg',
        interactive: 'bg-white border-namc-gray-200 shadow-sm hover:shadow-lg hover:border-namc-blue-300 cursor-pointer transform hover:scale-[1.02]',
      },
      size: {
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
      trend: {
        up: 'ring-1 ring-green-100',
        down: 'ring-1 ring-red-100',
        neutral: 'ring-1 ring-namc-gray-100',
        none: '',
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      trend: 'none',
    },
  }
)

export interface BusinessMetricCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof businessMetricCardVariants> {
  title: string
  value: string | number
  description?: string
  trend?: 'up' | 'down' | 'neutral' | 'none'
  trendValue?: string
  trendDescription?: string
  icon?: string
  iconColor?: string
  iconBackground?: string
  loading?: boolean
  prefix?: string
  suffix?: string
  format?: 'number' | 'currency' | 'percentage' | 'text'
  precision?: number
  animateValue?: boolean
  showProgress?: boolean
  progressValue?: number
  progressMax?: number
  children?: React.ReactNode
  onTrendClick?: () => void
  href?: string
}

const formatValue = (
  value: string | number,
  format: 'number' | 'currency' | 'percentage' | 'text' = 'text',
  precision = 0,
  prefix = '',
  suffix = ''
): string => {
  if (typeof value === 'string') return `${prefix}${value}${suffix}`
  
  let formatted: string
  
  switch (format) {
    case 'currency':
      formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(value)
      break
    case 'percentage':
      formatted = `${(value * 100).toFixed(precision)}%`
      break
    case 'number':
      formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: precision,
        maximumFractionDigits: precision,
      }).format(value)
      break
    default:
      formatted = value.toString()
  }
  
  return `${prefix}${formatted}${suffix}`
}

const AnimatedValue = ({ 
  value, 
  format, 
  precision, 
  prefix, 
  suffix,
  animate = true 
}: {
  value: string | number
  format?: 'number' | 'currency' | 'percentage' | 'text'
  precision?: number
  prefix?: string
  suffix?: string
  animate?: boolean
}) => {
  const [displayValue, setDisplayValue] = React.useState(animate ? 0 : value)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    if (!animate || typeof value !== 'number') {
      setDisplayValue(value)
      return
    }

    setIsAnimating(true)
    const targetValue = value
    const startValue = typeof displayValue === 'number' ? displayValue : 0
    const duration = 1500 // 1.5 seconds
    const steps = 60
    const stepValue = (targetValue - startValue) / steps
    const stepDuration = duration / steps

    let currentStep = 0
    const timer = setInterval(() => {
      currentStep++
      const currentValue = startValue + (stepValue * currentStep)
      
      if (currentStep >= steps) {
        setDisplayValue(targetValue)
        setIsAnimating(false)
        clearInterval(timer)
      } else {
        setDisplayValue(currentValue)
      }
    }, stepDuration)

    return () => {
      clearInterval(timer)
      setIsAnimating(false)
    }
  }, [value, animate, displayValue])

  return (
    <span className={cn("transition-all duration-300", isAnimating && "text-namc-blue-600")}>
      {formatValue(displayValue, format, precision, prefix, suffix)}
    </span>
  )
}

const TrendIndicator = ({ 
  trend, 
  trendValue, 
  trendDescription, 
  onClick 
}: {
  trend: 'up' | 'down' | 'neutral' | 'none'
  trendValue?: string
  trendDescription?: string
  onClick?: () => void
}) => {
  if (trend === 'none' || !trendValue) return null

  const trendConfig = {
    up: {
      icon: 'TrendingUp',
      color: 'text-green-600',
      background: 'bg-green-50',
      border: 'border-green-200',
    },
    down: {
      icon: 'TrendingDown',
      color: 'text-red-600',
      background: 'bg-red-50',
      border: 'border-red-200',
    },
    neutral: {
      icon: 'Minus',
      color: 'text-namc-gray-500',
      background: 'bg-namc-gray-50',
      border: 'border-namc-gray-200',
    },
  }

  const config = trendConfig[trend]

  return (
    <div 
      className={cn(
        "inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-medium transition-all duration-200",
        config.background,
        config.border,
        config.color,
        onClick && "cursor-pointer hover:opacity-80"
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <DynamicIcon name={config.icon} size={12} className="flex-shrink-0" />
      <span>{trendValue}</span>
      {trendDescription && (
        <span className="text-namc-gray-500 ml-1">{trendDescription}</span>
      )}
    </div>
  )
}

const ProgressBar = ({ 
  value, 
  max = 100, 
  className 
}: { 
  value: number
  max?: number
  className?: string 
}) => {
  const percentage = Math.min((value / max) * 100, 100)
  
  return (
    <div className={cn("w-full bg-namc-gray-200 rounded-full h-2 overflow-hidden", className)}>
      <div 
        className="h-full bg-gradient-to-r from-namc-blue-500 to-namc-blue-600 rounded-full transition-all duration-1000 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}

const LoadingSkeleton = () => (
  <div className="animate-pulse">
    <div className="flex items-center justify-between mb-4">
      <div>
        <div className="h-4 bg-namc-gray-200 rounded w-24 mb-2" />
        <div className="h-8 bg-namc-gray-200 rounded w-16" />
      </div>
      <div className="w-12 h-12 bg-namc-gray-200 rounded-lg" />
    </div>
    <div className="h-3 bg-namc-gray-200 rounded w-20" />
  </div>
)

export const BusinessMetricCard = React.forwardRef<
  HTMLDivElement,
  BusinessMetricCardProps
>(({
  className,
  variant,
  size,
  trend = 'none',
  title,
  value,
  description,
  trendValue,
  trendDescription,
  icon,
  iconColor = 'text-namc-blue-600',
  iconBackground = 'bg-namc-blue-100',
  loading = false,
  prefix,
  suffix,
  format = 'text',
  precision = 0,
  animateValue = true,
  showProgress = false,
  progressValue = 0,
  progressMax = 100,
  children,
  onTrendClick,
  href,
  ...props
}, ref) => {
  const CardWrapper = href ? 'a' : 'div'
  const cardProps = href ? { href, ...props } : props

  if (loading) {
    return (
      <div
        ref={ref}
        className={cn(businessMetricCardVariants({ variant, size, trend, className }))}
        {...cardProps}
      >
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <CardWrapper
      ref={ref}
      className={cn(businessMetricCardVariants({ variant, size, trend, className }))}
      {...cardProps}
    >
      {/* Background Gradient Effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-namc-blue-50/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className="text-sm font-medium text-namc-gray-600 mb-1 truncate">
              {title}
            </p>
            
            {/* Value */}
            <div className="mb-3">
              <p className="text-3xl font-bold text-namc-gray-900 leading-none">
                <AnimatedValue
                  value={value}
                  format={format}
                  precision={precision}
                  prefix={prefix}
                  suffix={suffix}
                  animate={animateValue}
                />
              </p>
            </div>

            {/* Description */}
            {description && (
              <p className="text-xs text-namc-gray-500 mb-3 line-clamp-2">
                {description}
              </p>
            )}

            {/* Progress Bar */}
            {showProgress && (
              <div className="mb-3">
                <ProgressBar 
                  value={progressValue} 
                  max={progressMax}
                  className="mb-1"
                />
                <div className="flex justify-between text-xs text-namc-gray-500">
                  <span>{progressValue}</span>
                  <span>{progressMax}</span>
                </div>
              </div>
            )}

            {/* Trend */}
            <TrendIndicator
              trend={trend}
              trendValue={trendValue}
              trendDescription={trendDescription}
              onClick={onTrendClick}
            />
          </div>

          {/* Icon */}
          {icon && (
            <div className={cn(
              "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ml-4 transition-all duration-300 group-hover:scale-110",
              iconBackground
            )}>
              <DynamicIcon 
                name={icon} 
                className={cn("w-6 h-6", iconColor)} 
                size={24}
              />
            </div>
          )}
        </div>

        {/* Custom Children */}
        {children && (
          <div className="mt-4 pt-4 border-t border-namc-gray-100">
            {children}
          </div>
        )}
      </div>

      {/* Hover Accent */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-namc-blue-500 to-namc-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
    </CardWrapper>
  )
})

BusinessMetricCard.displayName = 'BusinessMetricCard'

// Specialized Business Metric Cards

export const ProjectMetricCard = ({ 
  projectsApplied, 
  weeklyChange, 
  ...props 
}: {
  projectsApplied: number
  weeklyChange: number
} & Omit<BusinessMetricCardProps, 'title' | 'value' | 'icon' | 'trend' | 'trendValue'>) => (
  <BusinessMetricCard
    title="Projects Applied"
    value={projectsApplied}
    icon="Building2"
    iconColor="text-namc-blue-600"
    iconBackground="bg-namc-blue-100"
    trend={weeklyChange > 0 ? 'up' : weeklyChange < 0 ? 'down' : 'neutral'}
    trendValue={`${weeklyChange > 0 ? '+' : ''}${weeklyChange}`}
    trendDescription="this week"
    format="number"
    animateValue
    {...props}
  />
)

export const EventAttendanceCard = ({ 
  eventsAttended, 
  attendanceRank, 
  ...props 
}: {
  eventsAttended: number
  attendanceRank: number
} & Omit<BusinessMetricCardProps, 'title' | 'value' | 'icon' | 'trend' | 'trendValue'>) => (
  <BusinessMetricCard
    title="Events Attended"
    value={eventsAttended}
    icon="Calendar"
    iconColor="text-green-600"
    iconBackground="bg-green-100"
    trend="up"
    trendValue={`Top ${attendanceRank}%`}
    trendDescription="attendance"
    format="number"
    animateValue
    {...props}
  />
)

export const MessageMetricCard = ({ 
  unreadCount, 
  ...props 
}: {
  unreadCount: number
} & Omit<BusinessMetricCardProps, 'title' | 'value' | 'icon' | 'trend'>) => (
  <BusinessMetricCard
    title="Unread Messages"
    value={unreadCount}
    icon="MessageSquare"
    iconColor={unreadCount > 0 ? "text-red-600" : "text-namc-gray-600"}
    iconBackground={unreadCount > 0 ? "bg-red-100" : "bg-namc-gray-100"}
    trend={unreadCount > 0 ? 'up' : 'neutral'}
    trendValue={unreadCount > 0 ? 'Action needed' : 'All caught up'}
    format="number"
    variant={unreadCount > 0 ? 'interactive' : 'default'}
    {...props}
  />
)

export const CourseProgressCard = ({ 
  coursesEnrolled, 
  coursesInProgress, 
  completionRate, 
  ...props 
}: {
  coursesEnrolled: number
  coursesInProgress: number
  completionRate: number
} & Omit<BusinessMetricCardProps, 'title' | 'value' | 'icon' | 'showProgress' | 'progressValue'>) => (
  <BusinessMetricCard
    title="Course Progress"
    value={coursesEnrolled}
    icon="Users"
    iconColor="text-namc-gold-600"
    iconBackground="bg-namc-gold-100"
    trend="neutral"
    trendValue={`${coursesInProgress} in progress`}
    format="number"
    showProgress
    progressValue={completionRate}
    progressMax={100}
    animateValue
    {...props}
  />
)

export default BusinessMetricCard