// Global teardown for Jest tests
module.exports = async () => {
  console.log('🧹 Cleaning up test environment...')
  
  // Cleanup test database if needed
  // Note: In a real setup, you might want to:
  // 1. Stop test database container
  // 2. Clean up test files
  // 3. Close connections
  
  // Give time for async cleanup
  await new Promise(resolve => setTimeout(resolve, 100))
  
  console.log('✅ Test cleanup complete')
}