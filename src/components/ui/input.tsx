import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Search, Eye, EyeOff, AlertCircle, Check } from "lucide-react"

import { cn } from "@/lib/utils"

// 21st.dev inspired input variants with NAMC styling
const inputVariants = cva(
  "flex w-full rounded-lg border bg-background text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-namc-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "border-namc-gray-300 focus-visible:border-namc-blue-500 focus-visible:ring-2 focus-visible:ring-namc-blue-100",
        error: "border-namc-red-500 focus-visible:border-namc-red-500 focus-visible:ring-2 focus-visible:ring-namc-red-100",
        success: "border-namc-green-500 focus-visible:border-namc-green-500 focus-visible:ring-2 focus-visible:ring-namc-green-100",
        warning: "border-namc-gold-500 focus-visible:border-namc-gold-500 focus-visible:ring-2 focus-visible:ring-namc-gold-100",
      },
      size: {
        sm: "h-9 px-3 py-1 text-sm",
        default: "h-11 px-4 py-2",
        lg: "h-12 px-4 py-3 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  error?: string
  success?: string
  warning?: string
  label?: string
  description?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    variant, 
    size, 
    type, 
    error, 
    success, 
    warning, 
    label,
    description,
    required,
    leftIcon,
    rightIcon,
    ...props 
  }, ref) => {
    // Auto-determine variant based on validation state
    const computedVariant = error ? "error" : success ? "success" : warning ? "warning" : variant

    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-namc-gray-700">
            {label}
            {required && <span className="text-namc-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-namc-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              inputVariants({ variant: computedVariant, size, className }),
              leftIcon && "pl-10",
              rightIcon && "pr-10"
            )}
            ref={ref}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-namc-gray-400">
              {rightIcon}
            </div>
          )}
          
          {/* Auto validation icons */}
          {error && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-namc-red-500">
              <AlertCircle className="h-4 w-4" />
            </div>
          )}
          
          {success && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-namc-green-500">
              <Check className="h-4 w-4" />
            </div>
          )}
        </div>

        {description && !error && !success && !warning && (
          <p className="text-xs text-namc-gray-500">{description}</p>
        )}
        
        {error && (
          <p className="text-xs text-namc-red-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {error}
          </p>
        )}
        
        {success && (
          <p className="text-xs text-namc-green-600 flex items-center gap-1">
            <Check className="h-3 w-3" />
            {success}
          </p>
        )}
        
        {warning && (
          <p className="text-xs text-namc-gold-600 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {warning}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

// Specialized input components for NAMC use cases

interface SearchInputProps extends Omit<InputProps, "type" | "leftIcon"> {
  onSearch?: (value: string) => void
  onClear?: () => void
  showClearButton?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, onClear, showClearButton = true, className, ...props }, ref) => {
    const [value, setValue] = React.useState<string>("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      setValue(newValue)
      onSearch?.(newValue)
    }

    const handleClear = () => {
      setValue("")
      onClear?.()
    }

    return (
      <Input
        ref={ref}
        type="search"
        placeholder="Search..."
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          showClearButton && value ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-namc-gray-400 hover:text-namc-gray-600"
            >
              ×
            </button>
          ) : null
        }
        value={value}
        onChange={handleChange}
        className={cn("", className)}
        {...props}
      />
    )
  }
)
SearchInput.displayName = "SearchInput"

interface PasswordInputProps extends Omit<InputProps, "type" | "rightIcon"> {
  showPasswordToggle?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showPasswordToggle = true, className, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePassword = () => setShowPassword(!showPassword)

    return (
      <Input
        ref={ref}
        type={showPassword ? "text" : "password"}
        rightIcon={
          showPasswordToggle ? (
            <button
              type="button"
              onClick={togglePassword}
              className="text-namc-gray-400 hover:text-namc-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          ) : null
        }
        className={cn("", className)}
        {...props}
      />
    )
  }
)
PasswordInput.displayName = "PasswordInput"

interface PhoneInputProps extends Omit<InputProps, "type"> {
  countryCode?: string
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ countryCode = "+1", className, ...props }, ref) => {
    const [value, setValue] = React.useState("")

    const formatPhoneNumber = (value: string) => {
      // Remove all non-digits
      const phoneNumber = value.replace(/\D/g, "")
      
      // Format as (XXX) XXX-XXXX
      if (phoneNumber.length <= 3) {
        return phoneNumber
      } else if (phoneNumber.length <= 6) {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`
      } else {
        return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`
      }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const formatted = formatPhoneNumber(e.target.value)
      setValue(formatted)
    }

    return (
      <div className="flex">
        <div className="flex items-center px-3 border border-r-0 border-namc-gray-300 rounded-l-lg bg-namc-gray-50 text-sm text-namc-gray-600">
          {countryCode}
        </div>
        <Input
          ref={ref}
          type="tel"
          placeholder="(555) 123-4567"
          value={value}
          onChange={handleChange}
          className={cn("rounded-l-none border-l-0", className)}
          {...props}
        />
      </div>
    )
  }
)
PhoneInput.displayName = "PhoneInput"

export { Input, SearchInput, PasswordInput, PhoneInput, inputVariants }