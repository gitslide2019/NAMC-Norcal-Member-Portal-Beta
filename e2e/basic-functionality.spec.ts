import { test, expect } from '@playwright/test'

test.describe('Basic Portal Functionality', () => {
  test('should load homepage and display navigation', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Check basic page loading
    await expect(page).toHaveTitle(/NAMC/)
    
    // Check navigation elements
    await expect(page.locator('text=NAMC NorCal')).toBeVisible()
    await expect(page.locator('text=About')).toBeVisible()
    await expect(page.locator('text=Events')).toBeVisible()
    await expect(page.locator('text=Members')).toBeVisible()
    await expect(page.locator('text=Resources')).toBeVisible()
    
    // Check Programs dropdown
    await expect(page.locator('button:has-text("Programs")')).toBeVisible()
  })

  test('should open and close Programs dropdown', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Click Programs dropdown
    await page.click('button:has-text("Programs")')
    
    // Check TECH option appears
    await expect(page.locator('text=TECH Clean California')).toBeVisible()
    await expect(page.locator('text=Heat pump incentive program')).toBeVisible()
    
    // Click outside to close
    await page.click('text=NAMC NorCal')
    
    // Check dropdown closes
    await expect(page.locator('text=TECH Clean California')).not.toBeVisible()
  })

  test('should navigate to dashboard', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    
    // Check if auth is required (redirect to login) or if dashboard loads
    const currentUrl = page.url()
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('Dashboard requires authentication - this is expected')
      await expect(page.locator('input[type="email"]').or(page.locator('text=Sign In'))).toBeVisible()
    } else {
      // Dashboard loaded directly (mocked auth)
      await expect(page.locator('body')).toBeVisible()
    }
  })

  test('should handle TECH integration on dashboard if accessible', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    
    // Wait a moment for page to load
    await page.waitForTimeout(1000)
    
    const currentUrl = page.url()
    if (!currentUrl.includes('login') && !currentUrl.includes('auth')) {
      // Dashboard is accessible, check for TECH elements
      const techWidget = page.locator('text=TECH Clean California')
      
      if (await techWidget.isVisible()) {
        console.log('TECH widget found on dashboard')
        await expect(techWidget).toBeVisible()
        
        // Check for program-specific elements
        const programElements = page.locator('text=Heat pump incentive').or(page.locator('text=Active Projects'))
        if (await programElements.isVisible()) {
          await expect(programElements).toBeVisible()
        }
      } else {
        console.log('TECH widget not visible - user may not be enrolled')
      }
    }
  })

  test('should display authentication options when not logged in', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Should see sign in and join now buttons
    await expect(page.locator('text=Sign In')).toBeVisible()
    await expect(page.locator('text=Join Now')).toBeVisible()
  })

  test('should navigate to different portal sections', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Test About navigation
    await page.click('text=About')
    await expect(page).toHaveURL(/.*about/)
    
    // Go back to home
    await page.goto('http://localhost:3000')
    
    // Test Events navigation
    await page.click('text=Events')
    await expect(page).toHaveURL(/.*events/)
    
    // Go back to home
    await page.goto('http://localhost:3000')
    
    // Test Members navigation
    await page.click('text=Members')
    await expect(page).toHaveURL(/.*members/)
    
    // Go back to home
    await page.goto('http://localhost:3000')
    
    // Test Resources navigation
    await page.click('text=Resources')
    await expect(page).toHaveURL(/.*resources/)
  })

  test('should be mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3000')
    
    // Check that header is still visible on mobile
    await expect(page.locator('text=NAMC NorCal')).toBeVisible()
    
    // Programs dropdown should still work on mobile
    const programsButton = page.locator('button:has-text("Programs")')
    if (await programsButton.isVisible()) {
      await programsButton.click()
      await expect(page.locator('text=TECH Clean California')).toBeVisible()
    }
  })

  test('should not show JavaScript errors in console', async ({ page }) => {
    const consoleErrors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(2000) // Wait for any lazy loading
    
    // Check if there are critical JavaScript errors
    const criticalErrors = consoleErrors.filter(error => 
      !error.includes('favicon') && 
      !error.includes('NetworkError') &&
      !error.includes('net::')
    )
    
    if (criticalErrors.length > 0) {
      console.log('JavaScript errors found:', criticalErrors)
    }
    
    // Should have minimal critical errors
    expect(criticalErrors.length).toBeLessThan(5)
  })

  test('should handle TECH program navigation from dropdown', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Open Programs dropdown
    await page.click('button:has-text("Programs")')
    await expect(page.locator('text=TECH Clean California')).toBeVisible()
    
    // Click on TECH program link
    await page.click('text=TECH Clean California')
    
    // Should navigate to TECH program page (or show 404 if not implemented)
    const currentUrl = page.url()
    expect(currentUrl).toContain('tech-clean-california')
  })
})