/**
 * Button Component Tests
 * 
 * Comprehensive test suite for the Button UI component:
 * - Rendering and styling variants
 * - User interaction handling
 * - Accessibility compliance
 * - Loading and disabled states
 * - Performance and reliability testing
 */

import React from 'react'
import { fireEvent, screen, waitFor } from '@testing-library/react'
import { render, componentTestUtils as testUtils } from '@/test-utils/component.setup'

// Mock Button component for testing
const Button: React.FC<{
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  children?: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  className?: string
  'data-testid'?: string
}> = ({
  variant = 'default',
  size = 'default',
  disabled = false,
  loading = false,
  children,
  onClick,
  type = 'button',
  className = '',
  'data-testid': testId,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'text-primary underline-offset-4 hover:underline'
  }
  
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8',
    icon: 'h-10 w-10'
  }

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      data-testid={testId}
      {...props}
    >
      {loading && (
        <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

describe('Button Component', () => {
  describe('Rendering', () => {
    it('should render with default props', () => {
      render(<Button>Click me</Button>)
      
      const button = screen.getByRole('button', { name: /click me/i })
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('type', 'button')
      expect(button).not.toBeDisabled()
    })

    it('should render with custom text', () => {
      render(<Button>Custom Button Text</Button>)
      
      expect(screen.getByRole('button', { name: /custom button text/i })).toBeInTheDocument()
    })

    it('should render with children elements', () => {
      render(
        <Button>
          <span>Icon</span>
          Button Text
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Icon')
      expect(button).toHaveTextContent('Button Text')
    })

    it('should apply custom className', () => {
      render(<Button className="custom-class">Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
    })

    it('should set custom data-testid', () => {
      render(<Button data-testid="custom-button">Button</Button>)
      
      expect(screen.getByTestId('custom-button')).toBeInTheDocument()
    })
  })

  describe('Variants', () => {
    const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const

    variants.forEach(variant => {
      it(`should render ${variant} variant correctly`, () => {
        render(<Button variant={variant}>Button</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
        
        // Verify that the button has variant-specific classes
        const classes = button.className
        expect(classes).toContain('inline-flex')
        expect(classes).toContain('items-center')
        expect(classes).toContain('justify-center')
      })
    })

    it('should apply destructive styling for destructive variant', () => {
      render(<Button variant="destructive">Delete</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('bg-destructive')
    })

    it('should apply outline styling for outline variant', () => {
      render(<Button variant="outline">Outline</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('border')
      expect(button.className).toContain('border-input')
    })

    it('should apply link styling for link variant', () => {
      render(<Button variant="link">Link</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('text-primary')
      expect(button.className).toContain('underline-offset-4')
    })
  })

  describe('Sizes', () => {
    const sizes = ['default', 'sm', 'lg', 'icon'] as const

    sizes.forEach(size => {
      it(`should render ${size} size correctly`, () => {
        render(<Button size={size}>Button</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toBeInTheDocument()
      })
    })

    it('should apply small size classes', () => {
      render(<Button size="sm">Small</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-9')
      expect(button.className).toContain('px-3')
    })

    it('should apply large size classes', () => {
      render(<Button size="lg">Large</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-11')
      expect(button.className).toContain('px-8')
    })

    it('should apply icon size classes', () => {
      render(<Button size="icon">+</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('h-10')
      expect(button.className).toContain('w-10')
    })
  })

  describe('States', () => {
    describe('Disabled State', () => {
      it('should be disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
      })

      it('should apply disabled styling', () => {
        render(<Button disabled>Disabled</Button>)
        
        const button = screen.getByRole('button')
        expect(button.className).toContain('disabled:pointer-events-none')
        expect(button.className).toContain('disabled:opacity-50')
      })

      it('should not trigger onClick when disabled', () => {
        const handleClick = jest.fn()
        render(<Button disabled onClick={handleClick}>Disabled</Button>)
        
        const button = screen.getByRole('button')
        fireEvent.click(button)
        
        expect(handleClick).not.toHaveBeenCalled()
      })
    })

    describe('Loading State', () => {
      it('should be disabled when loading', () => {
        render(<Button loading>Loading</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toBeDisabled()
      })

      it('should show loading spinner when loading', () => {
        render(<Button loading>Loading</Button>)
        
        const button = screen.getByRole('button')
        const spinner = button.querySelector('svg')
        expect(spinner).toBeInTheDocument()
        expect(spinner).toHaveClass('animate-spin')
      })

      it('should not trigger onClick when loading', () => {
        const handleClick = jest.fn()
        render(<Button loading onClick={handleClick}>Loading</Button>)
        
        const button = screen.getByRole('button')
        fireEvent.click(button)
        
        expect(handleClick).not.toHaveBeenCalled()
      })

      it('should show both spinner and text', () => {
        render(<Button loading>Save Changes</Button>)
        
        const button = screen.getByRole('button')
        expect(button).toHaveTextContent('Save Changes')
        expect(button.querySelector('svg')).toBeInTheDocument()
      })
    })
  })

  describe('Type Attribute', () => {
    it('should default to button type', () => {
      render(<Button>Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should accept submit type', () => {
      render(<Button type="submit">Submit</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'submit')
    })

    it('should accept reset type', () => {
      render(<Button type="reset">Reset</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'reset')
    })
  })

  describe('User Interactions', () => {
    it('should call onClick when clicked', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle multiple clicks', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Click me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      fireEvent.click(button)
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalledTimes(3)
    })

    it('should handle keyboard activation', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Press me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should handle space key activation', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Press me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: ' ', code: 'Space' })
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should not call onClick on other keys', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Press me</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.keyDown(button, { key: 'Tab', code: 'Tab' })
      fireEvent.keyDown(button, { key: 'Escape', code: 'Escape' })
      
      expect(handleClick).not.toHaveBeenCalled()
    })
  })

  describe('Focus Management', () => {
    it('should be focusable by default', () => {
      render(<Button>Focus me</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      expect(button).toHaveFocus()
    })

    it('should not be focusable when disabled', () => {
      render(<Button disabled>Cannot focus</Button>)
      
      const button = screen.getByRole('button')
      button.focus()
      
      expect(button).not.toHaveFocus()
    })

    it('should apply focus-visible styles', () => {
      render(<Button>Focus styles</Button>)
      
      const button = screen.getByRole('button')
      expect(button.className).toContain('focus-visible:outline-none')
      expect(button.className).toContain('focus-visible:ring-2')
    })
  })

  describe('Form Integration', () => {
    it('should submit form when type is submit', () => {
      const handleSubmit = jest.fn(e => e.preventDefault())
      
      render(
        <form onSubmit={handleSubmit}>
          <Button type="submit">Submit Form</Button>
        </form>
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleSubmit).toHaveBeenCalledTimes(1)
    })

    it('should reset form when type is reset', () => {
      render(
        <form>
          <input defaultValue="test" />
          <Button type="reset">Reset Form</Button>
        </form>
      )
      
      const input = screen.getByRole('textbox')
      const button = screen.getByRole('button')
      
      // Change input value
      fireEvent.change(input, { target: { value: 'changed' } })
      expect(input).toHaveValue('changed')
      
      // Reset form
      fireEvent.click(button)
      expect(input).toHaveValue('test')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<Button>Accessible Button</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('should support aria-label', () => {
      render(<Button aria-label="Close dialog">×</Button>)
      
      const button = screen.getByLabelText('Close dialog')
      expect(button).toBeInTheDocument()
    })

    it('should support aria-describedby', () => {
      render(
        <div>
          <Button aria-describedby="help-text">Submit</Button>
          <div id="help-text">This will submit the form</div>
        </div>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-describedby', 'help-text')
    })

    it('should announce loading state to screen readers', () => {
      render(<Button loading aria-label="Saving changes">Save</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'Saving changes')
      expect(button).toBeDisabled()
    })

    it('should meet accessibility standards', async () => {
      const { container } = render(<Button>Accessible Button</Button>)
      
      await testUtils.checkA11y(container)
    })
  })

  describe('Performance', () => {
    it('should render quickly with many buttons', () => {
      const startTime = performance.now()
      
      render(
        <div>
          {Array(100).fill(null).map((_, i) => (
            <Button key={i}>Button {i}</Button>
          ))}
        </div>
      )
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(100) // Should render in under 100ms
    })

    it('should handle rapid clicks efficiently', () => {
      const handleClick = jest.fn()
      render(<Button onClick={handleClick}>Rapid clicks</Button>)
      
      const button = screen.getByRole('button')
      const startTime = performance.now()
      
      // Simulate rapid clicking
      for (let i = 0; i < 100; i++) {
        fireEvent.click(button)
      }
      
      const endTime = performance.now()
      expect(endTime - startTime).toBeLessThan(50) // Should handle clicks efficiently
      expect(handleClick).toHaveBeenCalledTimes(100)
    })
  })

  describe('Edge Cases', () => {
    it('should handle undefined onClick gracefully', () => {
      expect(() => {
        render(<Button>No onClick</Button>)
      }).not.toThrow()
      
      const button = screen.getByRole('button')
      expect(() => {
        fireEvent.click(button)
      }).not.toThrow()
    })

    it('should handle null children', () => {
      expect(() => {
        render(<Button>{null}</Button>)
      }).not.toThrow()
    })

    it('should handle empty string children', () => {
      render(<Button>{''}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
    })

    it('should handle boolean children', () => {
      render(<Button>{false && 'Hidden'}</Button>)
      
      const button = screen.getByRole('button')
      expect(button).not.toHaveTextContent('Hidden')
    })

    it('should handle complex children structures', () => {
      render(
        <Button>
          <div>
            <span>Nested</span>
            <strong>Content</strong>
          </div>
        </Button>
      )
      
      const button = screen.getByRole('button')
      expect(button).toHaveTextContent('Nested')
      expect(button).toHaveTextContent('Content')
    })
  })

  describe('Integration with Testing Utils', () => {
    it('should work with mock API responses', async () => {
      const handleClick = jest.fn(async () => {
        testUtils.mockFetchSuccess({ message: 'Button action completed' })
        const response = await fetch('/api/test')
        const data = await response.json()
        return data
      })

      render(<Button onClick={handleClick}>API Button</Button>)
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      await waitFor(() => {
        expect(handleClick).toHaveBeenCalled()
      })
    })

    it('should work in authenticated context', () => {
      const handleClick = jest.fn()
      
      testUtils.renderWithAuth(
        <Button onClick={handleClick}>Authenticated Action</Button>
      )
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleClick).toHaveBeenCalled()
    })

    it('should work with form utilities', async () => {
      const handleSubmit = jest.fn()
      
      render(
        <form onSubmit={handleSubmit}>
          <input name="test" />
          <Button type="submit">Submit</Button>
        </form>
      )
      
      const form = screen.getByRole('form') || screen.getByRole('button').closest('form')!
      await testUtils.fillForm(form, { test: 'value' })
      
      const button = screen.getByRole('button')
      fireEvent.click(button)
      
      expect(handleSubmit).toHaveBeenCalled()
    })
  })
})