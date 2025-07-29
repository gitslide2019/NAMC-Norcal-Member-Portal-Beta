// Rate limiting utilities for API routes
import { NextRequest } from 'next/server'

interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

// In-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

/**
 * Simple in-memory rate limiter
 * In production, use Redis or database for distributed rate limiting
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<boolean> => {
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const key = `rate_limit:${ip}`
    const now = Date.now()
    
    const record = rateLimitStore.get(key)
    
    if (!record || now > record.resetTime) {
      // Reset or create new record
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + config.windowMs
      })
      return true
    }
    
    if (record.count >= config.maxRequests) {
      return false // Rate limit exceeded
    }
    
    // Increment count
    record.count++
    rateLimitStore.set(key, record)
    
    return true
  }
}

/**
 * Default rate limiter for API routes
 */
export const defaultRateLimit = rateLimit({
  maxRequests: 100,
  windowMs: 15 * 60 * 1000 // 15 minutes
})

/**
 * Strict rate limiter for sensitive endpoints
 */
export const strictRateLimit = rateLimit({
  maxRequests: 10,
  windowMs: 15 * 60 * 1000 // 15 minutes
})

/**
 * Rate limit response helper
 */
export function createRateLimitResponse() {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Too many requests. Please try again later.',
      error: 'RATE_LIMIT_EXCEEDED'
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '900' // 15 minutes
      }
    }
  )
}