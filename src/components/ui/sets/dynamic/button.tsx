import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 transform hover:scale-105 active:scale-95',
  {
    variants: {
      variant: {
        default:
          'bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 hover:from-namc-blue-700 hover:to-namc-blue-800 text-white shadow-md hover:shadow-lg',
        destructive:
          'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg',
        outline:
          'bg-transparent hover:bg-namc-blue-50 text-namc-blue-600 border-2 border-namc-blue-300 hover:border-namc-blue-500 hover:shadow-md',
        secondary:
          'bg-namc-gray-200 hover:bg-namc-gray-300 text-namc-gray-800 shadow-sm hover:shadow-md',
        ghost: 'bg-transparent hover:bg-namc-gray-100 text-namc-gray-700 hover:shadow-sm',
        link: 'text-namc-blue-600 underline-offset-4 hover:underline font-bold',
        gold: 'bg-gradient-to-r from-namc-gold-500 to-namc-gold-600 hover:from-namc-gold-600 hover:to-namc-gold-700 text-white shadow-md hover:shadow-lg',
        success: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-md hover:shadow-lg',
      },
      size: {
        default: 'h-11 px-6 py-2',
        sm: 'h-9 rounded-lg px-4 text-xs',
        lg: 'h-13 rounded-xl px-8 text-base',
        xl: 'h-16 rounded-2xl px-10 text-lg',
        icon: 'h-11 w-11',
      },
      pulse: {
        true: 'animate-pulse-subtle',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      pulse: false,
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
  pulse?: boolean
  glow?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, pulse, glow = false, asChild = false, loading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, pulse, className }),
          glow && 'hover:shadow-[0_0_20px_rgba(59,130,246,0.5)]',
          loading && 'pointer-events-none'
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        <div className="flex items-center relative">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span className="opacity-70">{children}</span>
            </>
          ) : (
            <>
              {leftIcon && (
                <span className="mr-2 transition-transform duration-300 group-hover:scale-110">
                  {leftIcon}
                </span>
              )}
              <span className="relative z-10">{children}</span>
              {rightIcon && (
                <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">
                  {rightIcon}
                </span>
              )}
            </>
          )}
        </div>
        {/* Ripple effect overlay */}
        <div className="absolute inset-0 rounded-xl bg-white opacity-0 hover:opacity-10 transition-opacity duration-300" />
      </Comp>
    )
  }
)
Button.displayName = 'Button'

// Floating Action Button variant
export interface FabProps extends ButtonProps {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ position = 'bottom-right', className, ...props }, ref) => {
    const positionClasses = {
      'bottom-right': 'fixed bottom-6 right-6',
      'bottom-left': 'fixed bottom-6 left-6',
      'top-right': 'fixed top-6 right-6',
      'top-left': 'fixed top-6 left-6',
    }

    return (
      <Button
        ref={ref}
        size="icon"
        className={cn(
          positionClasses[position],
          'z-50 rounded-full shadow-2xl hover:shadow-3xl',
          className
        )}
        glow
        {...props}
      />
    )
  }
)
FloatingActionButton.displayName = 'FloatingActionButton'

export { Button, FloatingActionButton, buttonVariants }