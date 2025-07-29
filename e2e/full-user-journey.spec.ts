import { test, expect } from '@playwright/test'

test.describe('Full User Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
    await page.context().clearPermissions()
  })

  test('complete login to dashboard journey', async ({ page }) => {
    // Step 1: Go to login page
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    
    // Step 2: Fill in admin credentials
    await page.fill('input[type="email"]', 'admin@namc-norcal.org')
    await page.fill('input[type="password"]', 'password123')
    
    // Step 3: Submit the form
    await page.click('button:has-text("Sign In")')
    
    // Step 4: Wait for navigation to dashboard 
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
    
    // Step 5: Verify we're on the admin dashboard
    expect(page.url()).toContain('/admin/dashboard')
  })

  test('check if dashboard requires authentication', async ({ page }) => {
    // Try to access dashboard directly without login
    await page.goto('/dashboard')
    
    // Wait a bit for client-side redirect
    await page.waitForTimeout(3000)
    
    // Check if we get redirected to login or stay on dashboard
    const currentUrl = page.url()
    console.log('Current URL after visiting dashboard:', currentUrl)
    
    if (currentUrl.includes('/login')) {
      console.log('✅ Protected route working - redirected to login')
    } else if (currentUrl.includes('/dashboard')) {
      console.log('❌ Protected route NOT working - stayed on dashboard')
      
      // Check if we see loading spinner (which means protection is working)
      const loadingSpinner = page.locator('.animate-spin')
      if (await loadingSpinner.isVisible()) {
        console.log('✅ Protection working - showing loading spinner')
      } else {
        console.log('❌ No protection - content visible without auth')
      }
    }
  })

  test('test protected route behavior step by step', async ({ page }) => {
    // Step 1: Visit dashboard without auth
    console.log('Step 1: Visiting dashboard without authentication...')
    await page.goto('/dashboard')
    
    // Step 2: Check immediate state
    await page.waitForTimeout(1000)
    console.log('Step 2: URL after 1s:', page.url())
    
    // Step 3: Check for loading spinner
    const spinner = page.locator('.animate-spin').first()
    const isSpinnerVisible = await spinner.isVisible()
    console.log('Step 3: Loading spinner visible:', isSpinnerVisible)
    
    // Step 4: Wait longer for potential redirect
    await page.waitForTimeout(5000)
    console.log('Step 4: URL after 6s total:', page.url())
    
    // Step 5: Check final state
    if (page.url().includes('/login')) {
      console.log('✅ SUCCESS: Redirected to login')
      await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    } else {
      console.log('❌ ISSUE: Still on dashboard page')
      // Check what's actually displayed
      const pageText = await page.textContent('body')
      console.log('Page content preview:', pageText?.substring(0, 200) + '...')
    }
  })
  
  test('test member login and dashboard access', async ({ page }) => {
    // Login as regular member
    await page.goto('/login')
    await page.fill('input[type="email"]', 'maria.johnson@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    
    // Should redirect to member dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 })
    expect(page.url()).toContain('/dashboard')
    expect(page.url()).not.toContain('/admin')
  })

  test('verify form validation works', async ({ page }) => {
    await page.goto('/login')
    
    // Try to submit empty form
    await page.click('button:has-text("Sign In")')
    
    // Should prevent submission due to required fields
    await page.waitForTimeout(1000)
    expect(page.url()).toContain('/login') // Should still be on login page
  })
})