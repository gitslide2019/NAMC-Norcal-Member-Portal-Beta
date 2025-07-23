name: "NAMC Web Development PRP Template v1 - React/Next.js Optimized"
description: |

## Purpose
Template optimized for AI agents to implement web features for the NAMC NorCal member portal using React/Next.js with sufficient context and validation loops to achieve working code.

## Core Principles
1. **NAMC Domain First**: Understand member portal business rules and compliance requirements
2. **Component-Based**: Build reusable React components following established patterns
3. **Accessibility Required**: WCAG 2.1 AA compliance is mandatory
4. **Security by Design**: Role-based access, input validation, audit trails
5. **Mobile-First**: Responsive design with Tailwind CSS
6. **Type Safety**: TypeScript strict mode, proper interfaces
7. **Follow CLAUDE.md**: Adhere to all project rules and conventions

---

## Goal
[What needs to be built - be specific about the UI/UX, functionality, and integration points]

## Why
- [Business value for NAMC members and administrators]
- [Integration with existing member portal features]
- [Problems this solves for contractors and government compliance]

## What
[User-visible behavior, technical requirements, and acceptance criteria]

### Success Criteria
- [ ] [Specific measurable outcomes for users]
- [ ] [Accessibility requirements met (WCAG 2.1 AA)]
- [ ] [Mobile responsiveness verified]
- [ ] [Security requirements implemented]
- [ ] [Performance benchmarks achieved]

## All Needed Context

### Documentation & References
```yaml
# MUST READ - Include these in your context window
- file: CLAUDE.md
  why: Project rules, conventions, and NAMC-specific requirements
  
- file: examples/README.md
  why: Overview of all available patterns and examples
  
- file: examples/components/[RelatedComponent].tsx
  why: [Specific pattern to follow for component structure]
  
- file: examples/api/[RelatedAPI].ts
  why: [API pattern to follow for backend integration]
  
- file: examples/forms/[RelatedForm].tsx
  why: [Form handling pattern with validation]
  
- file: examples/database/[RelatedDB].ts
  why: [Database operation pattern]

- url: https://nextjs.org/docs/app/building-your-application/[specific-feature]
  why: [Next.js App Router specific documentation needed]
  
- url: https://tailwindcss.com/docs/[specific-feature]
  why: [Tailwind CSS utility classes for responsive design]
  
- url: https://www.prisma.io/docs/[specific-feature]
  why: [Prisma ORM patterns for database operations]

- url: https://react-hook-form.com/docs/[specific-feature]
  why: [Form handling with validation patterns]
```

### Current Project Structure
```bash
# Run this to understand the codebase layout
tree -I 'node_modules|.git|.next|dist' -L 3
```

### Target Implementation Structure
```bash
# Files to be created/modified with their responsibilities
src/components/
├── [FeatureName]/
│   ├── [MainComponent].tsx         # Primary component
│   ├── [SubComponent].tsx          # Supporting components
│   ├── types.ts                    # TypeScript interfaces
│   └── index.ts                    # Barrel exports
├── shared/
│   ├── [ReusableComponent].tsx     # Shared components
│   └── hooks/
│       └── use[FeatureName].ts     # Custom hooks
└── utils/
    └── [feature]-helpers.ts        # Utility functions

pages/api/ (or app/api/ for App Router)
├── [feature]/
│   ├── route.ts                    # API route handler
│   └── [id]/route.ts              # Dynamic route handler

database/
├── schema.prisma                   # Database schema updates
└── migrations/                     # Migration files
```

### NAMC Business Rules & Gotchas
```typescript
// CRITICAL: NAMC-specific requirements
// Member Types: 'REGULAR' | 'admin' - affects all access control
// Events: Have capacity limits, registration deadlines, approval workflows
// Messages: Direct member-to-member, no group messaging
// Announcements: Admin-only, broadcast to all members
// Audit Trail: All admin actions MUST be logged
// File Uploads: Security validation required, size limits enforced
// Accessibility: Screen reader support, keyboard navigation mandatory
// Mobile: Touch targets minimum 44px, responsive breakpoints required
```

### Tech Stack Constraints
```typescript
// Current versions - DO NOT upgrade during implementation
// Next.js: 15.3.5 (App Router)
// React: 18.2.0
// TypeScript: 5.7.2
// Tailwind CSS: 3.4.1
// Prisma: 6.1.0
// React Hook Form + Zod for forms
// Zustand for state management
// Axios for API calls

// Database Schema Patterns
interface User {
  id: string;
  email: string;
  memberType: 'REGULAR' | 'admin';
  // ... other fields
}

interface Event {
  id: string;
  title: string;
  maxCapacity: number;
  registrationDeadline?: Date;
  // ... other fields
}
```

## Implementation Blueprint

### 1. Database Schema Changes (if needed)
```typescript
// Prisma schema additions/modifications
model [NewModel] {
  id          String   @id @default(cuid())
  // ... fields
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  // Relationships
  user   User   @relation(fields: [userId], references: [id])
  userId String
  
  @@map("[table_name]")
}

// Migration command to run:
// npm run db:migrate
```

### 2. Type Definitions
```typescript
// Create interfaces for all data structures
interface [FeatureName]Props {
  // Component props with proper TypeScript
}

interface [FeatureName]Data {
  // API data structure
}

interface [FeatureName]FormData {
  // Form validation schema
}
```

### 3. API Routes (Next.js App Router)
```typescript
// app/api/[feature]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken } from '@/utils/auth-helpers';
import { z } from 'zod';

// Validation schema
const [feature]Schema = z.object({
  // ... validation rules
});

export async function GET(request: NextRequest) {
  // PATTERN: Always authenticate first
  const auth = await authenticateToken(request);
  if (!auth) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }
  
  // PATTERN: Role-based access control
  if (requiresAdmin && auth.memberType !== 'admin') {
    return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
  }
  
  try {
    // Business logic here
    return NextResponse.json({
      success: true,
      data: result,
      message: 'Success message',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Error message',
      error: error.message,
    }, { status: 500 });
  }
}
```

### 4. React Components
```typescript
// Main component structure
interface [ComponentName]Props {
  // ... props
}

export const [ComponentName]: React.FC<[ComponentName]Props> = ({
  // ... props
}) => {
  // PATTERN: Loading states
  const [isLoading, setIsLoading] = useState(false);
  
  // PATTERN: Error handling
  const [error, setError] = useState<string | null>(null);
  
  // PATTERN: Form handling (if applicable)
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  // PATTERN: Accessibility
  return (
    <div 
      className="..."
      role="..." 
      aria-label="..."
      aria-describedby="..."
    >
      {/* Content with proper semantic HTML */}
    </div>
  );
};
```

### 5. Database Operations
```typescript
// Follow examples/database/ patterns
export class [Feature]Operations {
  static async create[Item](data: Create[Item]Data, userId: string) {
    return await prisma.$transaction(async (tx) => {
      // Main operation
      const result = await tx.[model].create({ data });
      
      // Audit trail (if admin action)
      await tx.adminAction.create({
        data: {
          action: '[ACTION_TYPE]',
          userId,
          details: `Description of action`,
        },
      });
      
      return result;
    });
  }
}
```

## Validation Loops

### Level 1: TypeScript & Linting
```bash
# Run these FIRST - fix any errors before proceeding
npm run type-check                  # TypeScript compilation
npm run lint                       # ESLint checks
npm run lint:fix                   # Auto-fix linting issues

# Expected: No TypeScript errors, no linting warnings
```

### Level 2: Component Testing
```typescript
// Create test file: __tests__/[ComponentName].test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { [ComponentName] } from '../[ComponentName]';

describe('[ComponentName]', () => {
  it('renders correctly', () => {
    render(<[ComponentName] {...defaultProps} />);
    expect(screen.getByRole('...')).toBeInTheDocument();
  });
  
  it('handles user interactions', async () => {
    const user = userEvent.setup();
    render(<[ComponentName] {...defaultProps} />);
    
    await user.click(screen.getByRole('button', { name: '...' }));
    await waitFor(() => {
      expect(screen.getByText('...')).toBeInTheDocument();
    });
  });
  
  it('handles error states', () => {
    render(<[ComponentName] {...propsWithError} />);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
  
  it('meets accessibility requirements', () => {
    render(<[ComponentName] {...defaultProps} />);
    // Test keyboard navigation, screen reader support
  });
});
```

```bash
# Run tests
npm test -- --testPathPattern=[ComponentName]
# Expected: All tests pass, good coverage
```

### Level 3: API Testing
```bash
# Test API endpoints
curl -X POST http://localhost:3000/api/[feature] \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${TEST_TOKEN}" \
  -d '{"testData": "value"}'

# Expected: Proper JSON response with success: true
```

### Level 4: Database Migration & Seed
```bash
# If database changes were made
npm run db:generate                # Generate Prisma client
npm run db:migrate                 # Apply migrations
npm run db:seed                    # Seed test data

# Expected: Migrations applied successfully, no conflicts
```

### Level 5: Integration Testing
```bash
# Start development server
npm run dev

# Test the complete user flow:
# 1. Navigate to the feature
# 2. Test all user interactions
# 3. Verify responsive design (mobile, tablet, desktop)
# 4. Test with screen reader (if possible)
# 5. Test keyboard navigation
# 6. Verify admin vs regular member access

# Expected: Feature works end-to-end, no console errors
```

### Level 6: Accessibility Validation
```bash
# Install and run accessibility checker (if available)
npm run a11y-check                 # Automated accessibility testing

# Manual checks:
# - Tab through all interactive elements
# - Test with screen reader announcements
# - Verify color contrast ratios
# - Check focus indicators
# - Test responsive text scaling

# Expected: WCAG 2.1 AA compliance
```

## Final Validation Checklist
- [ ] All TypeScript compiles without errors: `npm run type-check`
- [ ] No linting issues: `npm run lint`
- [ ] All unit tests pass: `npm test`
- [ ] Component renders correctly in Storybook (if available)
- [ ] API endpoints return expected responses
- [ ] Database operations work correctly
- [ ] Manual testing successful across devices
- [ ] Accessibility requirements met (WCAG 2.1 AA)
- [ ] Performance benchmarks achieved (Lighthouse score > 90)
- [ ] Security audit passed (no sensitive data exposure)
- [ ] Audit trail created for admin actions
- [ ] Error handling graceful and user-friendly
- [ ] Loading states provide good UX
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested

---

## NAMC-Specific Anti-Patterns to Avoid

### Context Engineering & AI Behavior
- ❌ Don't create new patterns when existing NAMC patterns work
- ❌ Don't skip validation loops (type check → lint → test)
- ❌ Don't ignore failing tests - fix the root cause
- ❌ Don't assume missing context - ask about business rules
- ❌ Don't hardcode values that should be environment variables

### Security
- ❌ Don't expose sensitive member data in frontend
- ❌ Don't skip role-based access control checks
- ❌ Don't forget audit trail for admin actions
- ❌ Don't trust client-side validation alone

### Accessibility
- ❌ Don't use color alone to convey information
- ❌ Don't forget keyboard navigation support
- ❌ Don't skip screen reader testing
- ❌ Don't use generic button/link text

### Performance
- ❌ Don't load unnecessary data on initial render
- ❌ Don't forget to implement loading states
- ❌ Don't skip image optimization
- ❌ Don't ignore mobile performance

### Data Integrity
- ❌ Don't skip input validation on backend
- ❌ Don't forget database transactions for related operations
- ❌ Don't ignore error handling in async operations
- ❌ Don't skip data cleanup when deleting records

### UX/UI
- ❌ Don't ignore responsive design breakpoints
- ❌ Don't forget touch target sizes for mobile
- ❌ Don't skip user feedback for actions
- ❌ Don't ignore error message clarity

### Code Quality
- ❌ Don't create files longer than 500 lines
- ❌ Don't delete existing code unless explicitly instructed
- ❌ Don't skip organizing code into feature-based modules
- ❌ Don't forget to update documentation when adding features