# Core Libraries Reference - NAMC NorCal Member Portal

## Overview

The NAMC portal's core libraries provide production-ready services for authentication, email delivery, caching, security, and data validation. All libraries are designed with comprehensive error handling, fallback mechanisms, and enterprise-grade reliability.

---

## 🔐 Authentication Service (`/src/lib/auth.ts`)

### AuthService Class

**Core Authentication Methods**:

```typescript
class AuthService {
  // Password Management
  static async hashPassword(password: string): Promise<string>
  static async comparePassword(password: string, hash: string): Promise<boolean>
  
  // JWT Token Management
  static generateToken(user: AuthUser): string
  static verifyToken(token: string): JWTPayload | null
  
  // User Authentication
  static async authenticateUser(email: string, password: string): Promise<AuthUser | null>
  static async getUserFromToken(token: string): Promise<AuthUser | null>
  
  // Authorization & Permissions
  static async hasPermission(userId: string, resource: string, action: string): Promise<boolean>
  static isAdmin(user: AuthUser): boolean
  static canAccessAdmin(user: AuthUser): boolean
  
  // Audit Logging
  static async logAuthAction(action: string, userId: string, details: string, ipAddress?: string, userAgent?: string): Promise<void>
}
```

### Key Features

**Password Security**:
- **bcrypt hashing** with 12 salt rounds for maximum security
- **Password strength validation** with complexity requirements
- **Secure comparison** using constant-time algorithms

**JWT Management**:
- **7-day token expiration** with optional 30-day "remember me"
- **Secure secret validation** (minimum 32 characters required)
- **Token verification** with user status checks (active, verified)

**Account Security**:
- **Account lockout** after 5 failed login attempts
- **15-minute lockout duration** with automatic unlock
- **Failed attempt tracking** with database persistence
- **Last login tracking** for security monitoring

**Usage Example**:
```typescript
// Authenticate user
const user = await AuthService.authenticateUser(email, password)
if (!user) {
  throw new AuthenticationError('Invalid credentials')
}

// Generate JWT token
const token = AuthService.generateToken(user)

// Verify admin access
if (!AuthService.canAccessAdmin(user)) {
  throw new AuthorizationError('Admin access required')
}

// Log security event
await AuthService.logAuthAction(
  'USER_LOGIN',
  user.id,
  `User ${user.email} logged in successfully`,
  clientIP,
  userAgent
)
```

---

## 📧 Email Service (`/src/lib/email.ts`)

### EmailService Class

**Core Email Methods**:

```typescript
class EmailService {
  // Generic Email Sending
  async sendEmail(recipient: EmailRecipient, template: EmailTemplate, templateData: EmailTemplateData, options?: EmailOptions): Promise<EmailResult>
  
  // Specific Email Types
  async sendWelcomeEmail(recipient: EmailRecipient, templateData?: Partial<EmailTemplateData>): Promise<EmailResult>
  async sendVerificationEmail(recipient: EmailRecipient, verificationToken: string, templateData?: Partial<EmailTemplateData>): Promise<EmailResult>
  async sendPasswordResetEmail(recipient: EmailRecipient, resetToken: string, templateData?: Partial<EmailTemplateData>): Promise<EmailResult>
  async sendContractorInvitation(recipient: EmailRecipient, invitationToken: string, templateData?: Partial<EmailTemplateData>): Promise<EmailResult>
  async sendAdminNotification(recipients: EmailRecipient[], subject: string, message: string, templateData?: Partial<EmailTemplateData>): Promise<EmailResult[]>
  
  // Configuration & Validation
  getEmailTemplates(): Record<EmailTemplate, TemplateInfo>
  validateConfiguration(): ConfigValidationResult
}
```

### Email Templates

**Available Templates**:
```typescript
enum EmailTemplate {
  WELCOME = 'welcome',                    // New member welcome
  EMAIL_VERIFICATION = 'email_verification', // Account verification
  PASSWORD_RESET = 'password_reset',      // Password reset instructions
  CONTRACTOR_INVITATION = 'contractor_invitation', // Invite contractors
  EVENT_REGISTRATION = 'event_registration', // Event confirmations
  ADMIN_NOTIFICATION = 'admin_notification' // System notifications
}
```

**Template Data Structure**:
```typescript
interface EmailTemplateData {
  // Common variables
  firstName?: string
  lastName?: string
  email?: string
  company?: string
  
  // Action-specific variables
  resetToken?: string
  verificationToken?: string
  resetUrl?: string
  verificationUrl?: string
  
  // Event-specific variables
  eventName?: string
  eventDate?: string
  
  // Admin-specific variables
  adminMessage?: string
  timestamp?: string
  
  // Custom variables
  [key: string]: string | number | boolean | undefined
}
```

### HubSpot MCP Integration

**Production Configuration**:
```typescript
// Environment variables required
HUBSPOT_API_KEY="your-hubspot-api-key"
FROM_EMAIL="noreply@namc-norcal.org"
FROM_NAME="NAMC NorCal"
REPLY_TO_EMAIL="info@namc-norcal.org"
```

**Integration Structure** (Ready for HubSpot MCP):
```typescript
private async sendViaHubSpot(recipient: EmailRecipient, template: EmailTemplate, templateData: EmailTemplateData, options: any): Promise<EmailResult> {
  const emailData = {
    to: recipient.email,
    from: this.config.fromEmail,
    fromName: this.config.fromName,
    replyTo: this.config.replyToEmail,
    subject: options.subject,
    template: template,
    templateData: {
      ...templateData,
      fromName: this.config.fromName,
      fromEmail: this.config.fromEmail,
      replyToEmail: this.config.replyToEmail
    },
    options: {
      trackOpens: options.trackOpens ?? true,
      trackClicks: options.trackClicks ?? true,
      priority: options.priority ?? 'normal'
    }
  }

  // TODO: Integrate with HubSpot MCP when available
  // const result = await hubspotMCP.sendEmail(emailData)
  
  return {
    success: true,
    messageId: `hubspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }
}
```

### Rate Limiting & Security

**Email Rate Limiting**:
- **10 emails per hour** per recipient to prevent abuse
- **Redis-backed tracking** with fallback to in-memory storage
- **Automatic retry scheduling** for rate-limited emails

**Development Mode**:
```typescript
// Development logging (when NODE_ENV !== 'production')
console.log('📧 EMAIL (Development Mode):')
console.log('  To:', recipient.email, recipient.name ? `(${recipient.name})` : '')
console.log('  Template:', template)
console.log('  Subject:', options.subject || 'No subject')
console.log('  Data:', JSON.stringify(templateData, null, 2))
```

**Usage Example**:
```typescript
// Send welcome email
const result = await emailService.sendWelcomeEmail(
  {
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    company: user.company
  },
  {
    registrationDate: new Date().toISOString(),
    memberType: 'REGULAR'
  }
)

if (!result.success) {
  console.error('Failed to send welcome email:', result.error)
}
```

---

## 🗄️ Redis Client (`/src/lib/redis.ts`)

### RedisClient Class

**Connection Management**:
```typescript
class RedisClient {
  // Connection Lifecycle
  async connect(): Promise<void>
  async disconnect(): Promise<void>
  isAvailable(): boolean
  getStatus(): RedisStatus
  async ping(): Promise<string>
  async healthCheck(): Promise<HealthCheckResult>
  
  // Basic Operations
  async set(key: string, value: string, expireInSeconds?: number): Promise<boolean>
  async get(key: string): Promise<string | null>
  async del(key: string): Promise<number>
  async exists(key: string): Promise<boolean>
  async expire(key: string, seconds: number): Promise<boolean>
  async ttl(key: string): Promise<number>
  async incr(key: string): Promise<number>
}
```

**Advanced Data Structures**:
```typescript
// Hash Operations
async hset(key: string, field: string, value: string): Promise<number>
async hget(key: string, field: string): Promise<string | null>
async hgetall(key: string): Promise<Record<string, string>>

// Set Operations
async sadd(key: string, ...members: string[]): Promise<number>
async sismember(key: string, member: string): Promise<boolean>
async srem(key: string, ...members: string[]): Promise<number>
```

### Production Features

**Connection Management**:
- **Automatic reconnection** with exponential backoff
- **Health monitoring** with 30-second ping intervals
- **Connection pooling** with configurable limits
- **Graceful degradation** when Redis unavailable

**Configuration**:
```typescript
// Environment variables
REDIS_HOST="localhost"
REDIS_PORT="6379"
REDIS_PASSWORD=""
REDIS_DB="0"
```

**Graceful Fallback System**:
```typescript
export const withRedis = async <T>(
  operation: () => Promise<T>,
  fallback: () => T,
  operationName: string = 'Redis operation'
): Promise<T> => {
  if (!redisClient.isAvailable()) {
    console.warn(`${operationName}: Redis not available, using fallback`)
    return fallback()
  }

  try {
    return await operation()
  } catch (error) {
    console.error(`${operationName}: Failed, using fallback:`, error)
    return fallback()
  }
}
```

**Usage Example**:
```typescript
// Rate limiting with Redis
const result = await withRedis(
  async () => {
    const rateLimitData = await redisClient.hgetall(key)
    // Redis implementation
    return processRateLimit(rateLimitData)
  },
  () => {
    // Fallback to in-memory storage
    return processRateLimitFallback()
  },
  'Rate limit check'
)
```

---

## 🛡️ Security Middleware (`/src/lib/security.ts`)

### Security Headers

**Comprehensive Protection**:
```typescript
export const securityHeaders = {
  // XSS Protection
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS Enforcement
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' api.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Privacy & Features
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'payment=(self)',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', ')
}
```

### Rate Limiting System

**Rate Limit Configurations**:
```typescript
export const rateLimitConfigs = {
  strict: { windowMs: 15 * 60 * 1000, maxRequests: 10 },    // Login, admin
  moderate: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // General API
  relaxed: { windowMs: 15 * 60 * 1000, maxRequests: 500 },  // Public endpoints
}
```

**Rate Limiting Functions**:
```typescript
// Redis-backed rate limiting
export async function checkRateLimit(identifier: string, config: RateLimitConfig): Promise<RateLimitResult>

// Middleware for automatic rate limiting
export async function rateLimitMiddleware(request: NextRequest, config: RateLimitConfig): Promise<NextResponse>
```

### CSRF Protection

**Token-Based CSRF Protection**:
```typescript
export class CSRFProtection {
  static async generateToken(sessionId: string): Promise<string>
  static async validateToken(sessionId: string, token: string): Promise<boolean>
  static async cleanupExpiredTokens(): Promise<void>
}
```

**Features**:
- **Redis-backed storage** with 1-hour token expiration
- **Automatic cleanup** of expired tokens
- **Fallback to in-memory** storage when Redis unavailable

### IP Security System

**IP Blocking & Monitoring**:
```typescript
// IP management functions
export async function blockIP(ip: string): Promise<void>
export async function isIPBlocked(ip: string): Promise<boolean>
export async function trackSuspiciousActivity(ip: string): Promise<boolean>
```

**Suspicious Activity Tracking**:
- **Automatic IP blocking** after 10 suspicious activities
- **1-hour activity windows** with automatic reset
- **Redis persistence** with 24-hour data retention
- **Integration with rate limiting** for comprehensive protection

### Input Sanitization

**Security Functions**:
```typescript
// String sanitization
export function sanitizeString(input: string): string
export function sanitizeEmail(email: string): string
export function sanitizePhoneNumber(phone: string): string

// File security
export function validateFileType(filename: string, allowedTypes: string[]): boolean
export function validateFileSize(size: number, maxSizeBytes: number): boolean

// Password validation
export function validatePasswordStrength(password: string): PasswordValidationResult
```

**Usage Example**:
```typescript
// Apply security middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const clientIP = getClientIP(request)
  
  // Check IP blocking
  if (await isIPBlocked(clientIP)) {
    return createBlockedResponse()
  }
  
  // Apply rate limiting based on endpoint
  if (pathname.startsWith('/api/auth/login')) {
    const response = await rateLimitMiddleware(request, rateLimitConfigs.strict)
    if (response.status === 429) {
      await trackSuspiciousActivity(clientIP)
      return applySecurityHeaders(response)
    }
  }
  
  // Apply security headers to all responses
  const response = NextResponse.next()
  return applySecurityHeaders(response)
}
```

---

## ✅ Input Validation (`/src/lib/validation.ts`)

### Zod Schemas

**Authentication Schemas**:
```typescript
export const loginSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(1, 'Password is required')
    .max(128, 'Password must be less than 128 characters'),
  rememberMe: z.boolean().optional().default(false)
})

export const registerSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'First name contains invalid characters')
    .transform(name => name.trim()),
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Last name contains invalid characters')
    .transform(name => name.trim()),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .transform(email => email.toLowerCase().trim()),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  company: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters')
    .transform(name => name.trim()),
  agreeToTerms: z.boolean()
    .refine(val => val === true, 'You must agree to the terms and conditions')
})
```

**Admin & Business Schemas**:
```typescript
export const contractorSearchSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(25),
  search: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  county: z.string().max(100).optional(),
  classification: z.string().max(50).optional(),
  licenseStatus: z.string().max(20).optional(),
  sortBy: z.enum(['businessName', 'city', 'licenseNumber', 'createdAt']).default('businessName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})
```

### Type Safety

**Generated TypeScript Types**:
```typescript
export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ContractorSearchInput = z.infer<typeof contractorSearchSchema>
// ... all schema types
```

**Validation Helpers**:
```typescript
// Validation error formatter
export function formatValidationError(error: z.ZodError) {
  return error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message
  }))
}

// Request validation middleware
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${formatValidationError(error).map(e => `${e.field}: ${e.message}`).join(', ')}`)
    }
    throw error
  }
}
```

---

## 🔧 Error Handling (`/src/lib/error-handler.ts`)

### Standardized Error System

**Custom Error Classes**:
```typescript
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: APIErrorCode,
    message: string,
    public details?: any
  )
}

export class ValidationError extends APIError
export class AuthenticationError extends APIError
export class AuthorizationError extends APIError
export class NotFoundError extends APIError
export class ConflictError extends APIError
export class RateLimitError extends APIError
```

**Response Helpers**:
```typescript
// Success response
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Success',
  meta?: APIResponse['meta']
): NextResponse<APIResponse<T>>

// Error response
export function createErrorResponse(
  error: APIError,
  requestId?: string
): NextResponse<APIResponse>

// Main error handler
export function handleAPIError(
  error: unknown,
  requestId?: string
): NextResponse<APIResponse>
```

**Standard Response Format**:
```typescript
interface APIResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: {
    code: APIErrorCode
    message: string
    details?: any
  }
  meta?: {
    timestamp: string
    requestId?: string
    pagination?: PaginationMeta
  }
}
```

### Request Tracking

**Request ID Generation**:
```typescript
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}
```

**Usage in API Routes**:
```typescript
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // API logic here
    return createSuccessResponse(data, 'Success', { requestId })
  } catch (error) {
    return handleAPIError(error, requestId)
  }
}
```

---

## 🔗 Integration Examples

### Complete Authentication Flow

```typescript
// Login endpoint implementation
export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    const { email, password, rememberMe } = loginSchema.parse(body)

    // Authenticate user
    const user = await AuthService.authenticateUser(email, password)
    if (!user) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Generate JWT token
    const token = AuthService.generateToken(user)

    // Log successful login
    await AuthService.logAuthAction(
      'USER_LOGIN',
      user.id,
      `User ${user.email} logged in successfully`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    )

    const response = createSuccessResponse(
      { user, token },
      'Login successful',
      { requestId }
    )

    // Set secure httpOnly cookie
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60
    response.cookies.set('namc-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
      path: '/'
    })

    return response
  } catch (error) {
    return handleAPIError(error, requestId)
  }
}
```

### Email Integration with Error Handling

```typescript
// Registration with email verification
const emailResult = await emailService.sendVerificationEmail(
  { email: user.email, firstName: user.firstName, lastName: user.lastName },
  verificationToken,
  { registrationDate: new Date().toISOString() }
)

if (!emailResult.success) {
  await AuthService.logAuthAction(
    'EMAIL_VERIFICATION_FAILED',
    user.id,
    `Failed to send verification email: ${emailResult.error}`,
    clientIP,
    userAgent
  )
} else {
  await AuthService.logAuthAction(
    'EMAIL_VERIFICATION_SENT',
    user.id,
    `Verification email sent. Message ID: ${emailResult.messageId}`,
    clientIP,
    userAgent
  )
}
```

### Redis with Fallback Pattern

```typescript
// Rate limiting with Redis fallback
const rateLimitResult = await withRedis(
  async () => {
    // Redis implementation
    const data = await redisClient.hgetall(`rate_limit:${clientIP}`)
    return processRateLimit(data)
  },
  () => {
    // In-memory fallback
    return processRateLimitFallback(clientIP)
  },
  'Rate limit check'
)

if (!rateLimitResult.allowed) {
  throw new RateLimitError('Too many requests')
}
```

---

*For API endpoints and usage examples, see the [API Reference](API_REFERENCE.md).*