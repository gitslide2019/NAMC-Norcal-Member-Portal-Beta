# HubSpot Integration Guide

Complete guide for implementing and managing HubSpot workflow integration in the NAMC NorCal Member Portal.

## 📋 Overview

The HubSpot integration provides automated workflow management, contact synchronization, and member engagement tracking between the NAMC portal and HubSpot CRM.

### Key Features
- **Automated Member Onboarding**: New member registration triggers HubSpot workflows
- **Contact Synchronization**: Bi-directional sync between portal and HubSpot
- **Event Tracking**: Automatic enrollment in event-based workflows
- **Lead Management**: Prospect conversion and nurturing workflows
- **Analytics Integration**: Portal activity data flows to HubSpot reporting

## 🏗️ Architecture

### Integration Components
```
NAMC Portal ↔ HubSpot Integration Layer ↔ HubSpot CRM
     ↓              ↓                        ↓
- Member Data   - API Client             - Contacts
- Events        - Webhook Handler        - Workflows
- Activities    - State Management       - Properties
- Analytics     - Error Handling         - Reports
```

### Data Flow
1. **Portal → HubSpot**: Member actions trigger API calls to HubSpot
2. **HubSpot → Portal**: Webhook notifications update portal state
3. **Synchronization**: Periodic sync ensures data consistency
4. **Analytics**: Activity data aggregated for reporting

## 🔧 Setup and Configuration

### 1. HubSpot App Registration

#### Create HubSpot Private App
1. Navigate to HubSpot Settings → Integrations → Private Apps
2. Create new private app:
   - **Name**: "NAMC NorCal Portal Integration"
   - **Description**: "Member portal workflow automation"

#### Configure Scopes
Required scopes for the integration:
```
- crm.objects.contacts.read
- crm.objects.contacts.write
- crm.objects.companies.read
- crm.objects.companies.write
- automation (workflows)
- timeline
- oauth
- webhooks
```

#### OAuth App Setup (Optional)
For user-specific access:
1. Create OAuth app in HubSpot Developer Portal
2. Configure redirect URL: `https://portal.namcnorcal.org/api/hubspot/callback`
3. Set required scopes and review permissions

### 2. Environment Configuration

Add to your environment variables:
```env
# HubSpot API Configuration
HUBSPOT_API_KEY="pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
HUBSPOT_CLIENT_ID="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
HUBSPOT_CLIENT_SECRET="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
HUBSPOT_PORTAL_ID="12345678"

# Webhook Configuration
HUBSPOT_WEBHOOK_SECRET="your-webhook-secret-key"
HUBSPOT_REDIRECT_URI="https://portal.namcnorcal.org/api/hubspot/callback"

# Integration Settings
HUBSPOT_SYNC_ENABLED="true"
HUBSPOT_BATCH_SIZE="100"
HUBSPOT_RATE_LIMIT_DELAY="100"
```

### 3. Webhook Configuration

#### Portal Webhook Endpoints
The portal provides these webhook endpoints:

**Contact Events**: `/api/webhooks/hubspot/contact`
- Contact creation, updates, deletion
- Property changes and lifecycle stage updates

**Workflow Events**: `/api/webhooks/hubspot/workflow`
- Workflow enrollment and completion
- Step completion and goal achievements

**Company Events**: `/api/webhooks/hubspot/company`
- Company creation and updates
- Association changes

#### HubSpot Webhook Setup
1. Go to HubSpot Settings → Integrations → Webhooks
2. Create webhook for each endpoint:
   ```
   Target URL: https://portal.namcnorcal.org/api/webhooks/hubspot/contact
   Events: contact.creation, contact.propertyChange, contact.deletion
   ```
3. Add webhook secret for security validation

## 🚀 Core Integration Features

### 1. Member Onboarding Workflow

#### Automatic Contact Creation
When a new member registers in the portal:

```typescript
// Triggered on member registration
const hubspotContact = await createHubSpotContact({
  email: member.email,
  firstname: member.firstName,
  lastname: member.lastName,
  company: member.company,
  phone: member.phone,
  member_type: member.memberType,
  registration_date: member.createdAt,
  portal_member_id: member.id
});

// Enroll in onboarding workflow
await enrollInWorkflow(hubspotContact.id, 'member-onboarding-workflow');
```

#### Onboarding Workflow Steps
1. **Welcome Email**: Sent immediately after registration
2. **Profile Completion**: Reminder to complete member profile
3. **Resource Access**: Introduction to member resources
4. **First Event**: Invitation to upcoming events
5. **Survey**: Member needs assessment survey

### 2. Event Management Integration

#### Event Registration Tracking
```typescript
// When member registers for event
await updateHubSpotContact(member.hubspotContactId, {
  last_event_registration: event.title,
  last_registration_date: new Date().toISOString(),
  total_events_registered: member.eventsRegistered.length
});

// Enroll in event-specific workflow
await enrollInWorkflow(member.hubspotContactId, `event-${event.type}-workflow`);
```

#### Event Workflows
- **Pre-Event**: Reminders and preparation materials
- **During Event**: Live updates and engagement tracking
- **Post-Event**: Follow-up surveys and next steps

### 3. Member Engagement Tracking

#### Activity Scoring
The integration tracks member engagement through:
```typescript
const engagementScore = calculateEngagementScore({
  loginFrequency: member.loginCount,
  eventParticipation: member.eventsAttended.length,
  messageActivity: member.messagesSent.length,
  resourceDownloads: member.resourceDownloads.length,
  profileCompleteness: calculateProfileCompleteness(member)
});

await updateHubSpotContact(member.hubspotContactId, {
  engagement_score: engagementScore,
  last_portal_activity: member.lastLoginAt,
  member_status: determineMemberStatus(engagementScore)
});
```

#### Engagement Workflows
- **High Engagement**: Recognition and leadership opportunities
- **Medium Engagement**: Targeted content and event invitations
- **Low Engagement**: Re-engagement campaigns and surveys

## 📡 API Integration

### 1. HubSpot API Client

#### Client Configuration
```typescript
// src/lib/hubspot/client.ts
import { Client } from '@hubspot/api-client';

export const hubspotClient = new Client({
  accessToken: process.env.HUBSPOT_API_KEY,
  developerApiKey: process.env.HUBSPOT_API_KEY,
  basePath: 'https://api.hubapi.com'
});

// Rate limiting configuration
const rateLimiter = new RateLimiter({
  requests: 100,
  interval: 10000, // 10 seconds
  burst: 10
});
```

#### Core API Functions
```typescript
// Contact management
export async function createContact(contactData: ContactInput): Promise<Contact>;
export async function updateContact(contactId: string, updates: Partial<ContactInput>): Promise<Contact>;
export async function getContact(contactId: string): Promise<Contact>;
export async function searchContacts(query: SearchQuery): Promise<Contact[]>;

// Workflow management
export async function enrollInWorkflow(contactId: string, workflowId: string): Promise<void>;
export async function unenrollFromWorkflow(contactId: string, workflowId: string): Promise<void>;
export async function getWorkflowEnrollments(contactId: string): Promise<WorkflowEnrollment[]>;

// Company management
export async function createCompany(companyData: CompanyInput): Promise<Company>;
export async function associateContactWithCompany(contactId: string, companyId: string): Promise<void>;
```

### 2. Webhook Handlers

#### Contact Webhook Handler
```typescript
// src/app/api/webhooks/hubspot/contact/route.ts
export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-hubspot-signature');
  const body = await request.text();
  
  // Verify webhook signature
  if (!verifyHubSpotSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }
  
  const events = JSON.parse(body);
  
  for (const event of events) {
    switch (event.subscriptionType) {
      case 'contact.propertyChange':
        await handleContactPropertyChange(event);
        break;
      case 'contact.creation':
        await handleContactCreation(event);
        break;
      case 'contact.deletion':
        await handleContactDeletion(event);
        break;
    }
  }
  
  return NextResponse.json({ status: 'success' });
}
```

### 3. Data Synchronization

#### Bi-directional Sync Strategy
```typescript
// Sync from Portal to HubSpot
export async function syncMemberToHubSpot(member: Member): Promise<void> {
  const contactData = mapMemberToHubSpotContact(member);
  
  if (member.hubspotContactId) {
    await updateContact(member.hubspotContactId, contactData);
  } else {
    const contact = await createContact(contactData);
    await updateMember(member.id, { hubspotContactId: contact.id });
  }
}

// Sync from HubSpot to Portal
export async function syncHubSpotToMember(contactId: string): Promise<void> {
  const contact = await getContact(contactId);
  const memberData = mapHubSpotContactToMember(contact);
  
  const member = await getMemberByHubSpotId(contactId);
  if (member) {
    await updateMember(member.id, memberData);
  }
}
```

## 🔄 Workflow Templates

### 1. Member Onboarding Workflow

#### Workflow Configuration
```yaml
name: "Member Onboarding - NAMC NorCal"
trigger: "Contact creation with member_type property"
enrollment_criteria:
  - member_type: "REGULAR"
  - registration_source: "portal"

steps:
  - name: "Welcome Email"
    type: "email"
    delay: "0 minutes"
    template: "member-welcome"
    
  - name: "Profile Completion Reminder"
    type: "email"
    delay: "3 days"
    condition: "profile_completeness < 80%"
    template: "complete-profile"
    
  - name: "Resource Introduction"
    type: "email"
    delay: "1 week"
    template: "member-resources"
    
  - name: "First Event Invitation"
    type: "email"
    delay: "2 weeks"
    condition: "total_events_registered = 0"
    template: "first-event-invitation"
    
  - name: "30-Day Survey"
    type: "email"
    delay: "30 days"
    template: "member-survey"
```

### 2. Event Engagement Workflow

#### Pre-Event Sequence
```yaml
name: "Event Engagement - Pre-Event"
trigger: "Event registration"

steps:
  - name: "Registration Confirmation"
    type: "email"
    delay: "immediate"
    template: "event-confirmation"
    
  - name: "Pre-Event Resources"
    type: "email"
    delay: "1 week before event"
    template: "event-resources"
    
  - name: "Final Reminder"
    type: "email"
    delay: "1 day before event"
    template: "event-reminder"
```

#### Post-Event Follow-up
```yaml
name: "Event Engagement - Post-Event"
trigger: "Event attendance marked"

steps:
  - name: "Thank You & Resources"
    type: "email"
    delay: "1 day after event"
    template: "event-thankyou"
    
  - name: "Event Survey"
    type: "email"
    delay: "3 days after event"
    template: "event-survey"
    
  - name: "Next Event Recommendation"
    type: "email"
    delay: "1 week after event"
    template: "next-event"
```

## 📊 Analytics and Reporting

### 1. Member Engagement Analytics

#### Key Metrics Tracked
```typescript
interface MemberEngagementMetrics {
  totalMembers: number;
  activeMembers: number;
  newMembersThisMonth: number;
  averageEngagementScore: number;
  eventParticipationRate: number;
  messageActivityLevel: number;
  resourceUtilization: number;
  workflowCompletionRates: {
    onboarding: number;
    eventEngagement: number;
    reEngagement: number;
  };
}
```

#### HubSpot Dashboard Integration
```typescript
export async function syncAnalyticsToHubSpot(): Promise<void> {
  const metrics = await calculateMemberEngagementMetrics();
  
  // Update custom properties for reporting
  await updatePortalMetrics({
    total_portal_members: metrics.totalMembers,
    active_members_count: metrics.activeMembers,
    avg_engagement_score: metrics.averageEngagementScore,
    event_participation_rate: metrics.eventParticipationRate,
    last_sync_date: new Date().toISOString()
  });
}
```

### 2. Workflow Performance Tracking

#### Workflow Analytics
```typescript
interface WorkflowPerformance {
  workflowId: string;
  workflowName: string;
  totalEnrollments: number;
  completedEnrollments: number;
  completionRate: number;
  averageTimeToComplete: number;
  stepPerformance: Array<{
    stepName: string;
    completionRate: number;
    clickThroughRate: number;
    responseRate: number;
  }>;
}
```

## 🔒 Security and Best Practices

### 1. Security Implementation

#### API Key Management
```typescript
// Secure API key storage and rotation
export class HubSpotSecurityManager {
  private static apiKey = process.env.HUBSPOT_API_KEY;
  
  static validateApiKey(): boolean {
    return this.apiKey && this.apiKey.startsWith('pat-');
  }
  
  static getSecureHeaders(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': 'NAMC-Portal/1.0'
    };
  }
}
```

#### Webhook Security
```typescript
export function verifyHubSpotSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', process.env.HUBSPOT_WEBHOOK_SECRET!)
    .update(body)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}
```

### 2. Rate Limiting and Error Handling

#### Rate Limiting Strategy
```typescript
export class HubSpotRateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static readonly RATE_LIMIT = 100; // requests per 10 seconds
  private static readonly WINDOW = 10000; // 10 seconds
  
  static async checkRateLimit(endpoint: string): Promise<boolean> {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.WINDOW);
    
    if (validRequests.length >= this.RATE_LIMIT) {
      return false; // Rate limit exceeded
    }
    
    validRequests.push(now);
    this.requests.set(endpoint, validRequests);
    return true;
  }
}
```

#### Error Handling
```typescript
export async function safeHubSpotApiCall<T>(
  operation: () => Promise<T>,
  retries: number = 3
): Promise<T | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      if (error instanceof HubSpotApiError) {
        if (error.status === 429) { // Rate limited
          await delay(1000 * attempt); // Exponential backoff
          continue;
        }
        if (error.status >= 500) { // Server error
          await delay(1000 * attempt);
          continue;
        }
      }
      
      if (attempt === retries) {
        console.error('HubSpot API call failed after retries:', error);
        return null;
      }
    }
  }
  return null;
}
```

## 🧪 Testing

### 1. Integration Testing

#### Test Configuration
```typescript
// tests/hubspot/integration.test.ts
describe('HubSpot Integration', () => {
  beforeAll(async () => {
    // Setup test HubSpot portal
    await setupTestPortal();
  });
  
  describe('Contact Management', () => {
    it('should create contact when member registers', async () => {
      const member = await createTestMember();
      const contact = await getHubSpotContact(member.email);
      
      expect(contact).toBeDefined();
      expect(contact.properties.email).toBe(member.email);
    });
    
    it('should sync contact updates bi-directionally', async () => {
      // Test implementation
    });
  });
  
  describe('Workflow Automation', () => {
    it('should enroll new members in onboarding workflow', async () => {
      // Test implementation
    });
  });
});
```

### 2. Webhook Testing

#### Webhook Test Suite
```typescript
// tests/hubspot/webhooks.test.ts
describe('HubSpot Webhooks', () => {
  it('should handle contact property changes', async () => {
    const webhookPayload = {
      subscriptionType: 'contact.propertyChange',
      eventId: 'test-event-id',
      objectId: 'test-contact-id',
      propertyName: 'email',
      propertyValue: 'newemail@example.com'
    };
    
    const response = await POST(new Request('http://localhost:3000/api/webhooks/hubspot/contact', {
      method: 'POST',
      body: JSON.stringify([webhookPayload]),
      headers: {
        'x-hubspot-signature': generateTestSignature(JSON.stringify([webhookPayload]))
      }
    }));
    
    expect(response.status).toBe(200);
  });
});
```

## 📚 Additional Resources

### Documentation Links
- [HubSpot API Documentation](https://developers.hubspot.com/docs/api/overview)
- [Workflow API Guide](https://developers.hubspot.com/docs/api/automation/workflows)
- [Webhook Documentation](https://developers.hubspot.com/docs/api/webhooks)

### Code Examples
- [Example Workflows](./examples/workflows/)
- [Integration Patterns](./examples/integration-patterns/)
- [Testing Utilities](./examples/testing/)

### Troubleshooting
- [Common Issues](./troubleshooting.md)
- [Error Codes](./error-codes.md)
- [Performance Optimization](./performance.md)

---

**Next Steps**: Review the [API Documentation](../api/README.md) and explore [Workflow Examples](./examples/) to implement custom integration features.