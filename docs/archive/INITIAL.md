# NAMC NorCal Member Portal - Feature Specification Template

This template helps you create comprehensive feature specifications for the NAMC NorCal member portal. Follow this structure to ensure AI coding assistants have all the context needed for successful implementation.

## FEATURE:

**[Provide a clear, specific description of what needs to be built for the NAMC member portal]**

Include:
- **Purpose**: What business problem this solves for NAMC members or administrators
- **User Types**: Which member types (REGULAR members, administrators) will use this feature
- **Core Functionality**: Specific features and capabilities required
- **Business Rules**: NAMC-specific rules and constraints that must be followed
- **Integration Points**: How this connects with existing member portal features

**Example Feature Description:**
```
Build a member directory search system that allows NAMC members to find and connect with other members based on business type, location, and expertise. The system should respect privacy settings, provide professional networking capabilities, and include admin moderation features.

**Core Functionality:**
- Search members by company, business type, location, expertise
- View member profiles with contact information (privacy-controlled)
- Send connection requests and direct messages
- Admin oversight of member interactions and reported issues

**Business Rules:**
- Only verified NAMC members can access the directory
- Members control their profile visibility and contact information
- Business information is public, personal contact details require permission
- All admin actions must be logged for audit compliance
```

## EXAMPLES:

**[Reference specific example components and patterns from the `examples/` directory]**

Always include:
- **Component Patterns**: Which React components to use as templates
- **Form Patterns**: For user input and validation
- **API Patterns**: For backend integration
- **Database Patterns**: For data operations
- **Hook Patterns**: For state management and side effects

**Available NAMC Example Components:**

### React Components
- `examples/components/MemberCard.tsx` - Member profile display with role-based actions
- `examples/components/EventCard.tsx` - Event display with registration functionality
- `examples/forms/MemberRegistration.tsx` - Complex form with validation and accessibility

### API Integration
- `examples/api/auth.ts` - JWT authentication and security patterns
- Follow these patterns for user authentication and role-based access control

### Database Operations
- `examples/database/user-operations.ts` - Comprehensive CRUD operations with audit trails
- Use transaction patterns for multi-step operations
- Follow audit trail patterns for admin actions

### Custom Hooks (Create if needed)
- `examples/hooks/useAuth.ts` - Authentication state management
- `examples/hooks/useMembers.ts` - Member data operations
- `examples/hooks/useEvents.ts` - Event data management

## DOCUMENTATION:

**Required Reading (List documentation that will be referenced):**
- `CLAUDE.md` - NAMC business rules and technical conventions
- Next.js App Router documentation for routing patterns
- Prisma schema documentation for database operations
- React Hook Form + Zod validation patterns
- Tailwind CSS responsive design utilities
- WCAG 2.1 AA accessibility guidelines

**Example Usage:**
```
**Component Patterns to Follow:**
- `examples/components/MemberCard.tsx` - Use as base for member profile display
- `examples/forms/MemberRegistration.tsx` - Follow form validation and error handling patterns

**API Integration:**
- `examples/api/auth.ts` - Follow authentication patterns for protected routes
- Create new API endpoints following the consistent response format

**Database Operations:**
- `examples/database/user-operations.ts` - Use transaction patterns for data integrity
- Follow audit trail patterns for administrative actions
```

**Validation Checklist:**
- [ ] TypeScript compiles without errors: `npm run type-check`
- [ ] No linting issues: `npm run lint`
- [ ] Tests pass: `npm test`
- [ ] Accessibility requirements met
- [ ] Mobile responsiveness verified
- [ ] Admin and member access properly controlled


### Required Framework Documentation
- **Next.js App Router**: https://nextjs.org/docs/app/building-your-application/routing
- **React Patterns**: https://react.dev/learn
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Prisma ORM**: https://www.prisma.io/docs
- **React Hook Form**: https://react-hook-form.com/docs
- **Zod Validation**: https://zod.dev

### NAMC-Specific Requirements
- **Accessibility Standards**: https://www.w3.org/WAI/WCAG21/quickref/ (WCAG 2.1 AA required)
- **Government Contractor Compliance**: Include any specific regulatory requirements
- **NAMC Business Processes**: Document any existing member management processes

### Security & Privacy
- **OWASP Security Guidelines**: https://owasp.org/www-project-web-security-testing-guide/
- **Data Protection**: Include any privacy policy or data handling requirements

**Example Documentation Section:**
```
### Framework-Specific Documentation
- **Next.js Dynamic Routes**: https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- **Prisma Relations**: https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries
- **React Hook Form Validation**: https://react-hook-form.com/docs/useform/handlesubmit

### NAMC Business Requirements
- **Member Privacy Policy**: [Link to actual policy document]
- **Event Management Procedures**: [Link to current process documentation]
- **Audit Trail Requirements**: [Link to compliance documentation]
```

## OTHER CONSIDERATIONS:

**Context Engineering Best Practices:**
- Follow validation loops: Type check → Lint → Test → Manual verification
- Never assume missing context - ask questions about NAMC business rules
- Mirror established component and API patterns  
- Preserve existing functionality when adding new features
- Never ignore failing tests - fix the root cause
- Don't hardcode values that should be environment variables

### NAMC Business Rules (Always Apply)
- **Member Types**: Only `REGULAR` and `admin` member types exist
- **Access Control**: Role-based permissions must be enforced on frontend and backend
- **Audit Trail**: All administrative actions must be logged with details
- **Privacy**: Member contact information requires explicit permission to access
- **Professional Standards**: All communications and content must maintain professional standards

### Technical Requirements (Non-Negotiable)
- **Accessibility**: WCAG 2.1 AA compliance is mandatory for government contractor status
- **Security**: Input validation on both frontend (Zod) and backend (express-validator)
- **Mobile-First**: Responsive design with touch targets minimum 44px
- **Performance**: Page load times under 3 seconds, Lighthouse score > 90
- **Browser Support**: Modern browsers (last 2 versions of Chrome, Firefox, Safari, Edge)

### Database Patterns (Always Follow)
- **Transactions**: Use Prisma transactions for multi-table operations
- **Audit Trail**: Create AdminAction records for all administrative changes
- **Soft Deletes**: Consider if data should be archived rather than deleted
- **Indexing**: Plan database indexes for search and performance

### Security Considerations (Critical)
- **Authentication**: JWT tokens with 7-day expiration
- **File Uploads**: Virus scanning, type validation, size limits
- **API Rate Limiting**: 100 requests per 15 minutes per user
- **Input Sanitization**: XSS prevention on all user inputs
- **CORS**: Properly configured for production domains

### Common Pitfalls to Avoid
- **Hardcoded Values**: Use environment variables for all configuration
- **Missing Error Handling**: Implement graceful error states and user feedback
- **Accessibility Oversight**: Test with keyboard navigation and screen readers
- **Mobile UX Issues**: Test on actual mobile devices, not just browser dev tools
- **Performance Bottlenecks**: Optimize images, implement proper caching
- **Security Gaps**: Never trust client-side validation alone

### Development Workflow Requirements
- **Code Quality**: TypeScript strict mode, ESLint compliance, Prettier formatting
- **Testing**: Unit tests for components, API tests for endpoints
- **Documentation**: Update README and API documentation
- **Deployment**: Ensure environment variables and build process work

**Example Considerations Section:**
```
### NAMC-Specific Business Rules
- Members can only message other verified members
- Event registration requires active membership status
- File uploads limited to 10MB and specific types (PDF, DOC, JPG, PNG)
- Admin actions must include reason/justification for audit trail

### Technical Gotchas
- Prisma enum values must match TypeScript types exactly
- Next.js App Router requires specific file naming conventions
- Tailwind CSS classes must be complete strings (not dynamically generated)
- React Hook Form validation runs on every input change in "onChange" mode

### Performance Considerations
- Member directory search should be debounced (500ms)
- Event lists should be paginated (20 items per page)
- Images should use Next.js Image component for optimization
- Database queries should use proper indexing for search fields
```

---

## Quick Start Checklist

Before creating your INITIAL specification:

- [ ] **Read CLAUDE.md** - Understand project conventions and requirements
- [ ] **Review examples/** - Check what patterns already exist
- [ ] **Identify integrations** - How does this connect to existing features?
- [ ] **Define user types** - Who will use this feature and how?
- [ ] **Consider mobile UX** - How will this work on mobile devices?
- [ ] **Plan accessibility** - How will screen readers and keyboard users interact?
- [ ] **Think about errors** - What can go wrong and how to handle it gracefully?

## Template Usage

1. **Copy this template** to create `INITIAL_[FEATURE_NAME].md`
2. **Fill in each section** with specific requirements for your feature
3. **Reference existing examples** where patterns can be reused
4. **Include all necessary documentation** links
5. **Consider NAMC business rules** and compliance requirements
6. **Review with stakeholders** before proceeding to implementation

This template ensures comprehensive specifications that enable successful AI-assisted development of NAMC member portal features.