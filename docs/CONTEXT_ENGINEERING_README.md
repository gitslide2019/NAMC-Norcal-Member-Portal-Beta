# NAMC NorCal Member Portal - Context Engineering Guide

## What is Context Engineering?

Context Engineering is an approach to AI-assisted development that provides comprehensive context to AI coding assistants, enabling them to build features correctly on the first attempt. Instead of iterative back-and-forth, AI agents receive all necessary business rules, technical patterns, examples, and constraints upfront.

## Why Context Engineering for NAMC?

The NAMC NorCal Member Portal serves government contractors with specific compliance requirements, business rules, and technical standards. Context Engineering ensures AI assistants understand:

- **Government Contractor Compliance**: WCAG 2.1 AA accessibility, DEI requirements, audit trails
- **NAMC Business Rules**: Member types, role-based access, professional standards
- **Technical Standards**: Next.js patterns, TypeScript strict mode, security protocols
- **Quality Requirements**: Testing standards, performance benchmarks, mobile-first design

## NAMC Context Engineering File Structure

```
NAMC-Norcal-Member-Portal-Beta/
├── CLAUDE.md                          # Master AI assistant rules and NAMC business context
├── INITIAL.md                         # Feature specification template
├── .claude/
│   ├── commands/
│   │   ├── generate-prp.md           # Generate Product Requirements Prompts
│   │   └── execute-prp.md            # Execute PRPs to implement features
│   └── settings.local.json           # Claude Code permissions and settings
├── PRPs/
│   ├── templates/
│   │   ├── prp_namc_web.md          # NAMC-specific web development PRP template
│   │   └── prp_base.md              # Base PRP template for any feature type
│   └── [feature-name].md            # Generated PRPs for specific features
└── examples/
    ├── components/                   # React component patterns
    ├── api/                         # API endpoint patterns
    ├── database/                    # Database operation patterns
    ├── forms/                       # Form handling patterns
    └── hooks/                       # Custom React hook patterns
```

## How to Use the Context Engineering System

### 1. Requesting a New Feature

Create a feature specification using the `INITIAL.md` template:

```bash
# Copy the template
cp INITIAL.md INITIAL_[FEATURE_NAME].md

# Fill in the feature requirements following the template structure
```

**Required Sections:**
- **FEATURE**: Clear description of what needs to be built
- **EXAMPLES**: Reference existing code patterns to follow
- **DOCUMENTATION**: List required reading materials and API docs
- **OTHER CONSIDERATIONS**: NAMC-specific business rules and gotchas

### 2. Generating Product Requirements Prompts (PRPs)

Use the `/generate-prp` command to create comprehensive implementation guides:

```bash
/generate-prp INITIAL_[FEATURE_NAME].md
```

This will:
1. Analyze your feature requirements
2. Research the codebase for relevant patterns
3. Generate a detailed PRP with implementation blueprint
4. Include validation loops and testing requirements

### 3. Implementing Features

Execute the PRP using Claude Code or other AI assistants:

```bash
/execute-prp PRPs/[feature-name].md
```

The PRP provides:
- Complete technical context
- Step-by-step implementation plan
- Validation checkpoints
- NAMC-specific business rules
- Testing requirements

## NAMC Business Domain Context

### Member Portal Core Entities

```typescript
// Primary user types in the system
type MemberType = 'REGULAR' | 'admin';

// Core business entities
interface User {
  memberType: MemberType;
  certifications: string[];      // DBE, MBE, LBE, SBE, WBE
  company: string;
  serviceArea: string[];         // Geographic coverage
}

interface Project {
  type: 'residential' | 'commercial' | 'infrastructure';
  location: string;              // Northern California focus
  certificationRequired: string[];
  contractValue: number;
}
```

### Government Contractor Requirements

- **Accessibility**: WCAG 2.1 AA compliance mandatory
- **Security**: Role-based access control, audit trails for admin actions
- **Performance**: Sub-3-second load times, Lighthouse score > 90
- **Mobile**: Touch targets ≥ 44px, responsive design required
- **Data Protection**: No sensitive member information in frontend

### NAMC-Specific Business Rules

1. **Member Management**: Only admin users can modify member data
2. **Event Registration**: Capacity limits and deadline enforcement
3. **Project Opportunities**: Geographic filtering for Northern California
4. **Audit Trails**: All administrative actions must be logged
5. **Professional Standards**: All content must maintain professional tone

## Technical Standards

### Required Tech Stack

- **Frontend**: Next.js 15.3.5, React 18.2.0, TypeScript 5.7.2
- **Styling**: Tailwind CSS 3.4.1 (utility-first, zero-runtime)
- **Backend**: Express.js with Node.js, PostgreSQL with Prisma 6.1.0
- **Authentication**: JWT with refresh tokens, bcrypt password hashing
- **State Management**: Zustand 4.5.0 for global state
- **Forms**: React Hook Form with Zod validation
- **Testing**: Jest and React Testing Library

### Code Quality Standards

- **File Length**: Maximum 500 lines per file
- **Organization**: Feature-based modules, not type-based
- **TypeScript**: Strict mode enabled, avoid `any` types
- **Testing**: Unit tests for all new features, accessibility testing required
- **Performance**: Code splitting, lazy loading, image optimization

## Examples Directory Guide

### Component Patterns
- `examples/components/MemberCard.tsx` - Role-based UI, accessibility patterns
- `examples/components/EventCard.tsx` - Complex business object display
- `examples/forms/MemberRegistration.tsx` - Form validation with Zod

### API Patterns
- `examples/api/events.ts` - Authentication, validation, audit trails
- `examples/api/auth.ts` - JWT authentication patterns
- `examples/api/members.ts` - CRUD operations with role checks

### Database Patterns
- `examples/database/event-operations.ts` - Prisma transactions, business logic
- `examples/database/user-operations.ts` - Audit trails, data integrity

### Hooks & Utilities
- `examples/hooks/useAuth.ts` - Authentication state management
- `examples/hooks/useEvents.ts` - Data fetching patterns

## Validation & Quality Assurance

### Pre-Implementation Checklist
```bash
# Always run these before starting development
npm run type-check              # TypeScript compilation
npm run lint                   # ESLint validation
npm test                       # Existing test suite
```

### During Development
- Follow existing component patterns
- Use TypeScript interfaces for all props
- Implement proper error handling
- Add loading states for async operations
- Ensure mobile responsiveness

### Post-Implementation Validation
```bash
# Comprehensive validation loop
npm run type-check             # No TypeScript errors
npm run lint                   # No linting warnings
npm test                       # All tests passing
npm run build                  # Production build successful
```

### Accessibility Testing
- Screen reader compatibility (NVDA/JAWS)
- Keyboard navigation testing
- Color contrast verification (4.5:1 minimum)
- Touch target size validation (44px minimum)

## Integration History

This context engineering system integrates best practices from the original context-engineering-intro repository while customizing everything for NAMC's specific needs:

### What Was Integrated
- **Code Structure Guidelines**: 500-line file limits, feature-based organization
- **Testing Standards**: Unit tests, edge cases, failure scenarios
- **AI Behavior Rules**: Validation loops, pattern preservation, context verification
- **Documentation Standards**: Clear commenting, README updates, API documentation

### NAMC-Specific Enhancements
- **Government Compliance**: Accessibility, security, audit requirements
- **Business Domain**: Member types, project categories, geographic focus
- **Technical Constraints**: Specific versions, framework patterns, performance standards
- **Quality Assurance**: NAMC-specific validation and testing requirements

## Quick Start for Developers

### New Feature Development
1. **Start with Template**: Copy `INITIAL.md` and fill in feature requirements
2. **Generate PRP**: Use `/generate-prp` command to create implementation guide
3. **Follow Patterns**: Reference `examples/` directory for established patterns
4. **Validate Continuously**: Run type checks, lints, and tests throughout development
5. **Test Accessibility**: Ensure WCAG 2.1 AA compliance before completion

### Working with Existing Code
1. **Read CLAUDE.md**: Understand all NAMC business rules and constraints
2. **Study Examples**: Review relevant patterns before making changes
3. **Preserve Patterns**: Don't create new approaches when existing ones work
4. **Test Thoroughly**: Verify both admin and member user experiences
5. **Document Changes**: Update relevant documentation and examples

## Common Gotchas

### NAMC-Specific Issues
- Don't skip authentication middleware on protected routes
- Remember audit logging for all admin actions
- Always test with both admin and member user types
- Ensure mobile touch targets are at least 44px
- Validate inputs on both client and server side

### Technical Issues
- Don't create files longer than 500 lines
- Don't ignore failing tests - fix the root cause
- Don't hardcode values that should be environment variables
- Don't skip role-based access control validation
- Don't forget to update documentation when adding features

## Support & Resources

### Internal Resources
- `CLAUDE.md` - Complete NAMC business rules and technical guidelines
- `examples/` - Comprehensive code patterns and implementations
- `PRPs/templates/` - Templates for creating implementation guides
- `SHADCN_INTEGRATION_GUIDE.md` - Complete guide for integrating shadcn/ui components

### UI Enhancement Options
- **shadcn/ui Integration**: Government-compliant, accessible React components
- **Accessibility Benefits**: WCAG 2.1 AA ready components built on Radix UI
- **Next.js Compatible**: Works seamlessly with existing NAMC tech stack
- **Component Ownership**: Full control over component code and customization

### External Documentation
- [Next.js App Router](https://nextjs.org/docs/app/building-your-application/routing)
- [Prisma ORM](https://www.prisma.io/docs/orm)
- [React Hook Form](https://react-hook-form.com/docs)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [shadcn/ui Documentation](https://ui.shadcn.com/docs)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

---

This context engineering system ensures consistent, high-quality development for the NAMC NorCal Member Portal while maintaining government contractor compliance standards and professional quality.