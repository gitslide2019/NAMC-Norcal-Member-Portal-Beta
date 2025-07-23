import '@testing-library/jest-dom'

// Set environment to test
process.env.NODE_ENV = 'test'

// Use in-memory SQLite for integration tests (faster and no external dependencies)
process.env.DATABASE_URL = 'file:./test.db'

// Test JWT secret
process.env.JWT_SECRET = 'integration-test-jwt-secret-key-for-testing-purposes-only-minimum-32-characters'

// Redis test configuration
process.env.REDIS_HOST = 'localhost'
process.env.REDIS_PORT = '6379'
process.env.REDIS_DB = '2' // Different DB for integration tests

// Mock external services
process.env.HUBSPOT_API_KEY = 'test-hubspot-api-key'
process.env.HUBSPOT_PORTAL_ID = 'test-portal-id'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'

// Disable console logs in tests unless VERBOSE_TESTS is set
if (!process.env.VERBOSE_TESTS) {
  console.log = jest.fn()
  console.info = jest.fn() 
  console.debug = jest.fn()
}

// Mock Prisma for integration tests  
jest.mock('./src/lib/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    adminAction: {
      create: jest.fn(),
      findFirst: jest.fn(),
      deleteMany: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
    eventRegistration: {
      deleteMany: jest.fn(),
    },
    message: {
      deleteMany: jest.fn(),
    },
    announcement: {
      deleteMany: jest.fn(),
    },
    resource: {
      deleteMany: jest.fn(),
    },
    $disconnect: jest.fn(),
  }
}))

// Global test utilities for integration tests
global.integrationTestUtils = {
  // Create test user with realistic data
  createTestUser: async (overrides = {}) => {
    const userData = {
      id: `user-${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      firstName: 'Test',
      lastName: 'User',
      password: 'Test123!@#',
      company: 'Test Company',
      memberType: 'REGULAR',
      isActive: true,
      isVerified: true,
      agreeToTerms: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides
    }

    // Hash password using our auth service
    const { AuthService } = require('./src/lib/auth')
    const hashedPassword = await AuthService.hashPassword(userData.password)

    const user = {
      ...userData,
      password: hashedPassword,
    }

    // Mock Prisma response
    const { prisma } = require('./src/lib/prisma')
    prisma.user.create.mockResolvedValue(user)
    prisma.user.findUnique.mockResolvedValue(user)

    return { ...user, originalPassword: userData.password }
  },

  // Create admin user
  createAdminUser: async (overrides = {}) => {
    return global.integrationTestUtils.createTestUser({
      memberType: 'admin',
      email: `admin-${Date.now()}@example.com`,
      ...overrides
    })
  },

  // Generate auth headers for API requests
  getAuthHeaders: async (user) => {
    const { AuthService } = require('./src/lib/auth')
    const token = AuthService.generateToken(user)
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  },

  // Clean database between tests (mock implementation)
  cleanDatabase: async () => {
    const { prisma } = require('./src/lib/prisma')
    // Reset all mocks instead of actual database operations
    jest.clearAllMocks()
    
    // Reset mock implementations
    prisma.user.findUnique.mockReset()
    prisma.user.create.mockReset()
    prisma.adminAction.create.mockReset()
    prisma.adminAction.findFirst.mockReset()
  },

  // Seed basic test data
  seedTestData: async () => {
    // Create a standard test user
    const regularUser = await global.integrationTestUtils.createTestUser({
      email: 'regular@test.com',
      firstName: 'Regular',
      lastName: 'User'
    })

    // Create an admin user
    const adminUser = await global.integrationTestUtils.createAdminUser({
      email: 'admin@test.com',
      firstName: 'Admin',
      lastName: 'User'
    })

    return { regularUser, adminUser }
  },

  // Wait for async operations
  delay: (ms) => new Promise(resolve => setTimeout(resolve, ms))
}

// Setup before each test
beforeEach(async () => {
  // Clean database state
  await global.integrationTestUtils.cleanDatabase()
})

// Global error handler
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})