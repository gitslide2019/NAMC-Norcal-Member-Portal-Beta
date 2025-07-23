const nextJest = require('next/jest')

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
})

// Integration test configuration
const integrationJestConfig = {
  // Setup files
  setupFilesAfterEnv: ['<rootDir>/jest.integration.setup.js'],
  
  // Test environment
  testEnvironment: 'jest-environment-node',
  
  // Test file patterns - only integration tests
  testMatch: [
    '<rootDir>/src/**/__integration__/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Longer timeout for integration tests
  testTimeout: 30000,
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Global test setup and teardown
  globalSetup: '<rootDir>/jest.integration.global-setup.js',
  globalTeardown: '<rootDir>/jest.integration.global-teardown.js',
  
  // Verbose output for integration tests
  verbose: true,
  
  // Don't clear mocks (we need persistent state)
  clearMocks: false,
  
  // Run tests serially to avoid database conflicts
  maxWorkers: 1,
  
  // Coverage settings (optional for integration tests)
  collectCoverage: false,
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Force exit after tests complete
  forceExit: true,
  
  // Detect open handles to prevent hanging
  detectOpenHandles: true
}

// Export the configuration
module.exports = createJestConfig(integrationJestConfig)