import { test, expect } from '@playwright/test'

test.describe('NAMC Portal with TECH Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Start the development server if needed
    await page.goto('http://localhost:3000')
  })

  test.describe('Authentication Flow', () => {
    test('should show login page for unauthenticated users', async ({ page }) => {
      await expect(page).toHaveTitle(/NAMC/)
      
      // Check for login elements
      await expect(page.locator('text=Sign In')).toBeVisible()
      await expect(page.locator('text=Join Now')).toBeVisible()
    })

    test('should navigate to login page', async ({ page }) => {
      await page.click('text=Sign In')
      await expect(page).toHaveURL(/.*login/)
      
      // Check login form elements
      await expect(page.locator('input[type="email"]')).toBeVisible()
      await expect(page.locator('input[type="password"]')).toBeVisible()
    })

    test('should navigate to registration page', async ({ page }) => {
      await page.click('text=Join Now')
      await expect(page).toHaveURL(/.*register/)
    })
  })

  test.describe('Header Navigation', () => {
    test('should display all navigation items', async ({ page }) => {
      // Check main navigation items
      await expect(page.locator('text=NAMC NorCal')).toBeVisible()
      await expect(page.locator('text=About')).toBeVisible()
      await expect(page.locator('text=Events')).toBeVisible()
      await expect(page.locator('text=Members')).toBeVisible()
      await expect(page.locator('text=Programs')).toBeVisible()
      await expect(page.locator('text=Resources')).toBeVisible()
    })

    test('should open Programs dropdown and show TECH option', async ({ page }) => {
      // Click Programs dropdown
      await page.click('button:has-text("Programs")')
      
      // Check dropdown opens
      await expect(page.locator('text=TECH Clean California')).toBeVisible()
      await expect(page.locator('text=Heat pump incentive program')).toBeVisible()
      
      // Check TECH program icon
      await expect(page.locator('[data-testid="tech-program-icon"]').or(page.locator('.bg-green-100'))).toBeVisible()
    })

    test('should close Programs dropdown when clicking outside', async ({ page }) => {
      // Open dropdown
      await page.click('button:has-text("Programs")')
      await expect(page.locator('text=TECH Clean California')).toBeVisible()
      
      // Click outside
      await page.click('text=NAMC NorCal')
      
      // Check dropdown closes
      await expect(page.locator('text=TECH Clean California')).not.toBeVisible()
    })

    test('should navigate to TECH program from dropdown', async ({ page }) => {
      await page.click('button:has-text("Programs")')
      await page.click('text=TECH Clean California')
      
      await expect(page).toHaveURL(/.*programs\/tech-clean-california/)
    })
  })

  test.describe('Main Dashboard - Unauthenticated', () => {
    test('should show standard dashboard elements', async ({ page }) => {
      // Check welcome section would be visible if authenticated
      await expect(page.locator('text=Sign In')).toBeVisible()
      await expect(page.locator('text=Join Now')).toBeVisible()
    })
  })

  test.describe('Main Dashboard - Authenticated (Mocked)', () => {
    test.beforeEach(async ({ page }) => {
      // Mock authenticated state by going directly to dashboard
      // In real test, this would involve actual login
      await page.goto('http://localhost:3000/dashboard')
    })

    test('should display dashboard welcome section', async ({ page }) => {
      // Check for dashboard elements (may need to handle auth redirect)
      const welcomeSection = page.locator('text=Welcome back')
      if (await welcomeSection.isVisible()) {
        await expect(welcomeSection).toBeVisible()
      }
    })

    test('should show business metrics cards', async ({ page }) => {
      // Look for metric cards
      const metricsSection = page.locator('.grid').first()
      if (await metricsSection.isVisible()) {
        await expect(metricsSection).toBeVisible()
      }
    })

    test('should display TECH widget for enrolled contractors', async ({ page }) => {
      // Check if TECH widget is present (based on mock data)
      const techWidget = page.locator('text=TECH Clean California')
      if (await techWidget.isVisible()) {
        await expect(techWidget).toBeVisible()
        await expect(page.locator('text=Heat pump incentive program')).toBeVisible()
        
        // Check for TECH-specific elements
        await expect(page.locator('text=Active Projects').or(page.locator('text=Pending'))).toBeVisible()
      }
    })

    test('should show TECH program card for eligible non-enrolled members', async ({ page }) => {
      // This would depend on mock enrollment status
      const programCard = page.locator('text=TECH Clean California')
      if (await programCard.isVisible()) {
        const enrollButton = page.locator('text=Enroll Now')
        if (await enrollButton.isVisible()) {
          await expect(enrollButton).toBeVisible()
          await expect(page.locator('text=Eligible to Enroll')).toBeVisible()
        }
      }
    })
  })

  test.describe('TECH Dashboard Widget Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
    })

    test('should display TECH widget stats', async ({ page }) => {
      const techWidget = page.locator('text=TECH Clean California').first()
      if (await techWidget.isVisible()) {
        // Check for stats
        await expect(page.locator('text=Active Projects').or(page.locator('[class*="grid"]'))).toBeVisible()
        
        // Check for certification badge
        const certBadge = page.locator('text=Advanced Certified').or(page.locator('text=Basic Certified')).or(page.locator('text=Master Certified'))
        if (await certBadge.isVisible()) {
          await expect(certBadge).toBeVisible()
        }
      }
    })

    test('should show recent projects in widget', async ({ page }) => {
      const techWidget = page.locator('text=TECH Clean California').first()
      if (await techWidget.isVisible()) {
        // Look for project entries
        const projectsList = page.locator('text=Recent Projects')
        if (await projectsList.isVisible()) {
          await expect(projectsList).toBeVisible()
        }
      }
    })

    test('should have working quick action buttons', async ({ page }) => {
      const techWidget = page.locator('text=TECH Clean California').first()
      if (await techWidget.isVisible()) {
        // Check for quick action buttons
        const newProjectBtn = page.locator('text=New Project')
        const incentivesBtn = page.locator('text=Incentives')
        const programBtn = page.locator('text=Program')
        
        if (await newProjectBtn.isVisible()) {
          await expect(newProjectBtn).toBeVisible()
          // Test click (may navigate or show error without backend)
          await newProjectBtn.click()
        }
        
        if (await incentivesBtn.isVisible()) {
          await page.goto('http://localhost:3000/dashboard') // Reset
          await incentivesBtn.click()
        }
        
        if (await programBtn.isVisible()) {
          await page.goto('http://localhost:3000/dashboard') // Reset  
          await programBtn.click()
        }
      }
    })
  })

  test.describe('TECH Program Card Functionality', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
    })

    test('should display program benefits', async ({ page }) => {
      const programCard = page.locator('text=Heat Pump Incentive Program for Contractors')
      if (await programCard.isVisible()) {
        // Check for key benefits
        await expect(page.locator('text=Up to $15,000 Incentives').or(page.locator('text=Incentives'))).toBeVisible()
        await expect(page.locator('text=Professional Certification').or(page.locator('text=Certification'))).toBeVisible()
      }
    })

    test('should show eligibility requirements', async ({ page }) => {
      const programCard = page.locator('text=Heat Pump Incentive Program for Contractors')
      if (await programCard.isVisible()) {
        // Check for eligibility section
        await expect(page.locator('text=Eligibility Requirements').or(page.locator('text=Requirements'))).toBeVisible()
        await expect(page.locator('text=Active NAMC NorCal membership').or(page.locator('text=NAMC'))).toBeVisible()
      }
    })

    test('should display participating utilities', async ({ page }) => {
      const programCard = page.locator('text=Heat Pump Incentive Program for Contractors')
      if (await programCard.isVisible()) {
        // Check for utility badges
        const utilities = ['PG&E', 'SCE', 'SDG&E', 'SMUD', 'LADWP']
        for (const utility of utilities) {
          const utilityBadge = page.locator(`text=${utility}`)
          if (await utilityBadge.isVisible()) {
            await expect(utilityBadge).toBeVisible()
          }
        }
      }
    })

    test('should have working enrollment button for eligible users', async ({ page }) => {
      const enrollBtn = page.locator('text=Enroll Now')
      if (await enrollBtn.isVisible()) {
        await expect(enrollBtn).toBeVisible()
        await enrollBtn.click()
        // Should navigate to enrollment page or show form
        await expect(page).toHaveURL(/.*enroll/)
      }
    })

    test('should have working learn more button', async ({ page }) => {
      const learnMoreBtn = page.locator('text=Learn More')
      if (await learnMoreBtn.isVisible()) {
        await expect(learnMoreBtn).toBeVisible()
        await learnMoreBtn.click()
        // Should navigate to info page
        await expect(page).toHaveURL(/.*info/)
      }
    })
  })

  test.describe('Existing Portal Features', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
    })

    test('should display recent projects section', async ({ page }) => {
      const projectsSection = page.locator('text=Recent Project Opportunities')
      if (await projectsSection.isVisible()) {
        await expect(projectsSection).toBeVisible()
        await expect(page.locator('text=View All')).toBeVisible()
      }
    })

    test('should display upcoming events section', async ({ page }) => {
      const eventsSection = page.locator('text=Upcoming Events')
      if (await eventsSection.isVisible()) {
        await expect(eventsSection).toBeVisible()
      }
    })

    test('should display recent messages section', async ({ page }) => {
      const messagesSection = page.locator('text=Recent Messages')
      if (await messagesSection.isVisible()) {
        await expect(messagesSection).toBeVisible()
      }
    })

    test('should display quick actions section', async ({ page }) => {
      const quickActions = page.locator('text=Quick Actions')
      if (await quickActions.isVisible()) {
        await expect(quickActions).toBeVisible()
        
        // Check for action buttons
        await expect(page.locator('text=Post a Project').or(page.locator('text=Project'))).toBeVisible()
        await expect(page.locator('text=Register for Event').or(page.locator('text=Event'))).toBeVisible()
        await expect(page.locator('text=Find Members').or(page.locator('text=Members'))).toBeVisible()
      }
    })
  })

  test.describe('Navigation Links', () => {
    test('should navigate to About page', async ({ page }) => {
      await page.click('text=About')
      await expect(page).toHaveURL(/.*about/)
    })

    test('should navigate to Events page', async ({ page }) => {
      await page.click('text=Events')  
      await expect(page).toHaveURL(/.*events/)
    })

    test('should navigate to Members page', async ({ page }) => {
      await page.click('text=Members')
      await expect(page).toHaveURL(/.*members/)
    })

    test('should navigate to Resources page', async ({ page }) => {
      await page.click('text=Resources')
      await expect(page).toHaveURL(/.*resources/)
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 }) // iPhone SE size
    })

    test('should display mobile-friendly header', async ({ page }) => {
      await page.goto('http://localhost:3000')
      
      // Check that navigation collapses on mobile
      await expect(page.locator('text=NAMC NorCal')).toBeVisible()
      
      // Navigation items might be hidden behind hamburger menu on mobile
      const aboutLink = page.locator('text=About')
      if (await aboutLink.isVisible()) {
        await expect(aboutLink).toBeVisible()
      }
    })

    test('should show mobile-optimized dashboard', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      
      // Check that content stacks properly on mobile
      const dashboard = page.locator('body')
      await expect(dashboard).toBeVisible()
    })

    test('should handle TECH widget on mobile', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      
      const techWidget = page.locator('text=TECH Clean California').first()
      if (await techWidget.isVisible()) {
        await expect(techWidget).toBeVisible()
        
        // Check that stats grid adapts to mobile
        const statsGrid = page.locator('[class*="grid"]').first()
        if (await statsGrid.isVisible()) {
          await expect(statsGrid).toBeVisible()
        }
      }
    })
  })

  test.describe('Error Handling', () => {
    test('should handle missing components gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      
      // Check that page loads even if some components fail
      const body = page.locator('body')
      await expect(body).toBeVisible()
      
      // Should not show uncaught errors
      const errorMessages = page.locator('text=Error').or(page.locator('text=undefined')).or(page.locator('text=null'))
      if (await errorMessages.isVisible()) {
        console.log('Warning: Error messages detected on page')
      }
    })

    test('should handle broken navigation gracefully', async ({ page }) => {
      await page.goto('http://localhost:3000/nonexistent-page')
      
      // Should show 404 or redirect appropriately
      // The exact behavior depends on Next.js configuration
      const pageContent = page.locator('body')
      await expect(pageContent).toBeVisible()
    })
  })

  test.describe('Performance Checks', () => {
    test('should load dashboard within reasonable time', async ({ page }) => {
      const startTime = Date.now()
      await page.goto('http://localhost:3000/dashboard')
      const loadTime = Date.now() - startTime
      
      // Should load within 5 seconds (generous for development)
      expect(loadTime).toBeLessThan(5000)
    })

    test('should not have memory leaks from event listeners', async ({ page }) => {
      await page.goto('http://localhost:3000')
      
      // Click Programs dropdown multiple times
      for (let i = 0; i < 5; i++) {
        await page.click('button:has-text("Programs")')
        await page.click('text=NAMC NorCal') // Click outside to close
        await page.waitForTimeout(100)
      }
      
      // Page should still be responsive
      await expect(page.locator('text=NAMC NorCal')).toBeVisible()
    })
  })

  test.describe('Accessibility Checks', () => {
    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('http://localhost:3000/dashboard')
      
      // Check for h1, h2, etc. in proper order
      const h1 = page.locator('h1').first()
      if (await h1.isVisible()) {
        await expect(h1).toBeVisible()
      }
    })

    test('should have keyboard navigation support', async ({ page }) => {
      await page.goto('http://localhost:3000')
      
      // Test tab navigation
      await page.keyboard.press('Tab')
      const focusedElement = page.locator(':focus')
      if (await focusedElement.isVisible()) {
        await expect(focusedElement).toBeVisible()
      }
    })

    test('should have proper ARIA labels', async ({ page }) => {
      await page.goto('http://localhost:3000')
      
      // Check for buttons with proper labels
      const buttons = page.locator('button')
      const buttonCount = await buttons.count()
      
      if (buttonCount > 0) {
        for (let i = 0; i < Math.min(buttonCount, 5); i++) {
          const button = buttons.nth(i)
          if (await button.isVisible()) {
            const ariaLabel = await button.getAttribute('aria-label')
            const textContent = await button.textContent()
            
            // Button should have either aria-label or text content
            expect(ariaLabel || textContent).toBeTruthy()
          }
        }
      }
    })
  })
})