/**
 * TECH Clean California Project Lifecycle E2E Tests
 * 
 * End-to-end tests for the complete project lifecycle workflow,
 * from project creation through incentive payment processing.
 */

import { techTest, expect, TestDataGenerator } from './setup';

techTest.describe('TECH Project Creation and Initiation', () => {
  let contractor: any;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
  });

  techTest('should create new TECH project successfully', async ({ 
    page, 
    authHelper, 
    techHelper, 
    testData 
  }) => {
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    const projectId = await techHelper.createProject(project);
    
    // Verify project created
    expect(projectId).toBeTruthy();
    
    // Navigate to project details
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify project information
    await expect(page.locator('[data-testid="project-id"]')).toContainText(projectId);
    await expect(page.locator('[data-testid="project-type"]')).toContainText(project.projectType.toUpperCase());
    await expect(page.locator('[data-testid="utility-territory"]')).toContainText('PG&E');
    await expect(page.locator('[data-testid="project-status"]')).toContainText('inquiry');
    
    // Verify installation address
    await expect(page.locator('[data-testid="installation-address"]')).toContainText(project.installationAddress.street);
    await expect(page.locator('[data-testid="installation-city"]')).toContainText(project.installationAddress.city);
    
    // Verify equipment details
    await expect(page.locator('[data-testid="equipment-manufacturer"]')).toContainText(project.equipmentDetails.manufacturer);
    await expect(page.locator('[data-testid="equipment-model"]')).toContainText(project.equipmentDetails.model);
  });

  techTest('should calculate incentive estimate accurately', async ({ 
    page, 
    authHelper, 
    techHelper, 
    testData 
  }) => {
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    project.utilityTerritory = 'pge'; // PG&E has demand response bonus
    
    const projectId = await techHelper.createProject(project);
    
    // Navigate to project details
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify incentive calculation
    await expect(page.locator('[data-testid="base-incentive"]')).toBeVisible();
    await expect(page.locator('[data-testid="estimated-incentive"]')).toBeVisible();
    
    // Check for demand response bonus (PG&E specific)
    await expect(page.locator('[data-testid="demand-response-bonus"]')).toBeVisible();
    await expect(page.locator('[data-testid="demand-response-bonus"]')).toContainText('15%');
    
    // Verify total incentive amount
    const incentiveText = await page.locator('[data-testid="total-incentive"]').textContent();
    const incentiveAmount = parseFloat(incentiveText?.replace(/[$,]/g, '') || '0');
    expect(incentiveAmount).toBeGreaterThan(3000); // Base HVAC incentive
    expect(incentiveAmount).toBeLessThan(15000); // PG&E max incentive
  });

  techTest('should validate project data during creation', async ({ 
    page, 
    authHelper, 
    techHelper 
  }) => {
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    await page.goto('/tech/projects/new');
    
    // Try to submit without required fields
    await page.click('[data-testid="submit-project"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="error-project-type"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-utility-territory"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-installation-address"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-equipment-details"]')).toBeVisible();
    
    // Fill invalid data
    await page.fill('[data-testid="installation-zipcode"]', '123'); // Invalid ZIP
    await page.fill('[data-testid="equipment-efficiency"]', 'Invalid Rating'); // Invalid efficiency
    
    await page.click('[data-testid="submit-project"]');
    
    // Verify specific validation messages
    await expect(page.locator('[data-testid="error-zipcode"]')).toContainText('valid ZIP code');
    await expect(page.locator('[data-testid="error-efficiency"]')).toContainText('valid efficiency rating');
  });
});

techTest.describe('TECH Customer Agreement Workflow', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
  });

  techTest('should generate customer agreement automatically', async ({ 
    page, 
    authHelper 
  }) => {
    await page.goto(`/tech/projects/${projectId}`);
    
    // Wait for project to move to agreement pending status
    await page.waitForTimeout(2000); // Simulate workflow delay
    
    // Check if agreement generation triggered
    await expect(page.locator('[data-testid="agreement-status"]')).toContainText('pending');
    
    // Navigate to agreement tab
    await page.click('[data-testid="agreement-tab"]');
    
    // Verify agreement generated
    await expect(page.locator('[data-testid="customer-agreement"]')).toBeVisible();
    await expect(page.locator('[data-testid="agreement-pdf"]')).toBeVisible();
    
    // Verify agreement contains project details
    await expect(page.locator('[data-testid="agreement-project-id"]')).toContainText(projectId);
    await expect(page.locator('[data-testid="agreement-incentive-amount"]')).toBeVisible();
    
    // Verify signature placeholders
    await expect(page.locator('[data-testid="customer-signature-field"]')).toBeVisible();
    await expect(page.locator('[data-testid="contractor-signature-field"]')).toBeVisible();
  });

  techTest('should handle customer agreement signing', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/agreement`);
    
    // Simulate customer signing process
    await page.click('[data-testid="send-for-signature"]');
    
    // Verify customer notification sent
    await expect(page.locator('[data-testid="signature-request-sent"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-email-sent"]')).toContainText('signature request sent');
    
    // Simulate customer signature completion (would normally be external DocuSign flow)
    await page.evaluate(() => {
      // Mock customer signature completion
      window.postMessage({ type: 'SIGNATURE_COMPLETE', customerSigned: true }, '*');
    });
    
    // Wait for signature status update
    await page.waitForTimeout(1000);
    
    // Verify agreement signed status
    await expect(page.locator('[data-testid="customer-signature-status"]')).toContainText('signed');
    await expect(page.locator('[data-testid="signature-date"]')).toBeVisible();
    
    // Verify project status updated
    await page.goto(`/tech/projects/${projectId}`);
    await expect(page.locator('[data-testid="project-status"]')).toContainText('agreement_signed');
  });

  techTest('should handle agreement expiration', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/agreement`);
    
    // Mock expired agreement (set expiry date in past)
    await page.evaluate(() => {
      localStorage.setItem('agreement_expiry', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
    });
    
    await page.reload();
    
    // Verify expiration warning
    await expect(page.locator('[data-testid="agreement-expired"]')).toBeVisible();
    await expect(page.locator('[data-testid="agreement-expired"]')).toContainText('agreement has expired');
    
    // Verify regeneration option
    await expect(page.locator('[data-testid="regenerate-agreement"]')).toBeVisible();
    
    // Click regenerate
    await page.click('[data-testid="regenerate-agreement"]');
    
    // Verify new agreement generated
    await expect(page.locator('[data-testid="agreement-regenerated"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-expiry-date"]')).toBeVisible();
  });
});

techTest.describe('TECH Installation Management', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ page, authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
    
    // Mock signed agreement to proceed to installation
    await page.goto(`/tech/projects/${projectId}`);
    await page.evaluate(() => {
      window.postMessage({ type: 'AGREEMENT_SIGNED', projectId: arguments[0] }, '*');
    }, projectId);
  });

  techTest('should schedule installation after agreement signing', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/installation`);
    
    // Verify installation scheduling form
    await expect(page.locator('[data-testid="installation-scheduling"]')).toBeVisible();
    
    // Schedule installation
    const installationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
    await page.fill('[data-testid="installation-date"]', installationDate.toISOString().split('T')[0]);
    await page.fill('[data-testid="installation-time"]', '09:00');
    
    // Add installation notes
    await page.fill('[data-testid="installation-notes"]', 'Customer prefers morning installation. Access through side gate.');
    
    // Submit schedule
    await page.click('[data-testid="schedule-installation"]');
    
    // Verify scheduling success
    await expect(page.locator('[data-testid="installation-scheduled"]')).toBeVisible();
    
    // Verify calendar event created
    await expect(page.locator('[data-testid="calendar-event-created"]')).toBeVisible();
    
    // Verify customer notification sent
    await expect(page.locator('[data-testid="customer-notified"]')).toBeVisible();
    
    // Verify project status updated
    await page.goto(`/tech/projects/${projectId}`);
    await expect(page.locator('[data-testid="project-status"]')).toContainText('installation_scheduled');
  });

  techTest('should track installation progress', async ({ 
    page 
  }) => {
    // Schedule installation first
    await page.goto(`/tech/projects/${projectId}/installation`);
    const installationDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    await page.fill('[data-testid="installation-date"]', installationDate.toISOString().split('T')[0]);
    await page.click('[data-testid="schedule-installation"]');
    
    // Navigate to installation tracking
    await page.goto(`/tech/projects/${projectId}/installation/track`);
    
    // Mark installation as started
    await page.click('[data-testid="start-installation"]');
    
    // Verify status updated
    await expect(page.locator('[data-testid="installation-status"]')).toContainText('in_progress');
    await expect(page.locator('[data-testid="installation-start-time"]')).toBeVisible();
    
    // Update installation progress
    await page.click('[data-testid="equipment-installed"]');
    await page.click('[data-testid="electrical-connected"]');
    await page.click('[data-testid="testing-complete"]');
    
    // Verify progress indicators
    await expect(page.locator('[data-testid="progress-equipment"]')).toHaveClass(/completed/);
    await expect(page.locator('[data-testid="progress-electrical"]')).toHaveClass(/completed/);
    await expect(page.locator('[data-testid="progress-testing"]')).toHaveClass(/completed/);
    
    // Mark installation complete
    await page.click('[data-testid="complete-installation"]');
    
    // Verify completion
    await expect(page.locator('[data-testid="installation-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-timestamp"]')).toBeVisible();
    
    // Verify project status updated
    await page.goto(`/tech/projects/${projectId}`);
    await expect(page.locator('[data-testid="project-status"]')).toContainText('installation_complete');
  });

  techTest('should handle installation delays and rescheduling', async ({ 
    page 
  }) => {
    // Schedule installation
    await page.goto(`/tech/projects/${projectId}/installation`);
    const installationDate = new Date(Date.now() + 1 * 24 * 60 * 60 * 1000);
    await page.fill('[data-testid="installation-date"]', installationDate.toISOString().split('T')[0]);
    await page.click('[data-testid="schedule-installation"]');
    
    // Request reschedule
    await page.click('[data-testid="reschedule-installation"]');
    
    // Fill reschedule form
    await page.selectOption('[data-testid="reschedule-reason"]', 'weather');
    await page.fill('[data-testid="reschedule-notes"]', 'Heavy rain expected, rescheduling for safety.');
    
    const newDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    await page.fill('[data-testid="new-installation-date"]', newDate.toISOString().split('T')[0]);
    
    // Submit reschedule
    await page.click('[data-testid="submit-reschedule"]');
    
    // Verify reschedule success
    await expect(page.locator('[data-testid="reschedule-confirmed"]')).toBeVisible();
    
    // Verify customer notified
    await expect(page.locator('[data-testid="customer-reschedule-notification"]')).toBeVisible();
    
    // Verify new date reflected
    await expect(page.locator('[data-testid="installation-date"]')).toContainText(newDate.toLocaleDateString());
  });
});

techTest.describe('TECH Project Status Tracking', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
  });

  techTest('should display project timeline and milestones', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/timeline`);
    
    // Verify timeline structure
    await expect(page.locator('[data-testid="project-timeline"]')).toBeVisible();
    
    // Verify milestone stages
    await expect(page.locator('[data-testid="milestone-inquiry"]')).toHaveClass(/completed/);
    await expect(page.locator('[data-testid="milestone-agreement"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="milestone-installation"]')).toHaveClass(/pending/);
    await expect(page.locator('[data-testid="milestone-documentation"]')).toHaveClass(/pending/);
    await expect(page.locator('[data-testid="milestone-payment"]')).toHaveClass(/pending/);
    
    // Verify stage details
    await page.click('[data-testid="milestone-inquiry"]');
    await expect(page.locator('[data-testid="milestone-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="completion-date"]')).toBeVisible();
    await expect(page.locator('[data-testid="stage-duration"]')).toBeVisible();
  });

  techTest('should show upcoming deadlines and reminders', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify deadline section
    await expect(page.locator('[data-testid="upcoming-deadlines"]')).toBeVisible();
    
    // Mock upcoming deadline
    await page.evaluate(() => {
      const deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      localStorage.setItem('agreement_deadline', deadline.toISOString());
    });
    
    await page.reload();
    
    // Verify deadline display
    await expect(page.locator('[data-testid="agreement-deadline"]')).toBeVisible();
    await expect(page.locator('[data-testid="deadline-date"]')).toContainText('7 days');
    await expect(page.locator('[data-testid="deadline-priority"]')).toHaveClass(/high/);
    
    // Verify reminder actions
    await expect(page.locator('[data-testid="set-reminder"]')).toBeVisible();
    await expect(page.locator('[data-testid="extend-deadline"]')).toBeVisible();
  });

  techTest('should handle project status updates', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}`);
    
    // Admin-only status update (mock admin permissions)
    await page.evaluate(() => {
      localStorage.setItem('user_role', 'admin');
    });
    
    await page.reload();
    
    // Verify status update controls visible for admin
    await expect(page.locator('[data-testid="update-status"]')).toBeVisible();
    
    // Update project status
    await page.click('[data-testid="update-status"]');
    await page.selectOption('[data-testid="new-status"]', 'installation_scheduled');
    await page.fill('[data-testid="status-notes"]', 'Installation confirmed for next week');
    
    await page.click('[data-testid="confirm-status-update"]');
    
    // Verify status updated
    await expect(page.locator('[data-testid="status-updated"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-status"]')).toContainText('installation_scheduled');
    
    // Verify status history logged
    await page.click('[data-testid="status-history"]');
    await expect(page.locator('[data-testid="status-change-log"]')).toBeVisible();
    await expect(page.locator('[data-testid="latest-status-change"]')).toContainText('installation_scheduled');
  });

  techTest('should calculate and display project metrics', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/metrics`);
    
    // Verify metrics dashboard
    await expect(page.locator('[data-testid="project-metrics"]')).toBeVisible();
    
    // Verify timing metrics
    await expect(page.locator('[data-testid="project-duration"]')).toBeVisible();
    await expect(page.locator('[data-testid="current-stage-duration"]')).toBeVisible();
    await expect(page.locator('[data-testid="estimated-completion"]')).toBeVisible();
    
    // Verify financial metrics
    await expect(page.locator('[data-testid="estimated-incentive"]')).toBeVisible();
    await expect(page.locator('[data-testid="project-cost"]')).toBeVisible();
    await expect(page.locator('[data-testid="savings-calculation"]')).toBeVisible();
    
    // Verify performance indicators
    await expect(page.locator('[data-testid="on-time-performance"]')).toBeVisible();
    await expect(page.locator('[data-testid="budget-variance"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-score"]')).toBeVisible();
  });
});