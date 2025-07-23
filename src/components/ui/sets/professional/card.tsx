import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils'

const cardVariants = cva(
  'rounded-md text-card-foreground transition-shadow duration-200',
  {
    variants: {
      variant: {
        default: 'bg-white border border-namc-gray-200 shadow-sm hover:shadow-md',
        elevated: 'bg-white border border-namc-gray-200 shadow-md hover:shadow-lg',
        outline: 'border border-namc-gray-300 bg-transparent',
        ghost: 'bg-transparent shadow-none',
        interactive: 'bg-white border border-namc-gray-200 shadow-sm hover:shadow-md hover:border-namc-gray-300 cursor-pointer',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
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
    className={cn('flex flex-col space-y-1.5 pb-4 border-b border-namc-gray-100', className)}
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
      'text-lg font-bold leading-none tracking-tight text-namc-gray-900',
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
    className={cn('text-sm text-namc-gray-600 leading-relaxed', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-4', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 border-t border-namc-gray-100', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Specialized Card Components for Professional Set
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
  <Card ref={ref} className={cn('relative overflow-hidden', className)} {...props}>
    <CardContent className="pb-2">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-namc-gray-600">{title}</p>
          <p className="text-2xl font-bold text-namc-gray-900">{value}</p>
          {description && (
            <p className="text-xs text-namc-gray-500">{description}</p>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
      {trend && trendValue && (
        <div className={cn(
          'flex items-center text-xs mt-2',
          {
            'text-green-600': trend === 'up',
            'text-red-600': trend === 'down',
            'text-namc-gray-500': trend === 'neutral',
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
  <Card ref={ref} variant="interactive" className={cn('group', className)} onClick={onAction} {...props}>
    <CardContent>
      <div className="space-y-4">
        {icon && (
          <div className="flex items-center justify-center w-12 h-12 bg-namc-blue-100 rounded-lg group-hover:bg-namc-blue-200 transition-colors">
            {icon}
          </div>
        )}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-namc-gray-900">{title}</h3>
          <p className="text-sm text-namc-gray-600 leading-relaxed">{description}</p>
        </div>
        {features && features.length > 0 && (
          <ul className="space-y-1">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-namc-gray-600">
                <svg className="w-4 h-4 mr-2 text-namc-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        )}
        {actionLabel && (
          <div className="pt-2">
            <span className="text-sm font-medium text-namc-blue-700 group-hover:text-namc-blue-800">
              {actionLabel} →
            </span>
          </div>
        )}
      </div>
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