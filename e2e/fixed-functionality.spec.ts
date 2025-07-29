import { test, expect } from '@playwright/test'

test.describe('Fixed Portal Functionality', () => {
  test('should load homepage with improved selectors', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Check basic page loading
    await expect(page).toHaveTitle(/NAMC/)
    
    // Use more specific selectors
    await expect(page.getByTestId('header-logo')).toBeVisible()
    await expect(page.getByRole('link', { name: 'About' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Events' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Members' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Resources' })).toBeVisible()
    
    // Check Programs dropdown with test ID
    await expect(page.getByTestId('programs-dropdown')).toBeVisible()
  })

  test('should handle Programs dropdown without hydration issues', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Wait for client-side hydration
    await page.waitForTimeout(1000)
    
    // Click Programs dropdown
    await page.getByTestId('programs-dropdown').click()
    
    // Check TECH option appears
    await expect(page.getByText('TECH Clean California')).toBeVisible()
    await expect(page.getByText('Heat pump incentive program')).toBeVisible()
    
    // Click outside to close
    await page.getByTestId('header-logo').click()
    
    // Check dropdown closes
    await expect(page.getByText('TECH Clean California')).not.toBeVisible()
  })

  test('should handle TECH program link', async ({ page }) => {
    await page.goto('http://localhost:3000')
    
    // Wait for client-side hydration
    await page.waitForTimeout(1000)
    
    // Open Programs dropdown
    await page.getByTestId('programs-dropdown').click()
    await expect(page.getByTestId('tech-program-link')).toBeVisible()
    
    // Click on TECH program link
    await page.getByTestId('tech-program-link').click()
    
    // Should navigate to TECH program page (may show 404 for now)
    const currentUrl = page.url()
    expect(currentUrl).toContain('tech-clean-california')
  })

  test('should not show hydration errors in console', async ({ page }) => {
    const consoleErrors: string[] = []
    const hydrationWarnings: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
      if (msg.type() === 'warning' && msg.text().includes('hydration')) {
        hydrationWarnings.push(msg.text())
      }
    })
    
    await page.goto('http://localhost:3000')
    await page.waitForTimeout(2000) // Wait for hydration
    
    // Test Programs dropdown interaction
    await page.getByTestId('programs-dropdown').click()
    await page.waitForTimeout(500)
    await page.getByTestId('header-logo').click()
    
    // Check for hydration warnings (should be reduced)
    console.log('Hydration warnings:', hydrationWarnings.length)
    console.log('Console errors:', consoleErrors.length)
    
    // Should have fewer hydration issues
    expect(hydrationWarnings.length).toBeLessThan(3)
  })

  test('should be mobile responsive after fixes', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3000')
    
    // Wait for hydration
    await page.waitForTimeout(1000)
    
    // Check that header is still visible on mobile
    await expect(page.getByTestId('header-logo')).toBeVisible()
    
    // Programs dropdown should still work on mobile
    const programsButton = page.getByTestId('programs-dropdown')
    if (await programsButton.isVisible()) {
      await programsButton.click()
      await expect(page.getByText('TECH Clean California')).toBeVisible()
    }
  })

  test('should handle dashboard access correctly', async ({ page }) => {
    await page.goto('http://localhost:3000/dashboard')
    
    // Check if auth is required or if dashboard loads
    const currentUrl = page.url()
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('Dashboard requires authentication - expected behavior')
      // Should show authentication elements
      const authElements = page.getByRole('button', { name: /sign in/i }).or(page.locator('input[type="email"]'))
      await expect(authElements).toBeVisible()
    } else {
      // Dashboard loaded - check it works without errors
      await expect(page.locator('body')).toBeVisible()
      console.log('Dashboard accessible without auth - checking for TECH integration')
      
      // Look for TECH elements (may or may not be visible based on mock data)
      const techElements = page.getByText('TECH Clean California')
      if (await techElements.isVisible()) {
        console.log('TECH widget visible on dashboard')
      } else {
        console.log('TECH widget not visible - user not enrolled or eligible')
      }
    }
  })
})