module.exports = async () => {
  console.log('🧹 Cleaning up integration test environment...')

  try {
    // Clean up any global state or connections
    // Since we're using mocks, no actual database cleanup needed
    
    console.log('✅ Integration test cleanup complete')
  } catch (error) {
    console.error('❌ Error during integration test cleanup:', error)
  }
}