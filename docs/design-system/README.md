# NAMC NorCal Member Portal Design System

## 🎨 Design System Overview

The NAMC Design System is a comprehensive collection of reusable components, design tokens, and guidelines that ensures consistency, accessibility, and professional appearance across the entire member portal.

## 📁 Documentation Structure

```
docs/design-system/
├── README.md                    # This overview document
├── getting-started/
│   ├── installation.md          # Setup and installation guide
│   ├── quick-start.md           # Quick implementation examples
│   └── migration-guide.md       # Migrating from other systems
├── foundations/
│   ├── colors.md                # Color palette and usage
│   ├── typography.md            # Font system and hierarchy
│   ├── spacing.md               # Spacing scale and layout
│   ├── icons.md                 # Icon library and usage
│   └── accessibility.md         # Accessibility guidelines
├── components/
│   ├── buttons.md               # Button components and variants
│   ├── cards.md                 # Card components and layouts
│   ├── forms.md                 # Form inputs and validation
│   ├── navigation.md            # Navigation and menu components
│   ├── data-display.md          # Tables, lists, and data components
│   └── feedback.md              # Alerts, notifications, and status
├── patterns/
│   ├── dashboard-layouts.md     # Dashboard design patterns
│   ├── authentication.md       # Login and registration patterns
│   ├── data-entry.md           # Form and input patterns
│   └── content-organization.md  # Content layout patterns
├── resources/
│   ├── figma-library.md         # Design file access and usage
│   ├── code-examples.md         # Copy-paste code samples
│   ├── best-practices.md        # Implementation best practices
│   └── troubleshooting.md       # Common issues and solutions
└── assets/
    ├── logos/                   # NAMC logo variations
    ├── screenshots/             # Component examples
    └── mockups/                 # Design mockups and layouts
```

## 🚀 Quick Links

- **[Getting Started](./getting-started/quick-start.md)** - Start here for implementation
- **[Component Showcase](../../src/app/component-showcase/)** - Interactive component examples
- **[Design Tokens](./foundations/colors.md)** - Color, spacing, and typography tokens
- **[Accessibility Guidelines](./foundations/accessibility.md)** - WCAG compliance and best practices

## 🎯 Design Principles

### 1. **Professional First**
Every component is designed to meet government contractor standards and build trust with traditional construction industry professionals.

### 2. **Accessibility Excellence**
All components exceed WCAG 2.1 AA requirements with keyboard navigation, screen reader support, and high contrast ratios.

### 3. **Compliance Ready**
Built-in considerations for audit trails, security standards, and government contractor compliance requirements.

### 4. **Performance Optimized**
Lightweight components with optimized bundle sizes and fast loading times for all devices.

### 5. **Mobile Responsive**
Every component works seamlessly across desktop, tablet, and mobile devices with touch-friendly interactions.

## 🏗️ Architecture

### Component Sets Available

#### Primary: Professional Corporate
- **Purpose**: Government contractor focused, compliance-ready design
- **Best For**: Main portal functionality, admin interfaces, formal business processes
- **Location**: `/src/components/ui/sets/professional/`

#### Alternative: Modern Minimalist  
- **Purpose**: Clean, efficient, mobile-first approach
- **Best For**: Mobile applications, performance-critical sections
- **Location**: `/src/components/ui/sets/minimalist/`

#### Specialized: Interactive Dynamic
- **Purpose**: Engaging, community-focused with animations
- **Best For**: Community features, social interactions, onboarding flows
- **Location**: `/src/components/ui/sets/dynamic/`

### Design Token System
- **Location**: `/src/design-system/tokens.ts`
- **Colors**: NAMC brand colors with accessibility-compliant contrast ratios
- **Typography**: Professional font hierarchy with system font fallbacks
- **Spacing**: 8px base grid system for consistent layouts
- **Effects**: Shadows, borders, and animations for depth and interaction

## 📋 Component Status

| Component | Professional | Minimalist | Dynamic | Documentation |
|-----------|-------------|------------|---------|---------------|
| Button | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete |
| Card | ✅ Complete | ✅ Complete | ✅ Complete | ✅ Complete |
| Input | ✅ Complete | ⏳ In Progress | ⏳ In Progress | ✅ Complete |
| Navigation | ⏳ In Progress | ⏳ In Progress | ⏳ In Progress | ⏳ In Progress |
| Tables | 📋 Planned | 📋 Planned | 📋 Planned | 📋 Planned |
| Modals | 📋 Planned | 📋 Planned | 📋 Planned | 📋 Planned |

## 🔧 Usage Example

```tsx
import { Button } from '@/components/ui/sets/professional/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/sets/professional/card'

export function ExampleComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>NAMC Member Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default" size="lg">
          View Projects
        </Button>
      </CardContent>
    </Card>
  )
}
```

## 🎨 Brand Colors

### Primary Palette
- **NAMC Blue**: `#1e40af` - Primary brand color, navigation, CTAs
- **NAMC Gold**: `#d97706` - Accent color, highlights, success states
- **Professional Gray**: `#374151` - Text, borders, neutral elements

### Status Colors
- **Success**: `#16a34a` - Confirmations, completed states
- **Warning**: `#d97706` - Cautions, pending states  
- **Error**: `#dc2626` - Errors, destructive actions
- **Info**: `#2563eb` - Information, help content

## 📱 Responsive Breakpoints

```css
/* Mobile First Approach */
sm: '640px'   /* Small tablets and large phones */
md: '768px'   /* Tablets */
lg: '1024px'  /* Small laptops */
xl: '1280px'  /* Large laptops and desktops */
2xl: '1536px' /* Large desktops */
```

## ♿ Accessibility Standards

- **WCAG 2.1 AA Compliance**: All components meet or exceed standards
- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text, 3:1 for large text
- **Focus Management**: Visible focus indicators and logical tab order

## 🤝 Contributing

1. **Design Changes**: Follow the component evaluation process
2. **Code Updates**: Maintain accessibility and performance standards
3. **Documentation**: Update relevant documentation with changes
4. **Testing**: Ensure cross-browser compatibility and accessibility

## 📞 Support

- **Design Questions**: Contact the NAMC design team
- **Implementation Help**: See troubleshooting guide or file an issue
- **Accessibility Concerns**: Reach out for immediate assistance
- **Performance Issues**: Check best practices guide first

---

## 📚 Related Documentation

- [Component Evaluation Matrix](../../component-evaluation-matrix.md)
- [UI Component Evaluation Summary](../../UI-COMPONENT-EVALUATION-SUMMARY.md)
- [Technical Architecture Guide](../../TECHNICAL_ARCHITECTURE.md)
- [Development Setup](../../SETUP_INSTRUCTIONS.md)

**Last Updated**: January 2025 | **Version**: 1.0.0 | **Next Review**: April 2025