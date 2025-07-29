/**
 * API Validation Utilities
 * 
 * Request validation and sanitization for NAMC API endpoints:
 * - Zod schema validation with custom error messages
 * - Request body parsing and validation
 * - Query parameter validation and type conversion
 * - File upload validation and security checks
 * - Input sanitization and security measures
 */

import { NextRequest } from 'next/server'
import { z, ZodError, ZodSchema } from 'zod'
import { ApiError, ValidationError } from './response'

/**
 * Validate request body against Zod schema
 */
export async function validateRequestBody<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json()
    return schema.parse(body)
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      
      throw new ApiError(
        'Validation failed',
        400,
        'VALIDATION_ERROR',
        { validationErrors }
      )
    }
    
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400, 'INVALID_JSON')
    }
    
    throw new ApiError('Failed to parse request body', 400, 'PARSE_ERROR')
  }
}

/**
 * Validate query parameters against Zod schema
 */
export function validateQueryParams<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): T {
  try {
    const url = new URL(request.url)
    const queryParams = Object.fromEntries(url.searchParams)
    return schema.parse(queryParams)
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      
      throw new ApiError(
        'Query parameter validation failed',
        400,
        'QUERY_VALIDATION_ERROR',
        { validationErrors }
      )
    }
    
    throw new ApiError('Failed to validate query parameters', 400, 'QUERY_PARSE_ERROR')
  }
}

/**
 * Validate and parse form data
 */
export async function validateFormData<T>(
  request: NextRequest,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const formData = await request.formData()
    const data: any = {}
    
    formData.forEach((value, key) => {
      if (data[key]) {
        // Handle multiple values for the same key
        if (Array.isArray(data[key])) {
          data[key].push(value)
        } else {
          data[key] = [data[key], value]
        }
      } else {
        data[key] = value
      }
    })
    
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      const validationErrors: ValidationError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))
      
      throw new ApiError(
        'Form data validation failed',
        400,
        'FORM_VALIDATION_ERROR',
        { validationErrors }
      )
    }
    
    throw new ApiError('Failed to parse form data', 400, 'FORM_PARSE_ERROR')
  }
}

/**
 * Custom Zod schemas for common NAMC use cases
 */
export const CommonSchemas = {
  // Pagination parameters
  pagination: z.object({
    page: z.string().regex(/^\d+$/).transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/).transform(Number).default('50'),
    offset: z.string().regex(/^\d+$/).transform(Number).optional()
  }),

  // Date range parameters
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional()
  }),

  // Search parameters
  search: z.object({
    q: z.string().min(1).max(255).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc')
  }),

  // Member ID validation
  memberId: z.string().uuid('Invalid member ID format'),

  // Workflow ID validation
  workflowId: z.string().min(1).max(255),

  // Email validation
  email: z.string().email('Invalid email format').toLowerCase(),

  // Phone validation
  phone: z.string().regex(
    /^[\+]?[1-9][\d]{0,15}$/,
    'Invalid phone number format'
  ),

  // HubSpot ID validation
  hubspotId: z.string().regex(/^\d+$/, 'Invalid HubSpot ID format'),

  // File upload validation
  fileUpload: z.object({
    filename: z.string().min(1).max(255),
    contentType: z.string().min(1),
    size: z.number().max(10 * 1024 * 1024, 'File size must be less than 10MB')
  })
}

/**
 * Sanitize string input to prevent XSS and injection attacks
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove potentially harmful characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/data:/gi, '')
    .replace(/vbscript:/gi, '')
    .trim()
}

/**
 * Validate file upload security
 */
export function validateFileUpload(file: File): void {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]

  if (file.size > maxSize) {
    throw new ApiError('File size exceeds 10MB limit', 400, 'FILE_TOO_LARGE')
  }

  if (!allowedTypes.includes(file.type)) {
    throw new ApiError('File type not allowed', 400, 'INVALID_FILE_TYPE')
  }

  // Check for malicious file extensions
  const dangerousExtensions = ['.exe', '.bat', '.cmd', '.scr', '.pif', '.vbs', '.js']
  const fileName = file.name.toLowerCase()
  
  if (dangerousExtensions.some(ext => fileName.endsWith(ext))) {
    throw new ApiError('File extension not allowed', 400, 'DANGEROUS_FILE_EXTENSION')
  }
}

/**
 * Validate and normalize URL parameters
 */
export function validateUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    
    // Only allow HTTP and HTTPS protocols
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error('Invalid protocol')
    }
    
    return parsedUrl.toString()
  } catch (error) {
    throw new ApiError('Invalid URL format', 400, 'INVALID_URL')
  }
}

/**
 * Validate HubSpot property names
 */
export function validateHubSpotProperty(propertyName: string): boolean {
  // HubSpot property names must be lowercase, can contain letters, numbers, and underscores
  const hubspotPropertyRegex = /^[a-z][a-z0-9_]*$/
  return hubspotPropertyRegex.test(propertyName)
}

/**
 * Validate NAMC member type
 */
export const NAMCMemberTypeSchema = z.enum(['REGULAR', 'admin'], {
  errorMap: () => ({ message: 'Member type must be either REGULAR or admin' })
})

/**
 * Validate workflow type
 */
export const WorkflowTypeSchema = z.enum([
  'member_onboarding',
  'member_lifecycle',
  'project_matching',
  'service_request',
  'event_engagement',
  'renewal_management',
  'risk_intervention',
  'training_pathway',
  'committee_engagement',
  'donor_cultivation',
  'staff_task_automation',
  'member_communication'
], {
  errorMap: () => ({ message: 'Invalid workflow type' })
})

/**
 * Validate workflow status
 */
export const WorkflowStatusSchema = z.enum([
  'ACTIVE',
  'INACTIVE', 
  'PAUSED',
  'ERROR',
  'DRAFT'
], {
  errorMap: () => ({ message: 'Invalid workflow status' })
})

/**
 * Validate execution status
 */
export const ExecutionStatusSchema = z.enum([
  'PENDING',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
  'TIMEOUT'
], {
  errorMap: () => ({ message: 'Invalid execution status' })
})

/**
 * Validate member risk level
 */
export const MemberRiskLevelSchema = z.enum([
  'standard',
  'medium_risk',
  'high_risk',
  'at_risk_intervention'
], {
  errorMap: () => ({ message: 'Invalid member risk level' })
})

/**
 * Comprehensive request validation middleware
 */
export function createValidationMiddleware<T>(
  schema: ZodSchema<T>,
  source: 'body' | 'query' | 'form' = 'body'
) {
  return async (request: NextRequest): Promise<T> => {
    switch (source) {
      case 'body':
        return await validateRequestBody(request, schema)
      case 'query':
        return validateQueryParams(request, schema)
      case 'form':
        return await validateFormData(request, schema)
      default:
        throw new ApiError('Invalid validation source', 500, 'VALIDATION_CONFIG_ERROR')
    }
  }
}

/**
 * Batch validation for multiple inputs
 */
export function validateBatch<T>(
  inputs: any[],
  schema: ZodSchema<T>
): { valid: T[], invalid: Array<{ index: number, errors: ValidationError[] }> } {
  const valid: T[] = []
  const invalid: Array<{ index: number, errors: ValidationError[] }> = []

  inputs.forEach((input, index) => {
    try {
      const validatedInput = schema.parse(input)
      valid.push(validatedInput)
    } catch (error) {
      if (error instanceof ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code
        }))
        invalid.push({ index, errors: validationErrors })
      }
    }
  })

  return { valid, invalid }
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(
  identifier: string,
  limit: number,
  windowMs: number,
  requestTimestamp: number = Date.now()
): boolean {
  // This is a simplified in-memory rate limiter
  // In production, use Redis or another persistent store
  
  const key = `rate_limit:${identifier}`
  const requests = getRateLimitRequests(key)
  
  // Remove expired requests
  const validRequests = requests.filter(
    timestamp => timestamp > requestTimestamp - windowMs
  )
  
  if (validRequests.length >= limit) {
    return false
  }
  
  // Add current request
  validRequests.push(requestTimestamp)
  setRateLimitRequests(key, validRequests)
  
  return true
}

// Simple in-memory store for rate limiting (use Redis in production)
const rateLimitStore = new Map<string, number[]>()

function getRateLimitRequests(key: string): number[] {
  return rateLimitStore.get(key) || []
}

function setRateLimitRequests(key: string, requests: number[]): void {
  rateLimitStore.set(key, requests)
  
  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    const keysToDelete = Array.from(rateLimitStore.keys()).slice(0, 1000)
    keysToDelete.forEach(k => rateLimitStore.delete(k))
  }
}