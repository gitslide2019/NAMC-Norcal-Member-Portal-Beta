import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils'

const cardVariants = cva(
  'rounded-lg text-card-foreground transition-all duration-150',
  {
    variants: {
      variant: {
        default: 'bg-white border-0 shadow-sm hover:shadow',
        elevated: 'bg-white border-0 shadow hover:shadow-md',
        outline: 'border border-namc-gray-100 bg-white',
        ghost: 'bg-transparent shadow-none',
        interactive: 'bg-white border-0 shadow-sm hover:shadow-md hover:bg-namc-gray-50 cursor-pointer hover:scale-[1.02]',
        floating: 'bg-white border-0 shadow-lg hover:shadow-xl backdrop-blur-sm',
      },
      padding: {
        none: 'p-0',
        sm: 'p-3',
        default: 'p-4',
        lg: 'p-6',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex flex-col space-y-2 pb-3', className)}
    {...props}
  />
))
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      'text-lg font-semibold leading-tight tracking-tight text-namc-gray-900',
      className
    )}
    {...props}
  />
))
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn('text-sm text-namc-gray-500 leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-3', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Specialized Card Components for Minimalist Set
const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    description?: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    icon?: React.ReactNode
  }
>(({ className, title, value, description, trend, trendValue, icon, ...props }, ref) => (
  <Card ref={ref} variant="floating" className={cn('relative overflow-hidden group', className)} {...props}>
    <CardContent className="pb-2">
      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1">
          <p className="text-xs uppercase tracking-wide font-medium text-namc-gray-400">{title}</p>
          <p className="text-3xl font-light text-namc-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-namc-gray-500">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className={cn(
          'flex items-center text-xs mt-3 px-2 py-1 rounded-md w-fit',
          {
            'text-green-700 bg-green-50': trend === 'up',
            'text-red-700 bg-red-50': trend === 'down',
            'text-namc-gray-600 bg-namc-gray-50': trend === 'neutral',
          }
        )}>
          {trend === 'up' && (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          )}
          {trend === 'down' && (
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium">{trendValue}</span>
        </div>
      )}
    </CardContent>
  </Card>
))
MetricCard.displayName = 'MetricCard'

const FeatureCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    description: string
    icon?: React.ReactNode
    features?: string[]
    actionLabel?: string
    onAction?: () => void
  }
>(({ className, title, description, icon, features, actionLabel, onAction, ...props }, ref) => (
  <Card ref={ref} variant="interactive" className={cn('group h-full', className)} onClick={onAction} {...props}>
    <CardContent className="h-full flex flex-col">
      <div className="space-y-4 flex-1">
        {icon && (
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-namc-blue-50 to-namc-blue-100 rounded-lg group-hover:from-namc-blue-100 group-hover:to-namc-blue-200 transition-all">
            <div className="text-namc-blue-600">
              {icon}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-namc-gray-900">{title}</h3>
          <p className="text-sm text-namc-gray-600 leading-relaxed">{description}</p>
        </div>
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm text-namc-gray-600">
                <div className="w-1 h-1 bg-namc-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
      {actionLabel && (
        <div className="pt-4 mt-auto">
          <span className="text-sm font-medium text-namc-blue-600 group-hover:text-namc-blue-700 flex items-center">
            {actionLabel}
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </span>
        </div>
      )}
    </CardContent>
  </Card>
))
FeatureCard.displayName = 'FeatureCard'

export { 
  Card, 
  CardHeader, 
  CardFooter, 
  CardTitle, 
  CardDescription, 
  CardContent,
  MetricCard,
  FeatureCard,
  cardVariants 
}