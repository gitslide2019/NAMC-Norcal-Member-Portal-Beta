/**
 * Authentication Helpers for E2E Tests
 * 
 * Helper functions for handling authentication flows in end-to-end tests:
 * - Login/logout operations
 * - Session management
 * - Role-based authentication
 * - Token handling
 */

import { Page, expect } from '@playwright/test'

export const authHelper = {
  /**
   * Login as admin user
   */
  async loginAsAdmin(page: Page, adminUser: any) {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', adminUser.email)
    await page.fill('[data-testid="password"]', adminUser.password)
    await page.click('[data-testid="login-button"]')
    
    // Wait for redirect to admin dashboard
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible()
    
    // Verify admin privileges
    await expect(page.locator('[data-testid="user-role"]')).toContainText('Administrator')
  },

  /**
   * Login as regular member
   */
  async loginAsMember(page: Page, memberUser: any) {
    await page.goto('/login')
    
    await page.fill('[data-testid="email"]', memberUser.email)
    await page.fill('[data-testid="password"]', memberUser.password)
    await page.click('[data-testid="login-button"]')
    
    // Wait for redirect to member dashboard
    await expect(page).toHaveURL(/\/dashboard/)
    await expect(page.locator('[data-testid="member-nav"]')).toBeVisible()
    
    // Verify member role
    await expect(page.locator('[data-testid="user-role"]')).toContainText('Member')
  },

  /**
   * Logout current user
   */
  async logout(page: Page) {
    // Click user menu
    await page.click('[data-testid="user-menu"]')
    
    // Click logout
    await page.click('[data-testid="logout-button"]')
    
    // Verify redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('[data-testid="login-form"]')).toBeVisible()
  },

  /**
   * Set authentication state for API requests
   */
  async setAuthState(page: Page, token: string) {
    await page.addInitScript((token) => {
      localStorage.setItem('auth_token', token)
    }, token)
  },

  /**
   * Clear authentication state
   */
  async clearAuthState(page: Page) {
    await page.evaluate(() => {
      localStorage.removeItem('auth_token')
      sessionStorage.clear()
    })
  },

  /**
   * Verify user is authenticated
   */
  async verifyAuthenticated(page: Page) {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    expect(token).toBeTruthy()
  },

  /**
   * Verify user is not authenticated
   */
  async verifyNotAuthenticated(page: Page) {
    const token = await page.evaluate(() => localStorage.getItem('auth_token'))
    expect(token).toBeFalsy()
  },

  /**
   * Handle login form validation
   */
  async verifyLoginValidation(page: Page) {
    await page.goto('/login')
    
    // Submit empty form
    await page.click('[data-testid="login-button"]')
    
    // Verify validation errors
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Email is required')
    await expect(page.locator('[data-testid="password-error"]')).toContainText('Password is required')
    
    // Fill invalid email
    await page.fill('[data-testid="email"]', 'invalid-email')
    await page.click('[data-testid="login-button"]')
    
    await expect(page.locator('[data-testid="email-error"]')).toContainText('Please enter a valid email')
  },

  /**
   * Test session persistence across page reloads
   */
  async verifySessionPersistence(page: Page, user: any) {
    // Login
    await this.loginAsAdmin(page, user)
    
    // Reload page
    await page.reload()
    
    // Verify still authenticated
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible()
    await this.verifyAuthenticated(page)
  },

  /**
   * Test session expiry handling
   */
  async testSessionExpiry(page: Page) {
    // Mock expired token
    await page.addInitScript(() => {
      const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyMzkwMjJ9.expired'
      localStorage.setItem('auth_token', expiredToken)
    })
    
    // Try to access protected route
    await page.goto('/admin/workflows')
    
    // Should redirect to login
    await expect(page).toHaveURL(/\/login/)
    await expect(page.locator('[data-testid="session-expired-message"]')).toContainText('Your session has expired')
  },

  /**
   * Handle password reset flow
   */
  async testPasswordReset(page: Page, email: string) {
    await page.goto('/login')
    
    // Click forgot password
    await page.click('[data-testid="forgot-password-link"]')
    
    // Fill email
    await page.fill('[data-testid="reset-email"]', email)
    await page.click('[data-testid="send-reset-button"]')
    
    // Verify success message
    await expect(page.locator('[data-testid="reset-success"]')).toContainText('Password reset email sent')
  },

  /**
   * Test role-based access control
   */
  async verifyRoleAccess(page: Page, user: any, expectedRole: 'admin' | 'member') {
    if (expectedRole === 'admin') {
      await this.loginAsAdmin(page, user)
      
      // Verify admin-only routes are accessible
      await page.goto('/admin/workflows')
      await expect(page.locator('[data-testid="workflow-list"]')).toBeVisible()
      
      await page.goto('/admin/analytics')
      await expect(page.locator('[data-testid="analytics-dashboard"]')).toBeVisible()
      
      await page.goto('/admin/settings')
      await expect(page.locator('[data-testid="admin-settings"]')).toBeVisible()
      
    } else {
      await this.loginAsMember(page, user)
      
      // Verify admin routes are not accessible
      await page.goto('/admin/workflows')
      await expect(page).toHaveURL(/\/(unauthorized|dashboard)/)
      
      await page.goto('/admin/analytics')
      await expect(page).toHaveURL(/\/(unauthorized|dashboard)/)
      
      // Verify member routes are accessible
      await page.goto('/dashboard')
      await expect(page.locator('[data-testid="member-dashboard"]')).toBeVisible()
      
      await page.goto('/profile')
      await expect(page.locator('[data-testid="profile-form"]')).toBeVisible()
    }
  },

  /**
   * Handle 2FA authentication (if implemented)
   */
  async handle2FA(page: Page, code: string) {
    await expect(page.locator('[data-testid="2fa-form"]')).toBeVisible()
    await page.fill('[data-testid="2fa-code"]', code)
    await page.click('[data-testid="verify-2fa-button"]')
  },

  /**
   * Test concurrent sessions
   */
  async testConcurrentSessions(page: Page, user: any) {
    // Login in first tab
    await this.loginAsAdmin(page, user)
    
    // Open new tab and login again
    const newPage = await page.context().newPage()
    await this.loginAsAdmin(newPage, user)
    
    // Verify both sessions work
    await expect(page.locator('[data-testid="admin-nav"]')).toBeVisible()
    await expect(newPage.locator('[data-testid="admin-nav"]')).toBeVisible()
    
    await newPage.close()
  },

  /**
   * Test login rate limiting
   */
  async testLoginRateLimit(page: Page) {
    await page.goto('/login')
    
    // Attempt multiple failed logins
    for (let i = 0; i < 5; i++) {
      await page.fill('[data-testid="email"]', 'test@example.com')
      await page.fill('[data-testid="password"]', 'wrongpassword')
      await page.click('[data-testid="login-button"]')
      
      if (i < 4) {
        await expect(page.locator('[data-testid="login-error"]')).toContainText('Invalid credentials')
      }
    }
    
    // Verify rate limit message
    await expect(page.locator('[data-testid="rate-limit-error"]')).toContainText('Too many failed attempts')
  }
}