## FEATURE:

Build a comprehensive event management system for NAMC NorCal administrators to create, edit, manage, and track events. The system should include event creation forms, registration management, capacity tracking, and member communication features. Regular members should be able to view events, register/unregister, and see their registration status.

**Admin Functionality:**
- Create new events with all required details (title, description, date, location, capacity, registration deadline)
- Edit existing events with change tracking and notification system
- View event registrations with member details and export capabilities
- Manage event capacity and waitlist functionality
- Send targeted communications to registered members
- Event analytics and reporting dashboard
- Bulk event actions (cancel, postpone, duplicate)

**Member Functionality:**
- Browse upcoming and past events with filtering and search
- Register for events with form validation and confirmation
- Unregister from events (within allowed timeframe)
- View registration status and receive event updates
- Add events to personal calendar (iCal integration)
- Receive email notifications for event changes

**Technical Requirements:**
- Next.js pages for event listing, details, and admin management
- React Hook Form with Zod validation for event creation/editing
- Prisma database operations with proper transaction handling
- File upload support for event images and attachments
- Email notification system for event updates
- Calendar integration (iCal export)
- Responsive design with accessibility compliance

## EXAMPLES:

**Component Patterns to Follow:**
- `examples/components/EventCard.tsx` - Primary pattern for event display with registration functionality, capacity tracking, and date formatting
- `examples/components/MemberCard.tsx` - Adapt for displaying registered member lists in admin event management view
- `examples/components/AccessControlWrapper.tsx` - For admin-only event creation, editing, and member management sections
- `examples/components/AnnouncementBanner.tsx` - For event update notifications and registration confirmations

**Form Handling:**
- `examples/forms/MemberRegistration.tsx` - Use validation patterns (React Hook Form + Zod) for event creation/editing forms
- Implement similar error handling, loading states, and accessibility features for event forms
- Follow responsive design patterns for mobile event management

**API Integration:**
- `examples/api/auth.ts` - JWT authentication, role-based access control for admin event management
- `examples/api/events.ts` - Complete event CRUD operations, registration management, capacity tracking
- `examples/api/members.ts` - Member data for registration lists and event notifications

**Database Operations:**
- `examples/database/event-operations.ts` - Comprehensive event management including creation, updates, registration handling, and statistics
- `examples/database/user-operations.ts` - User activity tracking for event participation and audit trails

**State Management:**
- `examples/hooks/useAuth.ts` - Authentication state, admin permissions for event management
- `examples/hooks/useEvents.ts` - Complete event data management, registration status, filtering and pagination
- `examples/hooks/useMembers.ts` - Member directory for event registration and notification features

## DOCUMENTATION:

**Next.js Features:**
- https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes
- https://nextjs.org/docs/app/api-reference/file-conventions/page
- https://nextjs.org/docs/app/building-your-application/optimizing/images

**React Hook Form:**
- https://react-hook-form.com/docs/useform
- https://react-hook-form.com/docs/useformcontext
- https://react-hook-form.com/docs/usecontroller

**Zod Validation:**
- https://zod.dev/?id=objects
- https://zod.dev/?id=dates
- https://zod.dev/?id=arrays

**Prisma Database:**
- https://www.prisma.io/docs/concepts/components/prisma-client/transactions
- https://www.prisma.io/docs/concepts/components/prisma-client/aggregation-grouping-summarizing
- https://www.prisma.io/docs/concepts/components/prisma-client/pagination

**File Upload Handling:**
- https://nextjs.org/docs/app/api-reference/file-conventions/route#request-body
- https://developer.mozilla.org/en-US/docs/Web/API/FormData

**Email Integration:**
- https://nodemailer.com/about/
- https://docs.sendgrid.com/for-developers/sending-email/api-getting-started

## OTHER CONSIDERATIONS:

**NAMC-Specific Business Rules:**
- **Event Creation**: Only administrators can create events; require title, date, location, capacity (1-500), optional registration deadline
- **Registration Process**: Members register on first-come, first-served basis; no payment processing (events are member-benefit)
- **Capacity Management**: Hard capacity limits; when full, show "Event Full" with optional waitlist functionality
- **Registration Deadlines**: Default to 24 hours before event; cannot be set after event date; admin can override for emergency situations
- **Event Types**: Support networking events, educational workshops, member meetings, and business seminars
- **Notification System**: Email notifications for event creation, registration confirmation, event changes, and 24-hour reminders
- **Cancellation Policy**: Members can unregister up to 24 hours before event; admin can unregister members at any time
- **Audit Requirements**: Log all event creation, updates, deletions, and bulk member actions with admin user and timestamp
- **Event Visibility**: All events visible to all members; no private or invitation-only events in initial system

**Event Registration Workflow:**
1. **Event Discovery**: Member browses upcoming events, filtered by date/type, sees capacity and registration status
2. **Registration Check**: System validates member is logged in, event not full, deadline not passed, not already registered
3. **Registration Process**: Single-click registration (no forms/payment), immediate confirmation message displayed
4. **Confirmation**: Automated email sent with event details, calendar .ics file, and unregistration link
5. **Admin Notification**: Daily digest of new registrations sent to event administrators (not individual notifications)
6. **Capacity Tracking**: Real-time updates to event capacity display, automatic "Event Full" status when capacity reached
7. **Reminder System**: Automated 24-hour email reminder with event details, location, and contact information

**Capacity Management:**
- Hard capacity limits cannot be exceeded without admin override
- Waitlist functionality for events at capacity
- Automatic promotion from waitlist when spots become available
- Different capacity for members vs non-members (if applicable)
- VIP or priority registration for certain member types

**Email Notification System:**
- Event creation confirmation for admins
- Registration confirmation for members
- Event reminder emails (24-48 hours before)
- Event cancellation or major change notifications
- Waitlist status updates
- Custom announcements from event organizers

**Data Export and Reporting:**
- Export registration lists as CSV/Excel for external use
- Event analytics (registration trends, popular events, attendance rates)
- Member engagement metrics (events attended, registration patterns)
- Financial reporting for paid events (future enhancement)
- Automated reports for administrators

**File Upload and Media:**
- Event images for better visual presentation
- Document attachments (agendas, presentations, resources)
- File size limits and type validation
- Image optimization and resizing
- Secure file storage with access controls
- CDN integration for fast media delivery

**Calendar Integration:**
- iCal export for individual events
- Bulk calendar export for all registered events
- Integration with popular calendar applications
- Time zone handling and conversion
- Recurring event support (future enhancement)

**Performance Optimization:**
- Pagination for event lists to handle large numbers of events
- Search and filtering with database indexes
- Caching for frequently accessed event data
- Image lazy loading and optimization
- API rate limiting to prevent abuse

**Security Considerations:**
- Input validation for all event data (XSS prevention)
- File upload security (virus scanning, type validation)
- Access control for event management functions
- API authentication for all event operations
- Audit trails for all administrative actions
- GDPR compliance for member data handling

**Accessibility Requirements:**
- Keyboard navigation for all interactive elements
- Screen reader support with proper ARIA labels
- High contrast mode support
- Font scaling compatibility
- Alternative text for all images
- Form validation announcements
- Focus management for modal dialogs

**Error Handling Scenarios:**
- Network failures during registration
- Concurrent registration attempts (race conditions)
- File upload failures
- Email delivery failures
- Database connection issues
- Invalid event data submissions
- Permission denied scenarios
- Event capacity race conditions

**Future Enhancement Considerations:**
- Payment processing integration for paid events
- Social sharing features for events
- Event feedback and rating system
- Advanced event search and filtering
- Event series and recurring events
- Integration with external calendar services
- Mobile app notifications
- QR code check-in system for events