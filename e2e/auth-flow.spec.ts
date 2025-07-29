import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
  })

  test('should display login page correctly', async ({ page }) => {
    await page.goto('/login')
    
    // Check that the login form is visible
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.locator('text=Sign in to access your NAMC NorCal member portal')).toBeVisible()
    
    // Check form elements
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible()
    
    // Check demo credentials section
    await expect(page.locator('text=Demo Accounts')).toBeVisible()
    await expect(page.locator('text=admin@namc-norcal.org')).toBeVisible()
    await expect(page.locator('text=member@example.com')).toBeVisible()
  })

  test('should login successfully with admin credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in admin credentials
    await page.fill('input[type="email"]', 'admin@namc-norcal.org')
    await page.fill('input[type="password"]', 'password123')
    
    // Submit the form
    await page.click('button:has-text("Sign In")')
    
    // Wait for navigation after successful login
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    
    // Verify we're on the admin dashboard
    expect(page.url()).toContain('/admin/dashboard')
  })

  test('should login successfully with member credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in member credentials
    await page.fill('input[type="email"]', 'maria.johnson@example.com')
    await page.fill('input[type="password"]', 'password123')
    
    // Submit the form
    await page.click('button:has-text("Sign In")')
    
    // Wait for navigation after successful login
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    
    // Verify we're on the member dashboard
    expect(page.url()).toContain('/dashboard')
  })

  test('should use demo admin login button', async ({ page }) => {
    await page.goto('/login')
    
    // Click demo admin login button
    await page.click('button:has-text("Demo Admin Login")')
    
    // Verify credentials are filled
    await expect(page.locator('input[type="email"]')).toHaveValue('admin@namc-norcal.org')
    await expect(page.locator('input[type="password"]')).toHaveValue('password123')
    
    // Submit the form
    await page.click('button:has-text("Sign In")')
    
    // Wait for navigation
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/admin/dashboard')
  })

  test('should use demo member login button', async ({ page }) => {
    await page.goto('/login')
    
    // Click demo member login button
    await page.click('button:has-text("Demo Member Login")')
    
    // Verify credentials are filled
    await expect(page.locator('input[type="email"]')).toHaveValue('maria.johnson@example.com')
    await expect(page.locator('input[type="password"]')).toHaveValue('password123')
    
    // Submit the form
    await page.click('button:has-text("Sign In")')
    
    // Wait for navigation
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')
    
    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com')
    await page.fill('input[type="password"]', 'wrongpassword')
    
    // Submit the form
    await page.click('button:has-text("Sign In")')
    
    // Wait for error message (notification system)
    await expect(page.locator('text=Login Failed')).toBeVisible({ timeout: 5000 })
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit empty form
    await page.click('button:has-text("Sign In")')
    
    // Check HTML5 validation or custom validation
    const emailInput = page.locator('input[type="email"]')
    const passwordInput = page.locator('input[type="password"]')
    
    await expect(emailInput).toHaveAttribute('required')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should toggle password visibility', async ({ page }) => {
    await page.goto('/login')
    
    // Fill password
    await page.fill('input[type="password"]', 'password123')
    
    // Check initial state (password hidden)
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Click toggle button
    await page.click('button:has([class*="eye"])')
    
    // Check password is now visible
    await expect(page.locator('input[type="text"]')).toBeVisible()
    
    // Click toggle again
    await page.click('button:has([class*="eye"])')
    
    // Check password is hidden again
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should persist authentication after login', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@namc-norcal.org')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    
    // Navigate to home page
    await page.goto('/')
    
    // Should show authenticated state in header
    await expect(page.locator('text=System')).toBeVisible({ timeout: 5000 })
    await expect(page.locator('button:has-text("Sign Out")')).toBeVisible()
  })

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@namc-norcal.org')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    
    // Navigate to home page to access header
    await page.goto('/')
    
    // Wait for header to load and click sign out
    await page.waitForSelector('button:has-text("Sign Out")', { timeout: 5000 })
    await page.click('button:has-text("Sign Out")')
    
    // Should redirect to login or show unauthenticated state
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible({ timeout: 5000 })
  })

  test('should redirect unauthenticated users from protected routes', async ({ page }) => {
    // Try to access admin dashboard without login
    await page.goto('/admin/dashboard')
    
    // Should redirect to login page
    await page.waitForURL('**/login', { timeout: 10000 })
    expect(page.url()).toContain('/login')
  })
})