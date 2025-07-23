import request from 'supertest'
import { NextRequest } from 'next/server'
import { POST as loginPOST } from '../login/route'
import { POST as registerPOST } from '../register/route'
import { GET as meGET } from '../me/route'
import { POST as logoutPOST } from '../logout/route'
import { prisma } from '@/lib/prisma'

// Mock Next.js App for supertest
const mockApp = {
  post: (path: string, handler: Function) => ({
    request: (body: any, headers: any = {}) => 
      handler(new NextRequest(`http://localhost:3000${path}`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          ...headers
        },
        body: JSON.stringify(body)
      }))
  }),
  get: (path: string, handler: Function) => ({
    request: (headers: any = {}) =>
      handler(new NextRequest(`http://localhost:3000${path}`, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
          ...headers
        }
      }))
  })
}

describe('Authentication API Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const userData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        password: 'Password123!',
        company: 'Test Company',
        agreeToTerms: true
      }

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe(userData.email)
      expect(data.data.user.firstName).toBe(userData.firstName)
      expect(data.data.user.lastName).toBe(userData.lastName)
      expect(data.data.user.password).toBeUndefined() // Password should not be returned

      // Verify user was created in database
      const dbUser = await prisma.user.findUnique({
        where: { email: userData.email }
      })
      expect(dbUser).toBeTruthy()
      expect(dbUser?.isActive).toBe(true)
      expect(dbUser?.isVerified).toBe(false) // Should require email verification
    })

    it('should prevent duplicate email registration', async () => {
      // Create initial user
      await global.integrationTestUtils.createTestUser({
        email: 'duplicate@example.com'
      })

      const userData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'duplicate@example.com',
        password: 'Password123!',
        company: 'Test Company',
        agreeToTerms: true
      }

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('RESOURCE_CONFLICT')
    })

    it('should validate required fields', async () => {
      const invalidData = {
        firstName: 'John',
        // Missing required fields
      }

      const request = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invalidData)
      })

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      // Create verified test user
      const testUser = await global.integrationTestUtils.createTestUser({
        email: 'login.test@example.com',
        isVerified: true
      })

      const loginData = {
        email: testUser.email,
        password: testUser.originalPassword,
        rememberMe: false
      }

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.email).toBe(testUser.email)
      expect(data.data.token).toBeDefined()
      expect(data.data.user.password).toBeUndefined()

      // Check that auth cookie is set
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('namc-auth-token')

      // Verify audit log was created
      const auditLog = await prisma.adminAction.findFirst({
        where: {
          action: 'USER_LOGIN',
          userId: testUser.id
        }
      })
      expect(auditLog).toBeTruthy()
    })

    it('should reject invalid credentials', async () => {
      const testUser = await global.integrationTestUtils.createTestUser({
        email: 'invalid.test@example.com',
        isVerified: true
      })

      const loginData = {
        email: testUser.email,
        password: 'WrongPassword123!',
        rememberMe: false
      }

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('AUTHENTICATION_FAILED')
    })

    it('should reject login for unverified users', async () => {
      const testUser = await global.integrationTestUtils.createTestUser({
        email: 'unverified.test@example.com',
        isVerified: false
      })

      const loginData = {
        email: testUser.email,
        password: testUser.originalPassword,
        rememberMe: false
      }

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('AUTHENTICATION_FAILED')
    })

    it('should reject login for inactive users', async () => {
      const testUser = await global.integrationTestUtils.createTestUser({
        email: 'inactive.test@example.com',
        isActive: false,
        isVerified: true
      })

      const loginData = {
        email: testUser.email,
        password: testUser.originalPassword,
        rememberMe: false
      }

      const request = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData)
      })

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return current user data with valid token', async () => {
      const testUser = await global.integrationTestUtils.createTestUser({
        email: 'me.test@example.com',
        isVerified: true
      })

      const authHeaders = await global.integrationTestUtils.getAuthHeaders(testUser)

      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: authHeaders
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.user.id).toBe(testUser.id)
      expect(data.data.user.email).toBe(testUser.email)
      expect(data.data.user.password).toBeUndefined()
    })

    it('should reject request without authentication', async () => {
      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('AUTHENTICATION_FAILED')
    })

    it('should reject request with invalid token', async () => {
      const request = new Request('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json'
        }
      })

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('AUTHENTICATION_FAILED')
    })
  })

  describe('POST /api/auth/logout', () => {
    it('should successfully logout and clear auth cookie', async () => {
      const request = new Request('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const response = await logoutPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Logged out successfully')

      // Check that auth cookie is cleared
      const setCookieHeader = response.headers.get('set-cookie')
      expect(setCookieHeader).toContain('namc-auth-token=; Max-Age=0')
    })
  })

  describe('Authentication Flow Integration', () => {
    it('should complete full registration -> verification -> login flow', async () => {
      // Step 1: Register new user
      const userData = {
        firstName: 'Flow',
        lastName: 'Test',
        email: 'flow.test@example.com',
        password: 'Password123!',
        company: 'Flow Test Company',
        agreeToTerms: true
      }

      const registerRequest = new Request('http://localhost:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      const registerResponse = await registerPOST(registerRequest)
      const registerData = await registerResponse.json()

      expect(registerResponse.status).toBe(201)
      expect(registerData.success).toBe(true)

      // Step 2: Manually verify user (simulating email verification)
      await prisma.user.update({
        where: { email: userData.email },
        data: { isVerified: true }
      })

      // Step 3: Login with registered credentials
      const loginRequest = new Request('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          rememberMe: false
        })
      })

      const loginResponse = await loginPOST(loginRequest)
      const loginData = await loginResponse.json()

      expect(loginResponse.status).toBe(200)
      expect(loginData.success).toBe(true)
      expect(loginData.data.user.email).toBe(userData.email)

      // Step 4: Access protected endpoint
      const meRequest = new Request('http://localhost:3000/api/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.data.token}`,
          'Content-Type': 'application/json'
        }
      })

      const meResponse = await meGET(meRequest)
      const meData = await meResponse.json()

      expect(meResponse.status).toBe(200)
      expect(meData.success).toBe(true)
      expect(meData.data.user.email).toBe(userData.email)

      // Step 5: Logout
      const logoutRequest = new Request('http://localhost:3000/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const logoutResponse = await logoutPOST(logoutRequest)
      const logoutData = await logoutResponse.json()

      expect(logoutResponse.status).toBe(200)
      expect(logoutData.success).toBe(true)
    })
  })
})