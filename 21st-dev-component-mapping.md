# 21st.dev Component Mapping for NAMC Member Portal

## 🎯 Component Selection Matrix

This document maps specific 21st.dev components to NAMC member portal use cases, providing implementation guidance for developers.

---

## 🔐 Authentication Components

### Sign In Components (4 variants available)
**21st.dev Path**: `/components/authentication/sign-in`

#### Recommended Selection:
- **Variant 1**: Clean single-page form with email/password
- **Features**: Remember me checkbox, forgot password link
- **Customization**: NAMC logo placement, blue primary buttons

#### NAMC Use Cases:
- Member login portal
- Admin dashboard access
- Mobile app authentication

#### Implementation Notes:
```tsx
// Custom NAMC styling
const NAMCSignIn = () => (
  <SignInComponent
    logoSrc="/namc-logo.png"
    primaryColor="#1e40af"
    backgroundImage="/contractor-hero.jpg"
    enableRememberMe={true}
    forgotPasswordLink="/forgot-password"
  />
);
```

### Sign Up Components (4 variants available)
**21st.dev Path**: `/components/authentication/sign-up`

#### Recommended Selection:
- **Variant 2**: Multi-step registration with progress indicator
- **Features**: Email verification, member type selection, profile setup
- **Customization**: Government contractor specific fields

#### NAMC Use Cases:
- New member registration
- Contractor onboarding
- Admin user creation

---

## 🧭 Navigation Components

### Sidebars (10 variants available)
**21st.dev Path**: `/components/navigation/sidebars`

#### Recommended Selection:
- **Variant 3**: Collapsible sidebar with icon + text labels
- **Features**: Role-based menu items, search integration
- **Customization**: NAMC color scheme, contractor-specific icons

#### NAMC Menu Structure:
```typescript
const namcMenuItems = [
  {
    section: "Core",
    items: [
      { label: "Dashboard", icon: "ChartBarIcon", path: "/dashboard" },
      { label: "Events", icon: "CalendarIcon", path: "/events" },
      { label: "Members", icon: "UsersIcon", path: "/members" },
      { label: "Messages", icon: "ChatIcon", path: "/messages" },
    ]
  },
  {
    section: "Resources",
    items: [
      { label: "Documents", icon: "DocumentIcon", path: "/documents" },
      { label: "Announcements", icon: "SpeakerphoneIcon", path: "/announcements" },
      { label: "Directory", icon: "DirectoryIcon", path: "/directory" },
    ]
  },
  {
    section: "Account",
    items: [
      { label: "Profile", icon: "UserIcon", path: "/profile" },
      { label: "Settings", icon: "CogIcon", path: "/settings" },
    ]
  },
  {
    section: "Admin", // Role-based visibility
    items: [
      { label: "Contractors", icon: "BuildingIcon", path: "/admin/contractors" },
      { label: "Analytics", icon: "ChartIcon", path: "/admin/analytics" },
      { label: "System", icon: "ServerIcon", path: "/admin/system" },
    ]
  }
];
```

### Navigation Menus (11 variants available)
**21st.dev Path**: `/components/navigation/menus`

#### Recommended Selection:
- **Variant 5**: Top navigation with breadcrumbs and user dropdown
- **Features**: Search bar, notifications, user profile access
- **Mobile**: Hamburger menu with overlay

#### NAMC Top Navigation:
- Logo (left)
- Search bar (center)
- Notifications + User dropdown (right)
- Breadcrumb navigation below

### Tabs (38 variants available)
**21st.dev Path**: `/components/navigation/tabs`

#### Recommended Selection:
- **Variant 7**: Horizontal tabs with blue underline indicator
- **Features**: Scrollable on mobile, keyboard navigation
- **Usage**: Event categories, message types, report sections

---

## 📊 Data Display Components

### Tables (30 variants available)
**21st.dev Path**: `/components/data-display/tables`

#### Recommended Selections:

##### Member Directory Table (Variant 12)
- **Features**: Search, sort, filter, pagination
- **Columns**: Name, Company, Location, Membership Type, Status
- **Actions**: View profile, send message, export data

##### Event Registration Table (Variant 15)
- **Features**: Status indicators, bulk actions
- **Columns**: Event, Member, Registration Date, Status, Payment
- **Actions**: Approve, decline, send reminder

##### Contractor Database Table (Variant 18)
- **Features**: Advanced filtering, export to CSV
- **Columns**: License #, Company, Classification, Location, Contact
- **Actions**: View details, initiate contact, add to campaign

#### Implementation Example:
```tsx
const ContractorTable = () => (
  <Table
    data={contractors}
    columns={[
      { key: 'licenseNumber', label: 'License #', sortable: true },
      { key: 'businessName', label: 'Company', sortable: true },
      { key: 'classifications', label: 'Type', filter: true },
      { key: 'city', label: 'Location', filter: true },
      { key: 'email', label: 'Contact', render: EmailCell },
    ]}
    pagination={{ pageSize: 25, showSizeSelector: true }}
    filters={{ location: cities, classification: types }}
    exportable={true}
    selectable={true}
  />
);
```

### Cards (79 variants available)
**21st.dev Path**: `/components/data-display/cards`

#### Recommended Selections:

##### Event Cards (Variant 23)
- **Layout**: Image header, content body, action footer
- **Content**: Title, date, location, description, registration status
- **Actions**: Register, view details, share

##### Contractor Profile Cards (Variant 31)
- **Layout**: Company logo, info panel, contact actions
- **Content**: Company name, classification, contact info, certifications
- **Actions**: View profile, send message, add to favorites

##### Announcement Cards (Variant 45)
- **Layout**: Priority indicator, date badge, content
- **Content**: Title, preview text, author, timestamp
- **Actions**: Read more, share, mark as read

##### Resource Cards (Variant 52)
- **Layout**: File type icon, metadata, download action
- **Content**: File name, type, size, upload date
- **Actions**: Download, preview, share

---

## 📝 Form Components

### Forms (23 variants available)
**21st.dev Path**: `/components/forms/forms`

#### Recommended Selections:

##### Event Registration Form (Variant 8)
- **Layout**: Multi-step with progress indicator
- **Sections**: Event selection, attendee info, payment, confirmation
- **Validation**: Real-time validation, required field indicators

##### Member Profile Form (Variant 12)
- **Layout**: Tabbed sections for different data categories
- **Sections**: Personal info, company details, certifications, preferences
- **Features**: Photo upload, file attachments, auto-save

##### Contact/Message Form (Variant 16)
- **Layout**: Clean single-column design
- **Fields**: Recipient, subject, message, attachments
- **Features**: Rich text editor, recipient suggestions

### Inputs (102 variants available)
**21st.dev Path**: `/components/forms/inputs`

#### Key Input Types for NAMC:

##### Text Inputs (Variants 15-25)
- **Usage**: Names, addresses, license numbers
- **Features**: Validation states, helper text, character counts

##### Search Inputs (Variants 35-42)
- **Usage**: Member search, contractor lookup, document search
- **Features**: Autocomplete, recent searches, filters

##### Select Dropdowns (Variants 55-75)
- **Usage**: State selection, member types, event categories
- **Features**: Searchable, multi-select, grouped options

##### Date/Time Pickers (Variants 85-95)
- **Usage**: Event scheduling, membership expiration, report dates
- **Features**: Calendar overlay, time selection, date ranges

---

## 🔔 Interactive Components

### Modals/Dialogs (37 variants available)
**21st.dev Path**: `/components/interactive/modals`

#### Recommended Selections:

##### Confirmation Dialogs (Variant 5)
- **Usage**: Delete confirmations, action confirmations
- **Features**: Clear action buttons, warning states

##### Detail View Modals (Variant 15)
- **Usage**: Event details, contractor profiles, document preview
- **Features**: Large content area, scrollable, action buttons

##### Form Modals (Variant 25)
- **Usage**: Quick add forms, edit overlays
- **Features**: Form validation, submit/cancel actions

### Notifications (5 variants available)
**21st.dev Path**: `/components/interactive/notifications`

#### Recommended Selection:
- **Variant 3**: Toast notifications with auto-dismiss
- **Types**: Success, error, warning, info
- **Features**: Action buttons, persistence options

#### NAMC Notification Types:
```typescript
const notificationTypes = {
  success: {
    color: 'green',
    icon: 'CheckCircleIcon',
    examples: ['Event registered successfully', 'Profile updated']
  },
  error: {
    color: 'red',
    icon: 'XCircleIcon',
    examples: ['Registration failed', 'Network error']
  },
  warning: {
    color: 'amber',
    icon: 'ExclamationTriangleIcon',
    examples: ['Membership expiring soon', 'Event capacity full']
  },
  info: {
    color: 'blue',
    icon: 'InformationCircleIcon',
    examples: ['New announcement', 'System maintenance']
  }
};
```

---

## 📱 Mobile-Specific Adaptations

### Responsive Component Behavior

#### Tables → Cards (Mobile Transform)
```tsx
const ResponsiveDataDisplay = ({ data, isMobile }) => (
  isMobile ? (
    <CardGrid data={data} />
  ) : (
    <DataTable data={data} />
  )
);
```

#### Sidebar → Bottom Navigation
```tsx
const ResponsiveNavigation = ({ isMobile }) => (
  isMobile ? (
    <BottomTabNavigation items={mainMenuItems} />
  ) : (
    <SidebarNavigation items={fullMenuItems} />
  )
);
```

#### Modal → Full Screen (Mobile)
```tsx
const ResponsiveModal = ({ isOpen, isMobile, children }) => (
  <Modal
    isOpen={isOpen}
    fullScreen={isMobile}
    size={isMobile ? 'full' : 'lg'}
  >
    {children}
  </Modal>
);
```

---

## 🎨 Customization Guidelines

### Theme Configuration
```typescript
const namcTheme = {
  // Override 21st.dev default colors
  colors: {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      900: '#1e3a8a',
    },
    // ... other color overrides
  },
  // Custom component styles
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'semibold',
        borderRadius: 'md',
      },
      variants: {
        solid: {
          bg: 'primary.500',
          color: 'white',
          _hover: { bg: 'primary.600' },
        },
      },
    },
  },
};
```

### NAMC Brand Integration
```tsx
// Custom component wrapper
const NAMCComponent = ({ children, ...props }) => (
  <div className="namc-theme">
    <ComponentFromLibrary
      {...props}
      colorScheme="namc-blue"
      size="md"
    >
      {children}
    </ComponentFromLibrary>
  </div>
);
```

---

## ⚡ Performance Optimization

### Component Loading Strategy
```typescript
// Lazy load heavy components
const DataTable = lazy(() => import('21st-dev/tables/DataTable'));
const ChartDashboard = lazy(() => import('21st-dev/charts/Dashboard'));

// Preload critical components
import { Button, Input, Modal } from '21st-dev/core';
```

### Bundle Optimization
- Import only needed components
- Use tree-shaking for 21st.dev library
- Lazy load complex components
- Optimize images and assets

---

## 🧪 Testing Strategy

### Component Testing
```typescript
// Test component integration
describe('NAMC Event Card', () => {
  it('should display event information correctly', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText(mockEvent.title)).toBeInTheDocument();
  });

  it('should handle registration action', () => {
    const onRegister = jest.fn();
    render(<EventCard event={mockEvent} onRegister={onRegister} />);
    fireEvent.click(screen.getByText('Register'));
    expect(onRegister).toHaveBeenCalled();
  });
});
```

### Accessibility Testing
- Use @testing-library/jest-dom for a11y assertions
- Test keyboard navigation
- Verify ARIA labels and roles
- Check color contrast programmatically

---

*This component mapping serves as the implementation guide for integrating 21st.dev components into the NAMC member portal, ensuring consistent, professional, and accessible user experiences.*