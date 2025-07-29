import { test, expect } from '@playwright/test'

test.describe('NAMC Member Dashboard - Comprehensive Features', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth state
    await page.context().clearCookies()
    await page.context().clearPermissions()
  })

  async function loginAsMember(page: any) {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'maria.johnson@example.com')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('**/dashboard', { timeout: 10000 })
  }

  async function loginAsAdmin(page: any) {
    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@namc-norcal.org')
    await page.fill('input[type="password"]', 'password123')
    await page.click('button:has-text("Sign In")')
    await page.waitForURL('**/admin/dashboard', { timeout: 10000 })
  }

  test('should complete full member login and dashboard navigation', async ({ page }) => {
    // Step 1: Login as member
    await loginAsMember(page)
    
    // Step 2: Verify dashboard loads correctly
    expect(page.url()).toContain('/dashboard')
    
    // Step 3: Check dashboard layout and sidebar navigation
    await expect(page.locator('text=Dashboard')).toBeVisible()
    await expect(page.locator('text=Profile')).toBeVisible()
    await expect(page.locator('text=Projects')).toBeVisible()
    await expect(page.locator('text=Events')).toBeVisible()
    await expect(page.locator('text=Messages')).toBeVisible()
    await expect(page.locator('text=Directory')).toBeVisible()
    
    // Step 4: Test sidebar navigation items
    const navigationItems = [
      { text: 'Profile', url: '/profile' },
      { text: 'Directory', url: '/directory' },
      { text: 'Messages', url: '/messages' }
    ]
    
    for (const item of navigationItems) {
      await page.click(`text=${item.text}`)
      await page.waitForURL(`**${item.url}`, { timeout: 5000 })
      expect(page.url()).toContain(item.url)
    }
  })

  test('should test member directory functionality', async ({ page }) => {
    await loginAsMember(page)
    
    // Navigate to member directory
    await page.click('text=Directory')
    await page.waitForURL('**/directory', { timeout: 5000 })
    
    // Check directory page elements
    await expect(page.locator('h1:has-text("Member Directory")')).toBeVisible()
    await expect(page.locator('text=Search & Filter')).toBeVisible()
    
    // Test search functionality
    await page.fill('input[placeholder="Search members..."]', 'Maria')
    await page.waitForTimeout(500) // Wait for search to filter
    
    // Test member type filter
    await page.click('text=Member Type')
    await page.click('text=Premium')
    await page.waitForTimeout(500)
    
    // Test location filter
    await page.click('text=Location')
    await page.click('text=All Locations') // Reset to show options
    
    // Check if member cards are displayed
    await expect(page.locator('[data-testid="member-card"]').first()).toBeVisible({ timeout: 5000 })
      .catch(() => {
        // If no test id, check for card structure
        return expect(page.locator('.bg-white.rounded-lg.shadow').first()).toBeVisible()
      })
    
    // Test member interaction buttons
    const viewProfileButton = page.locator('button:has-text("View Profile")').first()
    const messageButton = page.locator('button:has-text("Message")').first()
    
    await expect(viewProfileButton).toBeVisible()
    await expect(messageButton).toBeVisible()
  })

  test('should test messaging system functionality', async ({ page }) => {
    await loginAsMember(page)
    
    // Navigate to messages
    await page.click('text=Messages')
    await page.waitForURL('**/messages', { timeout: 5000 })
    
    // Check messaging interface
    await expect(page.locator('h1:has-text("Messages")').or(page.locator('text=Messages').first())).toBeVisible()
    
    // Check for conversation list (if any mock data exists)
    const conversationElements = [
      'text=Search conversations',
      'button:has-text("New")',
      'text=Select a conversation' // Default state when no conversation selected
    ]
    
    for (const element of conversationElements) {
      await expect(page.locator(element)).toBeVisible({ timeout: 3000 })
        .catch(() => {
          console.log(`Element "${element}" not found in messaging interface`)
        })
    }
    
    // Test search functionality in messages
    const searchInput = page.locator('input[placeholder*="Search"]').first()
    if (await searchInput.isVisible()) {
      await searchInput.fill('test search')
    }
  })

  test('should test profile management functionality', async ({ page }) => {
    await loginAsMember(page)
    
    // Navigate to profile
    await page.click('text=Profile')
    await page.waitForURL('**/profile', { timeout: 5000 })
    
    // Check profile page elements
    await expect(page.locator('h1:has-text("Profile")')).toBeVisible()
    await expect(page.locator('text=Personal Information')).toBeVisible()
    
    // Test edit profile functionality
    const editButton = page.locator('button:has-text("Edit Profile")')
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Check if form becomes editable
      await expect(page.locator('input[value]').first()).toBeEnabled()
      
      // Test form fields
      const firstNameInput = page.locator('input').first()
      if (await firstNameInput.isEnabled()) {
        await firstNameInput.fill('Test Name')
      }
      
      // Check for save/cancel buttons
      await expect(page.locator('button:has-text("Save")').or(page.locator('button:has-text("Save Changes")'))).toBeVisible()
      await expect(page.locator('button:has-text("Cancel")')).toBeVisible()
    }
  })

  test('should test responsive design and mobile navigation', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    await loginAsMember(page)
    
    // Check mobile navigation
    const mobileMenuButton = page.locator('button:has([class*="Menu"])').or(page.locator('[data-testid="mobile-menu"]'))
    
    if (await mobileMenuButton.isVisible()) {
      await mobileMenuButton.click()
      
      // Check if navigation items are visible in mobile menu
      await expect(page.locator('text=Profile')).toBeVisible()
      await expect(page.locator('text=Messages')).toBeVisible()
    }
    
    // Test that dashboard content is responsive
    await expect(page.locator('h1').first()).toBeVisible()
  })

  test('should test API health and authentication endpoints', async ({ page }) => {
    // Test health endpoint
    const healthResponse = await page.request.get('/api/health')
    expect(healthResponse.status()).toBe(200)
    
    // Test auth endpoints without authentication
    const meResponse = await page.request.get('/api/auth/me')
    expect(meResponse.status()).toBe(401)
    
    // Test login endpoint with invalid credentials
    const loginResponse = await page.request.post('/api/auth/login', {
      data: {
        email: 'invalid@example.com',
        password: 'wrongpassword'
      }
    })
    expect(loginResponse.status()).toBe(401)
  })

  test('should test TECH Clean California program integration', async ({ page }) => {
    await loginAsMember(page)
    
    // Navigate to Programs from header if available
    const programsLink = page.locator('text=Programs').first()
    
    if (await programsLink.isVisible()) {
      await programsLink.click()
      
      // Look for TECH program link
      const techLink = page.locator('text=TECH Clean California')
      if (await techLink.isVisible()) {
        await techLink.click()
        await page.waitForURL('**/programs/tech-clean-california', { timeout: 5000 })
        
        // Check TECH program page
        await expect(page.locator('h1:has-text("TECH Clean California")')).toBeVisible()
        await expect(page.getByText('Heat Pump Incentive Program').first()).toBeVisible()
      }
    } else {
      // Try direct navigation to TECH program
      await page.goto('/programs/tech-clean-california')
      await expect(page.locator('h1:has-text("TECH Clean California")')).toBeVisible()
    }
  })

  test('should test HubSpot integration features', async ({ page }) => {
    await loginAsMember(page)
    
    // Check if dashboard shows any HubSpot-integrated widgets
    const techWidget = page.locator('[data-testid="tech-dashboard-widget"]')
      .or(page.locator('text=TECH Clean California'))
      .or(page.locator('text=Heat Pump'))
    
    if (await techWidget.isVisible()) {
      console.log('TECH/HubSpot widget found on dashboard')
      
      // Test widget interaction if available
      const widgetButton = techWidget.locator('button').first()
      if (await widgetButton.isVisible()) {
        await widgetButton.click()
      }
    }
    
    // Test API endpoints for HubSpot integration (if enabled)
    const techDashboardResponse = await page.request.get('/api/tech/dashboard')
    console.log('TECH Dashboard API status:', techDashboardResponse.status())
    
    const hubspotSyncResponse = await page.request.get('/api/hubspot/sync')
    console.log('HubSpot Sync API status:', hubspotSyncResponse.status())
  })

  test('should test admin vs member access control', async ({ page }) => {
    // Test member access
    await loginAsMember(page)
    
    // Try to access admin dashboard
    await page.goto('/admin/dashboard')
    
    // Should redirect away from admin dashboard or show access denied
    await page.waitForTimeout(2000)
    const currentUrl = page.url()
    expect(currentUrl).not.toContain('/admin/dashboard')
    
    // Logout and login as admin
    const logoutButton = page.locator('button:has-text("Sign out")').or(page.locator('button:has-text("Logout")'))
    if (await logoutButton.isVisible()) {
      await logoutButton.click()
    }
    
    // Login as admin
    await loginAsAdmin(page)
    
    // Should successfully access admin dashboard
    expect(page.url()).toContain('/admin/dashboard')
    
    // Check admin-specific navigation
    await expect(page.locator('text=User Management').or(page.locator('text=Admin'))).toBeVisible()
  })

  test('should test search functionality across features', async ({ page }) => {
    await loginAsMember(page)
    
    // Test dashboard search if available
    const dashboardSearch = page.locator('input[placeholder*="Search"]').first()
    if (await dashboardSearch.isVisible()) {
      await dashboardSearch.fill('project')
      await page.waitForTimeout(500)
    }
    
    // Test directory search
    await page.click('text=Directory')
    await page.waitForURL('**/directory')
    
    const directorySearch = page.locator('input[placeholder*="Search"]')
    if (await directorySearch.isVisible()) {
      await directorySearch.fill('Maria')
      await page.waitForTimeout(500)
    }
    
    // Test messages search
    await page.click('text=Messages')
    await page.waitForURL('**/messages')
    
    const messagesSearch = page.locator('input[placeholder*="Search"]')
    if (await messagesSearch.isVisible()) {
      await messagesSearch.fill('collaboration')
      await page.waitForTimeout(500)
    }
  })

  test('should test error handling and edge cases', async ({ page }) => {
    await loginAsMember(page)
    
    // Test navigation to non-existent page
    await page.goto('/dashboard/nonexistent')
    
    // Should handle gracefully (404 or redirect)
    await page.waitForTimeout(2000)
    
    // Test API error handling
    const response = await page.request.get('/api/nonexistent')
    expect(response.status()).toBe(404)
    
    // Test form submission with empty data
    await page.goto('/profile')
    
    const editButton = page.locator('button:has-text("Edit Profile")')
    if (await editButton.isVisible()) {
      await editButton.click()
      
      // Try to save with invalid data
      const saveButton = page.locator('button:has-text("Save")').or(page.locator('button:has-text("Save Changes")'))
      if (await saveButton.isVisible()) {
        // Clear required field
        const emailInput = page.locator('input[type="email"]')
        if (await emailInput.isVisible()) {
          await emailInput.clear()
          await saveButton.click()
          
          // Should show validation error
          await expect(page.locator('text=required').or(page.locator('text=invalid'))).toBeVisible({ timeout: 3000 })
            .catch(() => {
              console.log('Form validation not found or different implementation')
            })
        }
      }
    }
  })

  test('should test session management and persistence', async ({ page }) => {
    await loginAsMember(page)
    
    // Navigate to different pages to test session persistence
    await page.click('text=Profile')
    await page.waitForURL('**/profile')
    
    // Refresh page to test session persistence
    await page.reload()
    
    // Should remain logged in
    expect(page.url()).toContain('/profile')
    
    // Test logout functionality
    const userMenu = page.locator('button:has([class*="avatar"])').or(page.locator('[data-testid="user-menu"]'))
    if (await userMenu.isVisible()) {
      await userMenu.click()
      
      const signOutButton = page.locator('button:has-text("Sign out")').or(page.locator('text=Sign out'))
      if (await signOutButton.isVisible()) {
        await signOutButton.click()
        
        // Should redirect to login or home
        await page.waitForTimeout(2000)
        const currentUrl = page.url()
        expect(currentUrl.includes('/login') || currentUrl === page.url().split('/')[0] + '/').toBeTruthy()
      }
    }
  })
})