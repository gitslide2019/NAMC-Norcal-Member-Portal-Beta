import { NextResponse } from 'next/server'
import { z } from 'zod'
import Logger from './logger'

// Standard error codes
export enum APIErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
  AUTHORIZATION_FAILED = 'AUTHORIZATION_FAILED',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_CONFLICT = 'RESOURCE_CONFLICT',
  RATE_LIMITED = 'RATE_LIMITED',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}

// Custom error classes
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public code: APIErrorCode,
    message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'APIError'
  }
}

export class ValidationError extends APIError {
  constructor(message: string, details?: any) {
    super(400, APIErrorCode.VALIDATION_ERROR, message, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends APIError {
  constructor(message: string = 'Authentication required') {
    super(401, APIErrorCode.AUTHENTICATION_FAILED, message)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends APIError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, APIErrorCode.AUTHORIZATION_FAILED, message)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends APIError {
  constructor(resource: string = 'Resource') {
    super(404, APIErrorCode.RESOURCE_NOT_FOUND, `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends APIError {
  constructor(message: string) {
    super(409, APIErrorCode.RESOURCE_CONFLICT, message)
    this.name = 'ConflictError'
  }
}

export class RateLimitError extends APIError {
  constructor(message: string = 'Too many requests') {
    super(429, APIErrorCode.RATE_LIMITED, message)
    this.name = 'RateLimitError'
  }
}

// Standard API response interface
export interface APIResponse<T = any> {
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
    pagination?: {
      page: number
      limit: number
      total: number
      totalPages: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

// Success response helper
export function createSuccessResponse<T>(
  data: T,
  message: string = 'Success',
  meta?: APIResponse['meta']
): NextResponse<APIResponse<T>> {
  const response: APIResponse<T> = {
    success: true,
    data,
    message,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  }

  return NextResponse.json(response, { status: 200 })
}

// Error response helper
export function createErrorResponse(
  error: APIError,
  requestId?: string
): NextResponse<APIResponse> {
  const isDevelopment = process.env.NODE_ENV === 'development'
  
  const response: APIResponse = {
    success: false,
    message: error.message,
    error: {
      code: error.code,
      message: error.message,
      ...(isDevelopment && error.details && { details: error.details })
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId })
    }
  }

  return NextResponse.json(response, { status: error.statusCode })
}

// Validation error handler for Zod
export function handleValidationError(error: z.ZodError): ValidationError {
  const details = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }))

  return new ValidationError(
    'Invalid request data',
    details
  )
}

// Main error handler
export function handleAPIError(
  error: unknown,
  requestId?: string
): NextResponse<APIResponse> {
  // Log error for monitoring (don't expose sensitive details)
  const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  Logger.error(`API Error [${errorId}]`, error, {
    errorId,
    requestId,
    type: 'api_error'
  })

  // Handle known error types
  if (error instanceof APIError) {
    return createErrorResponse(error, requestId)
  }

  if (error instanceof z.ZodError) {
    const validationError = handleValidationError(error)
    return createErrorResponse(validationError, requestId)
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as any
    
    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        return createErrorResponse(
          new ConflictError('A record with this data already exists'),
          requestId
        )
      case 'P2025': // Record not found
        return createErrorResponse(
          new NotFoundError('Requested record'),
          requestId
        )
      case 'P2003': // Foreign key constraint violation
        return createErrorResponse(
          new ValidationError('Invalid reference to related data'),
          requestId
        )
      default:
        // Log Prisma error but don't expose details
        Logger.database.error('Prisma operation failed', error as unknown as Error, {
          type: 'prisma_error',
          code: prismaError.code
        })
    }
  }

  // Handle generic errors
  if (error instanceof Error) {
    // Don't expose internal error details in production
    const message = process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'An internal error occurred'

    return createErrorResponse(
      new APIError(500, APIErrorCode.INTERNAL_ERROR, message),
      requestId
    )
  }

  // Fallback for unknown error types
  return createErrorResponse(
    new APIError(500, APIErrorCode.INTERNAL_ERROR, 'An unexpected error occurred'),
    requestId
  )
}

// Async error handler wrapper
export function withErrorHandler<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      throw error // Let the route handler catch and format the error
    }
  }
}

// Request ID generator
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Helper for creating paginated responses
export function createPaginatedResponse<T>(
  data: T[],
  totalCount: number,
  page: number,
  limit: number,
  message: string = 'Success'
): NextResponse<APIResponse<T[]>> {
  const totalPages = Math.ceil(totalCount / limit)
  
  return createSuccessResponse(data, message, {
    timestamp: new Date().toISOString(),
    pagination: {
      page,
      limit,
      total: totalCount,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  })
}