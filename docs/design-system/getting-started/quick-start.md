# Quick Start Guide

## 🚀 Get Started with NAMC Design System

This guide will help you quickly implement the NAMC Design System in your project and start building consistent, accessible interfaces.

## Installation

### 1. Prerequisites

Ensure you have the following installed:
- Node.js 18+ 
- React 18+
- Next.js 14+
- Tailwind CSS 3.4+

### 2. Install Dependencies

```bash
npm install class-variance-authority clsx tailwind-merge
npm install lucide-react # for icons
npm install @radix-ui/react-slot # for flexible component composition
```

### 3. Configure Tailwind CSS

Update your `tailwind.config.js` to include NAMC design tokens:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        namc: {
          blue: {
            50: '#eff6ff',
            100: '#dbeafe',
            200: '#bfdbfe',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          gold: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b',
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
          },
          gray: {
            50: '#f9fafb',
            100: '#f3f4f6',
            200: '#e5e7eb',
            300: '#d1d5db',
            400: '#9ca3af',
            500: '#6b7280',
            600: '#4b5563',
            700: '#374151',
            800: '#1f2937',
            900: '#111827',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

### 4. Add Design System Files

Copy the design system files to your project:

```bash
# Copy design tokens and utilities
cp -r docs/design-system/src/design-system src/
cp -r docs/design-system/src/components/ui src/components/
```

## Your First Component

### 1. Create a Simple Button

```tsx
// src/components/example.tsx
import { Button } from '@/components/ui/sets/professional/button'
import { Download } from 'lucide-react'

export function ExampleComponent() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold text-namc-gray-900">
        Welcome to NAMC Portal
      </h1>
      
      <div className="space-x-4">
        <Button variant="default">
          Primary Action
        </Button>
        
        <Button variant="outline">
          Secondary Action
        </Button>
        
        <Button 
          variant="ghost" 
          leftIcon={<Download className="h-4 w-4" />}
        >
          Download
        </Button>
      </div>
    </div>
  )
}
```

### 2. Add to Your Page

```tsx
// src/app/page.tsx
import { ExampleComponent } from '@/components/example'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-namc-gray-50">
      <ExampleComponent />
    </main>
  )
}
```

## Common Patterns

### Dashboard Layout

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/sets/professional/card'
import { Button } from '@/components/ui/sets/professional/button'
import { Users, Building2, Calendar } from 'lucide-react'

export function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-namc-gray-900">
          Dashboard
        </h1>
        <Button leftIcon={<Plus />}>
          New Project
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-namc-gray-600">
                  Active Members
                </p>
                <p className="text-3xl font-bold text-namc-gray-900">
                  1,234
                </p>
              </div>
              <Users className="h-8 w-8 text-namc-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-namc-gray-600">
                  Active Projects
                </p>
                <p className="text-3xl font-bold text-namc-gray-900">
                  56
                </p>
              </div>
              <Building2 className="h-8 w-8 text-namc-gold-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-namc-gray-600">
                  Upcoming Events
                </p>
                <p className="text-3xl font-bold text-namc-gray-900">
                  8
                </p>
              </div>
              <Calendar className="h-8 w-8 text-namc-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

### Form Layout

```tsx
import { Button } from '@/components/ui/sets/professional/button'
import { Input } from '@/components/ui/sets/professional/input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/sets/professional/card'

export function ProfileForm() {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-namc-gray-700 mb-1">
              First Name
            </label>
            <Input 
              placeholder="Enter your first name"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-namc-gray-700 mb-1">
              Last Name
            </label>
            <Input 
              placeholder="Enter your last name"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-namc-gray-700 mb-1">
            Email Address
          </label>
          <Input 
            type="email"
            placeholder="your.email@company.com"
            required
          />
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline">
            Cancel
          </Button>
          <Button type="submit">
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
```

## Component Sets

The NAMC Design System includes three component sets. Choose the one that best fits your use case:

### Professional Corporate (Recommended)
Best for: Government contractors, compliance-focused applications

```tsx
import { Button } from '@/components/ui/sets/professional/button'
import { Card } from '@/components/ui/sets/professional/card'

// Traditional, formal styling
<Button variant="default">Submit Application</Button>
```

### Modern Minimalist
Best for: Mobile-first applications, performance-critical sections

```tsx
import { Button } from '@/components/ui/sets/minimalist/button'
import { Card } from '@/components/ui/sets/minimalist/card'

// Clean, efficient design
<Button variant="default">Save Changes</Button>
```

### Interactive Dynamic
Best for: Community features, engaging interactions

```tsx
import { Button } from '@/components/ui/sets/dynamic/button'
import { Card } from '@/components/ui/sets/dynamic/card'

// Animated, engaging design
<Button variant="default" glow>Join Community</Button>
```

## Essential Utilities

### Styling Utilities

```tsx
import { cn } from '@/lib/utils'

// Combine classes conditionally
const buttonClass = cn(
  'base-button-styles',
  isActive && 'active-styles',
  className
)
```

### Design Tokens

```tsx
import { designTokens } from '@/design-system/tokens'

// Access design tokens programmatically
const primaryColor = designTokens.colors.namc.blue[600]
const spacing = designTokens.spacing[4]
```

## Accessibility Quick Checklist

✅ **Color Contrast**: All combinations meet WCAG 2.1 AA standards
✅ **Keyboard Navigation**: All interactive elements are keyboard accessible
✅ **Screen Readers**: Proper ARIA labels and semantic HTML
✅ **Focus Management**: Visible focus indicators throughout
✅ **Responsive Design**: Works on all device sizes

## Common Styling Patterns

### Page Layout

```tsx
export function PageLayout({ children }) {
  return (
    <div className="min-h-screen bg-namc-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-namc-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-namc-gray-900">
            NAMC Portal
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  )
}
```

### Status Indicators

```tsx
// Success state
<div className="flex items-center text-green-600">
  <CheckCircle className="h-4 w-4 mr-2" />
  Application submitted successfully
</div>

// Warning state
<div className="flex items-center text-yellow-600">
  <AlertTriangle className="h-4 w-4 mr-2" />
  Please review your information
</div>

// Error state
<div className="flex items-center text-red-600">
  <XCircle className="h-4 w-4 mr-2" />
  Failed to save changes
</div>
```

### Loading States

```tsx
function LoadingButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  return (
    <Button 
      loading={isLoading}
      onClick={() => setIsLoading(true)}
    >
      {isLoading ? 'Processing...' : 'Submit'}
    </Button>
  )
}
```

## Next Steps

1. **Explore Components**: Check out the [Component Showcase](../../src/app/component-showcase/) for interactive examples
2. **Read Guidelines**: Review [Typography](../foundations/typography.md) and [Color](../foundations/colors.md) foundations
3. **Build Features**: Start implementing your specific NAMC portal features
4. **Test Accessibility**: Use automated testing tools and manual keyboard navigation
5. **Get Help**: Refer to [troubleshooting guide](../resources/troubleshooting.md) for common issues

## Resources

- **[Component Examples](../components/)** - Detailed component documentation
- **[Design Tokens](../foundations/)** - Color, typography, and spacing guidelines
- **[Best Practices](../resources/best-practices.md)** - Implementation recommendations
- **[Accessibility Guide](../foundations/accessibility.md)** - WCAG compliance details

---

**Need Help?** Check the [troubleshooting guide](../resources/troubleshooting.md) or reach out to the NAMC development team.