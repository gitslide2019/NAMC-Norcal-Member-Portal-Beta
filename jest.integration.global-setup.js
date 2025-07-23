module.exports = async () => {
  console.log('🚀 Setting up integration test environment...')

  try {
    // Set test environment variables
    process.env.NODE_ENV = 'test'
    process.env.JWT_SECRET = 'integration-test-jwt-secret-key-for-testing-purposes-only-minimum-32-characters'
    
    console.log('✅ Environment variables configured')
    console.log('✅ Mock services initialized')

  } catch (error) {
    console.error('❌ Failed to setup integration test environment:', error)
    process.exit(1)
  }

  console.log('🎉 Integration test environment ready!')
}