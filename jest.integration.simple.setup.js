// Set environment to test
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'integration-test-jwt-secret-key-for-testing-purposes-only-minimum-32-characters'
process.env.REDIS_HOST = 'localhost'
process.env.REDIS_PORT = '6379'
process.env.REDIS_DB = '2'
process.env.HUBSPOT_API_KEY = 'test-hubspot-api-key'
process.env.HUBSPOT_PORTAL_ID = 'test-portal-id'
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000'
process.env.BCRYPT_ROUNDS = '1' // Faster hashing for tests
process.env.EMAIL_SERVICE = 'test'

// Disable console logs in tests unless VERBOSE_TESTS is set
if (!process.env.VERBOSE_TESTS) {
  console.log = jest.fn()
  console.info = jest.fn() 
  console.debug = jest.fn()
}

// Global test utilities
global.testHelper = {
  // Create test user
  createTestUser: async (overrides = {}) => {
    const defaultUser = {
      id: 'test-user-id',
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '555-0123',
      company: 'Test Company',
      title: 'Tester',
      memberType: 'REGULAR',
      isActive: true,
      isVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    
    return {
      ...defaultUser,
      ...overrides
    }
  },
  
  // Create test admin user
  createTestAdmin: async (overrides = {}) => {
    return global.testHelper.createTestUser({
      memberType: 'ADMIN',
      ...overrides
    })
  },
  
  // Generate test JWT token
  generateTestToken: (userId = 'test-user-id') => {
    return `test-jwt-token-${userId}`
  }
}

console.log('🧪 Integration test environment setup complete')