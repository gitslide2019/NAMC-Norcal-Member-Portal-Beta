# Button Components

## 🔘 Overview

Buttons are essential interactive elements that enable users to trigger actions, submit forms, and navigate through the NAMC portal. Our button system provides consistent styling, clear hierarchy, and excellent accessibility across all device types.

## Button Variants

### Primary Buttons
Used for the most important actions on a page.

```tsx
import { Button } from '@/components/ui/sets/professional/button'

<Button variant="default">
  Primary Action
</Button>
```

**When to use:**
- Main call-to-action on a page
- Form submissions
- Confirmations and approvals
- Starting important workflows

### Secondary Buttons
Used for secondary actions that support the primary action.

```tsx
<Button variant="secondary">
  Secondary Action
</Button>
```

**When to use:**
- Alternative actions
- "Cancel" in dialog boxes
- Navigation back/previous
- Secondary workflows

### Outline Buttons
Used for actions that need emphasis but aren't primary.

```tsx
<Button variant="outline">
  Outline Button
</Button>
```

**When to use:**
- Filter and sort actions
- Secondary CTAs in cards
- Actions in toolbars
- Non-destructive alternatives

### Ghost Buttons
Minimal buttons for subtle actions.

```tsx
<Button variant="ghost">
  Ghost Button
</Button>
```

**When to use:**
- Table row actions
- Menu items
- Subtle navigation
- Dismissible elements

### Destructive Buttons
For dangerous or irreversible actions.

```tsx
<Button variant="destructive">
  Delete Account
</Button>
```

**When to use:**
- Delete actions
- Account removal
- Data destruction
- Irreversible operations

### Gold Accent Buttons
Special NAMC-branded buttons for featured actions.

```tsx
<Button variant="gold">
  Join NAMC
</Button>
```

**When to use:**
- NAMC membership actions
- Premium features
- Special promotions
- Achievement unlocks

## Button Sizes

### Size Variants

```tsx
// Extra small - compact spaces
<Button size="sm">Small</Button>

// Default - standard use
<Button size="default">Default</Button>

// Large - prominent actions
<Button size="lg">Large</Button>

// Extra large - hero sections
<Button size="xl">Extra Large</Button>

// Icon only - square buttons
<Button size="icon">
  <Plus className="h-4 w-4" />
</Button>
```

### Size Guidelines

| Size | Height | Padding | Font Size | Use Case |
|------|--------|---------|-----------|----------|
| `sm` | 36px | 12px 16px | 14px | Compact areas, tables |
| `default` | 40px | 16px 24px | 16px | Standard buttons |
| `lg` | 44px | 20px 32px | 18px | Prominent actions |
| `xl` | 48px | 24px 40px | 20px | Hero sections, CTAs |
| `icon` | 40px | 10px | 16px | Icon-only actions |

## Button States

### Loading State
Shows progress for async operations.

```tsx
<Button loading={true}>
  Processing...
</Button>
```

**Features:**
- Spinner animation
- Disabled interaction
- Maintains button dimensions
- Accessible loading announcement

### Disabled State
Prevents interaction when action isn't available.

```tsx
<Button disabled={true}>
  Disabled Button
</Button>
```

**Accessibility:**
- `aria-disabled="true"` attribute
- Reduced opacity for visual indication
- Maintains focus order when disabled temporarily
- Screen reader announcements

### Focus State
Keyboard navigation support.

```css
.button:focus-visible {
  outline: 2px solid var(--namc-blue-600);
  outline-offset: 2px;
}
```

### Hover State
Interactive feedback for mouse users.

```css
.button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.12);
}
```

## Button with Icons

### Left Icon
Icon before text for common actions.

```tsx
<Button leftIcon={<Download className="h-4 w-4" />}>
  Download Report
</Button>
```

### Right Icon
Icon after text for directional actions.

```tsx
<Button rightIcon={<ArrowRight className="h-4 w-4" />}>
  Continue
</Button>
```

### Icon-Only Buttons
Compact buttons with just icons.

```tsx
<Button size="icon" aria-label="Settings">
  <Settings className="h-4 w-4" />
</Button>
```

**Accessibility Requirements:**
- Always include `aria-label` for icon-only buttons
- Use descriptive labels that explain the action
- Consider tooltips for complex actions

## Component Set Variations

### Professional Corporate Set

```tsx
import { Button } from '@/components/ui/sets/professional/button'

// Traditional, formal appearance
<Button variant="default">
  Submit Application
</Button>
```

**Characteristics:**
- Conservative styling with clear borders
- Traditional hover effects
- High contrast for accessibility
- Professional color palette
- Formal typography

### Modern Minimalist Set

```tsx
import { Button } from '@/components/ui/sets/minimalist/button'

// Clean, efficient design
<Button variant="default">
  Save Changes
</Button>
```

**Characteristics:**
- Borderless design
- Subtle shadows and elevation
- Smooth micro-animations
- Optimized for performance
- Mobile-first approach

### Interactive Dynamic Set

```tsx
import { Button } from '@/components/ui/sets/dynamic/button'

// Engaging, animated interactions
<Button variant="default" glow={true}>
  Join Community
</Button>
```

**Characteristics:**
- Gradient backgrounds
- Transform animations on hover
- Glow effects for special buttons
- Playful micro-interactions
- Community-focused styling

## Accessibility Guidelines

### Keyboard Navigation
All buttons support standard keyboard interaction:

- **Space or Enter**: Activate button
- **Tab**: Navigate to next focusable element
- **Shift + Tab**: Navigate to previous element

### Screen Reader Support

```tsx
// Descriptive button text
<Button>Save Project Draft</Button>

// Additional context when needed
<Button aria-describedby="save-help">
  Save
</Button>
<div id="save-help" className="sr-only">
  Saves your current progress and allows you to continue later
</div>

// State announcements
<Button aria-pressed={isActive}>
  {isActive ? 'Active' : 'Inactive'}
</Button>
```

### Visual Accessibility

- **Contrast Ratios**: All button variants meet WCAG 2.1 AA standards
- **Color Independence**: Icons and text provide meaning, not just color
- **Focus Indicators**: Visible focus rings for keyboard users
- **Target Size**: Minimum 44px × 44px touch targets

## Usage Patterns

### Button Groups
Related actions grouped together.

```tsx
<div className="flex space-x-2">
  <Button variant="default">Save</Button>
  <Button variant="outline">Save as Draft</Button>
  <Button variant="ghost">Cancel</Button>
</div>
```

### Modal Actions
Standard modal button arrangement.

```tsx
<div className="flex justify-end space-x-2">
  <Button variant="ghost">Cancel</Button>
  <Button variant="destructive">Delete</Button>
</div>
```

### Form Actions
Standard form submission pattern.

```tsx
<div className="flex flex-col sm:flex-row sm:justify-end space-y-2 sm:space-y-0 sm:space-x-2">
  <Button variant="outline">Save as Draft</Button>
  <Button type="submit">Submit Application</Button>
</div>
```

### Loading Patterns
Async operation feedback.

```tsx
function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false)
  
  const handleSubmit = async () => {
    setIsLoading(true)
    try {
      await submitApplication()
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <Button 
      loading={isLoading}
      onClick={handleSubmit}
      disabled={isLoading}
    >
      {isLoading ? 'Submitting...' : 'Submit Application'}
    </Button>
  )
}
```

## Best Practices

### Do's ✅

```tsx
// Use clear, action-oriented text
<Button>Submit Application</Button>

// Provide loading states for async actions
<Button loading={isSubmitting}>
  {isSubmitting ? 'Submitting...' : 'Submit'}
</Button>

// Use appropriate variants for hierarchy
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>

// Include icons for clarity when helpful
<Button leftIcon={<Download />}>Download</Button>
```

### Don'ts ❌

```tsx
// Don't use vague text
<Button>Click Here</Button> // ❌

// Don't override button semantics
<div className="button-style" onClick={handleClick}>
  Not a real button
</div> // ❌

// Don't use too many primary buttons
<Button variant="default">Action 1</Button>
<Button variant="default">Action 2</Button> // ❌

// Don't forget loading states
<Button onClick={asyncAction}>Submit</Button> // ❌
```

### Text Guidelines

- **Action-oriented**: Use verbs that describe what happens
- **Specific**: Be clear about the outcome
- **Concise**: Keep text short but meaningful
- **Consistent**: Use similar patterns across the app

| Good ✅ | Bad ❌ |
|---------|--------|
| "Submit Application" | "Click Here" |
| "Download Report" | "Get File" |
| "Save Changes" | "OK" |
| "Delete Project" | "Remove" |

## Component API

### Button Props

```typescript
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'gold'
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon'
  asChild?: boolean
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}
```

### Advanced Usage

```tsx
// Custom styling with className
<Button 
  variant="outline" 
  size="lg"
  className="w-full"
  leftIcon={<User />}
  rightIcon={<ArrowRight />}
  loading={isLoading}
  disabled={!isValid}
  onClick={handleSubmit}
>
  Complete Profile
</Button>

// As a link using asChild
<Button asChild variant="ghost">
  <Link href="/dashboard">
    Go to Dashboard
  </Link>
</Button>
```

## Testing Guidelines

### Unit Tests

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './button'

test('renders button with correct text', () => {
  render(<Button>Click me</Button>)
  expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
})

test('calls onClick when clicked', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  fireEvent.click(screen.getByRole('button'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})

test('shows loading state correctly', () => {
  render(<Button loading={true}>Submit</Button>)
  expect(screen.getByRole('button')).toBeDisabled()
  expect(screen.getByText('Submit')).toBeInTheDocument()
})
```

### Accessibility Tests

```tsx
test('has proper ARIA attributes', () => {
  render(
    <Button aria-label="Close dialog" aria-describedby="help-text">
      ×
    </Button>
  )
  
  const button = screen.getByRole('button')
  expect(button).toHaveAttribute('aria-label', 'Close dialog')
  expect(button).toHaveAttribute('aria-describedby', 'help-text')
})

test('supports keyboard navigation', () => {
  const handleClick = jest.fn()
  render(<Button onClick={handleClick}>Click me</Button>)
  
  const button = screen.getByRole('button')
  fireEvent.keyDown(button, { key: 'Enter' })
  expect(handleClick).toHaveBeenCalled()
})
```

---

**Related Documentation:**
- [Form Components](./forms.md)
- [Navigation Components](./navigation.md)
- [Color Guidelines](../foundations/colors.md)
- [Accessibility Standards](../foundations/accessibility.md)