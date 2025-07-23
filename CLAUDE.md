# CLAUDE.md - NAMC NorCal Member Portal

This file provides guidance to Claude Code when working with the Northern California chapter of the National Association of Minority Contractors (NAMC) member portal codebase.

## Claude Code Workflow Rules

**IMPORTANT: Follow these 7 rules for every task:**

1. **Plan First**: Think through the problem, read the codebase for relevant files, and write a plan to `tasks/todo.md`
2. **Todo Structure**: The plan should have a list of todo items that you can check off as you complete them
3. **Get Approval**: Before beginning work, check in with the user to verify the plan
4. **Track Progress**: Work on todo items one by one, marking them as complete as you go
5. **High-Level Updates**: For every step, give a high-level explanation of what changes you made
6. **Keep It Simple**: Make every task and code change as simple as possible - avoid massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.
7. **Review Summary**: Finally, add a review section to the `todo.md` file with a summary of changes made and any relevant information

## 🚀 Project Context & Architecture

### Repository Overview
This repository contains web applications for the Northern California chapter of the National Association of Minority Contractors (NAMC) member portal. There are three projects:

- **NAMCNorCalMemberPortal2025**: React SPA with Vite, TypeScript, and Tailwind CSS
- **NAMCNorCalMemberPortal2025-1**: Duplicate/variant of the above
- **NAMCNorCalMemberPortalV2**: Full-stack application with Next.js frontend and Express.js backend

### Tech Stack (Current as of January 2025)
- **Frontend**: Next.js 15.3.5, React 18.2.0, TypeScript 5.7.2, Tailwind CSS 3.4.1
- **Backend**: Express.js with Node.js, PostgreSQL with Prisma 6.1.0
- **Authentication**: JWT with bcrypt
- **State Management**: Zustand 4.5.0, React Hook Form with Zod validation
- **Development**: Vite for React apps, Docker for services

## 🎯 NAMC Business Domain Rules

### Member Portal Requirements
- **Member Types**: Regular members and administrators
- **Core Features**: Event management, messaging, announcements, resource sharing
- **Security**: Government contractor compliance, role-based access control
- **Accessibility**: WCAG 2.1 AA compliance for government accessibility standards

## 🎨 UI/UX Design System

### Style Guide Reference
- **Primary Guide**: `/UI_UX_STYLE_GUIDE.md` - Complete design system and component guidelines
- **Component Library**: [21st.dev Components](https://21st.dev/components) - Professional React + Tailwind components
- **Component Mapping**: `/21st-dev-component-mapping.md` - Specific component selections for NAMC use cases
- **Framework**: React + Tailwind CSS with 400+ professional components available

### Design Principles
- **Professional & Trustworthy**: Government contractor standards require polished interfaces
- **Interactive & Modern**: Responsive, dynamic components for member engagement
- **Accessibility First**: WCAG 2.1 AA compliance for government accessibility standards
- **Mobile-Responsive**: Contractors work on-site, need mobile-optimized experience

### Key Component Selections
- **Authentication**: Professional sign-in/sign-up forms with NAMC branding
- **Navigation**: Collapsible sidebar with role-based menu items + top navigation
- **Data Display**: Sortable tables with filters, professional card layouts
- **Forms**: Multi-step forms with validation, modern input components
- **Interactive**: Modal dialogs, toast notifications, tooltips

### Database Schema Patterns
Always follow the established Prisma schema:
- User (with memberType: REGULAR/admin)
- Event (with EventRegistration many-to-many)
- Message (direct messaging between members)
- Announcement (admin broadcasts)
- Resource (file uploads and sharing)
- AdminAction (audit log for compliance)

## 🔧 Development Workflow & Commands

### Project Commands
```bash
# NAMCNorCalMemberPortal2025 (Vite React)
cd NAMCNorCalMemberPortal2025
npm run dev              # Start dev server (Vite)
npm run build            # TypeScript check + production build
npm run lint             # Run ESLint
npm run preview          # Preview production build

# NAMCNorCalMemberPortalV2 (Full-Stack)
cd NAMCNorCalMemberPortalV2
./setup.sh               # Automated setup script

# Backend (Express.js)
cd backend
npm run dev              # Start dev server (port 8000)
npm run db:migrate       # Run database migrations
npm run db:generate      # Generate Prisma client
npm run test             # Run Jest tests
npm run lint             # Run ESLint

# Frontend (Next.js)
cd frontend
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # Build for production
npm run type-check       # TypeScript type checking
```

## 📁 Code Structure & Best Practices

### File Organization
- **Components**: Organize by feature, not by type (e.g., `members/`, `events/`, `messaging/`)
- **API Routes**: Follow RESTful conventions (`/api/users/*`, `/api/events/*`, `/api/messages/*`)
- **Database**: Use Prisma migrations for all schema changes
- **File Naming**: kebab-case for files, PascalCase for React components

### React/Next.js Patterns
- **Components**: Use TypeScript interfaces for all props
- **State Management**: Zustand for global state, React Hook Form for forms
- **Styling**: Tailwind CSS utility classes, component-scoped styles when needed
- **Server Components**: Use Next.js App Router patterns, separate Client/Server components
- **API Integration**: Axios for HTTP calls, consistent error handling

### Security & Compliance
- **Authentication**: JWT tokens expire in 7 days, bcrypt for password hashing
- **Authorization**: Role-based access control (admin vs regular members)
- **Input Validation**: Zod schemas for all form inputs and API endpoints
- **Data Protection**: No sensitive information in frontend, secure file uploads
- **Audit Trail**: Log all admin actions for compliance

## 🧪 Testing & Quality Assurance

### Testing Requirements
- **Unit Tests**: Jest for backend, React Testing Library for frontend
- **Component Tests**: Test user interactions and accessibility
- **API Tests**: Test all endpoints with proper auth and validation
- **E2E Tests**: Critical user flows (registration, login, event signup)

### Code Quality
- **TypeScript**: Strict mode enabled, avoid `any` types
- **Linting**: ESLint with Next.js and React rules
- **Formatting**: Prettier for consistent code style
- **Accessibility**: Test with screen readers, keyboard navigation

## 🚦 Validation & Deployment

### Pre-Deployment Checklist
```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Tests
npm test

# Build verification
npm run build

# Accessibility audit
npm run a11y-check  # If available
```

### API Response Format
All API responses follow this structure:
```typescript
{
  success: boolean;
  data?: any;
  message: string;
  error?: string;
}
```

## 🔒 Security Best Practices

### Authentication & Authorization
- Always verify JWT tokens on protected routes
- Use middleware for role-based access control
- Implement rate limiting (100 requests per 15 minutes)
- Secure file upload validation and storage

### Data Handling
- Validate all inputs with express-validator (backend) and Zod (frontend)
- Never expose sensitive data in API responses
- Use parameterized queries to prevent SQL injection
- Implement proper CORS policies

## 🎨 UI/UX Standards

### Design System
- **Colors**: Follow NAMC brand guidelines
- **Typography**: System fonts with accessibility considerations
- **Components**: Reusable components in shared component library
- **Responsive**: Mobile-first design with Tailwind breakpoints

### Accessibility Requirements
- **WCAG 2.1 AA**: All interactive elements must meet standards
- **Keyboard Navigation**: Full keyboard accessibility
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 ratio for normal text

## 🐛 Error Handling & Logging

### Frontend Error Handling
- Use React Error Boundaries for component errors
- Toast notifications for user feedback
- Graceful degradation for network issues

### Backend Error Handling
- Use express-async-handler for async routes
- Structured error responses with appropriate HTTP status codes
- Comprehensive logging for debugging and audit trails

## 📋 Common Development Patterns

### Member Management
```typescript
// User authentication flow
const user = await authenticateUser(token);
if (!user) throw new UnauthorizedError();

// Role-based access
if (user.memberType !== 'admin' && action.requiresAdmin) {
  throw new ForbiddenError();
}
```

### Event Management
```typescript
// Event registration with capacity checking
const event = await prisma.event.findUnique({ where: { id } });
if (event.registrations.length >= event.maxCapacity) {
  throw new Error('Event is full');
}
```

### Database Operations
```typescript
// Always use transactions for multi-table operations
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ data: userData });
  await tx.adminAction.create({ 
    data: { action: 'USER_CREATED', userId: user.id } 
  });
});
```

## 🚀 Performance Optimization

### Frontend Optimization
- Use Next.js Image component for optimized images
- Implement proper loading states and skeleton screens
- Lazy load non-critical components
- Optimize bundle size with dynamic imports

### Backend Optimization
- Use Prisma query optimization and includes
- Implement Redis caching for frequently accessed data
- Use connection pooling for database connections
- Optimize API response sizes

## 📱 Mobile & Responsive Design

### Mobile-First Approach
- Design for mobile screens first, then scale up
- Use Tailwind responsive utilities (sm:, md:, lg:, xl:)
- Test on actual devices and various screen sizes
- Ensure touch targets are at least 44px

### Progressive Web App Features
- Service worker for offline functionality
- Push notifications for important updates
- App-like experience on mobile devices

## 🔄 Development Workflow

### Git Workflow
- Use feature branches for all development
- Descriptive commit messages following conventional commits
- Pull request reviews required for main branch
- Automated testing in CI/CD pipeline

### Environment Management
- Separate configurations for development, staging, production
- Environment variables for all sensitive configuration
- Docker containers for consistent development environment

---

## 🎯 Context Engineering & AI Coding Standards

### Code Structure & Modularity
- **Never create a file longer than 500 lines of code.** If a file approaches this limit, refactor by splitting it into modules or helper files.
- **Organize code into clearly separated modules**, grouped by feature or responsibility:
  - `components/` - React components grouped by feature
  - `api/` - API route handlers  
  - `utils/` - Utility functions and helpers
  - `types/` - TypeScript type definitions
  - `hooks/` - Custom React hooks
- **Use clear, consistent imports** (prefer relative imports within packages)
- **Use environment variables** for all configuration with proper defaults

### Testing & Reliability
- **Always create tests for new features** using React Testing Library and Jest
- **After updating any logic**, check whether existing tests need to be updated
- **Tests should include**:
  - 1 test for expected use case
  - 1 edge case test
  - 1 failure case test
  - Accessibility testing for UI components
- **Never ignore failing tests** - fix the root cause

### AI Behavior Rules
- **Never assume missing context** - Ask questions if uncertain about NAMC business rules
- **Never hallucinate APIs or libraries** - Only use verified packages and documented APIs
- **Always confirm file paths exist** before referencing them
- **Never delete existing code** unless explicitly instructed or part of approved task
- **Follow validation loops** - Type check → Lint → Test → Manual verification
- **Preserve existing patterns** - Mirror established component and API patterns

### Documentation Standards
- **Update README.md** when adding features or changing setup steps
- **Comment non-obvious business logic** especially NAMC-specific rules
- **Use TypeScript interfaces** for all props and data structures
- **Document API endpoints** with clear parameter and response examples

### NAMC-Specific Anti-Patterns
- ❌ Don't create new patterns when existing NAMC patterns work
- ❌ Don't skip role-based access control validation
- ❌ Don't ignore government compliance requirements
- ❌ Don't hardcode values that should be environment variables
- ❌ Don't skip accessibility testing for government contracts

---

**Remember**: The NAMC member portal serves government contractors and must maintain high standards for security, accessibility, and reliability. Always consider compliance requirements and user experience when making technical decisions.