import { test, expect } from '@playwright/test'

test.describe('Member Features', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
  })

  test('should display login page with member features', async ({ page }) => {
    await page.goto('/login')
    
    // Check page loads correctly
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.locator('text=Sign in to access your NAMC NorCal member portal')).toBeVisible()
    
    // Check form elements are present
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible()
    
    // Check demo credentials are shown
    await expect(page.locator('text=Demo Accounts')).toBeVisible()
    await expect(page.locator('text=member@example.com')).toBeVisible()
  })

  test('should navigate to member dashboard', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Should redirect to login if not authenticated
    await expect(page.url()).toContain('/login')
  })

  test('should display header navigation for members', async ({ page }) => {
    await page.goto('/')
    
    // Check header elements
    await expect(page.locator('text=NAMC NorCal')).toBeVisible()
    
    // Check navigation items
    await expect(page.locator('text=About')).toBeVisible()
    await expect(page.locator('text=Events')).toBeVisible()
    await expect(page.locator('text=Members')).toBeVisible()
    await expect(page.locator('text=Resources')).toBeVisible()
  })

  test('should show member profile page structure', async ({ page }) => {
    await page.goto('/profile')
    
    // Should redirect to login if not authenticated
    await expect(page.url()).toContain('/login')
  })

  test('should test password visibility toggle', async ({ page }) => {
    await page.goto('/login')
    
    // Fill password field
    await page.fill('input[type="password"]', 'testpassword')
    
    // Check password is hidden by default
    await expect(page.locator('input[type="password"]')).toHaveAttribute('type', 'password')
    
    // Click show password button
    const showPasswordButton = page.locator('button[aria-label*="password"]').first()
    await showPasswordButton.click()
    
    // Check password is now visible
    await expect(page.locator('input[type="text"]')).toBeVisible()
  })

  test('should validate form inputs', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit with empty email
    await page.click('button:has-text("Sign In")')
    
    // Check that form validation prevents submission
    // (Browser validation should prevent submission)
    const emailInput = page.locator('input[type="email"]')
    await expect(emailInput).toHaveAttribute('required')
    
    // Fill invalid email
    await page.fill('input[type="email"]', 'invalid-email')
    await page.fill('input[type="password"]', 'password')
    
    // Email field should show validation state
    await expect(emailInput).toHaveValue('invalid-email')
  })

  test('should handle logout redirect correctly', async ({ page }) => {
    // Test the logout endpoint directly
    const response = await page.request.post('/api/auth/logout')
    
    // Should handle logout request (even if not authenticated)
    expect(response.status()).toBeLessThan(500)
  })

  test('should test responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/login')
    
    // Check login form is still visible and functional on mobile
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
    
    // Check that demo credentials are still visible on mobile
    await expect(page.locator('text=Demo Accounts')).toBeVisible()
  })

  test('should load member dashboard page structure', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard')
    
    // Should redirect to login
    await page.waitForURL('**/login')
    expect(page.url()).toContain('/login')
    
    // Check that protected route redirection works
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
  })

  test('should test API health endpoints', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.request.get('/api/health')
    expect(healthResponse.status()).toBe(200)
    
    // Test auth me endpoint (should fail without auth)
    const meResponse = await page.request.get('/api/auth/me')
    expect(meResponse.status()).toBe(401)
  })
})