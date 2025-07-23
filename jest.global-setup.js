// Global setup for Jest tests
module.exports = async () => {
  // Set test environment variables
  process.env.NODE_ENV = 'test'
  
  // Setup test database if needed
  // Note: In a real setup, you might want to:
  // 1. Start a test database container
  // 2. Run database migrations
  // 3. Seed test data
  
  console.log('🧪 Setting up test environment...')
  
  // Mock external services for testing
  if (!process.env.MOCK_EXTERNAL_SERVICES) {
    process.env.MOCK_EXTERNAL_SERVICES = 'true'
  }
  
  // Disable email sending in tests
  if (!process.env.DISABLE_EMAIL_SENDING) {
    process.env.DISABLE_EMAIL_SENDING = 'true'
  }
  
  console.log('✅ Test environment ready')
}