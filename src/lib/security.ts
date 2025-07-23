import { NextRequest, NextResponse } from 'next/server'
import redisClient, { withRedis } from './redis'

// Security headers configuration
export const securityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HSTS (HTTP Strict Transport Security)
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Note: In production, remove unsafe-* and use nonces
    "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
    "font-src 'self' fonts.gstatic.com",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' api.stripe.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; '),
  
  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Feature Policy / Permissions Policy
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

// Apply security headers to response
export function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    if (!response.headers.has(key)) {
      response.headers.set(key, value)
    }
  })
  return response
}

// Security middleware
export function securityMiddleware(request: NextRequest) {
  const response = NextResponse.next()
  return applySecurityHeaders(response)
}

// Rate limiting store (Redis-backed with in-memory fallback)
const rateLimitFallbackStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number // Time window in milliseconds
  maxRequests: number // Maximum requests per window
  skipSuccessfulRequests?: boolean
  skipFailedRequests?: boolean
}

// Default rate limit configurations
export const rateLimitConfigs = {
  strict: { windowMs: 15 * 60 * 1000, maxRequests: 10 }, // 10 requests per 15 minutes (login attempts)
  moderate: { windowMs: 15 * 60 * 1000, maxRequests: 100 }, // 100 requests per 15 minutes (general API)
  relaxed: { windowMs: 15 * 60 * 1000, maxRequests: 500 }, // 500 requests per 15 minutes (public endpoints)
}

// Rate limiting function with Redis backend
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = rateLimitConfigs.moderate
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const now = Date.now()
  const key = `rate_limit:${identifier}`
  
  return await withRedis(
    // Redis implementation
    async () => {
      // Try to get current rate limit data from Redis
      const rateLimitData = await redisClient.hgetall(key)
      
      let count = 0
      let resetTime = now + config.windowMs
      
      if (rateLimitData.count && rateLimitData.resetTime) {
        count = parseInt(rateLimitData.count)
        resetTime = parseInt(rateLimitData.resetTime)
        
        // Reset if window has passed
        if (now > resetTime) {
          count = 0
          resetTime = now + config.windowMs
        }
      }
      
      // Check if limit is exceeded
      if (count >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime
        }
      }
      
      // Increment counter
      count++
      
      // Store updated data in Redis with TTL
      await redisClient.hset(key, 'count', count.toString())
      await redisClient.hset(key, 'resetTime', resetTime.toString())
      await redisClient.expire(key, Math.ceil(config.windowMs / 1000))
      
      return {
        allowed: true,
        remaining: config.maxRequests - count,
        resetTime
      }
    },
    // Fallback to in-memory storage
    () => {
      let limitData = rateLimitFallbackStore.get(key)
      
      // Reset if window has passed
      if (!limitData || now > limitData.resetTime) {
        limitData = {
          count: 0,
          resetTime: now + config.windowMs
        }
      }
      
      // Check if limit is exceeded
      if (limitData.count >= config.maxRequests) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: limitData.resetTime
        }
      }
      
      // Increment counter
      limitData.count++
      rateLimitFallbackStore.set(key, limitData)
      
      return {
        allowed: true,
        remaining: config.maxRequests - limitData.count,
        resetTime: limitData.resetTime
      }
    },
    'Rate limit check'
  )
}

// Rate limit middleware (async)
export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig = rateLimitConfigs.moderate
): Promise<NextResponse> {
  // Get client identifier (IP address)
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  
  const result = await checkRateLimit(clientIP, config)
  
  if (!result.allowed) {
    const resetDate = new Date(result.resetTime)
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          details: {
            resetTime: resetDate.toISOString()
          }
        }
      },
      { 
        status: 429,
        headers: {
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString()
        }
      }
    )
  }
  
  // Add rate limit headers to successful responses
  const response = NextResponse.next()
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString())
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString())
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString())
  
  return response
}

// CSRF protection with Redis backend
export class CSRFProtection {
  private static fallbackTokens = new Map<string, { token: string; expires: number }>()
  
  static async generateToken(sessionId: string): Promise<string> {
    const token = Math.random().toString(36).substring(2) + 
                  Math.random().toString(36).substring(2)
    const expires = Date.now() + (60 * 60 * 1000) // 1 hour
    const key = `csrf_token:${sessionId}`
    
    return await withRedis(
      // Redis implementation
      async () => {
        await redisClient.hset(key, 'token', token)
        await redisClient.hset(key, 'expires', expires.toString())
        await redisClient.expire(key, 3600) // 1 hour TTL
        return token
      },
      // Fallback implementation
      () => {
        this.fallbackTokens.set(sessionId, { token, expires })
        return token
      },
      'CSRF token generation'
    )
  }
  
  static async validateToken(sessionId: string, token: string): Promise<boolean> {
    const key = `csrf_token:${sessionId}`
    
    return await withRedis(
      // Redis implementation
      async () => {
        const storedData = await redisClient.hgetall(key)
        
        if (!storedData.token || !storedData.expires) {
          return false
        }
        
        // Check if token has expired
        const expires = parseInt(storedData.expires)
        if (Date.now() > expires) {
          await redisClient.del(key)
          return false
        }
        
        return storedData.token === token
      },
      // Fallback implementation
      () => {
        const storedData = this.fallbackTokens.get(sessionId)
        
        if (!storedData) {
          return false
        }
        
        // Check if token has expired
        if (Date.now() > storedData.expires) {
          this.fallbackTokens.delete(sessionId)
          return false
        }
        
        return storedData.token === token
      },
      'CSRF token validation'
    )
  }
  
  static async cleanupExpiredTokens(): Promise<void> {
    // Redis handles TTL automatically, but we need to clean up fallback storage
    const now = Date.now()
    for (const [sessionId, data] of this.fallbackTokens.entries()) {
      if (now > data.expires) {
        this.fallbackTokens.delete(sessionId)
      }
    }
  }
}

// Input sanitization helpers
export function sanitizeString(input: string): string {
  if (!input || typeof input !== 'string') {
    return ''
  }
  
  // Remove dangerous script tags and their content completely
  let sanitized = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Remove all remaining HTML tags but preserve their content
  sanitized = sanitized.replace(/<[^>]*>/g, '')
  
  return sanitized.trim()
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim()
}

export function sanitizePhoneNumber(phone: string): string {
  // Remove all non-digit characters including +
  return phone.replace(/\D/g, '')
}

// SQL injection prevention (when not using ORM)
export function escapeSQL(value: string): string {
  return value.replace(/'/g, "''")
}

// File upload security
export function validateFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.toLowerCase().split('.').pop()
  if (!extension) {
    return false
  }
  
  return allowedTypes.some(type => type.toLowerCase() === `.${extension}`)
}

export function validateFileSize(size: number, maxSizeBytes: number): boolean {
  return size >= 0 && size <= maxSizeBytes
}

// Common file type configurations
export const fileTypeConfigs = {
  images: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  documents: ['pdf', 'doc', 'docx', 'txt'],
  all: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt']
}

// IP address validation and blocking with Redis backend
const fallbackBlockedIPs = new Set<string>()
const fallbackSuspiciousActivity = new Map<string, { count: number; lastActivity: number }>()

export async function blockIP(ip: string): Promise<void> {
  const key = `blocked_ip:${ip}`
  
  await withRedis(
    // Redis implementation
    async () => {
      await redisClient.sadd('blocked_ips', ip)
      await redisClient.set(key, 'blocked', 24 * 60 * 60) // 24 hours
    },
    // Fallback implementation
    () => {
      fallbackBlockedIPs.add(ip)
    },
    'IP blocking'
  )
}

export async function isIPBlocked(ip: string): Promise<boolean> {
  return await withRedis(
    // Redis implementation
    async () => {
      return await redisClient.sismember('blocked_ips', ip)
    },
    // Fallback implementation
    () => {
      return fallbackBlockedIPs.has(ip)
    },
    'IP blocked check'
  )
}

export async function trackSuspiciousActivity(ip: string): Promise<boolean> {
  const now = Date.now()
  const key = `suspicious_activity:${ip}`
  
  return await withRedis(
    // Redis implementation
    async () => {
      const activityData = await redisClient.hgetall(key)
      
      let count = 0
      let lastActivity = now
      
      if (activityData.count && activityData.lastActivity) {
        count = parseInt(activityData.count)
        lastActivity = parseInt(activityData.lastActivity)
        
        // Reset count if more than 1 hour has passed
        if (now - lastActivity > 60 * 60 * 1000) {
          count = 0
        }
      }
      
      count++
      
      // Store updated activity data
      await redisClient.hset(key, 'count', count.toString())
      await redisClient.hset(key, 'lastActivity', now.toString())
      await redisClient.expire(key, 24 * 60 * 60) // 24 hour TTL
      
      // Block IP if too many suspicious activities
      if (count > 10) {
        await blockIP(ip)
        return true
      }
      
      return false
    },
    // Fallback implementation
    () => {
      const activity = fallbackSuspiciousActivity.get(ip) || { count: 0, lastActivity: now }
      
      // Reset count if more than 1 hour has passed
      if (now - activity.lastActivity > 60 * 60 * 1000) {
        activity.count = 0
      }
      
      activity.count++
      activity.lastActivity = now
      fallbackSuspiciousActivity.set(ip, activity)
      
      // Block IP if too many suspicious activities
      if (activity.count > 10) {
        fallbackBlockedIPs.add(ip)
        return true
      }
      
      return false
    },
    'Suspicious activity tracking'
  )
}

// Password strength validation
export function validatePasswordStrength(password: string): {
  isValid: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0

  // Length check
  if (password.length < 8) {
    feedback.push('Use at least 8 characters')
  } else if (password.length >= 12) {
    score += 2
  } else {
    score += 1
  }

  // Character variety checks
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters')
  } else {
    score += 1
  }

  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters')
  } else {
    score += 1
  }

  if (!/\d/.test(password)) {
    feedback.push('Add numbers')
  } else {
    score += 1
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Add special characters')
  } else {
    score += 1
  }

  // Common password patterns
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /admin/i,
    /letmein/i
  ]

  if (commonPatterns.some(pattern => pattern.test(password))) {
    feedback.push('Password contains common patterns that are easily guessed')
    score = Math.max(0, score - 2)
  }

  return {
    isValid: feedback.length === 0 && score >= 4,
    score: Math.min(5, score),
    feedback
  }
}

// Session security
export function generateSecureSessionId(length: number = 32): string {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(length)),
    byte => byte.toString(16).padStart(2, '0')
  ).join('').substring(0, length)
}

// Get client IP address from request headers
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }

  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP.trim()
  }

  const cfIP = request.headers.get('cf-connecting-ip')
  if (cfIP) {
    return cfIP.trim()
  }

  return 'unknown'
}

// Clean up expired data periodically (fallback storage only, Redis handles TTL automatically)
setInterval(async () => {
  await CSRFProtection.cleanupExpiredTokens()
  
  // Clean up old rate limit data (fallback only)
  const now = Date.now()
  for (const [key, data] of rateLimitFallbackStore.entries()) {
    if (now > data.resetTime) {
      rateLimitFallbackStore.delete(key)
    }
  }
  
  // Clean up old suspicious activity data (fallback only)
  for (const [ip, activity] of fallbackSuspiciousActivity.entries()) {
    if (now - activity.lastActivity > 24 * 60 * 60 * 1000) { // 24 hours
      fallbackSuspiciousActivity.delete(ip)
    }
  }
}, 60 * 60 * 1000) // Run every hour