import '@testing-library/jest-dom'

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-purposes-only-minimum-32-characters'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/namc_portal_test'
process.env.REDIS_HOST = 'localhost'
process.env.REDIS_PORT = '6379'
process.env.REDIS_DB = '1' // Use different DB for tests

// Mock Next.js modules that don't work well in Jest
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    getAll: jest.fn(),
    has: jest.fn(),
    keys: jest.fn(),
    values: jest.fn(),
    entries: jest.fn(),
    forEach: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/test-path',
}))

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: jest.fn(),
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
      headers: new Map(),
      cookies: {
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
      },
    })),
    next: jest.fn(() => ({
      headers: new Map(),
      cookies: {
        set: jest.fn(),
        get: jest.fn(),
        delete: jest.fn(),
      },
    })),
  },
}))

// Global test utilities
global.testUtils = {
  // Create mock user for testing
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    memberType: 'REGULAR',
    isActive: true,
    isVerified: true,
    ...overrides,
  }),

  // Create mock request for API testing
  createMockRequest: (overrides = {}) => ({
    json: jest.fn().mockResolvedValue({}),
    headers: {
      get: jest.fn(),
    },
    ...overrides,
  }),

  // Create mock Prisma client for testing
  createMockPrisma: () => ({
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    project: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    event: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    adminAction: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
    $disconnect: jest.fn(),
  }),
}

// Console override for cleaner test output
const originalConsole = { ...console }
global.console = {
  ...console,
  // Suppress console.log in tests unless VERBOSE_TESTS is set
  log: process.env.VERBOSE_TESTS ? originalConsole.log : jest.fn(),
  info: process.env.VERBOSE_TESTS ? originalConsole.info : jest.fn(),
  debug: process.env.VERBOSE_TESTS ? originalConsole.debug : jest.fn(),
  // Keep error and warn for important test feedback
  error: originalConsole.error,
  warn: originalConsole.warn,
}

// Setup and teardown
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
})

afterEach(() => {
  // Clean up after each test
  jest.restoreAllMocks()
})

// Global error handler for unhandled promises
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})