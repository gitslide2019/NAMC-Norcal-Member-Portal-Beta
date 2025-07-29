import { POST as loginPOST } from '../login/route'
import { POST as registerPOST } from '../register/route'
import { GET as meGET } from '../me/route'

// Mock the dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn()
    }
  }
}))

jest.mock('@/lib/auth', () => ({
  AuthService: {
    authenticateUser: jest.fn(),
    generateToken: jest.fn().mockReturnValue('mock-jwt-token'),
    hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    getUserFromToken: jest.fn(),
    logAuthAction: jest.fn()
  }
}))

jest.mock('@/lib/email', () => ({
  emailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue({ 
      success: true, 
      messageId: 'mock-message-id' 
    }),
    sendWelcomeEmail: jest.fn().mockResolvedValue({ 
      success: true, 
      messageId: 'mock-welcome-id' 
    })
  }
}))

jest.mock('@/lib/security', () => ({
  generateSecureSessionId: jest.fn().mockReturnValue('mock-verification-token')
}))

jest.mock('@/lib/logger', () => {
  const mockLogger = {
    auth: {
      login: jest.fn(),
      emailVerification: jest.fn()
    },
    email: {
      failed: jest.fn()
    },
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn()
  }
  return {
    default: mockLogger,
    __esModule: true
  }
})

describe('Authentication API Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/register', () => {
    it('should successfully register a new user', async () => {
      const { prisma } = require('@/lib/prisma')
      
      // Mock no existing user found
      prisma.user.findUnique.mockResolvedValue(null)
      
      // Mock user creation
      const mockUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '555-0123',
        company: 'Test Company',
        title: 'Manager',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: false
      }
      prisma.user.create.mockResolvedValue(mockUser)

      // Create a proper mock request
      const request = {
        json: jest.fn().mockResolvedValue({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          company: 'Test Company',
          title: 'Manager',
          password: 'SecurePass123!@',
          agreeToTerms: true
        }),
        headers: {
          get: jest.fn().mockImplementation((name) => {
            const headers = {
              'x-forwarded-for': '127.0.0.1',
              'user-agent': 'Test Agent'
            }
            return headers[name] || null
          })
        }
      } as any

      const response = await registerPOST(request)
      const data = await response.json()

      // Debug: Log the actual response when test fails
      if (response.status !== 200) {
        console.log('Register response status:', response.status)
        console.log('Register response data:', data)
      }

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Registration successful. Please check your email to verify your account.')
      expect(data.data.user).toMatchObject({
        id: 'user-123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        company: 'Test Company',
        isVerified: false
      })
      expect(data.data.emailSent).toBe(true)

      // Verify user creation was called with correct data
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          company: 'Test Company',
          title: 'Manager',
          password: 'hashed-password',
          memberType: 'REGULAR',
          isActive: true,
          isVerified: false
        })
      })
    })

    it('should reject registration with existing email', async () => {
      const { prisma } = require('@/lib/prisma')
      
      // Mock existing user found
      prisma.user.findUnique.mockResolvedValue({
        id: 'existing-user',
        email: 'existing@example.com'
      })

      // Create a proper mock request
      const request = {
        json: jest.fn().mockResolvedValue({
          firstName: 'John',
          lastName: 'Doe',
          email: 'existing@example.com',
          phone: '555-123-4567',
          company: 'Test Company',
          title: 'Manager',
          password: 'SecurePass123!@',
          agreeToTerms: true
        }),
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(409)
      expect(data.success).toBe(false)
      expect(data.message).toBe('An account with this email already exists')
      
      // Verify user creation was not called
      expect(prisma.user.create).not.toHaveBeenCalled()
    })

    it('should handle email service failure gracefully', async () => {
      const { prisma } = require('@/lib/prisma')
      const { emailService } = require('@/lib/email')
      
      // Mock no existing user found
      prisma.user.findUnique.mockResolvedValue(null)
      
      // Mock user creation
      const mockUser = {
        id: 'user-123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        company: 'Test Company',
        isVerified: false
      }
      prisma.user.create.mockResolvedValue(mockUser)

      // Mock email service failure
      emailService.sendVerificationEmail.mockResolvedValue({
        success: false,
        error: 'Email service unavailable'
      })

      // Create a proper mock request
      const request = {
        json: jest.fn().mockResolvedValue({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-123-4567',
          company: 'Test Company',
          title: 'Manager',
          password: 'SecurePass123!@',
          agreeToTerms: true
        }),
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      const response = await registerPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.data.emailSent).toBe(false)
      
      // User should still be created despite email failure
      expect(prisma.user.create).toHaveBeenCalled()
    })
  })

  describe('POST /api/auth/login', () => {
    it('should successfully login with valid credentials', async () => {
      const { AuthService } = require('@/lib/auth')
      
      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true
      }
      
      AuthService.authenticateUser.mockResolvedValue(mockUser)

      // Create a proper mock request
      const request = {
        json: jest.fn().mockResolvedValue({
          email: 'john.doe@example.com',
          password: 'SecurePass123!@',
          agreeToTerms: true,
          rememberMe: false
        }),
        headers: {
          get: jest.fn().mockImplementation((name) => {
            const headers = {
              'x-forwarded-for': '127.0.0.1',
              'user-agent': 'Test Agent'
            }
            return headers[name] || null
          })
        }
      } as any

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toBe('Login successful')
      expect(data.data.user).toMatchObject({
        id: 'user-123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true
      })
      expect(data.data.token).toBe('mock-jwt-token')

      // Verify cookie was set (case insensitive)
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toContain('namc-auth-token=mock-jwt-token')
      expect(cookies).toContain('HttpOnly')
      expect(cookies).toMatch(/SameSite=strict/i)
    })

    it('should reject login with invalid credentials', async () => {
      const { AuthService } = require('@/lib/auth')
      
      AuthService.authenticateUser.mockResolvedValue(null)

      // Create a proper mock request
      const request = {
        json: jest.fn().mockResolvedValue({
          email: 'wrong@example.com',
          password: 'WrongPassword',
          rememberMe: false
        }),
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid email or password')
    })

    it('should set longer cookie duration when rememberMe is true', async () => {
      const { AuthService } = require('@/lib/auth')
      
      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true
      }
      
      AuthService.authenticateUser.mockResolvedValue(mockUser)

      // Create a proper mock request
      const request = {
        json: jest.fn().mockResolvedValue({
          email: 'john.doe@example.com',
          password: 'SecurePass123!@',
          agreeToTerms: true,
          rememberMe: true
        }),
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      const response = await loginPOST(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)

      // Verify cookie was set with longer max-age (30 days = 2592000 seconds)
      const cookies = response.headers.get('set-cookie')
      expect(cookies).toContain('Max-Age=2592000')
    })
  })

  describe('GET /api/auth/me', () => {
    it('should return user data with valid token from cookie', async () => {
      const { AuthService } = require('@/lib/auth')
      
      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true
      }
      
      AuthService.getUserFromToken.mockResolvedValue(mockUser)

      // Create a mock request with cookies
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue({ value: 'valid-jwt-token' })
        },
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject(mockUser)
      expect(data.token).toBe('valid-jwt-token')
    })

    it('should return user data with valid token from Authorization header', async () => {
      const { AuthService } = require('@/lib/auth')
      
      const mockUser = {
        id: 'user-123',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe'
      }
      
      AuthService.getUserFromToken.mockResolvedValue(mockUser)

      // Create a mock request with authorization header
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        },
        headers: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'authorization') return 'Bearer valid-jwt-token'
            return null
          })
        }
      } as any

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.user).toMatchObject(mockUser)
      expect(data.token).toBe('valid-jwt-token')
    })

    it('should reject request with no token', async () => {
      // Create a mock request with no token
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        },
        headers: {
          get: jest.fn().mockReturnValue(null)
        }
      } as any

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('No authentication token provided')
    })

    it('should reject request with invalid token', async () => {
      const { AuthService } = require('@/lib/auth')
      
      AuthService.getUserFromToken.mockResolvedValue(null)

      // Create a mock request with invalid token
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        },
        headers: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'authorization') return 'Bearer invalid-token'
            return null
          })
        }
      } as any

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Invalid or expired token')
    })

    it('should handle token verification errors gracefully', async () => {
      const { AuthService } = require('@/lib/auth')
      
      AuthService.getUserFromToken.mockRejectedValue(new Error('Token verification failed'))

      // Create a mock request with problematic token
      const request = {
        cookies: {
          get: jest.fn().mockReturnValue(undefined)
        },
        headers: {
          get: jest.fn().mockImplementation((name) => {
            if (name === 'authorization') return 'Bearer problematic-token'
            return null
          })
        }
      } as any

      const response = await meGET(request)
      const data = await response.json()

      expect(response.status).toBe(500)
      expect(data.success).toBe(false)
      expect(data.message).toBe('Authentication check failed')
    })
  })
})