import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-namc-blue-600 text-white hover:bg-namc-blue-700 shadow-sm hover:shadow border-0 hover:scale-105',
        destructive:
          'bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow border-0 hover:scale-105',
        outline:
          'border border-namc-gray-200 bg-background hover:bg-namc-blue-50 hover:border-namc-blue-300 text-namc-blue-600 hover:scale-105',
        secondary:
          'bg-namc-gray-100 text-namc-gray-800 hover:bg-namc-gray-200 border-0 hover:scale-105',
        ghost: 'hover:bg-namc-gray-50 hover:text-namc-gray-900 text-namc-gray-600 hover:scale-105',
        link: 'text-namc-blue-600 underline-offset-4 hover:underline font-medium',
        gold: 'bg-namc-gold-500 text-white hover:bg-namc-gold-600 shadow-sm hover:shadow border-0 hover:scale-105',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-12 rounded-lg px-6 text-base',
        xl: 'h-14 rounded-lg px-8 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {children}
          </>
        ) : (
          <>
            {leftIcon && <span className="mr-2 opacity-80">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2 opacity-80">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }