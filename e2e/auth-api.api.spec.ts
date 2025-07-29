import { test, expect } from '@playwright/test'

test.describe('Authentication API', () => {
  const baseURL = 'http://localhost:3001/api'

  test('should login with valid admin credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'admin@namc-norcal.org',
        password: 'password123',
        rememberMe: false
      }
    })

    expect(response.status()).toBe(200)

    const responseBody = await response.json()
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.user.email).toBe('admin@namc-norcal.org')
    expect(responseBody.data.user.memberType).toBe('admin')
    expect(responseBody.data.user.firstName).toBe('System')
    expect(responseBody.data.user.lastName).toBe('Administrator')
    expect(responseBody.data.token).toBeDefined()
    expect(responseBody.message).toBe('Login successful')
  })

  test('should login with valid member credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'maria.johnson@example.com',
        password: 'password123',
        rememberMe: false
      }
    })

    expect(response.status()).toBe(200)

    const responseBody = await response.json()
    expect(responseBody.success).toBe(true)
    expect(responseBody.data.user.email).toBe('maria.johnson@example.com')
    expect(responseBody.data.user.memberType).toBe('REGULAR')
    expect(responseBody.data.user.firstName).toBe('Maria')
    expect(responseBody.data.user.lastName).toBe('Johnson')
    expect(responseBody.data.token).toBeDefined()
  })

  test('should reject invalid credentials', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    })

    expect(response.status()).toBe(401)

    const responseBody = await response.json()
    expect(responseBody.success).toBe(false)
    expect(responseBody.message).toBe('Invalid email or password')
    expect(responseBody.error.code).toBe('AUTHENTICATION_FAILED')
  })

  test('should reject missing email', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        password: 'password123'
      }
    })

    expect(response.status()).toBe(400)
  })

  test('should reject missing password', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'admin@namc-norcal.org'
      }
    })

    expect(response.status()).toBe(400)
  })

  test('should verify authentication with valid token', async ({ request }) => {
    // First login to get a token
    const loginResponse = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'admin@namc-norcal.org',
        password: 'password123'
      }
    })

    const loginData = await loginResponse.json()
    const token = loginData.data.token

    // Use token to access /me endpoint
    const meResponse = await request.get(`${baseURL}/auth/me`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    expect(meResponse.status()).toBe(200)

    const meData = await meResponse.json()
    expect(meData.success).toBe(true)
    expect(meData.user.email).toBe('admin@namc-norcal.org')
    expect(meData.user.memberType).toBe('admin')
  })

  test('should reject invalid token', async ({ request }) => {
    const response = await request.get(`${baseURL}/auth/me`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    })

    expect(response.status()).toBe(401)

    const responseBody = await response.json()
    expect(responseBody.success).toBe(false)
    expect(responseBody.message).toBe('Invalid or expired token')
  })

  test('should reject request without token', async ({ request }) => {
    const response = await request.get(`${baseURL}/auth/me`)

    expect(response.status()).toBe(401)

    const responseBody = await response.json()
    expect(responseBody.success).toBe(false)
    expect(responseBody.message).toBe('No authentication token provided')
  })

  test('should set httpOnly cookie on login', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'admin@namc-norcal.org',
        password: 'password123',
        rememberMe: true
      }
    })

    expect(response.status()).toBe(200)

    // Check that Set-Cookie header is present
    const setCookieHeader = response.headers()['set-cookie']
    expect(setCookieHeader).toBeDefined()
    expect(setCookieHeader).toContain('namc-auth-token=')
    expect(setCookieHeader).toContain('HttpOnly')
    expect(setCookieHeader).toContain('SameSite=Strict')
  })

  test('should verify authentication with cookie', async ({ request }) => {
    // First login to get cookie
    const loginResponse = await request.post(`${baseURL}/auth/login`, {
      data: {
        email: 'admin@namc-norcal.org',
        password: 'password123'
      }
    })

    expect(loginResponse.status()).toBe(200)

    // Extract cookie value
    const setCookieHeader = loginResponse.headers()['set-cookie']
    const cookieMatch = setCookieHeader?.match(/namc-auth-token=([^;]+)/)
    const cookieValue = cookieMatch?.[1]

    expect(cookieValue).toBeDefined()

    // Use cookie to access /me endpoint
    const meResponse = await request.get(`${baseURL}/auth/me`, {
      headers: {
        'Cookie': `namc-auth-token=${cookieValue}`
      }
    })

    expect(meResponse.status()).toBe(200)

    const meData = await meResponse.json()
    expect(meData.success).toBe(true)
    expect(meData.user.email).toBe('admin@namc-norcal.org')
  })

  test('should handle malformed JSON', async ({ request }) => {
    const response = await request.post(`${baseURL}/auth/login`, {
      data: 'invalid json'
    })

    expect(response.status()).toBe(400)
  })

  test('should rate limit excessive login attempts', async ({ request }) => {
    // Make multiple rapid login attempts
    const promises = []
    for (let i = 0; i < 10; i++) {
      promises.push(
        request.post(`${baseURL}/auth/login`, {
          data: {
            email: 'invalid@example.com',
            password: 'wrongpassword'
          }
        })
      )
    }

    const responses = await Promise.all(promises)
    
    // At least one should be rate limited
    const rateLimitedResponses = responses.filter(r => r.status() === 429)
    expect(rateLimitedResponses.length).toBeGreaterThan(0)
  })
})