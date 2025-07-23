# API Reference - NAMC NorCal Member Portal

## Overview

The NAMC portal provides a comprehensive REST API with JWT authentication, rate limiting, and comprehensive error handling. All protected endpoints require authentication via JWT tokens stored in httpOnly cookies.

---

## 🔐 Authentication Endpoints

Base Path: `/api/auth/`

### POST `/api/auth/login`
**User Authentication**

**Rate Limit**: Strict (10 requests per 15 minutes)

**Request Body**:
```typescript
{
  email: string,           // Valid email address
  password: string,        // User password
  rememberMe?: boolean     // Optional, extends session to 30 days
}
```

**Response** (200):
```typescript
{
  success: true,
  data: {
    user: {
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      memberType: "REGULAR" | "admin",
      isActive: boolean,
      isVerified: boolean
    },
    token: string           // JWT token (also set as httpOnly cookie)
  },
  message: "Login successful"
}
```

**Security Features**:
- Account lockout after 5 failed attempts (15-minute lockout)
- Rate limiting with IP tracking
- Suspicious activity monitoring
- Comprehensive audit logging

---

### POST `/api/auth/register`
**New User Registration**

**Rate Limit**: Moderate (100 requests per 15 minutes)

**Request Body**:
```typescript
{
  firstName: string,       // 2-50 characters
  lastName: string,        // 2-50 characters
  email: string,           // Valid email (becomes username)
  password: string,        // Min 8 chars, must meet strength requirements
  phone?: string,          // Optional phone number
  company: string,         // Company/organization name
  title?: string,          // Optional job title
  agreeToTerms: boolean    // Must be true
}
```

**Response** (201):
```typescript
{
  success: true,
  data: {
    user: {
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      company: string,
      isVerified: false      // Requires email verification
    },
    emailSent: boolean       // Whether verification email was sent
  },
  message: "Registration successful. Please check your email to verify your account."
}
```

**Automatic Actions**:
- Generates secure email verification token (24-hour expiration)
- Sends verification email via HubSpot
- Sends welcome email asynchronously
- Creates audit log entry

---

### POST `/api/auth/verify-email` & GET `/api/auth/verify-email?token=xxx`
**Email Address Verification**

**Request Body** (POST):
```typescript
{
  token: string            // Email verification token
}
```

**Query Parameters** (GET):
- `token` - Email verification token from email link

**Response** (200):
```typescript
{
  success: true,
  data: {
    user: {
      id: string,
      email: string,
      firstName: string,
      lastName: string,
      company: string,
      isVerified: true
    }
  },
  message: "Email verified successfully! You can now access all features."
}
```

**GET Response**: Returns HTML page for user-friendly verification experience

---

### POST `/api/auth/forgot-password`
**Password Reset Request**

**Rate Limit**: Moderate (100 requests per 15 minutes)

**Request Body**:
```typescript
{
  email: string            // Email address to send reset link
}
```

**Response** (200):
```typescript
{
  success: true,
  data: {
    message: "If an account with this email exists, password reset instructions have been sent.",
    emailSent: boolean     // Whether email was successfully sent
  }
}
```

**Security Features**:
- Always returns success to prevent email enumeration
- Generates secure reset token (1-hour expiration)
- Sends password reset email via HubSpot
- Logs all attempts for security monitoring

---

### POST `/api/auth/reset-password`
**Complete Password Reset**

**Request Body**:
```typescript
{
  token: string,           // Password reset token
  password: string         // New password (meets strength requirements)
}
```

**Response** (200):
```typescript
{
  success: true,
  data: {
    message: "Password reset successful. You can now log in with your new password."
  }
}
```

**Actions**:
- Validates reset token and expiration
- Hashes new password with bcrypt
- Clears reset token and failed login attempts
- Creates audit log entry

---

### GET `/api/auth/reset-password?token=xxx`
**Validate Reset Token**

**Query Parameters**:
- `token` - Password reset token to validate

**Response** (200):
```typescript
{
  success: true,
  data: {
    valid: true,
    email: string,           // Email address (masked)
    firstName: string,
    expiresAt: string        // ISO timestamp
  }
}
```

---

## 👑 Admin Endpoints

Base Path: `/api/admin/`  
**Authentication**: Admin role required for all endpoints  
**Rate Limit**: Strict (10 requests per 15 minutes)

### GET `/api/admin/contractors`
**List California Contractors**

**Query Parameters**:
```typescript
{
  page?: number,           // Page number (default: 1)
  limit?: number,          // Items per page (default: 25, max: 100)
  search?: string,         // Search in business name
  city?: string,           // Filter by city
  county?: string,         // Filter by county
  classification?: string, // Filter by license classification
  licenseStatus?: string,  // Filter by license status
  hasEmail?: boolean,      // Filter by email availability
  hasPhone?: boolean,      // Filter by phone availability
  outreachStatus?: string, // Filter by outreach status
  sortBy?: string,         // Sort field (default: 'businessName')
  sortOrder?: 'asc' | 'desc' // Sort direction (default: 'asc')
}
```

**Response** (200):
```typescript
{
  success: true,
  data: CaliforniaContractor[],
  meta: {
    pagination: {
      page: number,
      limit: number,
      total: number,
      totalPages: number,
      hasNext: boolean,
      hasPrev: boolean
    }
  }
}
```

---

### POST `/api/admin/contractors`
**Create New Contractor**

**Request Body**:
```typescript
{
  licenseNumber: string,   // Unique contractor license
  businessName: string,
  email?: string,
  phone?: string,
  address?: string,
  city?: string,
  county?: string,
  classification?: string,
  licenseStatus?: string,
  // ... additional contractor fields
}
```

---

### GET/PUT/DELETE `/api/admin/contractors/[id]`
**Manage Specific Contractor**

**GET Response**:
```typescript
{
  success: true,
  data: {
    // Complete contractor record with all fields
    id: string,
    licenseNumber: string,
    businessName: string,
    email?: string,
    emailConfidence?: number,
    emailValidated: boolean,
    // ... all contractor fields
  }
}
```

---

### POST `/api/admin/email/test`
**Test Email Configuration**

**Request Body**:
```typescript
{
  template: 'welcome' | 'email_verification' | 'password_reset' | 'contractor_invitation' | 'admin_notification',
  email: string,           // Test recipient
  firstName?: string,      // Default: 'Test'
  lastName?: string,       // Default: 'User'
  company?: string         // Default: 'Test Company'
}
```

**Response** (200):
```typescript
{
  success: true,
  data: {
    template: string,
    recipient: string,
    success: boolean,
    messageId?: string,      // HubSpot message ID
    error?: string,          // Error details if failed
    rateLimited?: boolean,
    retryAfter?: number      // Seconds until retry allowed
  }
}
```

---

### GET `/api/admin/email/test`
**Email Configuration Status**

**Response** (200):
```typescript
{
  success: true,
  data: {
    availableTemplates: {
      welcome: { subject: string, description: string },
      email_verification: { subject: string, description: string },
      // ... all templates
    },
    configuration: {
      valid: boolean,
      errors: string[],      // Configuration errors
      warnings: string[],    // Configuration warnings
      environment: string    // 'development' | 'production'
    },
    usage: {
      description: string,
      example: object        // Example request body
    }
  }
}
```

---

## 🏥 Health Check Endpoints

Base Path: `/api/health/`  
**Rate Limit**: Relaxed (500 requests per 15 minutes)

### GET `/api/health`
**General System Health**

**Response** (200):
```typescript
{
  status: 'healthy' | 'degraded' | 'unhealthy',
  checks: {
    api: boolean,          // Always true
    database: boolean,     // PostgreSQL connection
    redis: boolean         // Redis connection (optional)
  },
  errors?: string[],       // Error details if any checks fail
  version: string,         // Package version
  environment: string,     // NODE_ENV
  timestamp: string        // ISO timestamp
}
```

**Status Codes**:
- `200` - Healthy or degraded (Redis optional failure)
- `503` - Unhealthy (database failure)

---

### GET `/api/health/redis`
**Detailed Redis Health** *(Admin Only)*

**Response** (200):
```typescript
{
  success: true,
  data: {
    status: 'connected' | 'disconnected' | 'error',
    connected: boolean,
    latency?: string,      // Response time (e.g., "15ms")
    memory_usage?: string, // Memory usage (e.g., "2.1M")
    uptime?: string,      // Uptime (e.g., "2h 45m")
    configuration: {
      host: string,
      port: string,
      database: string
    },
    performance: {
      latency: string,
      memory_usage: string,
      uptime: string
    }
  }
}
```

---

## 🔒 Authentication & Authorization

### JWT Token Structure
```typescript
{
  userId: string,          // User's unique ID
  email: string,           // User's email
  memberType: string,      // 'REGULAR' | 'admin'
  iat: number,            // Issued at timestamp
  exp: number             // Expiration timestamp (7 days default)
}
```

### Cookie Configuration
- **Name**: `namc-auth-token`
- **httpOnly**: `true` (not accessible via JavaScript)
- **secure**: `true` (HTTPS only in production)
- **sameSite**: `'strict'` (CSRF protection)
- **maxAge**: 7 days (or 30 days with "remember me")
- **path**: `/` (available for all routes)

### Rate Limiting

**Tiers**:
- **Strict**: 10 requests per 15 minutes (login, admin endpoints)
- **Moderate**: 100 requests per 15 minutes (general API)
- **Relaxed**: 500 requests per 15 minutes (health checks)

**Headers**:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Requests remaining in window
- `X-RateLimit-Reset` - Window reset timestamp
- `Retry-After` - Seconds until retry allowed (when rate limited)

### Error Response Format

All API endpoints follow this standardized error format:

```typescript
{
  success: false,
  message: string,         // Human-readable error message
  error: {
    code: string,          // Error code (e.g., 'VALIDATION_ERROR')
    message: string,       // Error message
    details?: any          // Additional error details (development only)
  },
  meta: {
    timestamp: string,     // ISO timestamp
    requestId?: string     // Unique request ID for tracking
  }
}
```

**Common Error Codes**:
- `VALIDATION_ERROR` (400) - Invalid input data
- `AUTHENTICATION_FAILED` (401) - Invalid or missing authentication
- `AUTHORIZATION_FAILED` (403) - Insufficient permissions
- `RESOURCE_NOT_FOUND` (404) - Requested resource doesn't exist
- `RESOURCE_CONFLICT` (409) - Resource already exists (e.g., duplicate email)
- `RATE_LIMITED` (429) - Rate limit exceeded
- `INTERNAL_ERROR` (500) - Server error

---

## 🛡️ Security Features

### Input Validation
- **Zod schemas** for all request validation
- **Type-safe** input parsing and transformation
- **Comprehensive validation rules** for business logic
- **Automatic sanitization** of string inputs

### Security Headers
All responses include comprehensive security headers:
- `Content-Security-Policy` - XSS protection
- `X-Frame-Options: DENY` - Clickjacking protection
- `X-Content-Type-Options: nosniff` - MIME sniffing protection
- `Strict-Transport-Security` - HTTPS enforcement
- `X-XSS-Protection` - Browser XSS protection

### Audit Logging
All authentication and admin actions are logged with:
- User ID and action type
- IP address and user agent
- Detailed action description
- Timestamp and request ID
- Success/failure status

### IP Security
- **Automatic IP blocking** after suspicious activity
- **Activity tracking** with Redis storage
- **Rate limit violations** trigger suspicious activity tracking
- **Admin endpoints** have enhanced IP monitoring

---

*For implementation examples and detailed usage, see the [Core Libraries Documentation](CORE_LIBRARIES.md).*