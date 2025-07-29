/**
 * API Response Integration Tests
 * 
 * Integration tests for API response utilities:
 * - Response format standardization
 * - Error handling and transformation
 * - Rate limiting integration
 * - Validation integration
 * - Performance and reliability testing
 */

import { NextRequest, NextResponse } from 'next/server'
import { createApiResponse, ApiError, handleApiError } from '../response'
import { testUtils } from '@/test-utils/integration.setup'

describe('API Response Integration Tests', () => {
  let testPrisma: any

  beforeAll(async () => {
    testPrisma = await testUtils.setupTestDatabase()
  })

  afterAll(async () => {
    await testUtils.cleanupTestDatabase()
  })

  beforeEach(async () => {
    await testUtils.cleanupTestDatabase()
  })

  describe('createApiResponse', () => {
    it('should create successful response with correct structure', () => {
      const testData = { id: 1, name: 'Test' }
      const response = createApiResponse(testData, true, 'Success', 200)

      expect(response).toBeInstanceOf(NextResponse)
      
      // Parse the response to check structure
      const responseData = JSON.parse(response.body || '{}')
      testUtils.validateApiResponse(responseData)
      
      expect(responseData.success).toBe(true)
      expect(responseData.data).toEqual(testData)
      expect(responseData.message).toBe('Success')
    })

    it('should create error response with correct structure', () => {
      const response = createApiResponse(null, false, 'Error occurred', 400)

      expect(response.status).toBe(400)
      
      const responseData = JSON.parse(response.body || '{}')
      testUtils.validateApiResponse(responseData)
      
      expect(responseData.success).toBe(false)
      expect(responseData.data).toBeNull()
      expect(responseData.message).toBe('Error occurred')
    })

    it('should include request ID when provided', () => {
      const requestId = 'test-request-123'
      const response = createApiResponse({}, true, 'Success', 200, requestId)

      const responseData = JSON.parse(response.body || '{}')
      expect(responseData.requestId).toBe(requestId)
    })

    it('should include timestamp in response', () => {
      const response = createApiResponse({}, true, 'Success', 200)

      const responseData = JSON.parse(response.body || '{}')
      expect(responseData.timestamp).toBeDefined()
      expect(new Date(responseData.timestamp)).toBeInstanceOf(Date)
    })

    it('should set correct headers', () => {
      const response = createApiResponse({}, true, 'Success', 200)

      expect(response.headers.get('Content-Type')).toBe('application/json')
    })
  })

  describe('ApiError', () => {
    it('should create error with all properties', () => {
      const metadata = { field: 'name', value: 'invalid' }
      const error = new ApiError('Validation failed', 400, 'VALIDATION_ERROR', metadata)

      expect(error.message).toBe('Validation failed')
      expect(error.statusCode).toBe(400)
      expect(error.errorCode).toBe('VALIDATION_ERROR')
      expect(error.metadata).toEqual(metadata)
      expect(error.timestamp).toBeInstanceOf(Date)
    })

    it('should default to 500 status code', () => {
      const error = new ApiError('Internal error')

      expect(error.statusCode).toBe(500)
      expect(error.errorCode).toBe('INTERNAL_ERROR')
    })

    it('should be instance of Error', () => {
      const error = new ApiError('Test error')

      expect(error).toBeInstanceOf(Error)
      expect(error.name).toBe('ApiError')
    })
  })

  describe('handleApiError', () => {
    it('should handle ApiError correctly', () => {
      const apiError = new ApiError('Custom error', 422, 'CUSTOM_ERROR', { field: 'test' })
      const response = handleApiError(apiError)

      expect(response.status).toBe(422)
      
      const responseData = JSON.parse(response.body || '{}')
      expect(responseData.success).toBe(false)
      expect(responseData.message).toBe('Custom error')
      expect(responseData.error).toBe('CUSTOM_ERROR')
      expect(responseData.metadata).toEqual({ field: 'test' })
    })

    it('should handle generic Error', () => {
      const genericError = new Error('Generic error message')
      const response = handleApiError(genericError)

      expect(response.status).toBe(500)
      
      const responseData = JSON.parse(response.body || '{}')
      expect(responseData.success).toBe(false)
      expect(responseData.message).toBe('Generic error message')
      expect(responseData.error).toBe('INTERNAL_ERROR')
    })

    it('should handle unknown error types', () => {
      const unknownError = 'String error'
      const response = handleApiError(unknownError)

      expect(response.status).toBe(500)
      
      const responseData = JSON.parse(response.body || '{}')
      expect(responseData.success).toBe(false)
      expect(responseData.message).toBe('An unexpected error occurred')
      expect(responseData.error).toBe('UNKNOWN_ERROR')
    })

    it('should include error timestamp', () => {
      const error = new Error('Test error')
      const response = handleApiError(error)

      const responseData = JSON.parse(response.body || '{}')
      expect(responseData.timestamp).toBeDefined()
      expect(new Date(responseData.timestamp)).toBeInstanceOf(Date)
    })

    it('should log errors in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      
      const error = new Error('Test error')
      handleApiError(error)

      expect(consoleSpy).toHaveBeenCalledWith('API Error:', error)
      
      consoleSpy.mockRestore()
      process.env.NODE_ENV = originalEnv
    })
  })

  describe('Real API Integration', () => {
    it('should handle successful workflow creation', async () => {
      // Seed test data
      const { adminUser } = await testUtils.seedTestData()
      const token = testUtils.generateTestToken(adminUser.id, 'admin')

      const workflowData = testUtils.factories.createWorkflow({
        name: 'Integration Test Workflow',
        type: 'member_onboarding'
      })

      // Mock fetch to simulate API call
      const mockRequest = new NextRequest('http://localhost:3000/api/hubspot/workflows', {
        method: 'POST',
        headers: testUtils.createAuthHeaders(token),
        body: JSON.stringify(workflowData)
      })

      // Simulate workflow creation
      const workflow = await testPrisma.hubSpotWorkflow.create({
        data: workflowData
      })

      const response = createApiResponse(workflow, true, 'Workflow created successfully', 201)

      expect(response.status).toBe(201)
      
      const responseData = JSON.parse(response.body || '{}')
      testUtils.validateApiResponse(responseData)
      expect(responseData.data.name).toBe('Integration Test Workflow')
      expect(responseData.data.type).toBe('member_onboarding')
    })

    it('should handle validation errors in workflow creation', async () => {
      const { adminUser } = await testUtils.seedTestData()
      const token = testUtils.generateTestToken(adminUser.id, 'admin')

      const invalidWorkflowData = {
        name: '', // Invalid: empty name
        type: 'invalid_type' // Invalid: wrong type
      }

      try {
        await testPrisma.hubSpotWorkflow.create({
          data: invalidWorkflowData
        })
      } catch (error) {
        const apiError = new ApiError(
          'Validation failed',
          400,
          'VALIDATION_ERROR',
          {
            validationErrors: [
              { field: 'name', message: 'Name is required' },
              { field: 'type', message: 'Invalid workflow type' }
            ]
          }
        )

        const response = handleApiError(apiError)
        
        expect(response.status).toBe(400)
        
        const responseData = JSON.parse(response.body || '{}')
        expect(responseData.metadata.validationErrors).toHaveLength(2)
      }
    })

    it('should handle database connection errors', async () => {
      // Simulate database connection error
      const mockDbError = new Error('Connection to database failed')
      mockDbError.name = 'PrismaClientKnownRequestError'

      const response = handleApiError(mockDbError)

      expect(response.status).toBe(500)
      
      const responseData = JSON.parse(response.body || '{}')
      expect(responseData.success).toBe(false)
      expect(responseData.message).toBe('Connection to database failed')
    })

    it('should handle large response data efficiently', () => {
      // Create large dataset
      const largeDataset = Array(1000).fill(null).map((_, i) => ({
        id: `item-${i}`,
        name: `Item ${i}`,
        description: `This is item number ${i} with some additional data`,
        metadata: {
          created: new Date(),
          index: i,
          tags: [`tag-${i}`, `category-${i % 10}`]
        }
      }))

      const startTime = performance.now()
      const response = createApiResponse(largeDataset, true, 'Large dataset retrieved')
      const endTime = performance.now()

      expect(endTime - startTime).toBeLessThan(100) // Should be fast
      expect(response.status).toBe(200)
      
      const responseData = JSON.parse(response.body || '{}')
      expect(responseData.data).toHaveLength(1000)
    })
  })

  describe('Error Recovery and Resilience', () => {
    it('should handle JSON parsing errors gracefully', () => {
      // Simulate a situation where response data can't be serialized
      const circularData = { name: 'test' }
      circularData.self = circularData // Create circular reference

      try {
        createApiResponse(circularData)
      } catch (error) {
        const response = handleApiError(error)
        
        expect(response.status).toBe(500)
        
        const responseData = JSON.parse(response.body || '{}')
        expect(responseData.success).toBe(false)
      }
    })

    it('should handle memory pressure gracefully', () => {
      // Create a very large object to test memory handling
      const largeObject = {
        data: Array(10000).fill(null).map((_, i) => ({
          id: i,
          payload: 'x'.repeat(1000) // 1KB per item = ~10MB total
        }))
      }

      const response = createApiResponse(largeObject)

      expect(response).toBeInstanceOf(NextResponse)
      expect(response.status).toBe(200)
    })

    it('should maintain response consistency under load', async () => {
      // Simulate multiple concurrent API responses
      const responses = await Promise.all(
        Array(100).fill(null).map(async (_, i) => {
          const data = { id: i, name: `Item ${i}` }
          return createApiResponse(data, true, `Success ${i}`)
        })
      )

      responses.forEach((response, i) => {
        expect(response.status).toBe(200)
        
        const responseData = JSON.parse(response.body || '{}')
        testUtils.validateApiResponse(responseData)
        expect(responseData.data.id).toBe(i)
      })
    })
  })

  describe('Performance Benchmarks', () => {
    it('should create responses within performance budget', async () => {
      const testData = { message: 'Performance test' }
      
      const measurements = await Promise.all(
        Array(1000).fill(null).map(async () => {
          return testUtils.measureApiPerformance(() => {
            return Promise.resolve(createApiResponse(testData))
          })
        })
      )

      const averageDuration = measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length

      expect(averageDuration).toBeLessThan(1) // Should be sub-millisecond
      
      // All responses should be successful
      measurements.forEach(({ result }) => {
        expect(result.status).toBe(200)
      })
    })

    it('should handle error responses efficiently', async () => {
      const testError = new ApiError('Performance test error', 400, 'TEST_ERROR')
      
      const measurements = await Promise.all(
        Array(1000).fill(null).map(async () => {
          return testUtils.measureApiPerformance(() => {
            return Promise.resolve(handleApiError(testError))
          })
        })
      )

      const averageDuration = measurements.reduce((sum, m) => sum + m.duration, 0) / measurements.length

      expect(averageDuration).toBeLessThan(2) // Error handling should be fast
      
      // All error responses should be consistent
      measurements.forEach(({ result }) => {
        expect(result.status).toBe(400)
      })
    })
  })
})