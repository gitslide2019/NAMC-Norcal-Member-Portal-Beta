/**
 * TECH Clean California Incentive Processing E2E Tests
 * 
 * End-to-end tests for incentive calculation, processing, and payment
 * tracking workflows in the TECH Clean California program.
 */

import { techTest, expect, TestDataGenerator } from './setup';

techTest.describe('TECH Incentive Calculation', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
  });

  techTest('should calculate base HVAC incentive correctly', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify base incentive calculation
    await expect(page.locator('[data-testid="incentive-calculator"]')).toBeVisible();
    await expect(page.locator('[data-testid="base-incentive"]')).toBeVisible();
    
    // Check base HVAC incentive amount
    const baseIncentive = await page.locator('[data-testid="base-incentive-amount"]').textContent();
    const amount = parseFloat(baseIncentive?.replace(/[$,]/g, '') || '0');
    expect(amount).toBe(3000); // Standard HVAC base incentive
    
    // Verify incentive breakdown
    await expect(page.locator('[data-testid="incentive-breakdown"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-type-incentive"]')).toContainText('HVAC Heat Pump: $3,000');
  });

  techTest('should calculate combined system incentive', async ({ 
    page 
  }) => {
    // Update project to combined HVAC + HPWH system
    await page.goto(`/tech/projects/${projectId}/edit`);
    await page.selectOption('[data-testid="project-type"]', 'both');
    await page.click('[data-testid="save-project"]');
    
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify combined incentive calculation
    const totalIncentive = await page.locator('[data-testid="total-incentive-amount"]').textContent();
    const amount = parseFloat(totalIncentive?.replace(/[$,]/g, '') || '0');
    expect(amount).toBe(4500); // HVAC ($3,000) + HPWH ($1,500)
    
    // Verify breakdown shows both systems
    await expect(page.locator('[data-testid="hvac-incentive"]')).toContainText('$3,000');
    await expect(page.locator('[data-testid="hpwh-incentive"]')).toContainText('$1,500');
  });

  techTest('should apply utility-specific bonuses', async ({ 
    page 
  }) => {
    // Set project to PG&E territory (has demand response bonus)
    await page.goto(`/tech/projects/${projectId}/edit`);
    await page.selectOption('[data-testid="utility-territory"]', 'pge');
    await page.click('[data-testid="save-project"]');
    
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify demand response bonus applied
    await expect(page.locator('[data-testid="demand-response-bonus"]')).toBeVisible();
    await expect(page.locator('[data-testid="demand-response-bonus"]')).toContainText('15%');
    
    // Calculate expected total with bonus
    const baseAmount = 3000; // HVAC base
    const bonusAmount = baseAmount * 0.15; // 15% bonus
    const expectedTotal = baseAmount + bonusAmount;
    
    const totalIncentive = await page.locator('[data-testid="total-incentive-amount"]').textContent();
    const actualAmount = parseFloat(totalIncentive?.replace(/[$,]/g, '') || '0');
    expect(actualAmount).toBeCloseTo(expectedTotal, 2);
  });

  techTest('should enforce utility maximum limits', async ({ 
    page 
  }) => {
    // Create high-value project that would exceed PG&E limit
    await page.goto(`/tech/projects/${projectId}/edit`);
    await page.selectOption('[data-testid="project-type"]', 'both');
    await page.selectOption('[data-testid="utility-territory"]', 'pge');
    
    // Mock high-efficiency equipment with premium pricing
    await page.evaluate(() => {
      localStorage.setItem('premium_equipment', 'true');
      localStorage.setItem('base_incentive_multiplier', '4'); // Would result in $18,000 before cap
    });
    
    await page.click('[data-testid="save-project"]');
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify incentive capped at PG&E maximum
    const totalIncentive = await page.locator('[data-testid="total-incentive-amount"]').textContent();
    const amount = parseFloat(totalIncentive?.replace(/[$,]/g, '') || '0');
    expect(amount).toBe(15000); // PG&E maximum limit
    
    // Verify cap warning displayed
    await expect(page.locator('[data-testid="incentive-cap-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="incentive-cap-warning"]')).toContainText('incentive capped at utility maximum');
  });

  techTest('should calculate income-qualified bonuses', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/edit`);
    
    // Mark customer as income-qualified
    await page.check('[data-testid="income-qualified"]');
    await page.fill('[data-testid="household-income"]', '45000');
    await page.selectOption('[data-testid="household-size"]', '4');
    
    await page.click('[data-testid="save-project"]');
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify income-qualified bonus applied
    await expect(page.locator('[data-testid="income-qualified-bonus"]')).toBeVisible();
    await expect(page.locator('[data-testid="income-qualified-bonus"]')).toContainText('Additional $1,000');
    
    // Verify total includes bonus
    const totalIncentive = await page.locator('[data-testid="total-incentive-amount"]').textContent();
    const amount = parseFloat(totalIncentive?.replace(/[$,]/g, '') || '0');
    expect(amount).toBe(4000); // Base $3,000 + Income-qualified $1,000
  });
});

techTest.describe('TECH Incentive Pre-approval Process', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
  });

  techTest('should request incentive pre-approval', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}`);
    
    // Click request pre-approval
    await page.click('[data-testid="request-preapproval"]');
    
    // Verify pre-approval form
    await expect(page.locator('[data-testid="preapproval-form"]')).toBeVisible();
    
    // Fill additional details for pre-approval
    await page.fill('[data-testid="estimated-installation-date"]', '2024-02-15');
    await page.fill('[data-testid="customer-email"]', 'customer@example.com');
    await page.fill('[data-testid="special-requirements"]', 'Second-floor installation, crane access needed');
    
    // Submit pre-approval request
    await page.click('[data-testid="submit-preapproval"]');
    
    // Verify submission success
    await expect(page.locator('[data-testid="preapproval-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="preapproval-submitted"]')).toContainText('pre-approval request submitted');
    
    // Verify project status updated
    await expect(page.locator('[data-testid="project-status"]')).toContainText('preapproval_requested');
    
    // Verify estimated response time
    await expect(page.locator('[data-testid="preapproval-timeline"]')).toContainText('5-7 business days');
  });

  techTest('should handle pre-approval approval', async ({ 
    page 
  }) => {
    // Submit pre-approval request first
    await page.goto(`/tech/projects/${projectId}`);
    await page.click('[data-testid="request-preapproval"]');
    await page.fill('[data-testid="estimated-installation-date"]', '2024-02-15');
    await page.click('[data-testid="submit-preapproval"]');
    
    // Mock pre-approval approval (would normally come from admin action)
    await page.evaluate(() => {
      window.postMessage({ 
        type: 'PREAPPROVAL_APPROVED', 
        projectId: arguments[0],
        approvedAmount: 3450,
        conditions: ['Installation must be completed by 2024-03-15', 'Demand Response enrollment required']
      }, '*');
    }, projectId);
    
    await page.reload();
    
    // Verify pre-approval approved
    await expect(page.locator('[data-testid="preapproval-approved"]')).toBeVisible();
    await expect(page.locator('[data-testid="approved-amount"]')).toContainText('$3,450');
    
    // Verify approval conditions
    await expect(page.locator('[data-testid="approval-conditions"]')).toBeVisible();
    await expect(page.locator('[data-testid="condition-deadline"]')).toContainText('2024-03-15');
    await expect(page.locator('[data-testid="condition-demand-response"]')).toContainText('Demand Response enrollment required');
    
    // Verify project can proceed to installation
    await expect(page.locator('[data-testid="proceed-to-installation"]')).toBeVisible();
    await expect(page.locator('[data-testid="proceed-to-installation"]')).not.toBeDisabled();
  });

  techTest('should handle pre-approval rejection', async ({ 
    page 
  }) => {
    // Submit pre-approval request
    await page.goto(`/tech/projects/${projectId}`);
    await page.click('[data-testid="request-preapproval"]');
    await page.fill('[data-testid="estimated-installation-date"]', '2024-02-15');
    await page.click('[data-testid="submit-preapproval"]');
    
    // Mock pre-approval rejection
    await page.evaluate(() => {
      window.postMessage({ 
        type: 'PREAPPROVAL_REJECTED', 
        projectId: arguments[0],
        reason: 'Equipment model not on approved list',
        recommendations: ['Switch to approved Mitsubishi model', 'Update equipment specifications', 'Resubmit with correct documentation']
      }, '*');
    }, projectId);
    
    await page.reload();
    
    // Verify pre-approval rejected
    await expect(page.locator('[data-testid="preapproval-rejected"]')).toBeVisible();
    await expect(page.locator('[data-testid="rejection-reason"]')).toContainText('Equipment model not on approved list');
    
    // Verify recommendations displayed
    await expect(page.locator('[data-testid="rejection-recommendations"]')).toBeVisible();
    await expect(page.locator('[data-testid="recommendation-equipment"]')).toContainText('Switch to approved Mitsubishi model');
    
    // Verify resubmission option
    await expect(page.locator('[data-testid="resubmit-preapproval"]')).toBeVisible();
    await expect(page.locator('[data-testid="edit-project-details"]')).toBeVisible();
  });
});

techTest.describe('TECH Incentive Submission & Payment', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ authHelper, techHelper, testData, page }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
    
    // Complete project through documentation phase
    await page.evaluate(() => {
      window.postMessage({ 
        type: 'PROJECT_DOCUMENTATION_COMPLETE', 
        projectId: arguments[0]
      }, '*');
    }, projectId);
  });

  techTest('should submit incentive application', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}`);
    
    // Verify ready for incentive submission
    await expect(page.locator('[data-testid="ready-for-submission"]')).toBeVisible();
    
    // Click submit for incentive
    await page.click('[data-testid="submit-incentive-application"]');
    
    // Verify submission package preparation
    await expect(page.locator('[data-testid="preparing-submission"]')).toBeVisible();
    
    // Wait for package completion
    await page.waitForTimeout(3000);
    
    // Verify submission package ready
    await expect(page.locator('[data-testid="submission-package-ready"]')).toBeVisible();
    
    // Review submission package
    await page.click('[data-testid="review-submission-package"]');
    
    // Verify package contents
    await expect(page.locator('[data-testid="package-contents"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-agreement"]')).toBeVisible();
    await expect(page.locator('[data-testid="installation-photos"]')).toBeVisible();
    await expect(page.locator('[data-testid="equipment-specs"]')).toBeVisible();
    await expect(page.locator('[data-testid="compliance-checklist"]')).toBeVisible();
    
    // Submit to utility
    await page.click('[data-testid="submit-to-utility"]');
    
    // Verify submission confirmation
    await expect(page.locator('[data-testid="submission-confirmed"]')).toBeVisible();
    await expect(page.locator('[data-testid="submission-id"]')).toBeVisible();
    
    // Verify project status updated
    await expect(page.locator('[data-testid="project-status"]')).toContainText('incentive_submitted');
  });

  techTest('should track utility processing status', async ({ 
    page 
  }) => {
    // Submit incentive application first
    await page.goto(`/tech/projects/${projectId}`);
    await page.click('[data-testid="submit-incentive-application"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="submit-to-utility"]');
    
    // Navigate to payment tracking
    await page.click('[data-testid="track-payment"]');
    
    // Verify tracking interface
    await expect(page.locator('[data-testid="payment-tracking"]')).toBeVisible();
    await expect(page.locator('[data-testid="submission-status"]')).toContainText('submitted');
    
    // Mock utility processing updates
    await page.evaluate(() => {
      window.postMessage({ 
        type: 'UTILITY_STATUS_UPDATE', 
        projectId: arguments[0],
        status: 'under_review',
        estimatedProcessingDays: 28
      }, '*');
    }, projectId);
    
    await page.reload();
    
    // Verify status update
    await expect(page.locator('[data-testid="processing-status"]')).toContainText('under_review');
    await expect(page.locator('[data-testid="estimated-completion"]')).toContainText('28 days');
    
    // Verify progress timeline
    await expect(page.locator('[data-testid="processing-timeline"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-submitted"]')).toHaveClass(/completed/);
    await expect(page.locator('[data-testid="step-review"]')).toHaveClass(/active/);
    await expect(page.locator('[data-testid="step-approval"]')).toHaveClass(/pending/);
    await expect(page.locator('[data-testid="step-payment"]')).toHaveClass(/pending/);
  });

  techTest('should handle incentive approval and payment', async ({ 
    page 
  }) => {
    // Submit incentive and advance to approval
    await page.goto(`/tech/projects/${projectId}`);
    await page.click('[data-testid="submit-incentive-application"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="submit-to-utility"]');
    
    // Mock utility approval
    await page.evaluate(() => {
      window.postMessage({ 
        type: 'INCENTIVE_APPROVED', 
        projectId: arguments[0],
        approvedAmount: 3450,
        paymentScheduleDate: '2024-02-28'
      }, '*');
    }, projectId);
    
    await page.reload();
    
    // Verify approval notification
    await expect(page.locator('[data-testid="incentive-approved"]')).toBeVisible();
    await expect(page.locator('[data-testid="approved-amount"]')).toContainText('$3,450');
    await expect(page.locator('[data-testid="payment-date"]')).toContainText('2024-02-28');
    
    // Mock payment processing
    await page.evaluate(() => {
      window.postMessage({ 
        type: 'PAYMENT_PROCESSED', 
        projectId: arguments[0],
        paymentAmount: 3450,
        paymentDate: '2024-02-28',
        checkNumber: 'PGE-2024-789123'
      }, '*');
    }, projectId);
    
    await page.reload();
    
    // Verify payment confirmation
    await expect(page.locator('[data-testid="payment-confirmed"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-amount"]')).toContainText('$3,450');
    await expect(page.locator('[data-testid="check-number"]')).toContainText('PGE-2024-789123');
    
    // Verify project completion
    await expect(page.locator('[data-testid="project-status"]')).toContainText('completed');
    await expect(page.locator('[data-testid="completion-date"]')).toBeVisible();
  });

  techTest('should handle incentive rejections and appeals', async ({ 
    page 
  }) => {
    // Submit incentive application
    await page.goto(`/tech/projects/${projectId}`);
    await page.click('[data-testid="submit-incentive-application"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="submit-to-utility"]');
    
    // Mock utility rejection
    await page.evaluate(() => {
      window.postMessage({ 
        type: 'INCENTIVE_REJECTED', 
        projectId: arguments[0],
        rejectionReasons: [
          'Installation photos do not show proper refrigerant line insulation',
          'Equipment model efficiency rating could not be verified',
          'Customer signature on agreement is unclear'
        ],
        appealDeadline: '2024-03-15'
      }, '*');
    }, projectId);
    
    await page.reload();
    
    // Verify rejection notification
    await expect(page.locator('[data-testid="incentive-rejected"]')).toBeVisible();
    await expect(page.locator('[data-testid="rejection-reasons"]')).toBeVisible();
    
    // Check specific rejection reasons
    await expect(page.locator('[data-testid="reason-insulation"]')).toContainText('refrigerant line insulation');
    await expect(page.locator('[data-testid="reason-efficiency"]')).toContainText('efficiency rating could not be verified');
    await expect(page.locator('[data-testid="reason-signature"]')).toContainText('signature on agreement is unclear');
    
    // Verify appeal option
    await expect(page.locator('[data-testid="appeal-deadline"]')).toContainText('2024-03-15');
    await expect(page.locator('[data-testid="file-appeal"]')).toBeVisible();
    
    // File appeal
    await page.click('[data-testid="file-appeal"]');
    
    // Fill appeal form
    await page.fill('[data-testid="appeal-reason"]', 'Providing corrected documentation and clearer photos');
    
    // Upload corrected documentation
    await page.setInputFiles('[data-testid="corrected-photos"]', {
      name: 'corrected-installation-photos.zip',
      mimeType: 'application/zip',
      buffer: Buffer.from('Mock corrected photos package')
    });
    
    await page.setInputFiles('[data-testid="corrected-agreement"]', {
      name: 'corrected-customer-agreement.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock corrected customer agreement')
    });
    
    // Submit appeal
    await page.click('[data-testid="submit-appeal"]');
    
    // Verify appeal submission
    await expect(page.locator('[data-testid="appeal-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="appeal-confirmation"]')).toContainText('appeal submitted successfully');
    
    // Verify project status updated
    await expect(page.locator('[data-testid="project-status"]')).toContainText('appeal_pending');
  });
});

techTest.describe('TECH Payment Analytics & Reporting', () => {
  let contractor: any;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
  });

  techTest('should display payment summary dashboard', async ({ 
    page 
  }) => {
    await page.goto('/tech/payments');
    
    // Verify payment dashboard
    await expect(page.locator('[data-testid="payment-dashboard"]')).toBeVisible();
    
    // Verify summary metrics
    await expect(page.locator('[data-testid="total-earned"]')).toBeVisible();
    await expect(page.locator('[data-testid="pending-payments"]')).toBeVisible();
    await expect(page.locator('[data-testid="average-processing-time"]')).toBeVisible();
    await expect(page.locator('[data-testid="success-rate"]')).toBeVisible();
    
    // Verify payment by utility breakdown
    await expect(page.locator('[data-testid="payments-by-utility"]')).toBeVisible();
    await expect(page.locator('[data-testid="pge-payments"]')).toBeVisible();
    await expect(page.locator('[data-testid="sce-payments"]')).toBeVisible();
    await expect(page.locator('[data-testid="smud-payments"]')).toBeVisible();
  });

  techTest('should generate payment reports', async ({ 
    page 
  }) => {
    await page.goto('/tech/payments');
    
    // Click generate report
    await page.click('[data-testid="generate-payment-report"]');
    
    // Select report parameters
    await page.selectOption('[data-testid="report-period"]', 'year_to_date');
    await page.selectOption('[data-testid="report-format"]', 'pdf');
    await page.check('[data-testid="include-project-details"]');
    
    // Generate report
    await page.click('[data-testid="create-report"]');
    
    // Verify report generation
    await expect(page.locator('[data-testid="report-generating"]')).toBeVisible();
    
    // Wait for report completion
    await page.waitForTimeout(3000);
    
    // Verify report ready
    await expect(page.locator('[data-testid="report-ready"]')).toBeVisible();
    await expect(page.locator('[data-testid="download-report"]')).toBeVisible();
    
    // Verify report contents preview
    await page.click('[data-testid="preview-report"]');
    await expect(page.locator('[data-testid="report-preview"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-projects-summary"]')).toBeVisible();
    await expect(page.locator('[data-testid="payment-timeline-chart"]')).toBeVisible();
  });
});