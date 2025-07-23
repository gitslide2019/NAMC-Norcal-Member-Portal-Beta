import { AuthService } from '../auth'
import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Mock dependencies
jest.mock('../prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    adminAction: {
      create: jest.fn(),
    },
  },
}))

jest.mock('bcryptjs')
jest.mock('jsonwebtoken')

const mockPrisma = prisma as jest.Mocked<typeof prisma>
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>
const mockJwt = jwt as jest.Mocked<typeof jwt>

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only-minimum-32-characters'
  })

  describe('hashPassword', () => {
    it('should hash password with 12 salt rounds', async () => {
      const password = 'testpassword123'
      const hashedPassword = 'hashed_password'
      
      mockBcrypt.hash.mockResolvedValue(hashedPassword as never)

      const result = await AuthService.hashPassword(password)

      expect(mockBcrypt.hash).toHaveBeenCalledWith(password, 12)
      expect(result).toBe(hashedPassword)
    })

    it('should throw error if hashing fails', async () => {
      const password = 'testpassword123'
      const error = new Error('Hashing failed')
      
      mockBcrypt.hash.mockRejectedValue(error as never)

      await expect(AuthService.hashPassword(password)).rejects.toThrow('Hashing failed')
    })
  })

  describe('comparePassword', () => {
    it('should return true for valid password', async () => {
      const password = 'testpassword123'
      const hash = 'hashed_password'
      
      mockBcrypt.compare.mockResolvedValue(true as never)

      const result = await AuthService.comparePassword(password, hash)

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(true)
    })

    it('should return false for invalid password', async () => {
      const password = 'wrongpassword'
      const hash = 'hashed_password'
      
      mockBcrypt.compare.mockResolvedValue(false as never)

      const result = await AuthService.comparePassword(password, hash)

      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, hash)
      expect(result).toBe(false)
    })
  })

  describe('generateToken', () => {
    it('should generate JWT token with correct payload', () => {
      const user = global.testUtils.createMockUser()
      const token = 'jwt_token'
      
      mockJwt.sign.mockReturnValue(token as never)

      const result = AuthService.generateToken(user)

      expect(mockJwt.sign).toHaveBeenCalledWith(
        {
          userId: user.id,
          email: user.email,
          memberType: user.memberType,
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      )
      expect(result).toBe(token)
    })

    it('should throw error if JWT_SECRET is missing', () => {
      delete process.env.JWT_SECRET
      const user = global.testUtils.createMockUser()

      expect(() => AuthService.generateToken(user)).toThrow('JWT_SECRET environment variable is required')
    })

    it('should throw error if JWT_SECRET is too short', () => {
      process.env.JWT_SECRET = 'short'
      const user = global.testUtils.createMockUser()

      expect(() => AuthService.generateToken(user)).toThrow('JWT_SECRET must be at least 32 characters long')
    })
  })

  describe('verifyToken', () => {
    it('should return user payload for valid token', async () => {
      const token = 'valid_jwt_token'
      const payload = {
        userId: 'user-id',
        email: 'test@example.com',
        memberType: 'REGULAR',
      }
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true,
      }

      mockJwt.verify.mockReturnValue(payload as never)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await AuthService.verifyToken(token)

      expect(mockJwt.verify).toHaveBeenCalledWith(token, process.env.JWT_SECRET)
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          memberType: true,
          isActive: true,
          isVerified: true,
        },
      })
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        memberType: mockUser.memberType,
        isActive: mockUser.isActive,
        isVerified: mockUser.isVerified,
      })
    })

    it('should return null for invalid token', async () => {
      const token = 'invalid_jwt_token'
      
      mockJwt.verify.mockImplementation(() => {
        throw new Error('Invalid token')
      })

      const result = await AuthService.verifyToken(token)

      expect(result).toBeNull()
    })

    it('should return null if user not found', async () => {
      const token = 'valid_jwt_token'
      const payload = {
        userId: 'non-existent-user',
        email: 'test@example.com',
        memberType: 'REGULAR',
      }

      mockJwt.verify.mockReturnValue(payload as never)
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await AuthService.verifyToken(token)

      expect(result).toBeNull()
    })

    it('should return null if user is inactive', async () => {
      const token = 'valid_jwt_token'
      const payload = {
        userId: 'user-id',
        email: 'test@example.com',
        memberType: 'REGULAR',
      }
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        memberType: 'REGULAR',
        isActive: false, // Inactive user
        isVerified: true,
      }

      mockJwt.verify.mockReturnValue(payload as never)
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await AuthService.verifyToken(token)

      expect(result).toBeNull()
    })
  })

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockBcrypt.compare.mockResolvedValue(true as never)
      mockPrisma.user.update.mockResolvedValue(mockUser as any)

      const result = await AuthService.authenticateUser(email, password)

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          memberType: true,
          isActive: true,
          isVerified: true,
          failedLoginAttempts: true,
          lockedUntil: true,
        },
      })
      expect(mockBcrypt.compare).toHaveBeenCalledWith(password, mockUser.password)
      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        memberType: mockUser.memberType,
        isActive: mockUser.isActive,
        isVerified: mockUser.isVerified,
      })
    })

    it('should return null for non-existent user', async () => {
      const email = 'nonexistent@example.com'
      const password = 'password123'

      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await AuthService.authenticateUser(email, password)

      expect(result).toBeNull()
    })

    it('should return null for invalid password', async () => {
      const email = 'test@example.com'
      const password = 'wrongpassword'
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockBcrypt.compare.mockResolvedValue(false as never)

      const result = await AuthService.authenticateUser(email, password)

      expect(result).toBeNull()
    })

    it('should return null for inactive user', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        memberType: 'REGULAR',
        isActive: false, // Inactive user
        isVerified: true,
        failedLoginAttempts: 0,
        lockedUntil: null,
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)
      mockBcrypt.compare.mockResolvedValue(true as never)

      const result = await AuthService.authenticateUser(email, password)

      expect(result).toBeNull()
    })

    it('should return null for locked user', async () => {
      const email = 'test@example.com'
      const password = 'password123'
      const futureDate = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      const mockUser = {
        id: 'user-id',
        email: 'test@example.com',
        password: 'hashed_password',
        firstName: 'Test',
        lastName: 'User',
        memberType: 'REGULAR',
        isActive: true,
        isVerified: true,
        failedLoginAttempts: 5,
        lockedUntil: futureDate, // User is locked
      }

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any)

      const result = await AuthService.authenticateUser(email, password)

      expect(result).toBeNull()
    })
  })

  describe('isAdmin', () => {
    it('should return true for admin user', () => {
      const user = global.testUtils.createMockUser({ memberType: 'admin' })
      
      const result = AuthService.isAdmin(user)
      
      expect(result).toBe(true)
    })

    it('should return false for regular user', () => {
      const user = global.testUtils.createMockUser({ memberType: 'REGULAR' })
      
      const result = AuthService.isAdmin(user)
      
      expect(result).toBe(false)
    })
  })

  describe('canAccessAdmin', () => {
    it('should return true for active admin user', () => {
      const user = global.testUtils.createMockUser({ 
        memberType: 'admin', 
        isActive: true,
        isVerified: true
      })
      
      const result = AuthService.canAccessAdmin(user)
      
      expect(result).toBe(true)
    })

    it('should return false for inactive admin user', () => {
      const user = global.testUtils.createMockUser({ 
        memberType: 'admin', 
        isActive: false,
        isVerified: true
      })
      
      const result = AuthService.canAccessAdmin(user)
      
      expect(result).toBe(false)
    })

    it('should return false for unverified admin user', () => {
      const user = global.testUtils.createMockUser({ 
        memberType: 'admin', 
        isActive: true,
        isVerified: false
      })
      
      const result = AuthService.canAccessAdmin(user)
      
      expect(result).toBe(false)
    })

    it('should return false for regular user', () => {
      const user = global.testUtils.createMockUser({ 
        memberType: 'REGULAR', 
        isActive: true,
        isVerified: true
      })
      
      const result = AuthService.canAccessAdmin(user)
      
      expect(result).toBe(false)
    })
  })

  describe('logAuthAction', () => {
    it('should log auth action successfully', async () => {
      const action = 'USER_LOGIN'
      const userId = 'user-id'
      const details = 'User logged in successfully'
      const ipAddress = '192.168.1.1'
      const userAgent = 'Mozilla/5.0'

      mockPrisma.adminAction.create.mockResolvedValue({} as any)

      await AuthService.logAuthAction(action, userId, details, ipAddress, userAgent)

      expect(mockPrisma.adminAction.create).toHaveBeenCalledWith({
        data: {
          action,
          userId,
          details,
          ipAddress,
          userAgent,
          timestamp: expect.any(Date),
        },
      })
    })

    it('should handle logging errors gracefully', async () => {
      const action = 'USER_LOGIN'
      const userId = 'user-id'
      const details = 'User logged in successfully'

      mockPrisma.adminAction.create.mockRejectedValue(new Error('Database error'))

      // Should not throw - errors are logged and swallowed
      await expect(AuthService.logAuthAction(action, userId, details)).resolves.not.toThrow()
    })
  })
})