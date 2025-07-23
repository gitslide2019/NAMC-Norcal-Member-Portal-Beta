import { GET as healthGET } from '../route'
import { GET as redisHealthGET } from '../redis/route'

describe('Health Check API Integration Tests', () => {
  describe('GET /api/health', () => {
    it('should return healthy status when all services are operational', async () => {
      const request = new Request('http://localhost:3000/api/health', {
        method: 'GET'
      })

      const response = await healthGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.status).toBe('healthy')
      expect(data.data.services).toHaveProperty('database')
      expect(data.data.services).toHaveProperty('redis')
      expect(data.data.timestamp).toBeDefined()
      
      // Database should be healthy in test environment
      expect(data.data.services.database.status).toBe('healthy')
      expect(data.data.services.database.responseTime).toBeGreaterThan(0)
      
      // Redis might be healthy or unavailable in test environment
      expect(['healthy', 'unavailable']).toContain(data.data.services.redis.status)
    })

    it('should include response time metrics', async () => {
      const request = new Request('http://localhost:3000/api/health', {
        method: 'GET'
      })

      const response = await healthGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.data.services.database.responseTime).toBeGreaterThan(0)
      expect(typeof data.data.services.database.responseTime).toBe('number')
      
      if (data.data.services.redis.status === 'healthy') {
        expect(data.data.services.redis.responseTime).toBeGreaterThan(0)
        expect(typeof data.data.services.redis.responseTime).toBe('number')
      }
    })

    it('should return proper headers', async () => {
      const request = new Request('http://localhost:3000/api/health', {
        method: 'GET'
      })

      const response = await healthGET(request)

      expect(response.headers.get('content-type')).toContain('application/json')
      expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate')
    })
  })

  describe('GET /api/health/redis', () => {
    it('should return Redis connection status', async () => {
      const request = new Request('http://localhost:3000/api/health/redis', {
        method: 'GET'
      })

      const response = await redisHealthGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data).toHaveProperty('redis')
      expect(data.data.redis).toHaveProperty('status')
      expect(data.data.redis).toHaveProperty('responseTime')
      expect(data.data.timestamp).toBeDefined()
      
      // Redis status should be either healthy or unavailable
      expect(['healthy', 'unavailable']).toContain(data.data.redis.status)
      
      if (data.data.redis.status === 'healthy') {
        expect(data.data.redis.responseTime).toBeGreaterThan(0)
        expect(data.data.redis.info).toBeDefined()
      }
    })

    it('should handle Redis connection failures gracefully', async () => {
      const request = new Request('http://localhost:3000/api/health/redis', {
        method: 'GET'
      })

      const response = await redisHealthGET(request)
      const data = await response.json()

      // Even if Redis is unavailable, the endpoint should return 200
      // This is because health checks should report status, not fail
      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      
      if (data.data.redis.status === 'unavailable') {
        expect(data.data.redis.error).toBeDefined()
        expect(typeof data.data.redis.error).toBe('string')
      }
    })

    it('should include proper cache headers for health endpoint', async () => {
      const request = new Request('http://localhost:3000/api/health/redis', {
        method: 'GET'
      })

      const response = await redisHealthGET(request)

      expect(response.headers.get('content-type')).toContain('application/json')
      expect(response.headers.get('cache-control')).toBe('no-cache, no-store, must-revalidate')
    })
  })

  describe('Health Check Response Format', () => {
    it('should follow consistent response structure', async () => {
      const request = new Request('http://localhost:3000/api/health', {
        method: 'GET'
      })

      const response = await healthGET(request)
      const data = await response.json()

      // Verify standard API response structure
      expect(data).toHaveProperty('success')
      expect(data).toHaveProperty('data')
      expect(data).toHaveProperty('message')
      expect(data).toHaveProperty('meta')
      
      // Verify meta information
      expect(data.meta).toHaveProperty('timestamp')
      expect(data.meta).toHaveProperty('requestId')
      
      // Verify health-specific data structure
      expect(data.data).toHaveProperty('status')
      expect(data.data).toHaveProperty('services')
      expect(data.data).toHaveProperty('timestamp')
      expect(data.data).toHaveProperty('uptime')
    })
  })
})