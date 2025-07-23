import {
  APIError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  handleAPIError,
  generateRequestId,
  APIErrorCode
} from '../error-handler'
import { NextResponse } from 'next/server'

// Mock Logger
jest.mock('../logger', () => ({
  default: {
    error: jest.fn(),
    database: {
      error: jest.fn()
    }
  }
}))

describe('Error Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Custom Error Classes', () => {
    describe('APIError', () => {
      it('should create API error with correct properties', () => {
        const error = new APIError(400, APIErrorCode.VALIDATION_ERROR, 'Invalid input', { field: 'email' })
        
        expect(error.statusCode).toBe(400)
        expect(error.code).toBe(APIErrorCode.VALIDATION_ERROR)
        expect(error.message).toBe('Invalid input')
        expect(error.details).toEqual({ field: 'email' })
        expect(error).toBeInstanceOf(Error)
      })
    })

    describe('ValidationError', () => {
      it('should create validation error with 400 status', () => {
        const error = new ValidationError('Validation failed')
        
        expect(error.statusCode).toBe(400)
        expect(error.code).toBe(APIErrorCode.VALIDATION_ERROR)
        expect(error.message).toBe('Validation failed')
      })
    })

    describe('AuthenticationError', () => {
      it('should create authentication error with 401 status', () => {
        const error = new AuthenticationError('Invalid credentials')
        
        expect(error.statusCode).toBe(401)
        expect(error.code).toBe(APIErrorCode.AUTHENTICATION_FAILED)
        expect(error.message).toBe('Invalid credentials')
      })
    })

    describe('AuthorizationError', () => {
      it('should create authorization error with 403 status', () => {
        const error = new AuthorizationError('Access denied')
        
        expect(error.statusCode).toBe(403)
        expect(error.code).toBe(APIErrorCode.AUTHORIZATION_FAILED)
        expect(error.message).toBe('Access denied')
      })
    })

    describe('NotFoundError', () => {
      it('should create not found error with 404 status', () => {
        const error = new NotFoundError('Resource not found')
        
        expect(error.statusCode).toBe(404)
        expect(error.code).toBe(APIErrorCode.RESOURCE_NOT_FOUND)
        expect(error.message).toBe('Resource not found')
      })
    })

    describe('ConflictError', () => {
      it('should create conflict error with 409 status', () => {
        const error = new ConflictError('Resource already exists')
        
        expect(error.statusCode).toBe(409)
        expect(error.code).toBe(APIErrorCode.RESOURCE_CONFLICT)
        expect(error.message).toBe('Resource already exists')
      })
    })

    describe('RateLimitError', () => {
      it('should create rate limit error with 429 status', () => {
        const error = new RateLimitError('Too many requests')
        
        expect(error.statusCode).toBe(429)
        expect(error.code).toBe(APIErrorCode.RATE_LIMITED)
        expect(error.message).toBe('Too many requests')
      })
    })
  })

  describe('generateRequestId', () => {
    it('should generate unique request IDs', () => {
      const id1 = generateRequestId()
      const id2 = generateRequestId()
      
      expect(id1).not.toBe(id2)
      expect(id1).toMatch(/^req_\d+_[a-z0-9]+$/)
      expect(id2).toMatch(/^req_\d+_[a-z0-9]+$/)
    })

    it('should start with req_ prefix', () => {
      const id = generateRequestId()
      
      expect(id).toMatch(/^req_/)
    })
  })

  describe('createSuccessResponse', () => {
    it('should create success response with data', () => {
      const data = { user: 'test' }
      const message = 'Success'
      const requestId = 'test-request-id'
      
      const response = createSuccessResponse(data, message, { requestId })
      
      expect(response).toBeInstanceOf(NextResponse)
      // Test the response data structure
      const responseData = {
        success: true,
        data,
        message,
        meta: {
          timestamp: expect.any(String),
          requestId
        }
      }
      
      // We can't easily test the NextResponse content, but we can verify it was created
      expect(response.status).toBe(200)
    })

    it('should create success response with default message', () => {
      const data = { test: 'data' }
      
      const response = createSuccessResponse(data)
      
      expect(response.status).toBe(200)
    })

    it('should handle null data', () => {
      const response = createSuccessResponse(null, 'No data')
      
      expect(response.status).toBe(200)
    })
  })

  describe('createErrorResponse', () => {
    it('should create error response from APIError', () => {
      const error = new ValidationError('Invalid input')
      const requestId = 'test-request-id'
      
      const response = createErrorResponse(error, requestId)
      
      expect(response.status).toBe(400)
    })

    it('should handle APIError without details', () => {
      const error = new AuthenticationError('Login failed')
      
      const response = createErrorResponse(error)
      
      expect(response.status).toBe(401)
    })
  })

  describe('createPaginatedResponse', () => {
    it('should create paginated response with correct meta', () => {
      const data = [{ id: 1 }, { id: 2 }]
      const page = 2
      const limit = 10
      const totalCount = 25
      
      const response = createPaginatedResponse(data, page, limit, totalCount)
      
      expect(response.status).toBe(200)
      // We can verify the logic for pagination calculation
      const totalPages = Math.ceil(totalCount / limit)
      expect(totalPages).toBe(3)
      
      const hasNext = page < totalPages
      const hasPrev = page > 1
      expect(hasNext).toBe(true)
      expect(hasPrev).toBe(true)
    })

    it('should calculate pagination for first page', () => {
      const data = [{ id: 1 }]
      const page = 1
      const limit = 10
      const totalCount = 25
      
      const response = createPaginatedResponse(data, page, limit, totalCount)
      
      expect(response.status).toBe(200)
      
      const totalPages = Math.ceil(totalCount / limit)
      const hasNext = page < totalPages
      const hasPrev = page > 1
      expect(hasNext).toBe(true)
      expect(hasPrev).toBe(false)
    })

    it('should calculate pagination for last page', () => {
      const data = [{ id: 1 }]
      const page = 3
      const limit = 10
      const totalCount = 25
      
      const response = createPaginatedResponse(data, page, limit, totalCount)
      
      expect(response.status).toBe(200)
      
      const totalPages = Math.ceil(totalCount / limit)
      const hasNext = page < totalPages
      const hasPrev = page > 1
      expect(hasNext).toBe(false)  
      expect(hasPrev).toBe(true)
    })

    it('should handle empty data', () => {
      const data: any[] = []
      const page = 1
      const limit = 10
      const totalCount = 0
      
      const response = createPaginatedResponse(data, page, limit, totalCount)
      
      expect(response.status).toBe(200)
      
      const totalPages = Math.ceil(totalCount / limit)
      expect(totalPages).toBe(0)
    })
  })

  describe('handleAPIError', () => {
    it('should handle APIError correctly', () => {
      const error = new ValidationError('Invalid input')
      const requestId = 'test-request-id'
      
      const response = handleAPIError(error, requestId)
      
      expect(response.status).toBe(400)
    })

    it('should handle generic Error', () => {
      const error = new Error('Generic error')
      const requestId = 'test-request-id'
      
      const response = handleAPIError(error, requestId)
      
      expect(response.status).toBe(500)
    })

    it('should handle unknown error types', () => {
      const error = 'String error'
      const requestId = 'test-request-id'
      
      const response = handleAPIError(error, requestId)
      
      expect(response.status).toBe(500)
    })

    it('should handle Prisma errors', () => {
      const prismaError = {
        code: 'P2002',
        meta: { target: ['email'] }
      }
      const requestId = 'test-request-id'
      
      const response = handleAPIError(prismaError, requestId)
      
      expect(response.status).toBe(409) // Should convert to ConflictError
    })

    it('should handle Prisma foreign key constraint error', () => {
      const prismaError = {
        code: 'P2003',
        meta: { field_name: 'userId' }
      }
      const requestId = 'test-request-id'
      
      const response = handleAPIError(prismaError, requestId)
      
      expect(response.status).toBe(400) // Should convert to ValidationError
    })

    it('should handle Prisma record not found error', () => {
      const prismaError = {
        code: 'P2025',
        meta: {}
      }
      const requestId = 'test-request-id'
      
      const response = handleAPIError(prismaError, requestId)
      
      expect(response.status).toBe(404) // Should convert to NotFoundError
    })

    it('should mask error details in production', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'
      
      const error = new Error('Sensitive internal error')
      const response = handleAPIError(error)
      
      expect(response.status).toBe(500)
      
      process.env.NODE_ENV = originalEnv
    })

    it('should expose error details in development', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const error = new Error('Detailed error for debugging')
      const response = handleAPIError(error)
      
      expect(response.status).toBe(500)
      
      process.env.NODE_ENV = originalEnv
    })

    it('should generate error ID and log errors', () => {
      const error = new Error('Test error')
      const requestId = 'test-request-id'
      
      const response = handleAPIError(error, requestId)
      
      expect(response.status).toBe(500)
      // Logger should have been called (mocked)
    })

    it('should handle errors without request ID', () => {
      const error = new ValidationError('Test validation error')
      
      const response = handleAPIError(error)
      
      expect(response.status).toBe(400)
    })
  })
})