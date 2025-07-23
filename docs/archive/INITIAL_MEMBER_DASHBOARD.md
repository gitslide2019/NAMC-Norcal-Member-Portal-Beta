## FEATURE:

Build a comprehensive member dashboard for the NAMC NorCal member portal that provides members with an overview of their account, recent activity, upcoming events, and quick access to key features. The dashboard should be responsive, accessible (WCAG 2.1 AA compliant), and provide different views for regular members vs administrators.

**Core Functionality:**
- Member profile summary with company information and membership status
- Upcoming events section with registration status and quick actions
- Recent messages/announcements with read/unread indicators
- Quick stats (events attended, messages sent, resources accessed)
- Quick action buttons for common tasks (register for events, send message, upload resource)
- Admin-specific section for management actions (if admin user)

**Technical Requirements:**
- Next.js page component with App Router
- Server-side data fetching for initial page load
- Client-side state management for real-time updates
- TypeScript interfaces for all data structures
- Responsive design using Tailwind CSS
- Proper error handling and loading states
- Accessibility features (keyboard navigation, screen reader support)

## EXAMPLES:

**Component Patterns to Follow:**
- `examples/components/MemberCard.tsx` - Use as pattern for member profile display section with role-based actions
- `examples/components/EventCard.tsx` - Use for upcoming events section, create simplified "EventSummaryCard" variant showing title, date, registration status
- `examples/components/AnnouncementBanner.tsx` - For displaying recent admin announcements with priority levels and dismissible functionality
- `examples/components/AccessControlWrapper.tsx` - For admin-only sections like member management and analytics

**State Management and Data Fetching:**
- `examples/hooks/useAuth.ts` - Authentication state, user context, role-based permissions
- `examples/hooks/useEvents.ts` - Event data fetching, registration status, upcoming events filtering
- `examples/hooks/useMembers.ts` - Member profile data, activity statistics, directory access

**Form Patterns:**
- `examples/forms/MemberRegistration.tsx` - Follow validation, error handling, and accessibility patterns for any dashboard forms

**API Integration:**
- `examples/api/auth.ts` - JWT authentication, token refresh, role-based access control
- `examples/api/members.ts` - Member profile data, update profile, member directory access
- `examples/api/events.ts` - Event listing, registration status, upcoming events for dashboard

**Database Operations:**
- `examples/database/user-operations.ts` - User profile fetching, activity statistics, audit trail queries
- `examples/database/event-operations.ts` - Upcoming events, user registrations, event capacity tracking

## DOCUMENTATION:

**Next.js App Router:**
- https://nextjs.org/docs/app/building-your-application/routing/pages-and-layouts
- https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions

**React Patterns:**
- https://react.dev/learn/managing-state
- https://react.dev/learn/passing-data-deeply-with-context

**Tailwind CSS:**
- https://tailwindcss.com/docs/responsive-design
- https://tailwindcss.com/docs/grid-template-columns
- https://tailwindcss.com/docs/flexbox-grid

**Accessibility:**
- https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/
- https://www.w3.org/WAI/ARIA/apg/patterns/button/

**Prisma Database:**
- https://www.prisma.io/docs/concepts/components/prisma-client/select-fields
- https://www.prisma.io/docs/concepts/components/prisma-client/relation-queries

## OTHER CONSIDERATIONS:

**NAMC-Specific Business Rules:**
- **Member Profile Section**: Display member type (REGULAR/admin), company information, membership start date, and contact details
- **Quick Stats Widget**: Show events attended (last 12 months), messages sent/received (last 30 days), resources accessed
- **Upcoming Events**: Maximum 3 upcoming events, show registration status, capacity (X/Y registered), registration deadline
- **Recent Announcements**: Show last 2 admin announcements with priority indicators, dismissible functionality
- **Admin Dashboard Section** (admin only): Quick access to create events, send announcements, view member metrics, recent member registrations
- **Activity Feed**: Show user's own activities only (event registrations, profile updates, message activity) - never other members' private actions
- **Quick Actions**: Register for events, send messages, edit profile, upload resources (based on permissions)
- **Audit Trail**: All admin actions from dashboard (member creation, event creation, announcements) must be logged with timestamps and user details

**Performance Considerations:**
- **Initial Page Load**: Use Next.js server-side rendering for user profile and static content (target < 1.5s LCP)
- **Dashboard Widgets**: Implement skeleton loading states for async widgets (events, announcements, activity feed)
- **Data Caching**: Cache user profile data for 5 minutes, event data for 2 minutes, announcements for 10 minutes
- **Progressive Loading**: Load critical widgets first (profile, quick stats), then secondary content (activity feed, announcements)
- **Image Optimization**: Use Next.js Image component for member avatars and event images
- **Activity Feed**: Implement pagination (10 items per page) with "Load More" functionality
- **Real-time Updates**: Consider Server-Sent Events for new announcements and event registration updates

**Security Requirements:**
- All dashboard data must be filtered by user role and permissions
- Admin sections should be completely hidden from regular members
- API calls should include proper authentication headers
- Sensitive member information should not be exposed in frontend state
- Implement rate limiting for dashboard API endpoints

**Accessibility Gotchas:**
- Ensure dashboard cards have proper heading hierarchy (h1, h2, h3)
- Include skip links for keyboard navigation to main content areas
- Use proper ARIA labels for interactive dashboard widgets
- Ensure color contrast meets WCAG AA standards for all text and buttons
- Test with screen readers to ensure logical reading order
- Implement focus management for any modal dialogs or popups

**Mobile Considerations:**
- Dashboard cards should stack vertically on mobile devices
- Touch targets should be at least 44px for mobile interaction
- Consider progressive disclosure on mobile (show summary, expand for details)
- Test with various mobile devices and orientations
- Ensure horizontal scrolling is avoided

**Error Handling:**
- Graceful fallbacks when data fails to load (show cached data or default state)
- Clear error messages that help users understand what went wrong
- Retry mechanisms for failed API calls
- Offline state handling if implementing service worker
- Network error detection and user notification

**Real-time Features (Future Enhancement):**
- Consider WebSocket or Server-Sent Events for real-time notifications
- Live updates for new messages or announcements
- Real-time event registration status updates
- Activity feed updates without page refresh