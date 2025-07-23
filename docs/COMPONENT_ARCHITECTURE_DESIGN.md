# NAMC Portal Component Architecture Design

## 📋 Overview

This document defines the component architecture for the NAMC NorCal Member Portal, including design system specifications, interface definitions, component hierarchies, and implementation patterns.

## 🎨 Design System Architecture

### Design Philosophy

The NAMC portal uses a **tri-variant design system** to serve different contexts and user needs:

1. **Professional** - Government contractor compliance, accessibility-first
2. **Minimalist** - Clean, modern, mobile-optimized 
3. **Dynamic** - Interactive, engaging, event-focused

### Design Token System

**Color Palette:**
```typescript
const designTokens = {
  colors: {
    // NAMC Brand Colors
    primary: {
      50: '#eff6ff',   // namc-blue-50
      100: '#dbeafe',  // namc-blue-100
      500: '#3b82f6',  // namc-blue-500
      600: '#2563eb',  // namc-blue-600
      800: '#1e40af',  // namc-blue-800
      900: '#1e3a8a'   // namc-blue-900
    },
    secondary: {
      50: '#f9fafb',   // namc-gray-50
      100: '#f3f4f6',  // namc-gray-100
      500: '#6b7280',  // namc-gray-500
      700: '#374151',  // namc-gray-700
      900: '#111827'   // namc-gray-900
    },
    accent: {
      green: '#059669',  // Success/Active
      yellow: '#d97706', // Warning
      red: '#dc2626'     // Error/Destructive
    }
  },
  spacing: {
    component: '1rem',    // 16px
    section: '1.5rem',    // 24px
    page: '2rem'          // 32px
  },
  typography: {
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'monospace']
    },
    scales: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem' // 30px
    }
  }
}
```

**Animation System:**
```typescript
const animations = {
  duration: {
    fast: '150ms',
    normal: '300ms',
    slow: '500ms'
  },
  easing: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)'
  },
  transforms: {
    scale: 'scale(1.05)',
    slideUp: 'translateY(-4px)',
    fadeIn: 'opacity 0 to 1'
  }
}
```

## 🧩 Component Hierarchy

### Base Component System

```
components/
├── ui/                          # Atomic UI components
│   ├── Button/
│   │   ├── Button.tsx           # Base button component
│   │   ├── Button.types.ts      # TypeScript interfaces
│   │   ├── Button.styles.ts     # Style variants
│   │   └── Button.stories.tsx   # Storybook stories
│   ├── Input/
│   ├── Card/
│   ├── Badge/
│   ├── Alert/
│   └── sets/                    # Design variants
│       ├── professional/
│       ├── minimalist/
│       └── dynamic/
├── forms/                       # Form components
│   ├── FormField/
│   ├── FormSection/
│   └── FormWizard/
├── layout/                      # Layout components
│   ├── Header/
│   ├── Sidebar/
│   ├── Footer/
│   └── Container/
├── data/                        # Data display components
│   ├── DataTable/
│   ├── DataCard/
│   ├── Pagination/
│   └── SearchFilter/
├── navigation/                  # Navigation components
│   ├── NavMenu/
│   ├── Breadcrumbs/
│   ├── Tabs/
│   └── Stepper/
├── feedback/                    # User feedback components
│   ├── Toast/
│   ├── Modal/
│   ├── LoadingSpinner/
│   └── ProgressBar/
└── domain/                      # Business logic components
    ├── member/
    ├── project/
    ├── event/
    └── admin/
```

## 🎯 Core Component Specifications

### Button Component

**Interface Definition:**
```typescript
interface ButtonProps {
  // Content
  children: React.ReactNode
  
  // Behavior
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  loading?: boolean
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void
  
  // Styling
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  designVariant?: 'professional' | 'minimalist' | 'dynamic'
  className?: string
  
  // Accessibility
  'aria-label'?: string
  'aria-describedby'?: string
  
  // Advanced
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  fullWidth?: boolean
  asChild?: boolean
}
```

**Implementation Example:**
```typescript
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    children,
    variant = 'primary',
    size = 'md',
    designVariant = 'professional',
    disabled = false,
    loading = false,
    leftIcon,
    rightIcon,
    className,
    ...props
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variantClasses = buttonVariants[designVariant][variant]
    const sizeClasses = getSizeClasses(size)
    
    return (
      <button
        ref={ref}
        className={cn(baseClasses, variantClasses, sizeClasses, className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && <LoadingSpinner size="sm" className="mr-2" />}
        {!loading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
        {!loading && rightIcon && <span className="ml-2">{rightIcon}</span>}
      </button>
    )
  }
)
```

### Input Component

**Interface Definition:**
```typescript
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  // Styling
  variant?: 'default' | 'error' | 'success'
  size?: 'sm' | 'md' | 'lg'
  designVariant?: 'professional' | 'minimalist' | 'dynamic'
  
  // Enhanced functionality
  label?: string
  description?: string
  error?: string
  success?: string
  required?: boolean
  
  // Icons and addons
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  leftAddon?: React.ReactNode
  rightAddon?: React.ReactNode
  
  // Input types
  inputType?: 'text' | 'email' | 'password' | 'phone' | 'search' | 'url'
  
  // Validation
  showPasswordToggle?: boolean
  formatPhoneNumber?: boolean
  
  // Container props
  containerClassName?: string
  labelClassName?: string
}
```

**Advanced Input Types:**
```typescript
// Password Input with strength indicator
export const PasswordInput: React.FC<PasswordInputProps> = ({
  showStrengthIndicator = true,
  value,
  onChange,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const strength = calculatePasswordStrength(value)
  
  return (
    <div className="space-y-2">
      <Input
        {...props}
        type={showPassword ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        rightIcon={
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        }
      />
      {showStrengthIndicator && (
        <PasswordStrengthIndicator strength={strength} />
      )}
    </div>
  )
}

// Phone Input with formatting
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  ...props
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    onChange?.({ ...e, target: { ...e.target, value: formatted } })
  }
  
  return (
    <Input
      {...props}
      type="tel"
      value={value}
      onChange={handleChange}
      placeholder="(555) 123-4567"
      leftIcon={<Phone size={16} />}
    />
  )
}
```

### Card Component

**Interface Definition:**
```typescript
interface CardProps {
  // Content structure
  children: React.ReactNode
  
  // Styling variants
  variant?: 'default' | 'elevated' | 'interactive'
  designVariant?: 'professional' | 'minimalist' | 'dynamic'
  size?: 'sm' | 'md' | 'lg'
  
  // Behavior
  clickable?: boolean
  onClick?: () => void
  
  // Layout
  padding?: 'none' | 'sm' | 'md' | 'lg'
  className?: string
  
  // Accessibility
  role?: string
  'aria-label'?: string
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}
```

**Compound Component Pattern:**
```typescript
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, variant = 'default', designVariant = 'professional', ...props }, ref) => {
    const baseClasses = 'rounded-lg border bg-card text-card-foreground shadow-sm'
    const variantClasses = cardVariants[designVariant][variant]
    
    return (
      <div
        ref={ref}
        className={cn(baseClasses, variantClasses, props.className)}
        {...props}
      >
        {children}
      </div>
    )
  }
)

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className, ...props }) => (
  <div className={cn('flex flex-col space-y-1.5 p-6', className)} {...props}>
    {children}
  </div>
)

export const CardContent: React.FC<CardContentProps> = ({ children, className, ...props }) => (
  <div className={cn('p-6 pt-0', className)} {...props}>
    {children}
  </div>
)

export const CardFooter: React.FC<CardFooterProps> = ({ children, className, ...props }) => (
  <div className={cn('flex items-center p-6 pt-0', className)} {...props}>
    {children}
  </div>
)

// Compound assignment
Card.Header = CardHeader
Card.Content = CardContent
Card.Footer = CardFooter
```

## 📊 Data Components

### DataTable Component

**Interface Definition:**
```typescript
interface DataTableProps<T> {
  // Data
  data: T[]
  columns: Column<T>[]
  
  // Pagination
  pagination?: PaginationConfig
  
  // Sorting
  sortable?: boolean
  defaultSort?: SortConfig
  onSortChange?: (sort: SortConfig) => void
  
  // Filtering
  filterable?: boolean
  filters?: FilterConfig[]
  onFilterChange?: (filters: FilterConfig[]) => void
  
  // Search
  searchable?: boolean
  searchPlaceholder?: string
  onSearchChange?: (query: string) => void
  
  // Selection
  selectable?: boolean
  selectedRows?: string[]
  onSelectionChange?: (selectedIds: string[]) => void
  
  // Loading & Empty states
  loading?: boolean
  empty?: React.ReactNode
  
  // Styling
  variant?: 'default' | 'compact' | 'comfortable'
  className?: string
}

interface Column<T> {
  id: string
  header: string
  accessorKey?: keyof T
  accessorFn?: (row: T) => any
  cell?: (info: CellContext<T>) => React.ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: number | string
  minWidth?: number
  maxWidth?: number
  align?: 'left' | 'center' | 'right'
}
```

**Usage Example:**
```typescript
const MemberTable: React.FC = () => {
  const columns: Column<Member>[] = [
    {
      id: 'name',
      header: 'Name',
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      cell: ({ row }) => (
        <div className="flex items-center space-x-3">
          <Avatar src={row.profileImage} alt={row.firstName} />
          <div>
            <div className="font-medium">{row.firstName} {row.lastName}</div>
            <div className="text-sm text-gray-500">{row.email}</div>
          </div>
        </div>
      )
    },
    {
      id: 'company',
      header: 'Company',
      accessorKey: 'company',
      sortable: true,
      filterable: true
    },
    {
      id: 'memberSince',
      header: 'Member Since',
      accessorKey: 'memberSince',
      cell: ({ getValue }) => formatDate(getValue() as Date),
      sortable: true
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">View</Button>
          <Button size="sm" variant="outline">Edit</Button>
        </div>
      )
    }
  ]
  
  return (
    <DataTable
      data={members}
      columns={columns}
      searchable
      sortable
      pagination={{
        pageSize: 20,
        showSizeSelector: true
      }}
    />
  )
}
```

### Form Components

**FormField Component:**
```typescript
interface FormFieldProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  error?: string
  children: React.ReactNode
  className?: string
}

export const FormField: React.FC<FormFieldProps> = ({
  name,
  label,
  description,
  required,
  error,
  children,
  className
}) => {
  const fieldId = `field-${name}`
  const descriptionId = description ? `${fieldId}-description` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  
  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby': cn(descriptionId, errorId),
          'aria-invalid': !!error
        })}
      </div>
      
      {description && (
        <p id={descriptionId} className="text-sm text-gray-500">
          {description}
        </p>
      )}
      
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
```

**FormWizard Component:**
```typescript
interface FormWizardProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onSubmit: (data: any) => void
  validationSchema?: any
  className?: string
}

interface WizardStep {
  id: string
  title: string
  description?: string
  component: React.ComponentType<any>
  validation?: any
}

export const FormWizard: React.FC<FormWizardProps> = ({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  validationSchema,
  className
}) => {
  const currentStepData = steps[currentStep]
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1
  
  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress indicator */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              'flex items-center space-x-2',
              index < currentStep && 'text-green-600',
              index === currentStep && 'text-blue-600',
              index > currentStep && 'text-gray-400'
            )}
          >
            <div className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
              index < currentStep && 'bg-green-100 text-green-600',
              index === currentStep && 'bg-blue-100 text-blue-600',
              index > currentStep && 'bg-gray-100 text-gray-400'
            )}>
              {index < currentStep ? <Check size={16} /> : index + 1}
            </div>
            <span className="text-sm font-medium">{step.title}</span>
          </div>
        ))}
      </div>
      
      {/* Current step content */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">{currentStepData.title}</h3>
          {currentStepData.description && (
            <p className="text-gray-600">{currentStepData.description}</p>
          )}
        </CardHeader>
        
        <CardContent>
          <currentStepData.component />
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => onStepChange(currentStep - 1)}
            disabled={isFirstStep}
          >
            Previous
          </Button>
          
          <Button
            onClick={() => isLastStep ? onSubmit() : onStepChange(currentStep + 1)}
          >
            {isLastStep ? 'Submit' : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
```

## 🎭 Domain-Specific Components

### Member Components

**MemberCard Component:**
```typescript
interface MemberCardProps {
  member: Member
  variant?: 'compact' | 'detailed' | 'minimal'
  showActions?: boolean
  onContact?: (member: Member) => void
  onViewProfile?: (member: Member) => void
  className?: string
}

export const MemberCard: React.FC<MemberCardProps> = ({
  member,
  variant = 'detailed',
  showActions = true,
  onContact,
  onViewProfile,
  className
}) => {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar
            src={member.profileImage}
            alt={`${member.firstName} ${member.lastName}`}
            size="lg"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900">
              {member.firstName} {member.lastName}
            </h3>
            
            <p className="text-sm text-gray-600 mb-1">{member.title}</p>
            <p className="text-sm font-medium text-gray-900">{member.company}</p>
            
            {variant === 'detailed' && (
              <>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <MapPin size={14} className="mr-1" />
                  {member.city}, {member.state}
                </div>
                
                <div className="mt-3 flex flex-wrap gap-1">
                  {member.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="secondary" size="sm">
                      {skill}
                    </Badge>
                  ))}
                  {member.skills.length > 3 && (
                    <Badge variant="outline" size="sm">
                      +{member.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
        
        {showActions && (
          <div className="mt-4 flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewProfile?.(member)}
            >
              View Profile
            </Button>
            <Button
              size="sm"
              onClick={() => onContact?.(member)}
            >
              <Mail size={14} className="mr-1" />
              Contact
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### Project Components

**ProjectCard Component:**
```typescript
interface ProjectCardProps {
  project: Project
  viewMode?: 'card' | 'list'
  showActions?: boolean
  onApply?: (project: Project) => void
  onViewDetails?: (project: Project) => void
  className?: string
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  viewMode = 'card',
  showActions = true,
  onApply,
  onViewDetails,
  className
}) => {
  const isDeadlineSoon = dayjs(project.deadlineDate).diff(dayjs(), 'days') <= 7
  const canApply = project.status === 'BIDDING_OPEN' && 
                   project.applicationCount < (project.maxApplications || Infinity)
  
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {project.title}
            </h3>
            <div className="flex items-center space-x-3 text-sm text-gray-600">
              <Badge variant={getStatusVariant(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
              <span className="flex items-center">
                <MapPin size={14} className="mr-1" />
                {project.location}
              </span>
            </div>
          </div>
          
          {project.priority === 'HIGH' && (
            <Badge variant="destructive" size="sm">
              High Priority
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {project.description}
        </p>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Budget:</span>
            <p className="text-gray-600">
              {formatCurrency(project.budgetMin)} - {formatCurrency(project.budgetMax)}
            </p>
          </div>
          
          <div>
            <span className="font-medium text-gray-700">Deadline:</span>
            <p className={cn(
              'text-gray-600',
              isDeadlineSoon && 'text-red-600 font-medium'
            )}>
              {formatDate(project.deadlineDate)}
              {isDeadlineSoon && (
                <span className="ml-1 text-red-500">
                  <Clock size={12} className="inline" />
                </span>
              )}
            </p>
          </div>
        </div>
        
        {project.skillsRequired.length > 0 && (
          <div className="mt-4">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Skills Required:
            </span>
            <div className="flex flex-wrap gap-1">
              {project.skillsRequired.map((skill) => (
                <Badge key={skill} variant="outline" size="sm">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      
      {showActions && (
        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {project.applicationCount} of {project.maxApplications || '∞'} applications
          </div>
          
          <div className="flex space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onViewDetails?.(project)}
            >
              View Details
            </Button>
            
            {canApply && (
              <Button
                size="sm"
                onClick={() => onApply?.(project)}
                disabled={!canApply}
              >
                Apply Now
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
```

## 🎨 Layout Components

### Responsive Layout System

**Container Component:**
```typescript
interface ContainerProps {
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padding?: boolean
  className?: string
}

export const Container: React.FC<ContainerProps> = ({
  children,
  size = 'lg',
  padding = true,
  className
}) => {
  const sizeClasses = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl', 
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
    full: 'max-w-full'
  }
  
  return (
    <div className={cn(
      'mx-auto',
      sizeClasses[size],
      padding && 'px-4 sm:px-6 lg:px-8',
      className
    )}>
      {children}
    </div>
  )
}
```

**Grid System:**
```typescript
interface GridProps {
  children: React.ReactNode
  cols?: 1 | 2 | 3 | 4 | 6 | 12
  gap?: 'sm' | 'md' | 'lg'
  responsive?: {
    sm?: number
    md?: number
    lg?: number
    xl?: number
  }
  className?: string
}

export const Grid: React.FC<GridProps> = ({
  children,
  cols = 1,
  gap = 'md',
  responsive,
  className
}) => {
  const gapClasses = {
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6'
  }
  
  const colClasses = responsive ? 
    `grid-cols-1 ${responsive.sm ? `sm:grid-cols-${responsive.sm}` : ''} ${responsive.md ? `md:grid-cols-${responsive.md}` : ''} ${responsive.lg ? `lg:grid-cols-${responsive.lg}` : ''} ${responsive.xl ? `xl:grid-cols-${responsive.xl}` : ''}` :
    `grid-cols-${cols}`
  
  return (
    <div className={cn('grid', colClasses, gapClasses[gap], className)}>
      {children}
    </div>
  )
}
```

## 🔧 Component Composition Patterns

### Render Props Pattern

```typescript
interface DataFetcherProps<T> {
  url: string
  children: (data: {
    data: T | null
    loading: boolean
    error: Error | null
    refetch: () => void
  }) => React.ReactNode
}

export function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const { data, loading, error, refetch } = useQuery(url)
  
  return <>{children({ data, loading, error, refetch })}</>
}

// Usage
<DataFetcher<Project[]> url="/api/projects">
  {({ data, loading, error }) => {
    if (loading) return <LoadingSpinner />
    if (error) return <ErrorMessage error={error} />
    return <ProjectList projects={data || []} />
  }}
</DataFetcher>
```

### Higher-Order Components

```typescript
interface WithAuthProps {
  user: User | null
  isAuthenticated: boolean
}

export function withAuth<P extends WithAuthProps>(
  Component: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: Omit<P, keyof WithAuthProps>) {
    const { user, isAuthenticated } = useAuth()
    
    if (!isAuthenticated) {
      return <LoginPrompt />
    }
    
    return <Component {...props as P} user={user} isAuthenticated={isAuthenticated} />
  }
}

// Usage
const ProtectedDashboard = withAuth(Dashboard)
```

### Custom Hooks for Component Logic

```typescript
// useTable hook for DataTable logic
export function useTable<T>(options: UseTableOptions<T>) {
  const [data, setData] = useState<T[]>(options.data)
  const [sorting, setSorting] = useState<SortingState>(options.defaultSorting || [])
  const [filtering, setFiltering] = useState<FilteringState>(options.defaultFiltering || [])
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: options.pageSize || 10
  })
  
  const table = useReactTable({
    data,
    columns: options.columns,
    state: {
      sorting,
      columnFilters: filtering,
      pagination
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setFiltering,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })
  
  return {
    table,
    data,
    setData,
    sorting,
    setSorting,
    filtering,
    setFiltering,
    pagination,
    setPagination
  }
}
```

## 📱 Responsive Design Patterns

### Mobile-First Approach

```typescript
// Responsive component with mobile-first breakpoints
export const ResponsiveCard: React.FC<ResponsiveCardProps> = ({
  children,
  mobileLayout = 'stack',
  desktopLayout = 'grid'
}) => {
  return (
    <Card className={cn(
      // Mobile: Stack layout
      'flex flex-col space-y-4',
      // Tablet: Adjust spacing
      'md:space-y-6',
      // Desktop: Grid layout
      desktopLayout === 'grid' && 'lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0'
    )}>
      {children}
    </Card>
  )
}
```

### Adaptive Components

```typescript
// Component that adapts based on screen size
export const AdaptiveNavigation: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false)
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])
  
  return isMobile ? <MobileNavMenu /> : <DesktopNavMenu />
}
```

## 🎯 Performance Optimization

### Component Optimization Strategies

```typescript
// Memoized component to prevent unnecessary re-renders
export const OptimizedMemberCard = React.memo<MemberCardProps>(
  ({ member, ...props }) => {
    return <MemberCard member={member} {...props} />
  },
  (prevProps, nextProps) => {
    // Custom comparison function
    return (
      prevProps.member.id === nextProps.member.id &&
      prevProps.member.updatedAt === nextProps.member.updatedAt
    )
  }
)

// Lazy loaded component for better initial load performance
export const LazyProjectDetails = React.lazy(() => 
  import('./ProjectDetails').then(module => ({ default: module.ProjectDetails }))
)

// Virtual scrolling for large lists
export const VirtualizedMemberList: React.FC<VirtualizedListProps> = ({
  members,
  height = 600
}) => {
  const rowRenderer = useCallback(({ index, key, style }) => (
    <div key={key} style={style}>
      <MemberCard member={members[index]} />
    </div>
  ), [members])
  
  return (
    <List
      height={height}
      rowCount={members.length}
      rowHeight={200}
      rowRenderer={rowRenderer}
    />
  )
}
```

## 📚 Implementation Guidelines

### Component Development Checklist

- [ ] **TypeScript interfaces defined** with comprehensive prop types
- [ ] **Accessibility implemented** (ARIA labels, keyboard navigation, screen readers)
- [ ] **Responsive design** with mobile-first approach
- [ ] **Design variants supported** (professional, minimalist, dynamic)
- [ ] **Error boundaries** implemented for graceful failure handling
- [ ] **Loading states** provided for async operations
- [ ] **Storybook stories** created for documentation and testing
- [ ] **Unit tests** written with React Testing Library
- [ ] **Performance optimized** with React.memo where appropriate
- [ ] **Documentation updated** with usage examples

### Naming Conventions

- **Components**: PascalCase (`MemberCard`, `ProjectList`)
- **Props interfaces**: Component name + "Props" (`MemberCardProps`)
- **Event handlers**: "on" prefix (`onClick`, `onSubmit`)
- **Boolean props**: "is", "has", "can", "should" prefix (`isLoading`, `hasError`)
- **CSS classes**: kebab-case following Tailwind conventions

### File Structure

```
components/
├── ComponentName/
│   ├── index.ts              # Export file
│   ├── ComponentName.tsx     # Main component
│   ├── ComponentName.types.ts # TypeScript interfaces
│   ├── ComponentName.styles.ts # Style variants
│   ├── ComponentName.stories.tsx # Storybook stories
│   ├── ComponentName.test.tsx # Unit tests
│   └── hooks/               # Component-specific hooks
│       └── useComponentName.ts
```

---

*This component architecture provides a scalable, maintainable, and accessible foundation for the NAMC portal interface. Regular reviews and updates ensure the system evolves with user needs and technology advances.*