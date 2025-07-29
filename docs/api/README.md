# API Reference

Complete REST API documentation for the NAMC NorCal Member Portal, including HubSpot workflow integration endpoints.

## 📋 Overview

The NAMC Portal API provides RESTful endpoints for member management, event coordination, messaging, and HubSpot workflow integration. All endpoints return JSON responses and require proper authentication unless otherwise noted.

### Base URL
- **Development**: `http://localhost:3000/api`
- **Staging**: `https://staging.namcnorcal.org/api`
- **Production**: `https://portal.namcnorcal.org/api`

### API Versioning
Current version: `v1` (default)
- All endpoints use `/api/` prefix
- Version-specific endpoints: `/api/v1/`

## 🔐 Authentication

### JWT Bearer Token
Most endpoints require JWT authentication:
```http
Authorization: Bearer <jwt_token>
```

### Login Endpoint
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "memberType": "REGULAR",
      "profile": { ... }
    }
  },
  "message": "Login successful"
}
```

## 📊 Response Format

All API responses follow this standard format:

```json
{
  "success": boolean,
  "data": any,
  "message": string,
  "error": string | null,
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "totalPages": number
  } | null
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limited
- `500` - Internal Server Error

## 👤 Authentication Endpoints

### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "company": "Doe Construction",
  "phone": "+1-555-0123"
}
```

### Refresh Token
```http
POST /api/auth/refresh
Authorization: Bearer <refresh_token>
```

### Logout
```http
POST /api/auth/logout
Authorization: Bearer <jwt_token>
```

### Password Reset
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

## 👥 User Management

### Get Current User
```http
GET /api/users/me
Authorization: Bearer <jwt_token>
```

### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "company": "Updated Company Name",
  "phone": "+1-555-0456",
  "bio": "Updated bio",
  "website": "https://example.com"
}
```

### Upload Profile Picture
```http
POST /api/users/me/avatar
Authorization: Bearer <jwt_token>
Content-Type: multipart/form-data

file: <image_file>
```

### Get All Users (Admin Only)
```http
GET /api/users?page=1&limit=20&search=john
Authorization: Bearer <admin_jwt_token>
```

### Update User Role (Admin Only)
```http
PUT /api/users/{userId}/role
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "memberType": "admin"
}
```

## 📅 Event Management

### List Events
```http
GET /api/events?page=1&limit=10&upcoming=true&category=networking
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `upcoming` - Filter upcoming events (boolean)
- `category` - Event category filter
- `search` - Search in title and description

### Get Event Details
```http
GET /api/events/{eventId}
Authorization: Bearer <jwt_token>
```

### Create Event (Admin Only)
```http
POST /api/events
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "Networking Event",
  "description": "Monthly networking event for members",
  "startDate": "2025-02-15T18:00:00Z",
  "endDate": "2025-02-15T21:00:00Z",
  "location": "NAMC NorCal Office",
  "maxCapacity": 50,
  "category": "networking",
  "registrationDeadline": "2025-02-14T23:59:59Z"
}
```

### Update Event (Admin Only)
```http
PUT /api/events/{eventId}
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "Updated Event Title",
  "maxCapacity": 75
}
```

### Register for Event
```http
POST /api/events/{eventId}/register
Authorization: Bearer <jwt_token>
```

### Unregister from Event
```http
DELETE /api/events/{eventId}/register
Authorization: Bearer <jwt_token>
```

### Get Event Registrations (Admin Only)
```http
GET /api/events/{eventId}/registrations
Authorization: Bearer <admin_jwt_token>
```

## 💬 Messaging

### Get Messages
```http
GET /api/messages?page=1&limit=20&conversation={userId}
Authorization: Bearer <jwt_token>
```

### Send Message
```http
POST /api/messages
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "recipientId": "user_456",
  "content": "Hello! How are you?",
  "type": "text"
}
```

### Mark Message as Read
```http
PUT /api/messages/{messageId}/read
Authorization: Bearer <jwt_token>
```

### Get Conversations
```http
GET /api/messages/conversations
Authorization: Bearer <jwt_token>
```

## 📢 Announcements

### Get Announcements
```http
GET /api/announcements?page=1&limit=10&priority=high
Authorization: Bearer <jwt_token>
```

### Create Announcement (Admin Only)
```http
POST /api/announcements
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "title": "Important Update",
  "content": "Please note the upcoming changes...",
  "priority": "high",
  "publishDate": "2025-01-15T09:00:00Z",
  "expiryDate": "2025-02-15T09:00:00Z"
}
```

### Update Announcement (Admin Only)
```http
PUT /api/announcements/{announcementId}
Authorization: Bearer <admin_jwt_token>
```

### Delete Announcement (Admin Only)
```http
DELETE /api/announcements/{announcementId}
Authorization: Bearer <admin_jwt_token>
```

## 📁 Resource Management

### List Resources
```http
GET /api/resources?page=1&limit=20&category=documents
Authorization: Bearer <jwt_token>
```

### Upload Resource (Admin Only)
```http
POST /api/resources
Authorization: Bearer <admin_jwt_token>
Content-Type: multipart/form-data

file: <file>
title: "Resource Title"
description: "Resource description"
category: "documents"
```

### Download Resource
```http
GET /api/resources/{resourceId}/download
Authorization: Bearer <jwt_token>
```

### Delete Resource (Admin Only)
```http
DELETE /api/resources/{resourceId}
Authorization: Bearer <admin_jwt_token>
```

## 🔄 HubSpot Integration

### Sync Member to HubSpot
```http
POST /api/hubspot/sync/member/{memberId}
Authorization: Bearer <admin_jwt_token>
```

### Get HubSpot Contact
```http
GET /api/hubspot/contact/{contactId}
Authorization: Bearer <admin_jwt_token>
```

### Enroll in Workflow
```http
POST /api/hubspot/workflows/enroll
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "contactId": "hubspot_contact_123",
  "workflowId": "workflow_456",
  "reason": "Manual enrollment for special campaign"
}
```

### Get Workflow Enrollments
```http
GET /api/hubspot/workflows/enrollments/{contactId}
Authorization: Bearer <admin_jwt_token>
```

### Trigger Workflow Action
```http
POST /api/hubspot/workflows/trigger
Authorization: Bearer <admin_jwt_token>
Content-Type: application/json

{
  "memberId": "member_123",
  "workflowType": "event_registration",
  "eventId": "event_456",
  "data": {
    "eventTitle": "Networking Event",
    "eventDate": "2025-02-15T18:00:00Z"
  }
}
```

## 🪝 Webhook Endpoints

### HubSpot Contact Webhook
```http
POST /api/webhooks/hubspot/contact
Content-Type: application/json
X-HubSpot-Signature: <signature>

[
  {
    "eventId": "event_123",
    "subscriptionType": "contact.propertyChange",
    "objectId": "contact_456",
    "propertyName": "email",
    "propertyValue": "newemail@example.com",
    "occurredAt": "2025-01-15T10:30:00Z"
  }
]
```

### HubSpot Workflow Webhook
```http
POST /api/webhooks/hubspot/workflow
Content-Type: application/json
X-HubSpot-Signature: <signature>

[
  {
    "eventId": "event_789",
    "subscriptionType": "workflow.enrolled",
    "objectId": "contact_456",
    "workflowId": "workflow_123",
    "occurredAt": "2025-01-15T10:30:00Z"
  }
]
```

## 📊 Analytics and Reporting

### Member Analytics
```http
GET /api/analytics/members?period=30d&groupBy=memberType
Authorization: Bearer <admin_jwt_token>
```

### Event Analytics
```http
GET /api/analytics/events/{eventId}?metrics=registrations,attendance,engagement
Authorization: Bearer <admin_jwt_token>
```

### Engagement Metrics
```http
GET /api/analytics/engagement?startDate=2025-01-01&endDate=2025-01-31
Authorization: Bearer <admin_jwt_token>
```

### HubSpot Integration Analytics
```http
GET /api/analytics/hubspot/workflows?workflowId=workflow_123&period=7d
Authorization: Bearer <admin_jwt_token>
```

## 🏥 Health and Monitoring

### Health Check
```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 86400,
  "checks": {
    "database": {"status": "pass", "response_time": 45},
    "redis": {"status": "pass", "response_time": 12},
    "hubspot": {"status": "pass", "response_time": 234},
    "filesystem": {"status": "pass"},
    "memory": {"status": "pass", "usage_percent": 67.3}
  },
  "performance": {
    "response_time": 156,
    "memory_usage": 245
  }
}
```

### System Metrics (Admin Only)
```http
GET /api/admin/metrics
Authorization: Bearer <admin_jwt_token>
```

## ⚡ Rate Limiting

All API endpoints are rate limited:
- **Standard endpoints**: 100 requests per 15 minutes
- **Authentication endpoints**: 5 requests per 15 minutes
- **Upload endpoints**: 10 requests per 15 minutes

Rate limit headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642248000
```

## 🔍 Error Responses

### Validation Error (422)
```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "details": {
    "email": ["Email is required"],
    "password": ["Password must be at least 8 characters"]
  }
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Authentication required",
  "error": "UNAUTHORIZED"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Resource not found",
  "error": "NOT_FOUND"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "error": "RATE_LIMITED",
  "details": {
    "retryAfter": 300
  }
}
```

## 🧪 Testing

### Test Endpoints
Development and staging environments include test endpoints:

```http
POST /api/test/create-sample-data
Authorization: Bearer <admin_jwt_token>
```

```http
DELETE /api/test/cleanup
Authorization: Bearer <admin_jwt_token>
```

### API Collection
Import our Postman collection for easy testing:
- [Download Postman Collection](./postman/namc-portal-api.json)
- [Environment Variables](./postman/environments/)

## 📚 Code Examples

### JavaScript/TypeScript
```typescript
// API Client Example
class NAMCApiClient {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async getEvents(params: { page?: number; limit?: number } = {}) {
    const url = new URL('/api/events', this.baseUrl);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.json();
  }

  async createEvent(eventData: CreateEventRequest) {
    const response = await fetch(`${this.baseUrl}/api/events`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(eventData)
    });

    return response.json();
  }
}
```

### Python
```python
import requests
from typing import Optional, Dict, Any

class NAMCApiClient:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.token = token
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        })

    def get_events(self, page: Optional[int] = None, limit: Optional[int] = None) -> Dict[str, Any]:
        params = {}
        if page is not None:
            params['page'] = page
        if limit is not None:
            params['limit'] = limit
            
        response = self.session.get(f'{self.base_url}/api/events', params=params)
        return response.json()

    def create_event(self, event_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self.session.post(f'{self.base_url}/api/events', json=event_data)
        return response.json()
```

## 📖 Additional Resources

- [Authentication Guide](./auth.md)
- [Webhook Implementation](./webhooks.md)
- [Error Handling Best Practices](./error-handling.md)
- [Rate Limiting Details](./rate-limiting.md)
- [HubSpot Integration Patterns](./hubspot-integration.md)

---

**API Version**: 1.0.0  
**Last Updated**: January 2025  
**Support**: Create an issue in the repository for API-related questions