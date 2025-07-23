const nextJest = require('next/jest')

const createJestConfig = nextJest({
  dir: './',
})

// Simplified integration test configuration
const integrationJestConfig = {
  // Test environment
  testEnvironment: 'jest-environment-node',
  
  // Test file patterns - only integration tests
  testMatch: [
    '<rootDir>/src/**/__integration__/**/*.{test,spec}.{js,jsx,ts,tsx}',
    '<rootDir>/tests/integration/**/*.{test,spec}.{js,jsx,ts,tsx}'
  ],
  
  // Timeout for integration tests
  testTimeout: 10000,
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  // Verbose output
  verbose: true,
  
  // Clear mocks between tests
  clearMocks: true,
  
  // Run tests serially to avoid conflicts
  maxWorkers: 1,
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  
  // Force exit after tests complete
  forceExit: true,
  
  // Environment setup
  setupFiles: ['<rootDir>/jest.integration.simple.setup.js'],
  
  // Avoid global setup/teardown that conflicts with other tests
  globalSetup: undefined,
  globalTeardown: undefined
}

module.exports = createJestConfig(integrationJestConfig)