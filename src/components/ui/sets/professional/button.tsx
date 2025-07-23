import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-semibold ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'bg-namc-blue-800 text-white hover:bg-namc-blue-900 border border-namc-blue-800 hover:border-namc-blue-900 shadow-sm hover:shadow-md',
        destructive:
          'bg-red-600 text-white hover:bg-red-700 border border-red-600 hover:border-red-700 shadow-sm hover:shadow-md',
        outline:
          'border border-namc-gray-300 bg-background hover:bg-namc-gray-50 hover:border-namc-gray-400 text-namc-gray-700',
        secondary:
          'bg-white text-namc-gray-700 hover:bg-namc-gray-50 border border-namc-gray-300 hover:border-namc-gray-400 shadow-sm',
        ghost: 'hover:bg-namc-gray-100 hover:text-namc-gray-900 text-namc-gray-700',
        link: 'text-namc-blue-700 underline-offset-4 hover:underline font-medium',
        gold: 'bg-namc-gold-600 text-white hover:bg-namc-gold-700 border border-namc-gold-600 hover:border-namc-gold-700 shadow-sm hover:shadow-md',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
        xl: 'h-12 rounded-md px-10 text-base',
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
            {leftIcon && <span className="mr-2">{leftIcon}</span>}
            {children}
            {rightIcon && <span className="ml-2">{rightIcon}</span>}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }