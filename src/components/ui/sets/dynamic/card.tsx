import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils'

const cardVariants = cva(
  'rounded-xl text-card-foreground transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden',
  {
    variants: {
      variant: {
        default: 'bg-white border border-namc-gray-100 shadow-md hover:shadow-xl',
        elevated: 'bg-white border border-namc-gray-100 shadow-lg hover:shadow-2xl',
        outline: 'border-2 border-namc-gray-200 bg-white hover:border-namc-blue-300',
        ghost: 'bg-transparent shadow-none hover:bg-white/50 backdrop-blur-sm',
        interactive: 'bg-white border border-namc-gray-100 shadow-md hover:shadow-xl hover:border-namc-blue-200 cursor-pointer hover:scale-105',
        floating: 'bg-white/90 backdrop-blur-md border border-white/20 shadow-xl hover:shadow-2xl',
        gradient: 'bg-gradient-to-br from-white via-namc-blue-50/30 to-namc-gold-50/30 border border-namc-gray-100 shadow-lg hover:shadow-xl',
      },
      padding: {
        none: 'p-0',
        sm: 'p-4',
        default: 'p-6',
        lg: 'p-8',
      },
      glow: {
        true: 'hover:shadow-[0_0_30px_rgba(59,130,246,0.2)]',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'default',
      glow: false,
    },
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  asChild?: boolean
  animated?: boolean
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, glow, animated = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, padding, glow, className }),
        animated && 'animate-scale-in'
      )}
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
    className={cn('flex flex-col space-y-2 pb-4 relative', className)}
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
      'text-xl font-bold leading-tight tracking-tight text-namc-gray-900 relative z-10',
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
    className={cn('text-sm text-namc-gray-600 leading-relaxed relative z-10', className)}
    {...props}
  />
))
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('pt-0 relative z-10', className)} {...props} />
))
CardContent.displayName = 'CardContent'

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center pt-4 relative z-10', className)}
    {...props}
  />
))
CardFooter.displayName = 'CardFooter'

// Specialized Card Components for Dynamic Set
const MetricCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string
    value: string | number
    description?: string
    trend?: 'up' | 'down' | 'neutral'
    trendValue?: string
    icon?: React.ReactNode
    color?: 'blue' | 'green' | 'gold' | 'red' | 'gray'
  }
>(({ className, title, value, description, trend, trendValue, icon, color = 'blue', ...props }, ref) => {
  const colorClasses = {
    blue: 'from-namc-blue-500/10 to-namc-blue-600/5 border-namc-blue-200/30',
    green: 'from-green-500/10 to-green-600/5 border-green-200/30',
    gold: 'from-namc-gold-500/10 to-namc-gold-600/5 border-namc-gold-200/30',
    red: 'from-red-500/10 to-red-600/5 border-red-200/30',
    gray: 'from-namc-gray-500/10 to-namc-gray-600/5 border-namc-gray-200/30',
  }

  return (
    <Card 
      ref={ref} 
      variant="floating" 
      glow 
      className={cn(
        'relative overflow-hidden group bg-gradient-to-br border', 
        colorClasses[color],
        className
      )} 
      {...props}
    >
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      
      <CardContent className="pb-2 relative z-10">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <p className="text-xs uppercase tracking-wider font-bold text-namc-gray-500">{title}</p>
            <p className="text-4xl font-extrabold text-namc-gray-900 bg-gradient-to-r from-namc-gray-900 to-namc-gray-700 bg-clip-text">
              {value}
            </p>
            {description && (
              <p className="text-sm text-namc-gray-600 font-medium">{description}</p>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/80 to-white/40 flex items-center justify-center shadow-inner">
                {icon}
              </div>
            </div>
          )}
        </div>
        {trend && trendValue && (
          <div className={cn(
            'flex items-center text-sm mt-4 px-3 py-2 rounded-lg w-fit font-bold shadow-sm',
            {
              'text-green-700 bg-gradient-to-r from-green-100 to-green-200': trend === 'up',
              'text-red-700 bg-gradient-to-r from-red-100 to-red-200': trend === 'down',
              'text-namc-gray-700 bg-gradient-to-r from-namc-gray-100 to-namc-gray-200': trend === 'neutral',
            }
          )}>
            {trend === 'up' && (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {trend === 'down' && (
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
            <span>{trendValue}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
})
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
    featured?: boolean
  }
>(({ className, title, description, icon, features, actionLabel, onAction, featured = false, ...props }, ref) => (
  <Card 
    ref={ref} 
    variant="interactive" 
    glow={featured}
    className={cn(
      'group h-full relative overflow-hidden',
      featured && 'ring-2 ring-namc-blue-300 bg-gradient-to-br from-namc-blue-50/50 via-white to-namc-gold-50/30',
      className
    )} 
    onClick={onAction} 
    {...props}
  >
    {/* Featured badge */}
    {featured && (
      <div className="absolute top-4 right-4 z-20">
        <div className="bg-gradient-to-r from-namc-gold-500 to-namc-gold-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
          Featured
        </div>
      </div>
    )}
    
    {/* Animated gradient overlay */}
    <div className="absolute inset-0 bg-gradient-to-r from-namc-blue-500/5 via-transparent to-namc-gold-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    
    <CardContent className="h-full flex flex-col relative z-10">
      <div className="space-y-4 flex-1">
        {icon && (
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-namc-blue-100 to-namc-blue-200 rounded-2xl group-hover:from-namc-blue-200 group-hover:to-namc-blue-300 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3 shadow-lg">
            <div className="text-namc-blue-600 transform group-hover:scale-110 transition-transform duration-300">
              {icon}
            </div>
          </div>
        )}
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-namc-gray-900 group-hover:text-namc-blue-700 transition-colors duration-300">
            {title}
          </h3>
          <p className="text-sm text-namc-gray-600 leading-relaxed">{description}</p>
        </div>
        {features && features.length > 0 && (
          <ul className="space-y-2">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm text-namc-gray-600 group">
                <div className="w-2 h-2 bg-gradient-to-r from-namc-blue-400 to-namc-blue-500 rounded-full mt-2 mr-3 flex-shrink-0 group-hover:scale-125 transition-transform duration-300" />
                <span className="group-hover:text-namc-gray-700 transition-colors duration-300">{feature}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
      {actionLabel && (
        <div className="pt-6 mt-auto">
          <div className="flex items-center text-sm font-bold text-namc-blue-600 group-hover:text-namc-blue-700 transition-colors duration-300">
            <span>{actionLabel}</span>
            <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
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