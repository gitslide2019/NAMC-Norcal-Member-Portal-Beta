# Development Guide

Comprehensive development guidelines for the NAMC NorCal Member Portal with HubSpot workflow integration.

## 📋 Overview

This guide covers development workflows, coding standards, testing practices, and best practices for contributing to the NAMC Portal project.

### Tech Stack Summary
- **Frontend**: Next.js 15.3.5, React 18.2.0, TypeScript 5.7.2, Tailwind CSS 3.4.1
- **Backend**: Express.js, Node.js, PostgreSQL 15, Prisma 6.1.0, Redis 7
- **Testing**: Jest, React Testing Library, Playwright
- **DevOps**: Docker, GitHub Actions, Prometheus/Grafana

## 🏗️ Development Environment Setup

### Prerequisites
```bash
# Verify required tools
node --version    # 18.0.0+
npm --version     # 8.0.0+
docker --version  # Latest stable
git --version     # Any recent version
```

### Quick Setup
```bash
# Clone and setup
git clone https://github.com/your-org/namc-portal.git
cd namc-portal
npm install

# Environment configuration
cp .env.example .env.local
# Edit .env.local with your settings

# Start services
docker-compose up -d postgres redis
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

## 🎯 Development Workflow

### Branch Strategy

#### Git Flow
```bash
# Main branches
main         # Production-ready code
develop      # Integration branch for features

# Feature branches
feature/hubspot-workflow-integration
feature/member-dashboard-redesign
feature/event-management-improvements

# Release branches
release/v1.2.0

# Hotfix branches
hotfix/urgent-security-fix
```

#### Branch Naming Convention
```bash
# Feature branches
feature/short-description
feature/hubspot-contact-sync
feature/event-registration-flow

# Bug fixes
fix/issue-description
fix/email-notification-bug
fix/database-connection-timeout

# Chores/maintenance
chore/update-dependencies
chore/improve-documentation
chore/refactor-api-client
```

### Commit Message Standards

#### Conventional Commits
```bash
# Format: type(scope): description

# Types
feat(auth): add JWT refresh token functionality
fix(events): resolve registration date validation
docs(api): update HubSpot integration examples
style(ui): improve button component accessibility
refactor(db): optimize member query performance
test(integration): add HubSpot webhook tests
chore(deps): update Next.js to v15.3.5

# Breaking changes
feat(api)!: update user authentication to OAuth 2.0

BREAKING CHANGE: authentication now requires OAuth 2.0
```

#### Commit Best Practices
```bash
# Good commits
git commit -m "feat(hubspot): implement contact synchronization"
git commit -m "fix(events): handle timezone conversion correctly"
git commit -m "test(api): add comprehensive auth endpoint tests"

# Avoid
git commit -m "fixes"
git commit -m "update stuff"
git commit -m "WIP"
```

### Pull Request Process

#### PR Template
```markdown
## Description
Brief description of changes and motivation.

## Changes Made
- [ ] Added HubSpot contact synchronization
- [ ] Updated member registration flow
- [ ] Added comprehensive tests

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Accessibility testing done

## HubSpot Integration Impact
- [ ] API changes documented
- [ ] Webhook endpoints tested
- [ ] Workflow triggers verified

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Tests added for new functionality
- [ ] Documentation updated
- [ ] No breaking changes without migration plan
```

#### Review Guidelines
1. **Code Quality**: Follow established patterns and conventions
2. **Testing**: Ensure adequate test coverage (>80%)
3. **Documentation**: Update relevant documentation
4. **Security**: Review for potential security issues
5. **Performance**: Consider impact on application performance
6. **HubSpot Integration**: Verify integration changes don't break workflows

## 📝 Coding Standards

### TypeScript Standards

#### Type Definitions
```typescript
// Use strict typing
interface Member {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  memberType: 'REGULAR' | 'admin';
  hubspotContactId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Use utility types
type CreateMemberRequest = Omit<Member, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateMemberRequest = Partial<Pick<Member, 'firstName' | 'lastName' | 'email'>>;

// Avoid 'any' type
// Bad
function processData(data: any): any {
  return data.something;
}

// Good
function processData<T extends { id: string }>(data: T): T {
  return data;
}
```

#### Error Handling
```typescript
// Use Result pattern for error handling
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};

async function fetchMember(id: string): Promise<Result<Member>> {
  try {
    const member = await prisma.member.findUnique({ where: { id } });
    if (!member) {
      return { success: false, error: new Error('Member not found') };
    }
    return { success: true, data: member };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}

// Usage
const memberResult = await fetchMember('123');
if (memberResult.success) {
  console.log(memberResult.data.email); // Type-safe access
} else {
  console.error(memberResult.error.message);
}
```

### React Component Standards

#### Component Structure
```typescript
// components/members/MemberCard.tsx
import { type FC } from 'react';
import { type Member } from '@/types/member';

interface MemberCardProps {
  member: Member;
  onEdit?: (member: Member) => void;
  onDelete?: (memberId: string) => void;
  className?: string;
}

export const MemberCard: FC<MemberCardProps> = ({
  member,
  onEdit,
  onDelete,
  className = ''
}) => {
  const handleEdit = () => {
    onEdit?.(member);
  };

  const handleDelete = () => {
    onDelete?.(member.id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold">
        {member.firstName} {member.lastName}
      </h3>
      <p className="text-gray-600">{member.email}</p>
      <div className="mt-4 flex gap-2">
        {onEdit && (
          <button
            onClick={handleEdit}
            className="btn btn-primary"
            aria-label={`Edit ${member.firstName} ${member.lastName}`}
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="btn btn-danger"
            aria-label={`Delete ${member.firstName} ${member.lastName}`}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
};
```

#### Hooks Pattern
```typescript
// hooks/useMembers.ts
import { useState, useEffect } from 'react';
import { type Member } from '@/types/member';
import { membersApi } from '@/lib/api/members';

interface UseMembersResult {
  members: Member[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useMembers(): UseMembersResult {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await membersApi.getAll();
      if (result.success) {
        setMembers(result.data);
      } else {
        setError(result.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  return {
    members,
    loading,
    error,
    refetch: fetchMembers
  };
}
```

### API Development Standards

#### API Route Structure
```typescript
// src/app/api/members/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { validateAuth } from '@/lib/auth/validate';
import { createApiResponse } from '@/lib/api/response';
import { membersService } from '@/lib/services/members';

const CreateMemberSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  company: z.string().optional(),
  phone: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const auth = await validateAuth(request);
    if (!auth.success) {
      return createApiResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await membersService.getMembers({
      page,
      limit,
      userId: auth.user.id,
      userRole: auth.user.memberType
    });

    return createApiResponse(result);
  } catch (error) {
    console.error('GET /api/members error:', error);
    return createApiResponse(
      { success: false, error: 'Internal server error' },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await validateAuth(request, ['admin']);
    if (!auth.success) {
      return createApiResponse({ success: false, error: 'Unauthorized' }, 401);
    }

    const body = await request.json();
    const validation = CreateMemberSchema.safeParse(body);
    if (!validation.success) {
      return createApiResponse({
        success: false,
        error: 'Validation failed',
        details: validation.error.errors
      }, 422);
    }

    const result = await membersService.createMember(validation.data);
    return createApiResponse(result, result.success ? 201 : 400);
  } catch (error) {
    console.error('POST /api/members error:', error);
    return createApiResponse(
      { success: false, error: 'Internal server error' },
      500
    );
  }
}
```

#### Service Layer Pattern
```typescript
// lib/services/members.ts
import { prisma } from '@/lib/database';
import { hubspotService } from '@/lib/hubspot/service';
import { type CreateMemberRequest, type Member } from '@/types/member';

export class MembersService {
  async createMember(data: CreateMemberRequest): Promise<Result<Member>> {
    try {
      // Create member in database
      const member = await prisma.member.create({
        data: {
          ...data,
          memberType: 'REGULAR',
        },
      });

      // Sync to HubSpot asynchronously
      this.syncMemberToHubSpot(member).catch(error => {
        console.error('HubSpot sync failed:', error);
      });

      return { success: true, data: member };
    } catch (error) {
      return { success: false, error: error as Error };
    }
  }

  private async syncMemberToHubSpot(member: Member): Promise<void> {
    try {
      const hubspotContact = await hubspotService.createContact({
        email: member.email,
        firstname: member.firstName,
        lastname: member.lastName,
        company: member.company,
        member_type: member.memberType,
        portal_member_id: member.id,
      });

      // Update member with HubSpot contact ID
      await prisma.member.update({
        where: { id: member.id },
        data: { hubspotContactId: hubspotContact.id },
      });

      // Enroll in onboarding workflow
      await hubspotService.enrollInWorkflow(
        hubspotContact.id,
        'member-onboarding-workflow'
      );
    } catch (error) {
      console.error('Failed to sync member to HubSpot:', error);
      throw error;
    }
  }
}

export const membersService = new MembersService();
```

### Database Standards

#### Prisma Schema Best Practices
```prisma
// prisma/schema.prisma
model Member {
  id        String   @id @default(cuid())
  email     String   @unique
  firstName String   @map("first_name")
  lastName  String   @map("last_name")
  company   String?
  phone     String?
  
  // HubSpot integration
  hubspotContactId String? @unique @map("hubspot_contact_id")
  
  // Audit fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  // Relationships
  sentMessages     Message[] @relation("SentMessages")
  receivedMessages Message[] @relation("ReceivedMessages")
  eventRegistrations EventRegistration[]
  
  @@map("members")
  @@index([email])
  @@index([hubspotContactId])
}

model Event {
  id                   String   @id @default(cuid())
  title                String
  description          String?
  startDate            DateTime @map("start_date")
  endDate              DateTime @map("end_date")
  location             String
  maxCapacity          Int      @map("max_capacity")
  category             String
  registrationDeadline DateTime @map("registration_deadline")
  
  // Audit fields
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  createdBy String   @map("created_by")
  
  // Relationships
  registrations EventRegistration[]
  creator       Member              @relation(fields: [createdBy], references: [id])
  
  @@map("events")
  @@index([startDate])
  @@index([category])
}
```

#### Database Queries
```typescript
// Optimized queries with proper relations
export async function getMemberWithEvents(memberId: string) {
  return prisma.member.findUnique({
    where: { id: memberId },
    include: {
      eventRegistrations: {
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDate: true,
              location: true,
            },
          },
        },
        orderBy: {
          event: {
            startDate: 'desc',
          },
        },
      },
    },
  });
}

// Paginated queries
export async function getMembers(options: {
  page: number;
  limit: number;
  search?: string;
}) {
  const { page, limit, search } = options;
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' as const } },
          { lastName: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { company: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.member.count({ where }),
  ]);

  return {
    members,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

## 🧪 Testing Standards

### Testing Strategy

#### Test Pyramid
```
                E2E Tests (10%)
               ├─ User workflows
               ├─ Integration scenarios
               └─ Cross-browser testing
               
            Integration Tests (20%)
           ├─ API endpoints
           ├─ Database operations
           ├─ HubSpot integration
           └─ External services
           
        Unit Tests (70%)
       ├─ Pure functions
       ├─ React components
       ├─ Business logic
       └─ Utilities
```

### Unit Testing

#### Component Testing
```typescript
// __tests__/components/MemberCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MemberCard } from '@/components/members/MemberCard';
import { type Member } from '@/types/member';

const mockMember: Member = {
  id: '1',
  email: 'john@example.com',
  firstName: 'John',
  lastName: 'Doe',
  memberType: 'REGULAR',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('MemberCard', () => {
  it('renders member information correctly', () => {
    render(<MemberCard member={mockMember} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEditMock = jest.fn();
    render(<MemberCard member={mockMember} onEdit={onEditMock} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit john doe/i }));
    expect(onEditMock).toHaveBeenCalledWith(mockMember);
  });

  it('has proper accessibility attributes', () => {
    render(<MemberCard member={mockMember} onEdit={() => {}} />);
    
    const editButton = screen.getByRole('button', { name: /edit john doe/i });
    expect(editButton).toHaveAttribute('aria-label', 'Edit John Doe');
  });
});
```

#### Service Testing
```typescript
// __tests__/services/members.test.ts
import { membersService } from '@/lib/services/members';
import { prismaMock } from '@/test-utils/prisma-mock';
import { hubspotServiceMock } from '@/test-utils/hubspot-mock';

jest.mock('@/lib/database', () => ({
  prisma: prismaMock,
}));

jest.mock('@/lib/hubspot/service', () => ({
  hubspotService: hubspotServiceMock,
}));

describe('MembersService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createMember', () => {
    const memberData = {
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      company: 'Test Company',
    };

    it('creates member successfully', async () => {
      const createdMember = {
        id: '1',
        ...memberData,
        memberType: 'REGULAR' as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaMock.member.create.mockResolvedValue(createdMember);
      hubspotServiceMock.createContact.mockResolvedValue({ id: 'hubspot_123' });

      const result = await membersService.createMember(memberData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdMember);
      expect(prismaMock.member.create).toHaveBeenCalledWith({
        data: {
          ...memberData,
          memberType: 'REGULAR',
        },
      });
    });

    it('handles database errors', async () => {
      const dbError = new Error('Database connection failed');
      prismaMock.member.create.mockRejectedValue(dbError);

      const result = await membersService.createMember(memberData);

      expect(result.success).toBe(false);
      expect(result.error).toBe(dbError);
    });
  });
});
```

### Integration Testing

#### API Testing
```typescript
// __tests__/api/members.integration.test.ts
import { testClient } from '@/test-utils/test-client';
import { createTestUser, createAuthToken } from '@/test-utils/auth';
import { cleanupDatabase } from '@/test-utils/database';

describe('/api/members', () => {
  let authToken: string;
  let adminToken: string;

  beforeAll(async () => {
    const user = await createTestUser({ memberType: 'REGULAR' });
    const admin = await createTestUser({ memberType: 'admin' });
    
    authToken = await createAuthToken(user);
    adminToken = await createAuthToken(admin);
  });

  afterAll(async () => {
    await cleanupDatabase();
  });

  describe('GET /api/members', () => {
    it('returns paginated members for authenticated user', async () => {
      const response = await testClient
        .get('/api/members')
        .set('Authorization', `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('members');
      expect(response.body.data).toHaveProperty('pagination');
    });

    it('requires authentication', async () => {
      const response = await testClient.get('/api/members');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/members', () => {
    it('creates new member with admin permissions', async () => {
      const memberData = {
        email: 'newmember@example.com',
        firstName: 'New',
        lastName: 'Member',
        company: 'Test Company',
      };

      const response = await testClient
        .post('/api/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(memberData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(memberData.email);
    });

    it('validates required fields', async () => {
      const response = await testClient
        .post('/api/members')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email: 'invalid-email' });

      expect(response.status).toBe(422);
      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });
  });
});
```

### E2E Testing

#### Playwright Tests
```typescript
// e2e/member-registration.e2e.spec.ts
import { test, expect } from '@playwright/test';
import { createTestMember, cleanupTestData } from './helpers/test-data';

test.describe('Member Registration Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test.afterEach(async () => {
    await cleanupTestData();
  });

  test('completes member registration successfully', async ({ page }) => {
    // Fill registration form
    await page.fill('[data-testid="email"]', 'newmember@example.com');
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="company"]', 'Doe Construction');
    await page.fill('[data-testid="phone"]', '+1-555-0123');
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.fill('[data-testid="confirmPassword"]', 'SecurePassword123!');

    // Submit form
    await page.click('[data-testid="submit"]');

    // Verify success
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    await expect(page).toHaveURL('/dashboard');

    // Verify member dashboard loads
    await expect(page.locator('h1')).toContainText('Welcome, John!');
  });

  test('validates email format', async ({ page }) => {
    await page.fill('[data-testid="email"]', 'invalid-email');
    await page.fill('[data-testid="firstName"]', 'John');
    await page.click('[data-testid="submit"]');

    await expect(page.locator('[data-testid="email-error"]'))
      .toContainText('Please enter a valid email address');
  });

  test('prevents duplicate email registration', async ({ page }) => {
    // Create existing member
    await createTestMember({ email: 'existing@example.com' });

    // Attempt to register with same email
    await page.fill('[data-testid="email"]', 'existing@example.com');
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.click('[data-testid="submit"]');

    await expect(page.locator('[data-testid="error-message"]'))
      .toContainText('Email address is already registered');
  });
});
```

## 🔄 HubSpot Integration Development

### Local Development Setup

#### HubSpot Test Account
```bash
# Environment setup for HubSpot testing
HUBSPOT_API_KEY="test-key-for-development"
HUBSPOT_CLIENT_ID="test-client-id"
HUBSPOT_CLIENT_SECRET="test-client-secret"
HUBSPOT_PORTAL_ID="test-portal-id"
HUBSPOT_WEBHOOK_SECRET="test-webhook-secret"

# Use HubSpot sandbox for testing
HUBSPOT_BASE_URL="https://api.hubspot.com"
HUBSPOT_ENVIRONMENT="sandbox"
```

#### Mock HubSpot Service
```typescript
// test-utils/hubspot-mock.ts
export const hubspotServiceMock = {
  createContact: jest.fn(),
  updateContact: jest.fn(),
  getContact: jest.fn(),
  enrollInWorkflow: jest.fn(),
  unenrollFromWorkflow: jest.fn(),
  getWorkflowEnrollments: jest.fn(),
};

// Use in tests
beforeEach(() => {
  hubspotServiceMock.createContact.mockResolvedValue({
    id: 'mock-contact-id',
    properties: {
      email: 'test@example.com',
      firstname: 'Test',
      lastname: 'User',
    },
  });
});
```

### Integration Testing

#### Webhook Testing
```typescript
// test-utils/webhook-testing.ts
import crypto from 'crypto';

export function generateHubSpotSignature(body: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
}

export function createWebhookPayload(type: string, data: any) {
  return [{
    eventId: `test-event-${Date.now()}`,
    subscriptionType: type,
    objectId: data.objectId || 'test-object-id',
    occurredAt: new Date().toISOString(),
    ...data,
  }];
}

// Usage in tests
const webhookPayload = createWebhookPayload('contact.creation', {
  objectId: 'contact-123',
  properties: {
    email: 'test@example.com',
    firstname: 'Test',
    lastname: 'User',
  },
});

const signature = generateHubSpotSignature(
  JSON.stringify(webhookPayload),
  process.env.HUBSPOT_WEBHOOK_SECRET!
);
```

## 🎨 UI/UX Development

### Design System

#### Component Library Structure
```
src/components/
├── ui/                     # Base UI components
│   ├── Button/
│   ├── Input/
│   ├── Modal/
│   └── ...
├── features/               # Feature-specific components
│   ├── auth/
│   ├── members/
│   ├── events/
│   └── hubspot/
└── layouts/               # Layout components
    ├── DashboardLayout/
    ├── AuthLayout/
    └── PublicLayout/
```

#### Tailwind CSS Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
        },
        secondary: {
          50: '#f9fafb',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

#### Accessibility Standards
```typescript
// Accessibility-first component development
export const Button: FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size]
      )}
      disabled={disabled || loading}
      aria-disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <LoadingSpinner className="w-4 h-4 mr-2" aria-hidden="true" />
      )}
      {children}
    </button>
  );
};
```

## 📊 Performance Guidelines

### Frontend Optimization

#### Code Splitting
```typescript
// Dynamic imports for route-level code splitting
import dynamic from 'next/dynamic';

const MemberDashboard = dynamic(() => import('./MemberDashboard'), {
  loading: () => <LoadingSpinner />,
  ssr: false,
});

const HubSpotIntegration = dynamic(() => import('./HubSpotIntegration'), {
  loading: () => <LoadingSpinner />,
});
```

#### Image Optimization
```typescript
// Use Next.js Image component
import Image from 'next/image';

export const MemberAvatar: FC<{ member: Member }> = ({ member }) => {
  return (
    <Image
      src={member.avatarUrl || '/default-avatar.png'}
      alt={`${member.firstName} ${member.lastName}`}
      width={48}
      height={48}
      className="rounded-full"
      priority={false}
      placeholder="blur"
      blurDataURL="data:image/jpeg;base64,..."
    />
  );
};
```

### Backend Optimization

#### Database Query Optimization
```typescript
// Use proper indexes and query optimization
export async function getEventWithRegistrations(eventId: string) {
  return prisma.event.findUnique({
    where: { id: eventId },
    include: {
      registrations: {
        include: {
          member: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
}

// Use pagination for large datasets
export async function getMembers(options: PaginationOptions) {
  const { page, limit } = options;
  const skip = (page - 1) * limit;

  return prisma.member.findMany({
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
      memberType: true,
      createdAt: true,
    },
  });
}
```

#### Caching Strategy
```typescript
// Redis caching for frequently accessed data
import { redis } from '@/lib/redis';

export async function getCachedMember(memberId: string): Promise<Member | null> {
  const cacheKey = `member:${memberId}`;
  
  // Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Fetch from database
  const member = await prisma.member.findUnique({
    where: { id: memberId },
  });
  
  if (member) {
    // Cache for 1 hour
    await redis.setex(cacheKey, 3600, JSON.stringify(member));
  }
  
  return member;
}
```

## 🔒 Security Guidelines

### Input Validation

#### Zod Schema Validation
```typescript
// schemas/member.ts
import { z } from 'zod';

export const CreateMemberSchema = z.object({
  email: z.string().email('Invalid email format'),
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in first name'),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in last name'),
  company: z.string().max(100, 'Company name too long').optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
           'Password must contain uppercase, lowercase, number, and special character'),
});

export type CreateMemberRequest = z.infer<typeof CreateMemberSchema>;
```

#### SQL Injection Prevention
```typescript
// Always use Prisma's type-safe queries
// Good - Prisma prevents SQL injection
const members = await prisma.member.findMany({
  where: {
    email: {
      contains: searchTerm, // Safe with Prisma
      mode: 'insensitive',
    },
  },
});

// Avoid raw queries, but if necessary, use parameterized queries
const result = await prisma.$queryRaw`
  SELECT * FROM members 
  WHERE email ILIKE ${`%${searchTerm}%`}
`;
```

### Authentication Security

#### JWT Implementation
```typescript
// lib/auth/jwt.ts
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const JWTPayloadSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  memberType: z.enum(['REGULAR', 'admin']),
  iat: z.number(),
  exp: z.number(),
});

export function generateToken(payload: {
  userId: string;
  email: string;
  memberType: 'REGULAR' | 'admin';
}): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'namc-portal',
    audience: 'namc-members',
  });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'namc-portal',
      audience: 'namc-members',
    });
    
    const validation = JWTPayloadSchema.safeParse(decoded);
    return validation.success ? validation.data : null;
  } catch {
    return null;
  }
}
```

## 📚 Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [HubSpot API Reference](https://developers.hubspot.com/docs/api/overview)

### Tools and Extensions
- **VS Code Extensions**:
  - TypeScript Importer
  - Prisma
  - Tailwind CSS IntelliSense
  - Jest Runner
  - ESLint
  - Prettier

### Community Resources
- [React TypeScript Patterns](https://react-typescript-cheatsheet.netlify.app/)
- [Next.js Examples](https://github.com/vercel/next.js/tree/canary/examples)
- [Prisma Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**Happy Coding!** 🚀  
Remember to follow the guidelines, write tests, and keep security in mind for all contributions to the NAMC Portal.