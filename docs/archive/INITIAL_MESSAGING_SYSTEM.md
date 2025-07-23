## FEATURE:

Build a secure direct messaging system for NAMC NorCal members to communicate with each other. The system should provide member-to-member messaging, message threads, read/unread status tracking, and basic moderation features for administrators. The messaging system must prioritize member privacy and security while providing a professional communication platform.

**Core Messaging Features:**
- Send direct messages between any two members
- Message thread organization with conversation history
- Real-time message delivery and read receipts
- Message search and filtering capabilities
- File attachment support (documents, images)
- Message status indicators (sent, delivered, read)
- Conversation archiving and deletion
- Member directory with search for finding message recipients

**Member Functionality:**
- Compose new messages to any member using member directory
- Reply to received messages within conversation threads
- Search message history by content, sender, or date
- Attach files to messages with size and type restrictions
- Mark conversations as important or archive old conversations
- Block/unblock other members (prevent unwanted messages)
- Message notification preferences (email, in-app, none)

**Admin Functionality:**
- View message activity dashboard and statistics
- Moderate reported messages or inappropriate content
- Send broadcast announcements to all members (separate from direct messages)
- Access member messaging activity for compliance purposes
- Manage blocked users and message restrictions
- Export message data for legal or compliance requirements

**Technical Requirements:**
- Next.js pages for message inbox, compose, and thread views
- Real-time messaging using WebSockets or Server-Sent Events
- Prisma database with proper message indexing for search performance
- File upload system with security validation and storage
- Push notification system for new messages
- Message encryption for sensitive communications
- Responsive design optimized for mobile messaging

## EXAMPLES:

**Component Patterns to Follow:**
- `examples/components/MemberCard.tsx` - Adapt for message recipient selection in member directory and conversation headers
- `examples/components/AccessControlWrapper.tsx` - For admin moderation features and message reporting functionality
- `examples/components/AnnouncementBanner.tsx` - Adapt for message status notifications and system announcements
- `examples/forms/MemberRegistration.tsx` - Use form validation patterns for message composition and file attachment forms

**State Management and Real-time:**
- `examples/hooks/useAuth.ts` - Authentication state, messaging permissions, user context for conversations
- `examples/hooks/useMembers.ts` - Member directory search, recipient selection, contact information access
- Create `useMessages.ts` hook following similar patterns for message state, conversation management, and real-time updates

**API Integration:**
- `examples/api/auth.ts` - JWT authentication for protected messaging endpoints and real-time connection authorization
- `examples/api/members.ts` - Member directory search, recipient validation, contact access permissions
- Create `examples/api/messages.ts` following similar patterns for conversation management, message sending, and moderation

**Database Operations:**
- `examples/database/user-operations.ts` - User lookup for messaging, contact permissions, and member directory access
- Create `examples/database/message-operations.ts` following similar transaction patterns for conversation management and message storage

**Form and Input Handling:**
- `examples/forms/MemberRegistration.tsx` - Follow validation patterns (React Hook Form + Zod) for message composition and file attachments
- Implement similar error handling, loading states, and accessibility features for messaging forms

## DOCUMENTATION:

**Next.js Real-time Features:**
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- https://socket.io/docs/v4/server-api/

**WebSocket Integration:**
- https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- https://socket.io/docs/v4/client-api/
- https://github.com/socketio/socket.io

**Prisma Full-text Search:**
- https://www.prisma.io/docs/concepts/components/prisma-client/full-text-search
- https://www.prisma.io/docs/concepts/components/prisma-client/filtering-and-sorting
- https://www.prisma.io/docs/concepts/components/prisma-client/pagination

**File Upload Security:**
- https://owasp.org/www-community/vulnerabilities/Unrestricted_File_Upload
- https://developer.mozilla.org/en-US/docs/Web/API/File
- https://nextjs.org/docs/app/api-reference/file-conventions/route#request-body

**Message Encryption:**
- https://nodejs.org/api/crypto.html
- https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto
- https://libsodium.gitbook.io/doc/

**Push Notifications:**
- https://developer.mozilla.org/en-US/docs/Web/API/Push_API
- https://web.dev/push-notifications-overview/
- https://firebase.google.com/docs/cloud-messaging

## OTHER CONSIDERATIONS:

**NAMC-Specific Business Rules:**
- **Member-to-Member Access**: All verified members can message any other member; no premium or tiered messaging restrictions
- **Professional Standards**: Messages must be business-related and professional; personal solicitation and spam prohibited
- **Admin Moderation**: Administrators can view reported messages and conversation metadata but cannot read private messages without member reporting
- **Message Reporting**: Members can report inappropriate messages; reported content flagged for admin review within 24 hours
- **Content Restrictions**: No external links without context, no file attachments over 10MB, no executable files (.exe, .bat, .sh)
- **Retention Policy**: Messages retained for 2 years for business continuity; deleted messages removed from system after 30-day recovery period
- **Privacy Controls**: Members can hide their contact information from directory but cannot disable messaging entirely
- **Business Hours**: No automated restrictions on messaging hours; members control their own notification preferences

**Privacy and Security Requirements:**
- Messages should be encrypted in transit and at rest
- Member contact information is private - only display names and professional details
- No tracking of message read times without explicit user consent
- Members control their own notification preferences
- Option to delete message history with proper data removal
- Compliance with data protection regulations (GDPR, CCPA)

**Message Threading and Organization:**
- Conversations are organized by participants (two-person threads only)
- No group messaging to maintain simplicity and privacy
- Message threads display most recent messages first
- Clear visual indication of unread messages
- Conversation search within specific threads
- Export conversation history in standard formats

**File Attachment Security:**
- File type restrictions (documents, images only - no executables)
- File size limits (10MB per attachment, configurable)
- Virus scanning for all uploaded files
- Secure file storage with access controls
- File retention policy aligned with message retention
- Preview capabilities for images and common document types

**Real-time Features:**
- Instant message delivery using WebSockets
- Online/offline status indicators for members
- Typing indicators when composing messages
- Real-time read receipts (optional, user-controlled)
- Push notifications for new messages (web and mobile)
- Automatic reconnection handling for network interruptions

**Performance Considerations:**
- Pagination for message history to handle large conversation threads
- Database indexing for fast message search and retrieval
- Message caching for frequently accessed conversations
- File upload progress indicators and resumable uploads
- Optimistic UI updates for immediate feedback
- Lazy loading of older messages and attachments

**Moderation and Compliance:**
- **Content Filtering**: Basic profanity filter and spam detection; no automatic message blocking (professional environment assumed)
- **Reporting System**: One-click reporting with categories: spam, inappropriate content, harassment, off-topic business
- **Admin Dashboard**: View reported messages, conversation context, member history; action options include warning, temporary restriction, account review
- **Audit Trail**: Log all moderation actions with admin user, timestamp, action taken, and justification notes
- **Professional Standards**: Three-strike system: warning → 7-day messaging restriction → admin review for account status
- **Data Retention**: Export conversation data in CSV format for legal/compliance requests; 30-day advance notice for data deletion
- **Member Appeals**: Allow members to appeal moderation decisions through admin contact form with 5-day response guarantee

**Mobile Optimization:**
- Touch-friendly message interface with appropriate spacing
- Swipe gestures for common actions (mark as read, delete)
- Optimized keyboard handling for message composition
- File attachment from mobile camera or gallery
- Push notification support for mobile browsers
- Offline message composition with sync when online

**Accessibility Features:**
- Keyboard navigation for all messaging functions
- Screen reader support with proper message announcements
- High contrast mode for message text and interface
- Font scaling support for message content
- Alternative text for image attachments
- Focus management for conversation switching

**Error Handling Scenarios:**
- Network failures during message sending
- File upload failures with retry mechanisms
- WebSocket connection drops and reconnection
- Message delivery failures and retry logic
- Invalid recipient selection
- Attachment size or type violations
- Database connection issues during high load

**Search and Discovery:**
- Full-text search across all message content
- Search by sender, recipient, date range
- Filter by conversation, attachment type, read status
- Member directory search for finding message recipients
- Recent conversation quick access
- Bookmark important conversations

**Notification System:**
- In-app notifications for new messages
- Email notifications with customizable frequency
- Browser push notifications (with permission)
- Notification preferences per conversation
- Do not disturb mode for focused work
- Summary emails for multiple unread messages

**Data Management:**
- Message retention policies with automatic cleanup
- User-controlled message deletion and archiving
- Bulk actions for message management
- Data export for user account portability
- Conversation backup and restore capabilities
- GDPR compliance with right to be forgotten

**Future Enhancement Considerations:**
- Voice message support for mobile users
- Video call integration for direct member communication
- Message translation for international members
- Advanced search with natural language processing
- Message templates for common professional communications
- Integration with calendar for meeting scheduling
- Message analytics for admin insights
- API access for third-party integrations