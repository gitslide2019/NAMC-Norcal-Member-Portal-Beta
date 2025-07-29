/**
 * TECH Clean California Dashboard Widget E2E Tests
 * 
 * End-to-end tests for the TECH dashboard widget functionality,
 * metrics display, and user interactions.
 */

import { techTest, expect, TestDataGenerator } from './setup';

techTest.describe('TECH Dashboard Widget Display', () => {
  let contractor: any;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
  });

  techTest('should display TECH dashboard widget for enrolled contractors', async ({ 
    page 
  }) => {
    await page.goto('/dashboard');
    
    // Verify TECH widget is visible
    await expect(page.locator('[data-testid="tech-dashboard-widget"]')).toBeVisible();
    
    // Verify widget header
    await expect(page.locator('[data-testid="tech-widget-header"]')).toContainText('TECH Clean California');
    await expect(page.locator('[data-testid="tech-program-status"]')).toContainText('Active');
    
    // Verify summary metrics section
    await expect(page.locator('[data-testid="tech-summary-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="active-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="completed-projects"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-incentives"]')).toBeVisible();
    
    // Verify quick actions section
    await expect(page.locator('[data-testid="tech-quick-actions"]')).toBeVisible();
    await expect(page.locator('[data-testid="create-project-button"]')).toBeVisible();
    await expect(page.locator('[data-testid="view-all-projects-button"]')).toBeVisible();
  });

  techTest('should hide TECH widget for non-enrolled contractors', async ({ 
    page,
    authHelper
  }) => {
    // Create contractor but don't enroll in TECH
    const nonEnrolledContractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(nonEnrolledContractor);
    
    await page.goto('/dashboard');
    
    // Verify TECH widget is not visible
    await expect(page.locator('[data-testid="tech-dashboard-widget"]')).not.toBeVisible();
    
    // Verify enrollment prompt is shown instead
    await expect(page.locator('[data-testid="tech-enrollment-prompt"]')).toBeVisible();
    await expect(page.locator('[data-testid="tech-enrollment-prompt"]')).toContainText('Join TECH Clean California');
    await expect(page.locator('[data-testid="enroll-now-button"]')).toBeVisible();
  });

  techTest('should display correct metrics for contractor with projects', async ({ 
    page,
    techHelper
  }) => {
    // Create test projects
    const project1 = TestDataGenerator.createProject();
    const project2 = TestDataGenerator.createProject();
    
    await techHelper.createProject(project1);
    await techHelper.createProject(project2);
    
    await page.goto('/dashboard');
    
    // Verify project counts
    await expect(page.locator('[data-testid="total-projects"]')).toContainText('2');
    await expect(page.locator('[data-testid="active-projects"]')).toContainText('2');
    await expect(page.locator('[data-testid="completed-projects"]')).toContainText('0');
    
    // Verify incentive total (2 projects × $3,000 base incentive)
    const incentiveText = await page.locator('[data-testid="total-incentives"]').textContent();
    const incentiveAmount = parseFloat(incentiveText?.replace(/[$,]/g, '') || '0');
    expect(incentiveAmount).toBeCloseTo(6000, 2);
  });

  techTest('should display recent activity feed', async ({ 
    page,
    techHelper
  }) => {
    // Create a project to generate activity
    const project = TestDataGenerator.createProject();
    await techHelper.createProject(project);
    
    await page.goto('/dashboard');
    
    // Verify activity feed section
    await expect(page.locator('[data-testid="tech-activity-feed"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-feed-header"]')).toContainText('Recent Activity');
    
    // Verify project creation activity
    await expect(page.locator('[data-testid="activity-project-created"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-project-created"]')).toContainText('Project created');
    
    // Verify activity timestamp
    await expect(page.locator('[data-testid="activity-timestamp"]')).toBeVisible();
  });
});

techTest.describe('TECH Dashboard Widget Interactions', () => {
  let contractor: any;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
  });

  techTest('should navigate to project creation from quick actions', async ({ 
    page 
  }) => {
    await page.goto('/dashboard');
    
    // Click create project button
    await page.click('[data-testid="create-project-button"]');
    
    // Verify navigation to project creation
    await expect(page.url()).toContain('/tech/projects/new');
    await expect(page.locator('[data-testid="project-creation-form"]')).toBeVisible();
  });

  techTest('should navigate to all projects view', async ({ 
    page 
  }) => {
    await page.goto('/dashboard');
    
    // Click view all projects button
    await page.click('[data-testid="view-all-projects-button"]');
    
    // Verify navigation to projects list
    await expect(page.url()).toContain('/tech/projects');
    await expect(page.locator('[data-testid="projects-list"]')).toBeVisible();
  });

  techTest('should expand widget to detailed view', async ({ 
    page,
    techHelper
  }) => {
    // Create some test data for detailed view
    const project = TestDataGenerator.createProject();
    await techHelper.createProject(project);
    
    await page.goto('/dashboard');
    
    // Click expand widget button
    await page.click('[data-testid="expand-tech-widget"]');
    
    // Verify expanded view
    await expect(page.locator('[data-testid="tech-widget-expanded"]')).toBeVisible();
    
    // Verify additional details shown
    await expect(page.locator('[data-testid="projects-by-status-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="projects-by-utility-chart"]')).toBeVisible();
    await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
    
    // Verify collapse functionality
    await page.click('[data-testid="collapse-tech-widget"]');
    await expect(page.locator('[data-testid="tech-widget-expanded"]')).not.toBeVisible();
  });

  techTest('should filter activity feed by time period', async ({ 
    page,
    techHelper
  }) => {
    // Create projects at different times (simulated)
    const project1 = TestDataGenerator.createProject();
    const project2 = TestDataGenerator.createProject();
    
    await techHelper.createProject(project1);
    await techHelper.createProject(project2);
    
    await page.goto('/dashboard');
    
    // Verify default time filter (last 30 days)
    await expect(page.locator('[data-testid="activity-time-filter"]')).toHaveValue('30_days');
    
    // Change to last 7 days
    await page.selectOption('[data-testid="activity-time-filter"]', '7_days');
    
    // Verify activities still visible (since they're recent)
    await expect(page.locator('[data-testid="activity-project-created"]')).toHaveCount(2);
    
    // Change to last 24 hours
    await page.selectOption('[data-testid="activity-time-filter"]', '24_hours');
    
    // Activities should still be visible for new projects
    await expect(page.locator('[data-testid="activity-project-created"]')).toHaveCount(2);
  });

  techTest('should refresh widget data', async ({ 
    page,
    techHelper
  }) => {
    await page.goto('/dashboard');
    
    // Initial state - no projects
    await expect(page.locator('[data-testid="total-projects"]')).toContainText('0');
    
    // Create a project in background (simulated external update)
    const project = TestDataGenerator.createProject();
    await techHelper.createProject(project);
    
    // Click refresh button
    await page.click('[data-testid="refresh-tech-widget"]');
    
    // Wait for refresh animation
    await expect(page.locator('[data-testid="widget-refreshing"]')).toBeVisible();
    await expect(page.locator('[data-testid="widget-refreshing"]')).not.toBeVisible();
    
    // Verify updated data
    await expect(page.locator('[data-testid="total-projects"]')).toContainText('1');
  });
});

techTest.describe('TECH Dashboard Widget Charts and Analytics', () => {
  let contractor: any;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
  });

  techTest('should display projects by status chart', async ({ 
    page,
    techHelper
  }) => {
    // Create projects with different statuses
    const project1 = TestDataGenerator.createProject();
    const project2 = TestDataGenerator.createProject();
    const project3 = TestDataGenerator.createProject();
    
    await techHelper.createProject(project1);
    await techHelper.createProject(project2);
    await techHelper.createProject(project3);
    
    // Mock different project statuses
    await page.evaluate(() => {
      localStorage.setItem('project_statuses', JSON.stringify([
        { id: 'proj1', status: 'inquiry' },
        { id: 'proj2', status: 'agreement_signed' },
        { id: 'proj3', status: 'installation_complete' }
      ]));
    });
    
    await page.goto('/dashboard');
    await page.click('[data-testid="expand-tech-widget"]');
    
    // Verify status chart
    await expect(page.locator('[data-testid="projects-by-status-chart"]')).toBeVisible();
    
    // Verify chart segments
    await expect(page.locator('[data-testid="status-inquiry"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-agreement-signed"]')).toBeVisible();
    await expect(page.locator('[data-testid="status-installation-complete"]')).toBeVisible();
    
    // Verify chart legend
    await expect(page.locator('[data-testid="status-legend"]')).toBeVisible();
    await expect(page.locator('[data-testid="legend-inquiry"]')).toContainText('Inquiry: 1');
    await expect(page.locator('[data-testid="legend-agreement-signed"]')).toContainText('Agreement Signed: 1');
    await expect(page.locator('[data-testid="legend-installation-complete"]')).toContainText('Installation Complete: 1');
  });

  techTest('should display projects by utility territory chart', async ({ 
    page,
    techHelper
  }) => {
    // Create projects in different utility territories
    const project1 = TestDataGenerator.createProject();
    project1.utilityTerritory = 'pge';
    
    const project2 = TestDataGenerator.createProject();
    project2.utilityTerritory = 'sce';
    
    const project3 = TestDataGenerator.createProject();
    project3.utilityTerritory = 'pge';
    
    await techHelper.createProject(project1);
    await techHelper.createProject(project2);
    await techHelper.createProject(project3);
    
    await page.goto('/dashboard');
    await page.click('[data-testid="expand-tech-widget"]');
    
    // Verify utility chart
    await expect(page.locator('[data-testid="projects-by-utility-chart"]')).toBeVisible();
    
    // Verify utility segments
    await expect(page.locator('[data-testid="utility-pge"]')).toBeVisible();
    await expect(page.locator('[data-testid="utility-sce"]')).toBeVisible();
    
    // Verify utility legend
    await expect(page.locator('[data-testid="utility-legend"]')).toBeVisible();
    await expect(page.locator('[data-testid="legend-pge"]')).toContainText('PG&E: 2');
    await expect(page.locator('[data-testid="legend-sce"]')).toContainText('SCE: 1');
  });

  techTest('should display performance metrics', async ({ 
    page,
    techHelper
  }) => {
    // Create completed projects for performance calculation
    const project1 = TestDataGenerator.createProject();
    const project2 = TestDataGenerator.createProject();
    
    await techHelper.createProject(project1);
    await techHelper.createProject(project2);
    
    // Mock performance data
    await page.evaluate(() => {
      localStorage.setItem('tech_performance', JSON.stringify({
        complianceScore: 95,
        averageProcessingTime: 32,
        customerSatisfaction: 4.7,
        successRate: 98,
        documentationScore: 88
      }));
    });
    
    await page.goto('/dashboard');
    await page.click('[data-testid="expand-tech-widget"]');
    
    // Verify performance metrics section
    await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
    
    // Verify individual metrics
    await expect(page.locator('[data-testid="compliance-score"]')).toContainText('95%');
    await expect(page.locator('[data-testid="average-processing-time"]')).toContainText('32 days');
    await expect(page.locator('[data-testid="customer-satisfaction"]')).toContainText('4.7/5.0');
    await expect(page.locator('[data-testid="success-rate"]')).toContainText('98%');
    await expect(page.locator('[data-testid="documentation-score"]')).toContainText('88%');
    
    // Verify performance indicators
    await expect(page.locator('[data-testid="compliance-indicator"]')).toHaveClass(/excellent/);
    await expect(page.locator('[data-testid="satisfaction-indicator"]')).toHaveClass(/excellent/);
  });

  techTest('should show upcoming deadlines and alerts', async ({ 
    page,
    techHelper
  }) => {
    // Create project with upcoming deadline
    const project = TestDataGenerator.createProject();
    await techHelper.createProject(project);
    
    // Mock upcoming deadlines
    await page.evaluate(() => {
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      
      localStorage.setItem('tech_deadlines', JSON.stringify([
        {
          projectId: 'proj1',
          type: 'customer_agreement',
          deadline: tomorrow.toISOString(),
          priority: 'high'
        },
        {
          projectId: 'proj2',
          type: 'documentation_submission',
          deadline: nextWeek.toISOString(),
          priority: 'medium'
        }
      ]));
    });
    
    await page.goto('/dashboard');
    
    // Verify alerts section
    await expect(page.locator('[data-testid="tech-alerts"]')).toBeVisible();
    await expect(page.locator('[data-testid="alerts-header"]')).toContainText('Upcoming Deadlines');
    
    // Verify high priority alert
    await expect(page.locator('[data-testid="deadline-high-priority"]')).toBeVisible();
    await expect(page.locator('[data-testid="deadline-high-priority"]')).toContainText('Customer agreement expires tomorrow');
    await expect(page.locator('[data-testid="deadline-high-priority"]')).toHaveClass(/high-priority/);
    
    // Verify medium priority alert
    await expect(page.locator('[data-testid="deadline-medium-priority"]')).toBeVisible();
    await expect(page.locator('[data-testid="deadline-medium-priority"]')).toContainText('Documentation due in 7 days');
    
    // Verify action buttons
    await expect(page.locator('[data-testid="view-project-deadline"]')).toBeVisible();
    await expect(page.locator('[data-testid="extend-deadline"]')).toBeVisible();
  });
});

techTest.describe('TECH Dashboard Widget Responsive Design', () => {
  let contractor: any;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
  });

  techTest('should adapt to mobile viewport', async ({ 
    page 
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/dashboard');
    
    // Verify mobile-optimized layout
    await expect(page.locator('[data-testid="tech-dashboard-widget"]')).toBeVisible();
    
    // Verify stacked layout on mobile
    await expect(page.locator('[data-testid="tech-summary-metrics"]')).toHaveClass(/mobile-stacked/);
    
    // Verify mobile quick actions
    await expect(page.locator('[data-testid="mobile-quick-actions"]')).toBeVisible();
    await expect(page.locator('[data-testid="mobile-create-project"]')).toBeVisible();
    
    // Verify charts are hidden/simplified on mobile
    await page.click('[data-testid="expand-tech-widget"]');
    await expect(page.locator('[data-testid="mobile-chart-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="projects-by-status-chart"]')).not.toBeVisible();
  });

  techTest('should adapt to tablet viewport', async ({ 
    page 
  }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/dashboard');
    
    // Verify tablet layout
    await expect(page.locator('[data-testid="tech-dashboard-widget"]')).toBeVisible();
    
    // Verify semi-expanded view on tablet
    await expect(page.locator('[data-testid="tablet-layout"]')).toBeVisible();
    
    // Verify charts are simplified but visible
    await page.click('[data-testid="expand-tech-widget"]');
    await expect(page.locator('[data-testid="simplified-charts"]')).toBeVisible();
    await expect(page.locator('[data-testid="projects-by-status-chart"]')).toBeVisible();
  });

  techTest('should maintain functionality across screen sizes', async ({ 
    page,
    techHelper
  }) => {
    const project = TestDataGenerator.createProject();
    await techHelper.createProject(project);
    
    // Test desktop
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');
    await expect(page.locator('[data-testid="total-projects"]')).toContainText('1');
    
    // Test tablet
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.reload();
    await expect(page.locator('[data-testid="total-projects"]')).toContainText('1');
    
    // Test mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload();
    await expect(page.locator('[data-testid="total-projects"]')).toContainText('1');
    
    // Test navigation works on all sizes
    await page.click('[data-testid="create-project-button"]');
    await expect(page.url()).toContain('/tech/projects/new');
  });
});