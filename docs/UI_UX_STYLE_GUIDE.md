# NAMC NorCal Member Portal - UI/UX Style Guide

## 🎨 Design System Reference
**Component Library**: [21st.dev Components](https://21st.dev/components)  
**Framework**: React + Tailwind CSS  
**Component Count**: 400+ professional components available  
**Last Updated**: January 2025

---

## 🎯 Design Philosophy

### Core Principles
- **Professional & Trustworthy**: Government contractor standards require polished, reliable interfaces
- **Interactive & Modern**: Engage members with responsive, dynamic components
- **Accessibility First**: WCAG 2.1 AA compliance for government accessibility standards
- **Mobile-Responsive**: Contractors work on-site, need mobile-optimized experience
- **Data-Driven**: Clear presentation of complex contractor and event information

### User Experience Goals
- Reduce task completion time by 40%
- Achieve 90%+ user satisfaction scores
- Maintain <3 second page load times
- Ensure 100% WCAG 2.1 AA compliance

---

## 🎨 Visual Design System

### Brand Colors
```css
/* Primary NAMC Colors */
--namc-blue-primary: #1e40af;      /* Primary brand blue */
--namc-blue-secondary: #3b82f6;    /* Secondary blue */
--namc-blue-light: #dbeafe;        /* Light blue backgrounds */

/* Professional Grays */
--gray-900: #111827;               /* Primary text */
--gray-700: #374151;               /* Secondary text */
--gray-500: #6b7280;               /* Muted text */
--gray-100: #f3f4f6;               /* Light backgrounds */
--gray-50: #f9fafb;                /* Subtle backgrounds */

/* Status Colors */
--success-green: #10b981;          /* Success states */
--warning-amber: #f59e0b;          /* Warning states */
--error-red: #ef4444;              /* Error states */
--info-blue: #3b82f6;              /* Information states */
```

### Typography Scale
```css
/* Headings */
--text-4xl: 2.25rem;               /* Page titles */
--text-3xl: 1.875rem;              /* Section titles */
--text-2xl: 1.5rem;                /* Card titles */
--text-xl: 1.25rem;                /* Subtitle */
--text-lg: 1.125rem;               /* Large text */

/* Body Text */
--text-base: 1rem;                 /* Default body text */
--text-sm: 0.875rem;               /* Small text */
--text-xs: 0.75rem;                /* Caption text */

/* Font Weights */
--font-bold: 700;                  /* Headings, emphasis */
--font-semibold: 600;              /* Subheadings */
--font-medium: 500;                /* UI elements */
--font-normal: 400;                /* Body text */
```

### Spacing System
```css
/* Consistent spacing using Tailwind scale */
--space-1: 0.25rem;                /* 4px */
--space-2: 0.5rem;                 /* 8px */
--space-4: 1rem;                   /* 16px */
--space-6: 1.5rem;                 /* 24px */
--space-8: 2rem;                   /* 32px */
--space-12: 3rem;                  /* 48px */
--space-16: 4rem;                  /* 64px */
```

---

## 🧩 Component Selection & Usage

### 1. Authentication Components
**Source**: 21st.dev Authentication (4 Sign In + 4 Sign Up variants)

#### Sign In Component
- **Style**: Clean, professional single-page form
- **Features**: Email/password, "Remember me", forgot password
- **Customization**: NAMC logo, blue primary buttons
- **Mobile**: Stacked layout, large touch targets

#### Sign Up Component  
- **Style**: Multi-step registration with progress indicator
- **Features**: Member validation, terms acceptance, profile setup
- **Customization**: Government contractor specific fields
- **Mobile**: One field per screen on mobile

### 2. Navigation Components
**Source**: 21st.dev Navigation (10 Sidebars + 11 Menus + 38 Tabs)

#### Primary Sidebar
- **Style**: Collapsible sidebar with role-based menu
- **Sections**: Dashboard, Events, Messaging, Resources, Profile, Admin
- **Icons**: Consistent icon family (Heroicons recommended)
- **Mobile**: Overlay sidebar with backdrop

#### Top Navigation
- **Style**: Clean top bar with breadcrumbs and user dropdown
- **Features**: Search bar, notifications, user profile
- **Responsive**: Hamburger menu on mobile
- **Customization**: NAMC branding in header

#### Tab Navigation
- **Style**: Horizontal tabs for sub-navigation
- **Usage**: Within sections (Event types, Message categories)
- **Indicator**: Blue underline for active tab
- **Mobile**: Scrollable horizontal tabs

### 3. Data Display Components
**Source**: 21st.dev Tables (30 variants) + Cards (79 variants)

#### Data Tables
- **Style**: Clean, sortable tables with hover effects
- **Features**: Search, filter, pagination, export
- **Usage**: Member directory, contractor database, event registrations
- **Mobile**: Horizontal scroll or card transformation

#### Content Cards
- **Event Cards**: Image, title, date, location, CTA button
- **Contractor Cards**: Company info, contact details, certifications
- **Announcement Cards**: Priority indicator, date, preview text
- **Resource Cards**: File type, download button, description

### 4. Form Components
**Source**: 21st.dev Forms (23 variants) + Inputs (102 variants)

#### Form Styling
- **Labels**: Above inputs, required field indicators
- **Validation**: Real-time validation with clear error messages
- **Layout**: Single column on mobile, multi-column on desktop
- **Buttons**: Primary (blue), Secondary (gray), Destructive (red)

#### Input Types
- **Text Inputs**: Clean borders, focus states
- **Dropdowns**: Searchable select components
- **Date Pickers**: Calendar overlay with time selection
- **File Uploads**: Drag-and-drop zones with progress

### 5. Interactive Elements
**Source**: 21st.dev Modals (37 variants) + Notifications (5 variants)

#### Modal Dialogs
- **Confirmation**: Simple yes/no dialogs
- **Detail Views**: Event details, contractor profiles
- **Forms**: Add/edit overlays
- **Image Viewer**: Document and image previews

#### Notification System
- **Toast Notifications**: Success, error, warning, info
- **Banners**: System announcements, maintenance notices
- **Badges**: Unread counts, status indicators
- **Progress**: Loading states for data operations

---

## 📱 Responsive Design Strategy

### Breakpoint System
```css
/* Mobile First Approach */
--mobile: 320px;                   /* Small phones */
--tablet: 768px;                   /* Tablets */
--desktop: 1024px;                 /* Desktop */
--wide: 1280px;                    /* Large screens */
```

### Mobile Optimizations
- **Touch Targets**: Minimum 44px for interactive elements
- **Navigation**: Collapsible sidebar, bottom tab bar option
- **Forms**: Single column layout, large input fields
- **Tables**: Transform to card layout or horizontal scroll
- **Images**: Responsive sizing with lazy loading

### Tablet Adaptations
- **Layout**: Hybrid layouts with collapsible sidebars
- **Navigation**: Persistent sidebar with collapse option
- **Content**: Two-column layouts where appropriate
- **Touch**: Optimized for both touch and mouse input

---

## ♿ Accessibility Standards

### WCAG 2.1 AA Compliance
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Indicators**: Clear visual focus states

### Implementation Guidelines
- **Alt Text**: Descriptive alt text for all images
- **Form Labels**: Associated labels for all form controls
- **Heading Structure**: Logical heading hierarchy (H1-H6)
- **Skip Links**: Navigation shortcuts for screen readers

---

## 🎭 Animation & Interactions

### Micro-Interactions
- **Hover States**: Subtle color changes, elevation effects
- **Loading States**: Skeleton screens, progress indicators
- **Transitions**: Smooth 200ms ease-in-out transitions
- **Feedback**: Immediate visual feedback for user actions

### Performance Guidelines
- **Reduced Motion**: Respect user preferences for reduced motion
- **GPU Acceleration**: Use transform and opacity for animations
- **Frame Rate**: Maintain 60fps for smooth interactions
- **Bundle Size**: Lazy load animation libraries

---

## 🔧 Technical Implementation

### Component Architecture
```jsx
// Example component structure
interface ComponentProps {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

const Component: React.FC<ComponentProps> = ({
  variant = 'primary',
  size = 'md',
  ...props
}) => {
  return (
    <div className={cn(baseStyles, variantStyles[variant], sizeStyles[size])}>
      {/* Component content */}
    </div>
  );
};
```

### Theming System
```typescript
// Theme configuration
export const namcTheme = {
  colors: {
    primary: {
      50: '#eff6ff',
      500: '#3b82f6',
      900: '#1e3a8a',
    },
    gray: {
      50: '#f9fafb',
      500: '#6b7280',
      900: '#111827',
    },
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
  },
  spacing: {
    1: '0.25rem',
    4: '1rem',
    8: '2rem',
  },
};
```

---

## 📊 Component Inventory

### Core Components (Phase 1)
- [x] **Authentication**: Sign In + Sign Up
- [x] **Navigation**: Sidebar + Top Nav + Tabs  
- [x] **Layout**: Grid + Container + Stack

### Content Components (Phase 2)
- [ ] **Tables**: Sortable data tables with filters
- [ ] **Cards**: Event, contractor, announcement cards
- [ ] **Forms**: Registration, contact, profile forms
- [ ] **Modals**: Detail views, confirmations

### Advanced Components (Phase 3)
- [ ] **Dashboard**: Metrics, charts, analytics
- [ ] **Notifications**: Toast, banners, badges
- [ ] **Search**: Global search with filters
- [ ] **File Upload**: Document management

---

## 🎯 Quality Assurance

### Testing Checklist
- [ ] **Visual Regression**: Consistent appearance across browsers
- [ ] **Accessibility**: WCAG 2.1 AA compliance verification
- [ ] **Performance**: Load time under 3 seconds
- [ ] **Mobile**: Touch-friendly on all device sizes
- [ ] **Cross-browser**: Chrome, Firefox, Safari, Edge compatibility

### Performance Metrics
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

---

## 📚 Resources & References

### Design System Tools
- **Component Library**: [21st.dev](https://21st.dev/components)
- **Icons**: [Heroicons](https://heroicons.com/)
- **Colors**: [Tailwind Color Palette](https://tailwindcss.com/docs/customizing-colors)
- **Accessibility**: [WebAIM Guidelines](https://webaim.org/)

### Development Resources
- **React**: Component development framework
- **Tailwind CSS**: Utility-first CSS framework
- **TypeScript**: Type safety and developer experience
- **Storybook**: Component documentation and testing

---

*This style guide serves as the single source of truth for all UI/UX decisions in the NAMC NorCal Member Portal. All designers and developers should reference this document when creating or modifying interface components.*