import { NextRequest, NextResponse } from 'next/server'
import Logger from './logger'
import { generateRequestId } from './error-handler'

// Performance monitoring thresholds
const SLOW_REQUEST_THRESHOLD = 1000 // 1 second
const MEMORY_REPORT_INTERVAL = 60000 // 1 minute

let lastMemoryReport = 0

/**
 * Log API request with performance monitoring
 */
export function logAPIRequest(
  request: NextRequest,
  response: NextResponse,
  startTime: number,
  requestId?: string
): void {
  const duration = Date.now() - startTime
  const { method, url } = request
  const { status } = response

  // Extract client information
  const clientIP = request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown'
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // Build context
  const context = {
    requestId,
    ip: clientIP,
    userAgent,
    duration,
    method,
    url,
    statusCode: status
  }

  // Log request
  Logger.request(method, url, status, duration, context)

  // Check for slow requests
  if (duration > SLOW_REQUEST_THRESHOLD) {
    Logger.performance.slow('API Request', duration, SLOW_REQUEST_THRESHOLD, context)
  }

  // Periodic memory reporting
  const now = Date.now()
  if (now - lastMemoryReport > MEMORY_REPORT_INTERVAL) {
    lastMemoryReport = now
    Logger.performance.memory(process.memoryUsage(), { requestId })
  }
}

/**
 * Middleware wrapper for automatic request logging
 */
export function withRequestLogging<T extends NextRequest>(
  handler: (request: T) => Promise<NextResponse>
) {
  return async (request: T): Promise<NextResponse> => {
    const startTime = Date.now()
    const requestId = generateRequestId()

    try {
      // Add request ID to request headers for use in handlers
      const requestWithId = new Proxy(request, {
        get(target, prop) {
          if (prop === 'requestId') {
            return requestId
          }
          return Reflect.get(target, prop)
        }
      })

      const response = await handler(requestWithId as T)
      
      // Log successful request
      logAPIRequest(request, response, startTime, requestId)
      
      return response
    } catch (error) {
      // Create error response for logging
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
      
      // Log failed request
      logAPIRequest(request, errorResponse, startTime, requestId)
      
      // Re-throw error for proper error handling
      throw error
    }
  }
}

/**
 * Simple request logger for non-handler usage
 */
export function createRequestLogger(request: NextRequest, requestId?: string) {
  const startTime = Date.now()
  const rid = requestId || generateRequestId()

  return {
    requestId: rid,
    logResponse: (response: NextResponse) => {
      logAPIRequest(request, response, startTime, rid)
    },
    logError: (error: unknown) => {
      const errorResponse = NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
      logAPIRequest(request, errorResponse, startTime, rid)
      
      Logger.error('Request handler error', error, {
        requestId: rid,
        method: request.method,
        url: request.url,
        type: 'request_error'
      })
    }
  }
}

// Type augmentation for request with requestId
declare global {
  namespace NodeJS {
    interface Process {
      requestId?: string
    }
  }
}

export default Logger