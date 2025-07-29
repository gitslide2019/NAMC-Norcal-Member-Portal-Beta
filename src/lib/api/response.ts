/**
 * API Response Utilities
 * 
 * Standardized response formatting and error handling for NAMC API endpoints:
 * - Consistent response structure across all endpoints
 * - Type-safe error handling and status codes
 * - Request/response logging and monitoring
 * - CORS and security headers management
 */

import { NextResponse } from 'next/server'

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message: string
  error?: string
  timestamp: string
  requestId?: string
}

export interface PaginatedResponse<T = any> {
  items: T[]
  pagination: {
    total: number
    page: number
    limit: number
    hasMore: boolean
  }
}

export interface ValidationError {
  field: string
  message: string
  code: string
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Create standardized API response
 */
export function createApiResponse<T = any>(
  data: T | null = null,
  success: boolean = true,
  message: string = 'Success',
  statusCode: number = 200,
  requestId?: string
): NextResponse<ApiResponse<T>> {
  const response: ApiResponse<T> = {
    success,
    message,
    timestamp: new Date().toISOString()
  }

  if (success && data !== null) {
    response.data = data
  }

  if (!success) {
    response.error = message
  }

  if (requestId) {
    response.requestId = requestId
  }

  // Add security headers
  const nextResponse = NextResponse.json(response, { status: statusCode })
  
  // CORS headers
  nextResponse.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  nextResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  nextResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
  
  // Security headers
  nextResponse.headers.set('X-Content-Type-Options', 'nosniff')
  nextResponse.headers.set('X-Frame-Options', 'DENY')
  nextResponse.headers.set('X-XSS-Protection', '1; mode=block')
  nextResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Request tracking
  if (requestId) {
    nextResponse.headers.set('X-Request-ID', requestId)
  }

  return nextResponse
}

/**
 * Create paginated API response
 */
export function createPaginatedResponse<T = any>(
  items: T[],
  total: number,
  page: number,
  limit: number,
  message: string = 'Success',
  requestId?: string
): NextResponse<ApiResponse<PaginatedResponse<T>>> {
  const hasMore = (page * limit) < total
  
  const paginatedData: PaginatedResponse<T> = {
    items,
    pagination: {
      total,
      page,
      limit,
      hasMore
    }
  }

  return createApiResponse(paginatedData, true, message, 200, requestId)
}

/**
 * Create validation error response
 */
export function createValidationErrorResponse(
  errors: ValidationError[],
  requestId?: string
): NextResponse<ApiResponse<null>> {
  const errorMessage = `Validation failed: ${errors.map(e => e.message).join(', ')}`
  
  const response = createApiResponse(
    null,
    false,
    errorMessage,
    400,
    requestId
  )

  // Add validation errors to response body
  const body = response.json() as any
  body.validationErrors = errors

  return NextResponse.json(body, { status: 400 })
}

/**
 * Create error response from ApiError
 */
export function createErrorResponse(
  error: ApiError,
  requestId?: string
): NextResponse<ApiResponse<null>> {
  const response = createApiResponse(
    null,
    false,
    error.message,
    error.statusCode,
    requestId
  )

  // Add error details if available
  if (error.details) {
    const body = response.json() as any
    body.errorDetails = error.details
  }

  if (error.code) {
    const body = response.json() as any
    body.errorCode = error.code
  }

  return response
}

/**
 * Handle unhandled errors
 */
export function createUnhandledErrorResponse(
  error: any,
  requestId?: string
): NextResponse<ApiResponse<null>> {
  console.error('Unhandled API error:', error)

  // Don't expose internal error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal server error'
    : error.message || 'Unknown error occurred'

  return createApiResponse(
    null,
    false,
    message,
    500,
    requestId
  )
}

/**
 * CORS preflight response
 */
export function createCorsResponse(): NextResponse {
  const response = new NextResponse(null, { status: 200 })
  
  response.headers.set('Access-Control-Allow-Origin', process.env.CORS_ORIGIN || '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}

/**
 * Rate limiting error response
 */
export function createRateLimitResponse(
  resetTime: number,
  requestId?: string
): NextResponse<ApiResponse<null>> {
  const response = createApiResponse(
    null,
    false,
    'Rate limit exceeded',
    429,
    requestId
  )

  response.headers.set('Retry-After', Math.ceil(resetTime / 1000).toString())
  response.headers.set('X-RateLimit-Reset', resetTime.toString())

  return response
}

/**
 * Success response shortcuts
 */
export const ApiResponses = {
  success: <T>(data: T, message: string = 'Success') => 
    createApiResponse(data, true, message, 200),
    
  created: <T>(data: T, message: string = 'Created successfully') => 
    createApiResponse(data, true, message, 201),
    
  accepted: <T>(data: T, message: string = 'Accepted') => 
    createApiResponse(data, true, message, 202),
    
  noContent: (message: string = 'No content') => 
    createApiResponse(null, true, message, 204),
    
  badRequest: (message: string = 'Bad request') => 
    createApiResponse(null, false, message, 400),
    
  unauthorized: (message: string = 'Unauthorized') => 
    createApiResponse(null, false, message, 401),
    
  forbidden: (message: string = 'Forbidden') => 
    createApiResponse(null, false, message, 403),
    
  notFound: (message: string = 'Not found') => 
    createApiResponse(null, false, message, 404),
    
  conflict: (message: string = 'Conflict') => 
    createApiResponse(null, false, message, 409),
    
  unprocessableEntity: (message: string = 'Unprocessable entity') => 
    createApiResponse(null, false, message, 422),
    
  tooManyRequests: (message: string = 'Too many requests') => 
    createApiResponse(null, false, message, 429),
    
  internalServerError: (message: string = 'Internal server error') => 
    createApiResponse(null, false, message, 500),
    
  serviceUnavailable: (message: string = 'Service unavailable') => 
    createApiResponse(null, false, message, 503)
}

/**
 * Error response shortcuts
 */
export const ApiErrors = {
  validation: (errors: ValidationError[]) => 
    createValidationErrorResponse(errors),
    
  authentication: (message: string = 'Authentication required') => 
    new ApiError(message, 401, 'AUTH_REQUIRED'),
    
  authorization: (message: string = 'Insufficient permissions') => 
    new ApiError(message, 403, 'INSUFFICIENT_PERMISSIONS'),
    
  notFound: (resource: string = 'Resource') => 
    new ApiError(`${resource} not found`, 404, 'NOT_FOUND'),
    
  conflict: (message: string = 'Resource conflict') => 
    new ApiError(message, 409, 'CONFLICT'),
    
  rateLimit: (message: string = 'Rate limit exceeded') => 
    new ApiError(message, 429, 'RATE_LIMIT_EXCEEDED'),
    
  hubspotSync: (message: string = 'HubSpot synchronization failed') => 
    new ApiError(message, 502, 'HUBSPOT_SYNC_FAILED'),
    
  workflowExecution: (message: string = 'Workflow execution failed') => 
    new ApiError(message, 500, 'WORKFLOW_EXECUTION_FAILED'),
    
  databaseConnection: (message: string = 'Database connection failed') => 
    new ApiError(message, 503, 'DATABASE_CONNECTION_FAILED')
}

/**
 * Response logging utility
 */
export function logApiResponse(
  method: string,
  path: string,
  statusCode: number,
  responseTime: number,
  requestId?: string,
  userId?: string
) {
  const logData = {
    method,
    path,
    statusCode,
    responseTime,
    requestId,
    userId,
    timestamp: new Date().toISOString()
  }

  // Log to appropriate level based on status code
  if (statusCode >= 500) {
    console.error('API Error:', logData)
  } else if (statusCode >= 400) {
    console.warn('API Warning:', logData)
  } else {
    console.log('API Success:', logData)
  }

  // In production, you would send this to your logging service
  // Example: sendToLoggingService(logData)
}

/**
 * Request ID generation
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}