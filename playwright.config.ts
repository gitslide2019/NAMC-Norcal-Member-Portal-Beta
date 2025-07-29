/**
 * Playwright E2E Testing Configuration
 * 
 * Configuration for end-to-end testing with Playwright:
 * - Cross-browser testing (Chrome, Firefox, Safari)
 * - Mobile device testing
 * - Visual regression testing
 * - Performance testing
 * - API testing integration
 */

import { defineConfig, devices } from '@playwright/test'

// Use process.env.PORT by default and fallback to port 3000 (Next.js development server)
const PORT = process.env.PORT || 3000

// Set webServer.url and use.baseURL with the location of the WebServer respecting the correct set port
const baseURL = `http://localhost:${PORT}`

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  // Test directory
  testDir: './e2e',
  
  // Test timeout
  timeout: 30 * 1000,
  expect: {
    // Maximum time expect() should wait for the condition to be met
    timeout: 5000
  },

  // Run tests in files in parallel
  fullyParallel: true,
  
  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,
  
  // Retry on CI only
  retries: process.env.CI ? 2 : 0,
  
  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/e2e-results.json' }],
    ['junit', { outputFile: 'test-results/e2e-junit.xml' }],
    process.env.CI ? ['github'] : ['list']
  ],
  
  // Shared settings for all the projects below
  use: {
    // Base URL to use in actions like `await page.goto('/')`
    baseURL,
    
    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
    
    // Take screenshot only when test fails
    screenshot: 'only-on-failure',
    
    // Record video only when retrying
    video: 'retain-on-failure',
    
    // Global test timeout
    actionTimeout: 15 * 1000,
    
    // Ignore HTTPS errors
    ignoreHTTPSErrors: true,
    
    // Use custom viewport
    viewport: { width: 1280, height: 720 },
    
    // Custom user agent
    userAgent: 'Mozilla/5.0 (compatible; NAMCPortalTests/1.0; +http://namcnorcal.org)',
    
    // Locale and timezone
    locale: 'en-US',
    timezoneId: 'America/Los_Angeles',
    
    // Color scheme
    colorScheme: 'light'
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    // Test against mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    // Test against branded browsers
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    },
    
    // API testing
    {
      name: 'api',
      testMatch: /.*\.api\.spec\.ts/,
      use: {
        baseURL: `http://localhost:${PORT}/api`,
        extraHTTPHeaders: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }
    },
    
    // Visual regression testing
    {
      name: 'visual',
      testMatch: /.*\.visual\.spec\.ts/,
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      }
    },
    
    // Performance testing
    {
      name: 'performance',
      testMatch: /.*\.perf\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        // Enable performance metrics collection
        launchOptions: {
          args: ['--enable-performance-manager-extra-logging']
        }
      }
    }
  ],

  // Global setup and teardown (commented out for manual testing)
  // globalSetup: './e2e/global-setup.ts',
  // globalTeardown: './e2e/global-teardown.ts',

  // Run your local dev server before starting the tests (commented out since server is already running)
  // webServer: {
  //   command: 'npm run dev',
  //   url: baseURL,
  //   reuseExistingServer: !process.env.CI,
  //   stdout: 'ignore',
  //   stderr: 'pipe',
  //   timeout: 120 * 1000 // 2 minutes to start
  // },

  // Output directory for test artifacts
  outputDir: 'test-results'
})