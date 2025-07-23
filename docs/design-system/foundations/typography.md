# Typography System

## 📝 NAMC Typography Guidelines

The NAMC typography system prioritizes readability, professionalism, and accessibility. Our type scale is designed to create clear hierarchy while maintaining the trust and credibility essential for government contractor communications.

## Font Families

### Primary: Inter
**Purpose**: Body text, UI elements, most interface content
**Rationale**: Excellent readability at all sizes, professional appearance, optimized for screens

```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

**Characteristics:**
- High legibility at small sizes
- Professional, modern appearance
- Excellent web font performance
- Wide language support
- Accessibility optimized

### Display: Poppins (Optional)
**Purpose**: Large headings, marketing content, special emphasis
**Rationale**: Friendly yet professional, good for community-focused content

```css
font-family: 'Poppins', 'Inter', system-ui, sans-serif;
```

**Usage Guidelines:**
- Use sparingly for impact
- Primarily for H1 and large display text
- Avoid for body text or small sizes

### Monospace: JetBrains Mono
**Purpose**: Code snippets, data display, technical content
**Rationale**: Excellent code readability, consistent character spacing

```css
font-family: 'JetBrains Mono', 'Fira Code', monospace;
```

## Type Scale

### Responsive Typography
Our type scale adapts to screen size for optimal readability:

| Size Token | Mobile | Desktop | Line Height | Usage |
|------------|--------|---------|-------------|-------|
| `text-xs` | 12px | 12px | 1.33 | Captions, labels |
| `text-sm` | 14px | 14px | 1.43 | Small text, metadata |
| `text-base` | 16px | 16px | 1.5 | Body text |
| `text-lg` | 18px | 18px | 1.56 | Large body text |
| `text-xl` | 20px | 20px | 1.4 | Subheadings |
| `text-2xl` | 24px | 24px | 1.33 | Small headings |
| `text-3xl` | 28px | 30px | 1.2 | Medium headings |
| `text-4xl` | 32px | 36px | 1.11 | Large headings |
| `text-5xl` | 40px | 48px | 1 | Display headings |
| `text-6xl` | 48px | 60px | 1 | Hero headings |

### CSS Custom Properties

```css
:root {
  /* Font Sizes */
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 3.75rem;    /* 60px */

  /* Line Heights */
  --leading-tight: 1.25;
  --leading-snug: 1.375;
  --leading-normal: 1.5;
  --leading-relaxed: 1.625;
  --leading-loose: 2;
}
```

## Font Weights

### Available Weights

```css
--font-light: 300;      /* Light text, large sizes only */
--font-normal: 400;     /* Body text, default weight */
--font-medium: 500;     /* Emphasis, important text */
--font-semibold: 600;   /* Subheadings, strong emphasis */
--font-bold: 700;       /* Headings, primary emphasis */
--font-extrabold: 800;  /* Display text, maximum impact */
```

### Usage Guidelines

| Weight | Usage | Examples |
|--------|-------|----------|
| **300 (Light)** | Large display text only | Hero headlines |
| **400 (Normal)** | Body text, descriptions | Paragraphs, captions |
| **500 (Medium)** | Subtle emphasis | Input labels, metadata |
| **600 (Semibold)** | Important text | Subheadings, card titles |
| **700 (Bold)** | Primary headings | Section headers, buttons |
| **800 (Extrabold)** | Maximum emphasis | Page titles, alerts |

## Typography Hierarchy

### Heading Scale

```css
/* H1 - Page Titles */
.heading-1 {
  font-size: var(--text-4xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--namc-gray-900);
  margin-bottom: 1.5rem;
}

/* H2 - Section Headers */
.heading-2 {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--namc-gray-900);
  margin-bottom: 1rem;
}

/* H3 - Subsection Headers */
.heading-3 {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--namc-gray-800);
  margin-bottom: 0.75rem;
}

/* H4 - Card Titles */
.heading-4 {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--namc-gray-800);
  margin-bottom: 0.5rem;
}

/* H5 - Component Headers */
.heading-5 {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--namc-gray-700);
  margin-bottom: 0.5rem;
}

/* H6 - Small Headers */
.heading-6 {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--namc-gray-700);
  margin-bottom: 0.25rem;
}
```

### Body Text

```css
/* Body Large - Important content */
.body-large {
  font-size: var(--text-lg);
  font-weight: var(--font-normal);
  line-height: var(--leading-relaxed);
  color: var(--namc-gray-700);
}

/* Body Default - Standard content */
.body-default {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--namc-gray-700);
}

/* Body Small - Secondary content */
.body-small {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--namc-gray-600);
}
```

### Special Text Types

```css
/* Labels and Captions */
.label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--namc-gray-700);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.caption {
  font-size: var(--text-xs);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--namc-gray-500);
}

/* Links */
.link {
  font-weight: var(--font-medium);
  color: var(--namc-blue-600);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.link:hover {
  color: var(--namc-blue-700);
  text-decoration-thickness: 2px;
}

/* Code and Technical Text */
.code-inline {
  font-family: var(--font-mono);
  font-size: 0.875em;
  background-color: var(--namc-gray-100);
  padding: 0.125rem 0.25rem;
  border-radius: 0.25rem;
}

.code-block {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  background-color: var(--namc-gray-900);
  color: var(--namc-gray-100);
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
}
```

## Component Typography

### Buttons

```css
/* Button text sizing */
.btn-xs { font-size: var(--text-xs); font-weight: var(--font-medium); }
.btn-sm { font-size: var(--text-sm); font-weight: var(--font-medium); }
.btn-md { font-size: var(--text-base); font-weight: var(--font-semibold); }
.btn-lg { font-size: var(--text-lg); font-weight: var(--font-semibold); }
.btn-xl { font-size: var(--text-xl); font-weight: var(--font-bold); }
```

### Form Elements

```css
/* Input labels */
.form-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--namc-gray-700);
  margin-bottom: 0.5rem;
}

/* Input text */
.form-input {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
}

/* Help text */
.form-help {
  font-size: var(--text-sm);
  color: var(--namc-gray-500);
  margin-top: 0.25rem;
}

/* Error text */
.form-error {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--namc-red-600);
  margin-top: 0.25rem;
}
```

### Navigation

```css
/* Main navigation */
.nav-main {
  font-size: var(--text-base);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
}

/* Breadcrumbs */
.breadcrumb {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  color: var(--namc-gray-600);
}

.breadcrumb-current {
  font-weight: var(--font-medium);
  color: var(--namc-gray-900);
}
```

## Accessibility Guidelines

### Contrast Requirements
All text meets WCAG 2.1 AA standards:

| Text Size | Minimum Contrast | NAMC Standard |
|-----------|------------------|---------------|
| Normal (16px+) | 4.5:1 | 7.0:1 |
| Large (18px+ or 14px+ bold) | 3.0:1 | 4.5:1 |

### Readability Best Practices

1. **Line Length**: 45-75 characters for optimal reading
2. **Line Height**: 1.5x font size minimum for body text
3. **Paragraph Spacing**: 1.5x line height between paragraphs
4. **Font Size**: 16px minimum for body text
5. **Font Weight**: 400+ for body text, 600+ for headings

### Screen Reader Considerations

```html
<!-- Use semantic HTML -->
<h1>Page Title</h1>
<h2>Section Header</h2>
<p>Body content with proper hierarchy</p>

<!-- Provide text alternatives -->
<span aria-label="User rating: 4 out of 5 stars">★★★★☆</span>

<!-- Use proper heading order -->
<h1>Main Title</h1>
  <h2>Section</h2>
    <h3>Subsection</h3>
```

## Responsive Typography

### Mobile Considerations

```css
/* Adjust for mobile screens */
@media (max-width: 768px) {
  .heading-1 { font-size: var(--text-3xl); }
  .heading-2 { font-size: var(--text-2xl); }
  .heading-3 { font-size: var(--text-xl); }
  
  /* Increase line height for mobile */
  .body-default { line-height: var(--leading-relaxed); }
}

/* Touch-friendly sizing */
@media (hover: none) {
  .interactive-text {
    font-size: 1.1em; /* Slightly larger for touch */
    line-height: 1.6;  /* More spacing for easier tapping */
  }
}
```

## Implementation Examples

### React Components

```tsx
// Typography component
interface TypographyProps {
  variant: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'body' | 'caption'
  className?: string
  children: React.ReactNode
}

const Typography: React.FC<TypographyProps> = ({ variant, className, children }) => {
  const baseClasses = 'font-inter'
  
  const variantClasses = {
    h1: 'text-4xl font-bold leading-tight text-namc-gray-900',
    h2: 'text-3xl font-bold leading-tight text-namc-gray-900',
    h3: 'text-2xl font-semibold leading-snug text-namc-gray-800',
    h4: 'text-xl font-semibold leading-snug text-namc-gray-800',
    h5: 'text-lg font-medium leading-normal text-namc-gray-700',
    h6: 'text-base font-medium leading-normal text-namc-gray-700',
    body: 'text-base font-normal leading-normal text-namc-gray-700',
    caption: 'text-xs font-normal leading-normal text-namc-gray-500'
  }
  
  const Component = variant.startsWith('h') ? variant : 'p'
  
  return (
    <Component className={cn(baseClasses, variantClasses[variant], className)}>
      {children}
    </Component>
  )
}
```

### CSS Utility Classes

```css
/* Typography utilities */
.text-heading-1 { @apply text-4xl font-bold leading-tight text-namc-gray-900; }
.text-heading-2 { @apply text-3xl font-bold leading-tight text-namc-gray-900; }
.text-heading-3 { @apply text-2xl font-semibold leading-snug text-namc-gray-800; }
.text-body { @apply text-base font-normal leading-normal text-namc-gray-700; }
.text-caption { @apply text-xs font-normal leading-normal text-namc-gray-500; }

/* Special text treatments */
.text-gradient-primary {
  @apply bg-gradient-to-r from-namc-blue-600 to-namc-blue-800 bg-clip-text text-transparent;
}

.text-highlight {
  @apply bg-namc-gold-100 px-1 py-0.5 rounded;
}
```

## Performance Optimization

### Font Loading Strategy

```html
<!-- Preload critical fonts -->
<link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>

<!-- Font display swap for performance -->
<style>
  @font-face {
    font-family: 'Inter';
    src: url('/fonts/inter-var.woff2') format('woff2');
    font-display: swap;
    font-weight: 300 800;
  }
</style>
```

### Bundle Optimization
- Use variable fonts to reduce HTTP requests
- Subset fonts to include only needed characters
- Implement font-display: swap for better performance
- Consider system font fallbacks for critical content

## Testing and Validation

### Typography Checklist
- [ ] All text meets minimum contrast ratios
- [ ] Heading hierarchy is semantic and logical
- [ ] Line length is optimal (45-75 characters)
- [ ] Font sizes are readable at minimum browser zoom
- [ ] Text scales appropriately on mobile devices
- [ ] Screen readers can navigate heading structure
- [ ] Font loading doesn't block render

---

**Related Documentation:**
- [Color Guidelines](./colors.md)
- [Accessibility Standards](./accessibility.md)
- [Component Examples](../components/)