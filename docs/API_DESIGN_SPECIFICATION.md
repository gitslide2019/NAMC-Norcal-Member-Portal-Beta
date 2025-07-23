# NAMC Portal API Design Specification

## 📋 Overview

This document provides comprehensive API design specifications for the NAMC NorCal Member Portal, including endpoint definitions, data schemas, authentication patterns, and integration flows.

## 🔧 API Standards

### Base Configuration
- **Base URL**: `https://api.namc-norcal.org/api/v1`
- **Protocol**: HTTPS only (TLS 1.3)
- **Content Type**: `application/json`
- **Authentication**: Bearer JWT tokens
- **Rate Limiting**: 100 requests per minute per IP
- **Versioning**: URL path versioning (`/api/v1`, `/api/v2`)

### Response Standards

**Success Response Format:**
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2024-07-23T10:30:00Z",
    "requestId": "req_1234567890",
    "version": "1.0.0"
  }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2024-07-23T10:30:00Z",
    "requestId": "req_1234567890"
  }
}
```

**Paginated Response Format:**
```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  },
  "meta": {
    "timestamp": "2024-07-23T10:30:00Z",
    "requestId": "req_1234567890"
  }
}
```

## 🔐 Authentication API

### POST /api/auth/login
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "rememberMe": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_1234567890abcdef",
    "expiresIn": 604800,
    "user": {
      "id": "user_123",
      "email": "john.doe@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "memberType": "REGULAR",
      "isVerified": true,
      "profileImage": "https://cdn.namc.org/avatars/user_123.jpg"
    }
  },
  "message": "Login successful"
}
```

### POST /api/auth/register
Register new user account.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "securePassword123",
  "phone": "+1-555-123-4567",
  "company": "ABC Construction Inc.",
  "title": "Project Manager",
  "agreeToTerms": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_124",
    "email": "john.doe@example.com",
    "verificationRequired": true
  },
  "message": "Registration successful. Please check your email to verify your account."
}
```

### POST /api/auth/refresh
Refresh expired JWT token.

**Request:**
```json
{
  "refreshToken": "rt_1234567890abcdef"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 604800
  },
  "message": "Token refreshed successfully"
}
```

### POST /api/auth/logout
Invalidate current session.

**Request:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

## 👥 Users API

### GET /api/users/me
Get current user profile.

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "company": "ABC Construction Inc.",
    "title": "Project Manager",
    "phone": "+1-555-123-4567",
    "address": {
      "street": "123 Main St",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94102"
    },
    "memberType": "REGULAR",
    "memberSince": "2023-01-15T00:00:00Z",
    "isActive": true,
    "isVerified": true,
    "profileImage": "https://cdn.namc.org/avatars/user_123.jpg",
    "bio": "Experienced project manager specializing in commercial construction.",
    "website": "https://abcconstruction.com",
    "linkedin": "https://linkedin.com/in/johndoe",
    "skills": ["Project Management", "Construction", "Safety Management"],
    "certifications": [
      {
        "name": "PMP Certification",
        "issuer": "PMI",
        "issueDate": "2022-03-01",
        "expiryDate": "2025-03-01"
      }
    ],
    "notificationPreferences": {
      "email": true,
      "sms": false,
      "push": true
    }
  }
}
```

### PUT /api/users/me
Update current user profile.

**Request:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1-555-123-4567",
  "company": "ABC Construction Inc.",
  "title": "Senior Project Manager",
  "bio": "Experienced project manager with 15+ years in commercial construction.",
  "website": "https://abcconstruction.com",
  "skills": ["Project Management", "Construction", "Safety Management", "LEED Certification"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "firstName": "John",
    "lastName": "Doe",
    "updatedAt": "2024-07-23T10:30:00Z"
  },
  "message": "Profile updated successfully"
}
```

### GET /api/users/directory
Get member directory with search and filtering.

**Query Parameters:**
- `search` (string): Search query for name, company, or skills
- `location` (string): Filter by city or state
- `skills` (string[]): Filter by skills (comma-separated)
- `memberType` (string): Filter by member type
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)

**Example Request:**
```
GET /api/users/directory?search=construction&location=San Francisco&page=1&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "company": "ABC Construction Inc.",
      "title": "Project Manager",
      "city": "San Francisco",
      "state": "CA",
      "profileImage": "https://cdn.namc.org/avatars/user_123.jpg",
      "skills": ["Project Management", "Construction"],
      "memberSince": "2023-01-15T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🏗️ Projects API

### GET /api/projects
Get projects with filtering and search.

**Query Parameters:**
- `search` (string): Full-text search query
- `category` (string): Project category filter
- `status` (string): Project status filter
- `budgetMin` (number): Minimum budget filter
- `budgetMax` (number): Maximum budget filter
- `location` (string): Location filter
- `skills` (string[]): Required skills filter
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sortBy` (string): Sort field (default: 'createdAt')
- `sortOrder` (string): Sort order ('asc' or 'desc', default: 'desc')

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "proj_123",
      "title": "Downtown Office Complex Renovation",
      "description": "Complete renovation of 50,000 sq ft office complex...",
      "category": "COMMERCIAL",
      "status": "BIDDING_OPEN",
      "budgetMin": 500000,
      "budgetMax": 750000,
      "location": "San Francisco, CA",
      "coordinates": {
        "lat": 37.7749,
        "lng": -122.4194
      },
      "startDate": "2024-09-01T00:00:00Z",
      "endDate": "2024-12-31T00:00:00Z",
      "deadlineDate": "2024-08-15T23:59:59Z",
      "skillsRequired": ["Commercial Construction", "Project Management"],
      "bondingRequired": true,
      "applicationCount": 12,
      "maxApplications": 20,
      "createdBy": {
        "id": "user_456",
        "firstName": "Jane",
        "lastName": "Smith",
        "company": "City Development Corp"
      },
      "createdAt": "2024-07-15T10:00:00Z",
      "updatedAt": "2024-07-20T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 89,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### GET /api/projects/{id}
Get specific project details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj_123",
    "title": "Downtown Office Complex Renovation",
    "description": "Complete renovation of 50,000 sq ft office complex including HVAC upgrades, electrical modernization, and interior design updates. LEED Gold certification required.",
    "category": "COMMERCIAL",
    "subcategory": "Office Buildings",
    "status": "BIDDING_OPEN",
    "priority": "HIGH",
    "visibility": "MEMBERS_ONLY",
    "budgetMin": 500000,
    "budgetMax": 750000,
    "estimatedValue": 625000,
    "fundingSource": "Private Investment",
    "location": "San Francisco, CA",
    "address": {
      "street": "123 Market Street",
      "city": "San Francisco",
      "state": "CA",
      "zipCode": "94105"
    },
    "coordinates": {
      "lat": 37.7749,
      "lng": -122.4194
    },
    "startDate": "2024-09-01T00:00:00Z",
    "endDate": "2024-12-31T00:00:00Z",
    "deadlineDate": "2024-08-15T23:59:59Z",
    "estimatedDuration": 122,
    "requirements": [
      "Valid contractor license in California",
      "Minimum 5 years commercial construction experience",
      "OSHA 30-hour certification",
      "LEED accreditation preferred"
    ],
    "skillsRequired": ["Commercial Construction", "HVAC", "Electrical", "Project Management"],
    "certificationsRequired": [
      {
        "name": "California Contractor License",
        "type": "REQUIRED",
        "classes": ["B", "C10", "C20"]
      }
    ],
    "experienceRequired": 5,
    "bondingRequired": true,
    "insuranceRequired": {
      "generalLiability": 2000000,
      "workersCompensation": true,
      "professionalLiability": 1000000
    },
    "contactName": "Jane Smith",
    "contactEmail": "jane.smith@citydev.com",
    "contactPhone": "+1-555-987-6543",
    "organization": "City Development Corp",
    "applicationCount": 12,
    "maxApplications": 20,
    "files": [
      {
        "id": "file_123",
        "fileName": "architectural_plans.pdf",
        "fileType": "application/pdf",
        "fileSize": 5242880,
        "downloadUrl": "https://cdn.namc.org/files/proj_123/architectural_plans.pdf"
      }
    ],
    "createdBy": {
      "id": "user_456",
      "firstName": "Jane",
      "lastName": "Smith",
      "company": "City Development Corp",
      "email": "jane.smith@citydev.com"
    },
    "createdAt": "2024-07-15T10:00:00Z",
    "updatedAt": "2024-07-20T14:30:00Z"
  }
}
```

### POST /api/projects
Create new project (Admin only).

**Request:**
```json
{
  "title": "New Commercial Building Construction",
  "description": "Ground-up construction of 30,000 sq ft commercial building...",
  "category": "COMMERCIAL",
  "budgetMin": 800000,
  "budgetMax": 1200000,
  "location": "Oakland, CA",
  "startDate": "2024-10-01T00:00:00Z",
  "endDate": "2025-06-30T00:00:00Z",
  "deadlineDate": "2024-09-15T23:59:59Z",
  "skillsRequired": ["Commercial Construction", "Project Management"],
  "bondingRequired": true,
  "maxApplications": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "proj_124",
    "title": "New Commercial Building Construction",
    "status": "DRAFT",
    "createdAt": "2024-07-23T10:30:00Z"
  },
  "message": "Project created successfully"
}
```

### POST /api/projects/{id}/apply
Apply to a project.

**Request:**
```json
{
  "coverLetter": "Dear Hiring Team, I am submitting my application for this exciting project...",
  "proposal": "Detailed project proposal including timeline, approach, and team composition...",
  "bidAmount": 575000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationId": "app_123",
    "projectId": "proj_123",
    "status": "PENDING",
    "submittedAt": "2024-07-23T10:30:00Z"
  },
  "message": "Application submitted successfully"
}
```

### GET /api/projects/{id}/applications
Get project applications (Project owner/Admin only).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "app_123",
      "projectId": "proj_123",
      "status": "PENDING",
      "bidAmount": 575000,
      "submittedAt": "2024-07-23T10:30:00Z",
      "applicant": {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe",
        "company": "ABC Construction Inc.",
        "profileImage": "https://cdn.namc.org/avatars/user_123.jpg"
      }
    }
  ]
}
```

## 📅 Events API

### GET /api/events
Get events with filtering.

**Query Parameters:**
- `type` (string): Event type filter
- `status` (string): Event status filter
- `startDate` (string): Filter events after date (ISO format)
- `endDate` (string): Filter events before date (ISO format)
- `location` (string): Location filter
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "evt_123",
      "title": "Monthly Member Networking Event",
      "description": "Join fellow NAMC members for networking and business development...",
      "type": "NETWORKING",
      "status": "REGISTRATION_OPEN",
      "startDate": "2024-08-15T18:00:00Z",
      "endDate": "2024-08-15T21:00:00Z",
      "registrationDeadline": "2024-08-13T23:59:59Z",
      "location": "San Francisco Convention Center",
      "address": {
        "street": "747 Howard Street",
        "city": "San Francisco",
        "state": "CA",
        "zipCode": "94103"
      },
      "isVirtual": false,
      "price": 25.00,
      "memberPrice": 15.00,
      "maxCapacity": 150,
      "currentCapacity": 78,
      "speakers": [
        {
          "name": "Dr. Maria Rodriguez",
          "title": "Construction Industry Expert",
          "bio": "Leading expert in sustainable construction practices..."
        }
      ],
      "agenda": [
        {
          "time": "18:00",
          "title": "Registration & Welcome Reception",
          "duration": 30
        },
        {
          "time": "18:30",
          "title": "Keynote: Future of Construction",
          "speaker": "Dr. Maria Rodriguez",
          "duration": 45
        }
      ],
      "createdBy": {
        "id": "user_789",
        "firstName": "Admin",
        "lastName": "User"
      },
      "createdAt": "2024-07-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 24,
    "totalPages": 2,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### POST /api/events/{id}/register
Register for an event.

**Request:**
```json
{
  "notes": "Looking forward to the networking opportunities",
  "dietaryRestrictions": "Vegetarian",
  "accessibilityNeeds": "None"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "registrationId": "reg_123",
    "eventId": "evt_123",
    "status": "REGISTERED",
    "amount": 15.00,
    "registeredAt": "2024-07-23T10:30:00Z"
  },
  "message": "Event registration successful"
}
```

## 💬 Messages API

### GET /api/messages/conversations
Get user's message conversations.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_123",
      "participant": {
        "id": "user_456",
        "firstName": "Jane",
        "lastName": "Smith",
        "company": "Smith Construction",
        "profileImage": "https://cdn.namc.org/avatars/user_456.jpg"
      },
      "lastMessage": {
        "id": "msg_789",
        "content": "Thanks for the project information!",
        "sentAt": "2024-07-23T09:15:00Z",
        "senderId": "user_456"
      },
      "unreadCount": 2,
      "updatedAt": "2024-07-23T09:15:00Z"
    }
  ]
}
```

### GET /api/messages/conversations/{userId}
Get messages in conversation with specific user.

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "msg_789",
      "senderId": "user_456",
      "receiverId": "user_123",
      "subject": "Project Collaboration Opportunity",
      "content": "Hi John, I saw your profile and think we might have some collaboration opportunities...",
      "status": "READ",
      "sentAt": "2024-07-23T09:15:00Z",
      "readAt": "2024-07-23T09:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 15,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

### POST /api/messages/send
Send a message to another user.

**Request:**
```json
{
  "receiverId": "user_456",
  "subject": "Partnership Opportunity",
  "content": "Hi Jane, I'd like to discuss a potential partnership on the downtown project..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "messageId": "msg_790",
    "receiverId": "user_456",
    "sentAt": "2024-07-23T10:30:00Z",
    "status": "SENT"
  },
  "message": "Message sent successfully"
}
```

## 📊 Admin API

### GET /api/admin/analytics/dashboard
Get admin dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "summary": {
      "totalMembers": 1247,
      "activeMembers": 892,
      "newMembersThisMonth": 23,
      "totalProjects": 156,
      "activeProjects": 45,
      "totalEvents": 38,
      "upcomingEvents": 12
    },
    "memberGrowth": [
      {
        "month": "2024-01",
        "newMembers": 18,
        "totalMembers": 1156
      },
      {
        "month": "2024-02",
        "newMembers": 22,
        "totalMembers": 1178
      }
    ],
    "projectMetrics": {
      "totalValue": 45678900,
      "averageApplicationsPerProject": 8.5,
      "successRate": 0.73
    },
    "eventMetrics": {
      "averageAttendance": 67,
      "totalRegistrations": 2547,
      "attendanceRate": 0.82
    }
  }
}
```

### GET /api/admin/users
Get all users with admin filters.

**Query Parameters:**
- `search` (string): Search query
- `memberType` (string): Filter by member type
- `status` (string): Filter by status
- `registrationDate` (string): Filter by registration date range
- `page` (number): Page number
- `limit` (number): Items per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "company": "ABC Construction Inc.",
      "memberType": "REGULAR",
      "isActive": true,
      "isVerified": true,
      "memberSince": "2023-01-15T00:00:00Z",
      "lastLogin": "2024-07-22T14:30:00Z",
      "projectApplications": 5,
      "eventRegistrations": 12
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1247,
    "totalPages": 25,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🔔 Webhooks API

### POST /api/webhooks/stripe
Handle Stripe webhook events.

**Request Headers:**
```
Stripe-Signature: t=1690123456,v1=abc123def456...
```

**Request Body:**
```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 2500,
      "currency": "usd",
      "metadata": {
        "userId": "user_123",
        "eventId": "evt_456"
      }
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## 📡 Real-time API (WebSockets/SSE)

### WebSocket Connection
```
WSS /api/ws?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Message Types:**
```json
{
  "type": "NEW_MESSAGE",
  "data": {
    "messageId": "msg_123",
    "senderId": "user_456",
    "content": "Hello!",
    "sentAt": "2024-07-23T10:30:00Z"
  }
}

{
  "type": "PROJECT_UPDATE",
  "data": {
    "projectId": "proj_123",
    "status": "BIDDING_CLOSED",
    "updatedAt": "2024-07-23T10:30:00Z"
  }
}

{
  "type": "EVENT_REMINDER",
  "data": {
    "eventId": "evt_123",
    "title": "Monthly Networking Event",
    "startDate": "2024-08-15T18:00:00Z"
  }
}
```

## 🔍 Search API

### GET /api/search
Global search across multiple entities.

**Query Parameters:**
- `q` (string): Search query (required)
- `type` (string[]): Entity types to search (users, projects, events)
- `limit` (number): Results per type (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_123",
        "firstName": "John",
        "lastName": "Doe",
        "company": "ABC Construction",
        "type": "user",
        "relevanceScore": 0.95
      }
    ],
    "projects": [
      {
        "id": "proj_123",
        "title": "Downtown Office Complex",
        "category": "COMMERCIAL",
        "type": "project",
        "relevanceScore": 0.87
      }
    ],
    "events": [
      {
        "id": "evt_123",
        "title": "Construction Industry Conference",
        "startDate": "2024-08-15T18:00:00Z",
        "type": "event",
        "relevanceScore": 0.73
      }
    ]
  },
  "meta": {
    "totalResults": 47,
    "searchTime": 0.12
  }
}
```

## 📈 Data Flow Diagrams

### Authentication Flow
```
┌─────────┐    POST /auth/login    ┌─────────────┐    Validate    ┌──────────┐
│ Client  │ ──────────────────────→│ API Server  │──────────────→ │ Database │
└─────────┘                        └─────────────┘                └──────────┘
     │                                     │                            │
     │            JWT Token                │         User Data          │
     │←────────────────────────────────────│←───────────────────────────│
     │                                     │                            │
     │    Subsequent Requests              │                            │
     │    (Authorization: Bearer token)    │                            │
     │────────────────────────────────────→│                            │
```

### Project Application Flow
```
┌─────────┐  POST /projects/{id}/apply  ┌─────────────┐   Insert    ┌──────────┐
│ Member  │ ─────────────────────────→ │ API Server  │───────────→ │ Database │
└─────────┘                            └─────────────┘             └──────────┘
     │                                        │                          │
     │        Application Created             │      Update Count        │
     │←───────────────────────────────────────│←─────────────────────────│
     │                                        │                          │
     │                                        │  Send Notification       │
     │                                        │─────────────────→ ┌──────────┐
     │        Email Notification              │                   │   Email  │
     │←───────────────────────────────────────│←──────────────────│ Service  │
     │                                        │                   └──────────┘
```

### Real-time Message Flow
```
┌───────────┐   POST /messages/send   ┌─────────────┐   Store    ┌──────────┐
│ Sender    │ ─────────────────────→ │ API Server  │──────────→ │ Database │
└───────────┘                        └─────────────┘            └──────────┘
                                             │                         │
                                             │   Message Stored        │
                                             │←────────────────────────│
                                             │                         
                                             │  WebSocket Push         
                                             │─────────────────→ ┌───────────┐
                                             │                   │ Receiver  │
                                             │                   └───────────┘
```

## 🔧 Error Handling

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `422` - Unprocessable Entity (business logic errors)
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

### Error Response Codes
```typescript
enum APIErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',
  RATE_LIMITED = 'RATE_LIMITED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

## 📝 Implementation Notes

### Security Considerations
- All endpoints require HTTPS
- JWT tokens expire after 7 days
- Rate limiting per IP and per user
- Input validation using Zod schemas
- SQL injection prevention via Prisma ORM
- CORS policy enforcement

### Performance Optimizations
- Database query optimization with proper indexing
- Response caching with Redis
- Pagination for large datasets
- Connection pooling for database connections
- CDN for static asset delivery

### Monitoring & Logging
- Request/response logging
- Error tracking and alerting
- Performance monitoring
- API usage analytics
- Security event logging

---

*This API specification serves as the authoritative guide for frontend developers and external integrators. For implementation details, refer to the codebase and inline documentation.*