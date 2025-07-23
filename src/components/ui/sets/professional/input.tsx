import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/design-system/utils'
import { Eye, EyeOff, Search, AlertCircle, CheckCircle } from 'lucide-react'

const inputVariants = cva(
  'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
  {
    variants: {
      variant: {
        default: 'border-namc-gray-300 focus-visible:ring-namc-blue-500 focus-visible:border-namc-blue-500',
        error: 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 bg-red-50',
        success: 'border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500 bg-green-50',
        warning: 'border-yellow-500 focus-visible:ring-yellow-500 focus-visible:border-yellow-500 bg-yellow-50',
      },
      size: {
        sm: 'h-8 px-2 text-xs',
        default: 'h-10',
        lg: 'h-12 px-4',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  success?: string
  helpText?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, size, leftIcon, rightIcon, error, success, helpText, ...props }, ref) => {
    // Determine variant based on state
    const effectiveVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="space-y-1">
        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-namc-gray-400">{leftIcon}</span>
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: effectiveVariant, size, className }),
              leftIcon && 'pl-10',
              rightIcon && 'pr-10'
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-namc-gray-400">{rightIcon}</span>
            </div>
          )}
          {error && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
          )}
          {success && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-600 font-medium">{error}</p>
        )}
        {success && (
          <p className="text-sm text-green-600 font-medium">{success}</p>
        )}
        {helpText && !error && !success && (
          <p className="text-sm text-namc-gray-500">{helpText}</p>
        )}
      </div>
    )
  }
)
Input.displayName = 'Input'

// Password Input Component
export interface PasswordInputProps extends Omit<InputProps, 'type' | 'rightIcon'> {
  showPasswordToggle?: boolean
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showPasswordToggle = true, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    return (
      <div className="relative">
        <Input
          {...props}
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          rightIcon={
            showPasswordToggle ? (
              <button
                type="button"
                className="pointer-events-auto hover:text-namc-gray-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            ) : undefined
          }
        />
      </div>
    )
  }
)
PasswordInput.displayName = 'PasswordInput'

// Search Input Component
export interface SearchInputProps extends Omit<InputProps, 'leftIcon' | 'type'> {
  onSearch?: (value: string) => void
  clearable?: boolean
}

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ onSearch, clearable = true, ...props }, ref) => {
    const [value, setValue] = React.useState('')

    const handleSearch = React.useCallback(
      (searchValue: string) => {
        setValue(searchValue)
        onSearch?.(searchValue)
      },
      [onSearch]
    )

    const handleClear = () => {
      setValue('')
      onSearch?.('')
    }

    return (
      <Input
        {...props}
        ref={ref}
        type="search"
        value={value}
        onChange={(e) => handleSearch(e.target.value)}
        leftIcon={<Search className="h-4 w-4" />}
        rightIcon={
          clearable && value ? (
            <button
              type="button"
              className="pointer-events-auto hover:text-namc-gray-600 transition-colors"
              onClick={handleClear}
              tabIndex={-1}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : undefined
        }
      />
    )
  }
)
SearchInput.displayName = 'SearchInput'

// Textarea Component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  error?: string
  success?: string
  helpText?: string
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, error, success, helpText, resize = 'vertical', ...props }, ref) => {
    // Determine variant based on state
    const effectiveVariant = error ? 'error' : success ? 'success' : variant

    return (
      <div className="space-y-1">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200',
            effectiveVariant === 'error' && 'border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500 bg-red-50',
            effectiveVariant === 'success' && 'border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500 bg-green-50',
            effectiveVariant === 'default' && 'border-namc-gray-300 focus-visible:ring-namc-blue-500 focus-visible:border-namc-blue-500',
            {
              'resize-none': resize === 'none',
              'resize': resize === 'both',
              'resize-x': resize === 'horizontal',
              'resize-y': resize === 'vertical',
            },
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600 font-medium flex items-center">
            <AlertCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 font-medium flex items-center">
            <CheckCircle className="h-4 w-4 mr-1" />
            {success}
          </p>
        )}
        {helpText && !error && !success && (
          <p className="text-sm text-namc-gray-500">{helpText}</p>
        )}
      </div>
    )
  }
)
Textarea.displayName = 'Textarea'

export { Input, PasswordInput, SearchInput, Textarea, inputVariants }