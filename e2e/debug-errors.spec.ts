import { test, expect } from '@playwright/test'

test.describe('Debug JavaScript Errors', () => {
  test('check for console errors on login page', async ({ page }) => {
    const errors: string[] = []
    
    // Listen for console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Listen for page errors
    page.on('pageerror', (error) => {
      errors.push(`Page error: ${error.message}`)
    })
    
    // Navigate to login page
    await page.goto('/login')
    
    // Wait for page to load
    await page.waitForTimeout(3000)
    
    // Log any errors found
    console.log('JavaScript errors found:', errors)
    
    // Try to fill form and see what happens
    try {
      await page.fill('input[type="email"]', 'admin@namc-norcal.org')
      console.log('✅ Email field filled successfully')
    } catch (error) {
      console.log('❌ Error filling email field:', error)
    }
    
    try {
      await page.fill('input[type="password"]', 'password123')
      console.log('✅ Password field filled successfully')
    } catch (error) {
      console.log('❌ Error filling password field:', error)
    }
    
    // Check if Sign In button is clickable
    const signInButton = page.locator('button:has-text("Sign In")')
    const isVisible = await signInButton.isVisible()
    const isEnabled = await signInButton.isEnabled()
    
    console.log('Sign In button - Visible:', isVisible, 'Enabled:', isEnabled)
    
    // Try to click the button
    try {
      await signInButton.click({ timeout: 5000 })
      console.log('✅ Sign In button clicked successfully')
    } catch (error) {
      console.log('❌ Error clicking Sign In button:', error)
    }
    
    // Final error summary
    if (errors.length > 0) {
      console.log('=== ERRORS SUMMARY ===')
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`)
      })
    } else {
      console.log('✅ No JavaScript errors detected')
    }
  })
})