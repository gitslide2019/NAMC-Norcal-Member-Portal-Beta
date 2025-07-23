import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        // Base system variants
        default: "bg-namc-blue-600 text-white hover:bg-namc-blue-700 focus-visible:ring-namc-blue-500 shadow-namc-sm hover:shadow-namc-md",
        destructive: "bg-namc-red-500 text-white hover:bg-namc-red-600 focus-visible:ring-namc-red-500 shadow-sm",
        outline: "border border-namc-gray-300 bg-white text-namc-gray-700 hover:bg-namc-gray-50 hover:border-namc-gray-400 focus-visible:ring-namc-blue-500",
        secondary: "bg-namc-gray-100 text-namc-gray-900 hover:bg-namc-gray-200 focus-visible:ring-namc-gray-500",
        ghost: "text-namc-gray-700 hover:bg-namc-gray-100 hover:text-namc-gray-900 focus-visible:ring-namc-gray-500",
        link: "text-namc-blue-600 underline-offset-4 hover:underline focus-visible:ring-namc-blue-500",
        
        // Enhanced NAMC variants inspired by 21st.dev
        primary: "bg-namc-blue-600 text-white hover:bg-namc-blue-700 focus-visible:ring-namc-blue-500 shadow-namc-sm hover:shadow-namc-md",
        success: "bg-namc-green-600 text-white hover:bg-namc-green-700 focus-visible:ring-namc-green-500 shadow-sm",
        warning: "bg-namc-gold-500 text-white hover:bg-namc-gold-600 focus-visible:ring-namc-gold-500 shadow-sm",
        danger: "bg-namc-red-500 text-white hover:bg-namc-red-600 focus-visible:ring-namc-red-500 shadow-sm",
        info: "bg-namc-cyan-500 text-white hover:bg-namc-cyan-600 focus-visible:ring-namc-cyan-500 shadow-sm",
        
        // Outline variants
        "outline-primary": "border border-namc-blue-600 text-namc-blue-600 hover:bg-namc-blue-50 focus-visible:ring-namc-blue-500",
        "outline-success": "border border-namc-green-600 text-namc-green-600 hover:bg-namc-green-50 focus-visible:ring-namc-green-500",
        "outline-warning": "border border-namc-gold-500 text-namc-gold-600 hover:bg-namc-gold-50 focus-visible:ring-namc-gold-500",
        "outline-danger": "border border-namc-red-500 text-namc-red-600 hover:bg-namc-red-50 focus-visible:ring-namc-red-500",
        
        // Ghost variants
        "ghost-primary": "text-namc-blue-600 hover:bg-namc-blue-50 hover:text-namc-blue-700 focus-visible:ring-namc-blue-500",
        "ghost-success": "text-namc-green-600 hover:bg-namc-green-50 hover:text-namc-green-700 focus-visible:ring-namc-green-500",
        "ghost-warning": "text-namc-gold-600 hover:bg-namc-gold-50 hover:text-namc-gold-700 focus-visible:ring-namc-gold-500",
        "ghost-danger": "text-namc-red-600 hover:bg-namc-red-50 hover:text-namc-red-700 focus-visible:ring-namc-red-500",
        
        // Special variants
        gradient: "bg-gradient-to-r from-namc-blue-600 to-namc-blue-700 text-white hover:from-namc-blue-700 hover:to-namc-blue-800 shadow-namc-md",
        gold: "bg-namc-gold-600 text-white hover:bg-namc-gold-700 focus-visible:ring-namc-gold-500 shadow-sm",
      },
      size: {
        xs: "h-8 px-3 text-xs",
        sm: "h-9 px-4 text-sm",
        default: "h-11 px-6 py-2",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-11 w-11",
        "icon-sm": "h-9 w-9",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants } 