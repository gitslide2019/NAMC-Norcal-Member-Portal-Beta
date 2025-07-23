# Color System

## 🎨 NAMC Brand Color Palette

The NAMC color system is built on accessibility, professionalism, and brand consistency. All colors meet WCAG 2.1 AA contrast requirements and are optimized for government contractor standards.

## Primary Brand Colors

### NAMC Blue
The primary brand color representing trust, stability, and professionalism.

```css
--namc-blue-50: #eff6ff   /* Light backgrounds, subtle accents */
--namc-blue-100: #dbeafe  /* Hover states, disabled backgrounds */
--namc-blue-200: #bfdbfe  /* Borders, dividers */
--namc-blue-300: #93c5fd  /* Interactive elements, icons */
--namc-blue-400: #60a5fa  /* Secondary buttons, links */
--namc-blue-500: #3b82f6  /* Default blue, general use */
--namc-blue-600: #2563eb  /* Primary brand blue */
--namc-blue-700: #1d4ed8  /* Hover states, active elements */
--namc-blue-800: #1e40af  /* Primary text, navigation */
--namc-blue-900: #1e3a8a  /* Dark text, high contrast */
```

**Usage:**
- **Primary Actions**: Blue-600, Blue-700 (hover)
- **Navigation**: Blue-800
- **Links**: Blue-600
- **Backgrounds**: Blue-50, Blue-100

### NAMC Gold
Accent color representing achievement, quality, and success.

```css
--namc-gold-50: #fffbeb   /* Light backgrounds */
--namc-gold-100: #fef3c7  /* Subtle highlights */
--namc-gold-200: #fde68a  /* Borders, accents */
--namc-gold-300: #fcd34d  /* Icons, decorative elements */
--namc-gold-400: #fbbf24  /* Interactive highlights */
--namc-gold-500: #f59e0b  /* Warning states */
--namc-gold-600: #d97706  /* Primary gold, CTAs */
--namc-gold-700: #b45309  /* Hover states */
--namc-gold-800: #92400e  /* Dark accents */
--namc-gold-900: #78350f  /* High contrast text */
```

**Usage:**
- **Accent Elements**: Gold-600
- **Success Indicators**: Gold-500
- **Highlights**: Gold-300, Gold-400
- **Warm Backgrounds**: Gold-50, Gold-100

## Professional Grays

### NAMC Gray Scale
Neutral colors for text, backgrounds, and UI elements.

```css
--namc-gray-50: #f9fafb   /* Page backgrounds */
--namc-gray-100: #f3f4f6  /* Card backgrounds */
--namc-gray-200: #e5e7eb  /* Borders, dividers */
--namc-gray-300: #d1d5db  /* Input borders */
--namc-gray-400: #9ca3af  /* Placeholder text */
--namc-gray-500: #6b7280  /* Secondary text */
--namc-gray-600: #4b5563  /* Body text */
--namc-gray-700: #374151  /* Headings */
--namc-gray-800: #1f2937  /* Primary text */
--namc-gray-900: #111827  /* High contrast text */
```

**Usage:**
- **Primary Text**: Gray-800, Gray-900
- **Secondary Text**: Gray-600, Gray-700
- **Borders**: Gray-200, Gray-300
- **Backgrounds**: Gray-50, Gray-100

## Status Colors

### Success (Green)
For positive actions, confirmations, and success states.

```css
--namc-green-50: #f0fdf4
--namc-green-100: #dcfce7
--namc-green-200: #bbf7d0
--namc-green-300: #86efac
--namc-green-400: #4ade80
--namc-green-500: #22c55e
--namc-green-600: #16a34a  /* Primary success */
--namc-green-700: #15803d
--namc-green-800: #166534
--namc-green-900: #14532d
```

### Warning (Amber)
For cautions, pending states, and important notices.

```css
--namc-yellow-50: #fffbeb
--namc-yellow-100: #fef3c7
--namc-yellow-200: #fde68a
--namc-yellow-300: #fcd34d
--namc-yellow-400: #fbbf24
--namc-yellow-500: #f59e0b  /* Primary warning */
--namc-yellow-600: #d97706
--namc-yellow-700: #b45309
--namc-yellow-800: #92400e
--namc-yellow-900: #78350f
```

### Error (Red)
For errors, destructive actions, and critical alerts.

```css
--namc-red-50: #fef2f2
--namc-red-100: #fee2e2
--namc-red-200: #fecaca
--namc-red-300: #fca5a5
--namc-red-400: #f87171
--namc-red-500: #ef4444   /* Primary error */
--namc-red-600: #dc2626
--namc-red-700: #b91c1c
--namc-red-800: #991b1b
--namc-red-900: #7f1d1d
```

### Info (Cyan)
For informational content, help text, and neutral states.

```css
--namc-cyan-50: #ecfeff
--namc-cyan-100: #cffafe
--namc-cyan-200: #a5f3fc
--namc-cyan-300: #67e8f9
--namc-cyan-400: #22d3ee
--namc-cyan-500: #06b6d4   /* Primary info */
--namc-cyan-600: #0891b2
--namc-cyan-700: #0e7490
--namc-cyan-800: #155e75
--namc-cyan-900: #164e63
```

## Accessibility Compliance

### Contrast Ratios
All color combinations meet WCAG 2.1 AA standards:

| Background | Text Color | Contrast Ratio | Compliance |
|-----------|------------|----------------|------------|
| White | Gray-800 | 12.6:1 | ✅ AAA |
| White | Gray-700 | 9.2:1 | ✅ AAA |
| White | Gray-600 | 7.0:1 | ✅ AAA |
| White | Blue-800 | 8.6:1 | ✅ AAA |
| Blue-800 | White | 8.6:1 | ✅ AAA |
| Gray-50 | Gray-800 | 11.9:1 | ✅ AAA |

### Color Blindness Considerations
- **Red-Green Deficiency**: Icons and additional indicators supplement color
- **Blue-Yellow Deficiency**: High contrast maintained across spectrum
- **Monochrome**: All interfaces remain functional without color

## Usage Guidelines

### Do's ✅

```css
/* Use semantic color names */
.success-button {
  background-color: var(--namc-green-600);
  color: white;
}

/* Maintain contrast ratios */
.text-primary {
  color: var(--namc-gray-800);
}

/* Use appropriate color weights */
.border-light {
  border-color: var(--namc-gray-200);
}
```

### Don'ts ❌

```css
/* Don't use arbitrary hex values */
.button {
  background-color: #1234ab; /* Use design tokens instead */
}

/* Don't create insufficient contrast */
.low-contrast {
  color: var(--namc-gray-400);
  background-color: var(--namc-gray-300); /* Fails contrast ratio */
}

/* Don't use color alone for meaning */
.error-text {
  color: var(--namc-red-600); /* Also add icon or text indicator */
}
```

## Component Color Applications

### Buttons

```tsx
// Primary button
<Button 
  className="bg-namc-blue-800 hover:bg-namc-blue-900 text-white"
>
  Primary Action
</Button>

// Success button  
<Button 
  className="bg-namc-green-600 hover:bg-namc-green-700 text-white"
>
  Save Changes
</Button>

// Warning button
<Button 
  className="bg-namc-yellow-500 hover:bg-namc-yellow-600 text-white"
>
  Proceed with Caution
</Button>
```

### Cards and Surfaces

```tsx
// Default card
<Card className="bg-white border-namc-gray-200">
  <CardContent className="text-namc-gray-800">
    Content goes here
  </CardContent>
</Card>

// Status cards
<Card className="bg-namc-green-50 border-namc-green-200">
  <CardContent className="text-namc-green-800">
    Success message
  </CardContent>
</Card>
```

### Text Hierarchy

```css
.heading-primary {
  color: var(--namc-gray-900);
}

.heading-secondary {
  color: var(--namc-gray-800);
}

.body-text {
  color: var(--namc-gray-700);
}

.caption-text {
  color: var(--namc-gray-600);
}

.muted-text {
  color: var(--namc-gray-500);
}
```

## Dark Mode Considerations

While the current system focuses on light mode for professional use, dark mode tokens are planned:

```css
/* Future dark mode support */
:root[data-theme="dark"] {
  --namc-background: var(--namc-gray-900);
  --namc-surface: var(--namc-gray-800);
  --namc-text-primary: var(--namc-gray-100);
  --namc-text-secondary: var(--namc-gray-300);
}
```

## Color Implementation

### In CSS

```css
:root {
  /* Import design tokens */
  --primary: var(--namc-blue-800);
  --primary-foreground: white;
  --secondary: var(--namc-gray-100);
  --secondary-foreground: var(--namc-gray-800);
}
```

### In Tailwind Config

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        namc: {
          blue: { /* blue scale */ },
          gold: { /* gold scale */ },
          gray: { /* gray scale */ },
          // ... status colors
        }
      }
    }
  }
}
```

### In React Components

```tsx
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  "inline-flex items-center justify-center",
  {
    variants: {
      variant: {
        default: "bg-namc-blue-800 text-white hover:bg-namc-blue-900",
        secondary: "bg-namc-gray-100 text-namc-gray-800 hover:bg-namc-gray-200",
      }
    }
  }
)
```

## Testing and Validation

### Accessibility Testing Tools
- **WebAIM Contrast Checker**: Verify contrast ratios
- **Colour Contrast Analyser**: Desktop tool for testing
- **axe DevTools**: Browser extension for accessibility testing

### Color Validation Checklist
- [ ] All text meets minimum 4.5:1 contrast ratio
- [ ] Large text meets minimum 3:1 contrast ratio  
- [ ] Color is not the only way to convey information
- [ ] Colors work for users with color vision deficiencies
- [ ] Hover and focus states have sufficient contrast

---

**Related Documentation:**
- [Typography Guidelines](./typography.md)
- [Accessibility Standards](./accessibility.md)
- [Component Usage](../components/buttons.md)