import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// 21st.dev inspired card variants with NAMC styling
const cardVariants = cva(
  "rounded-xl border bg-card text-card-foreground shadow-sm transition-all duration-200",
  {
    variants: {
      variant: {
        default: "border-namc-gray-200 bg-white",
        outlined: "border-namc-gray-300 bg-white hover:border-namc-blue-300",
        elevated: "border-namc-gray-200 bg-white shadow-namc-md hover:shadow-namc-lg",
        gradient: "border-transparent bg-gradient-to-br from-namc-blue-50 to-namc-blue-100",
        interactive: "border-namc-gray-200 bg-white hover:shadow-namc-md hover:border-namc-blue-300 cursor-pointer",
        feature: "border-namc-blue-200 bg-gradient-to-br from-white to-namc-blue-50",
      },
      size: {
        sm: "p-4",
        default: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof cardVariants>
>(({ className, variant, size, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(cardVariants({ variant, size, className }))}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-namc-gray-900",
      className
    )}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-namc-gray-600 leading-relaxed", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-4 border-t border-namc-gray-100", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

// Specialized card components for NAMC use cases

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  description?: string
  trend?: "up" | "down" | "neutral"
  trendValue?: string
  icon?: React.ReactNode
}

const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ className, title, value, description, trend, trendValue, icon, ...props }, ref) => (
    <Card ref={ref} variant="elevated" className={cn("", className)} {...props}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-namc-gray-600">{title}</p>
            <p className="text-3xl font-bold text-namc-gray-900 mt-2">{value}</p>
            {description && (
              <p className="text-sm text-namc-gray-500 mt-1">{description}</p>
            )}
            {trend && trendValue && (
              <div className="flex items-center mt-2">
                <span
                  className={cn(
                    "text-sm font-medium",
                    trend === "up" && "text-namc-green-600",
                    trend === "down" && "text-namc-red-600",
                    trend === "neutral" && "text-namc-gray-600"
                  )}
                >
                  {trendValue}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-namc-blue-100 rounded-xl flex items-center justify-center">
                {icon}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
)
MetricCard.displayName = "MetricCard"

interface FeatureCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  icon?: React.ReactNode
  features?: string[]
  actionLabel?: string
  onAction?: () => void
}

const FeatureCard = React.forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ className, title, description, icon, features, actionLabel, onAction, ...props }, ref) => (
    <Card ref={ref} variant="interactive" className={cn("h-full", className)} {...props}>
      <CardHeader>
        {icon && (
          <div className="w-12 h-12 bg-namc-blue-100 rounded-xl flex items-center justify-center mb-4">
            {icon}
          </div>
        )}
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {features && (
          <ul className="space-y-2 text-sm text-namc-gray-600">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <span className="inline-block w-1.5 h-1.5 bg-namc-blue-600 rounded-full mt-2 mr-3 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {actionLabel && onAction && (
        <CardFooter>
          <button
            onClick={onAction}
            className="w-full bg-namc-blue-600 hover:bg-namc-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            {actionLabel}
          </button>
        </CardFooter>
      )}
    </Card>
  )
)
FeatureCard.displayName = "FeatureCard"

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