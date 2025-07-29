import { test, expect } from '@playwright/test'

test.describe('NAMC Portal Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001')
  })

  test('should have working header logo', async ({ page }) => {
    const logo = page.getByTestId('header-logo')
    await expect(logo).toBeVisible()
    await expect(logo).toHaveText('NAMC NorCal')
    
    // Test logo navigation
    await logo.click()
    await expect(page).toHaveURL('http://localhost:3001/')
  })

  test('should navigate to About page', async ({ page }) => {
    await page.click('text=About')
    await expect(page).toHaveURL('http://localhost:3001/about')
    await expect(page.locator('h1')).toContainText('About NAMC NorCal')
  })

  test('should navigate to Events page', async ({ page }) => {
    await page.click('text=Events')
    await expect(page).toHaveURL('http://localhost:3001/events')
    await expect(page.locator('h1')).toContainText('Events')
  })

  test('should navigate to Members page', async ({ page }) => {
    await page.click('text=Members')
    await expect(page).toHaveURL('http://localhost:3001/members')
    await expect(page.locator('h1')).toContainText('Member Directory')
  })

  test('should navigate to Resources page', async ({ page }) => {
    await page.click('text=Resources')
    await expect(page).toHaveURL('http://localhost:3001/resources')
    await expect(page.locator('h1')).toContainText('Resources')
  })

  test('should show Programs dropdown and navigate to TECH program', async ({ page }) => {
    // Click Programs dropdown
    const programsButton = page.getByTestId('programs-dropdown')
    await expect(programsButton).toBeVisible()
    await programsButton.click()
    
    // Verify dropdown opens
    const techLink = page.getByText('TECH Clean California')
    await expect(techLink).toBeVisible()
    await expect(page.getByText('Heat pump incentive program')).toBeVisible()
    
    // Navigate to TECH program
    await techLink.click()
    await expect(page).toHaveURL('http://localhost:3001/programs/tech-clean-california')
    await expect(page.locator('h1')).toContainText('TECH Clean California')
  })

  test('should show auth buttons for unauthenticated users', async ({ page }) => {
    const signInButton = page.getByText('Sign In')
    const joinButton = page.getByText('Join Now')
    
    await expect(signInButton).toBeVisible()
    await expect(joinButton).toBeVisible()
    
    // Test Sign In navigation
    await signInButton.click()
    await expect(page).toHaveURL('http://localhost:3001/login')
    
    // Go back and test Join Now
    await page.goBack()
    await joinButton.click()
    await expect(page).toHaveURL('http://localhost:3001/register')
  })

  test('should have responsive navigation on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Desktop navigation should be hidden
    const desktopNav = page.locator('nav.hidden.md\\:flex')
    await expect(desktopNav).toBeHidden()
  })

  test('should close Programs dropdown when clicking outside', async ({ page }) => {
    // Open dropdown
    const programsButton = page.getByTestId('programs-dropdown')
    await programsButton.click()
    
    // Verify dropdown is open
    await expect(page.getByText('TECH Clean California')).toBeVisible()
    
    // Click outside
    await page.click('body', { position: { x: 50, y: 50 } })
    
    // Verify dropdown closes
    await expect(page.getByText('TECH Clean California')).not.toBeVisible()
  })
})

test.describe('NAMC Portal Pages Content', () => {
  test('Home page should load correctly', async ({ page }) => {
    await page.goto('http://localhost:3001')
    
    // Check for key elements
    await expect(page.locator('h1')).toContainText('Welcome to NAMC NorCal')
    await expect(page.getByText('Join Now')).toBeVisible()
    await expect(page.getByText('Learn More')).toBeVisible()
  })

  test('About page should have complete content', async ({ page }) => {
    await page.goto('http://localhost:3001/about')
    
    await expect(page.locator('h1')).toContainText('About NAMC NorCal')
    await expect(page.getByText('Our Mission')).toBeVisible()
    await expect(page.getByText('Our History')).toBeVisible()
    await expect(page.getByText('Our Programs')).toBeVisible()
  })

  test('Events page should show events list', async ({ page }) => {
    await page.goto('http://localhost:3001/events')
    
    await expect(page.locator('h1')).toContainText('Events')
    await expect(page.getByText('NAMC NorCal Networking Mixer')).toBeVisible()
    await expect(page.getByText('Construction Safety Training')).toBeVisible()
  })

  test('Members page should show member directory', async ({ page }) => {
    await page.goto('http://localhost:3001/members')
    
    await expect(page.locator('h1')).toContainText('Member Directory')
    await expect(page.getByText('Search members')).toBeVisible()
    await expect(page.getByText('Filter by')).toBeVisible()
  })

  test('Resources page should show resource categories', async ({ page }) => {
    await page.goto('http://localhost:3001/resources')
    
    await expect(page.locator('h1')).toContainText('Resources')
    await expect(page.getByText('All Categories')).toBeVisible()
    await expect(page.getByText('Forms & Documents')).toBeVisible()
  })

  test('TECH program page should show program details', async ({ page }) => {
    await page.goto('http://localhost:3001/programs/tech-clean-california')
    
    await expect(page.locator('h1')).toContainText('TECH Clean California')
    await expect(page.getByText('Heat Pump Incentive Program')).toBeVisible()
    await expect(page.getByText('Overview')).toBeVisible()
    await expect(page.getByText('Incentives')).toBeVisible()
  })
})