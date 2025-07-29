/**
 * TECH Clean California Contractor Enrollment E2E Tests
 * 
 * End-to-end tests for the complete contractor enrollment workflow,
 * from initial application through certification and activation.
 */

import { techTest, expect, TestDataGenerator } from './setup';

techTest.describe('TECH Contractor Enrollment Workflow', () => {
  techTest('should complete full enrollment workflow successfully', async ({ 
    page, 
    authHelper, 
    techHelper, 
    testData 
  }) => {
    // Create test contractor
    const contractor = testData.createContractor();
    
    // Login as contractor
    await authHelper.loginAsContractor(contractor);
    
    // Navigate to TECH enrollment page
    await page.goto('/tech/enrollment');
    await expect(page.locator('h1')).toContainText('TECH Clean California Enrollment');
    
    // Check if already enrolled
    const alreadyEnrolled = await page.locator('[data-testid="already-enrolled"]').isVisible();
    if (alreadyEnrolled) {
      console.log('Contractor already enrolled, skipping enrollment test');
      return;
    }
    
    // Fill enrollment form
    await page.selectOption('[data-testid="certification-level"]', contractor.certificationLevel);
    
    // Select service territories
    for (const territory of contractor.serviceTerritories) {
      await page.check(`[data-testid="service-territory-${territory}"]`);
    }
    
    await page.fill('[data-testid="business-license"]', contractor.businessLicense);
    await page.fill('[data-testid="contractor-license"]', contractor.contractorLicense);
    
    // Upload required documents
    await techHelper.uploadMockDocument('[data-testid="insurance-certificate"]', 'insurance-cert.pdf');
    
    // Submit enrollment
    await page.click('[data-testid="submit-enrollment"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="enrollment-success"]')).toBeVisible();
    await expect(page.locator('[data-testid="enrollment-success"]')).toContainText('enrollment submitted successfully');
    
    // Verify enrollment status
    await page.goto('/tech/profile');
    await expect(page.locator('[data-testid="enrollment-status"]')).toContainText('pending');
    
    // Verify notification sent (check for confirmation message)
    await expect(page.locator('[data-testid="notification-sent"]')).toBeVisible();
  });

  techTest('should handle enrollment validation errors', async ({ 
    page, 
    authHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    
    await page.goto('/tech/enrollment');
    
    // Submit form without required fields
    await page.click('[data-testid="submit-enrollment"]');
    
    // Verify validation errors
    await expect(page.locator('[data-testid="validation-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-certification-level"]')).toContainText('Certification level is required');
    await expect(page.locator('[data-testid="error-service-territories"]')).toContainText('At least one service territory required');
    await expect(page.locator('[data-testid="error-business-license"]')).toContainText('Business license is required');
  });

  techTest('should prevent duplicate enrollment', async ({ 
    page, 
    authHelper, 
    techHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    
    // Complete first enrollment
    await techHelper.enrollInTechProgram(contractor);
    
    // Attempt second enrollment
    await page.goto('/tech/enrollment');
    
    // Should show already enrolled message
    await expect(page.locator('[data-testid="already-enrolled"]')).toBeVisible();
    await expect(page.locator('[data-testid="already-enrolled"]')).toContainText('already enrolled');
    
    // Enrollment form should not be visible
    await expect(page.locator('[data-testid="enrollment-form"]')).not.toBeVisible();
  });

  techTest('should show enrollment progress tracking', async ({ 
    page, 
    authHelper, 
    techHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    
    // Complete enrollment
    await techHelper.enrollInTechProgram(contractor);
    
    // Navigate to enrollment status page
    await page.goto('/tech/enrollment/status');
    
    // Verify progress tracking elements
    await expect(page.locator('[data-testid="progress-tracker"]')).toBeVisible();
    await expect(page.locator('[data-testid="step-application"]')).toHaveClass(/completed/);
    await expect(page.locator('[data-testid="step-documents"]')).toHaveClass(/active/);
    
    // Verify status details
    await expect(page.locator('[data-testid="current-status"]')).toContainText('documents under review');
    await expect(page.locator('[data-testid="estimated-completion"]')).toBeVisible();
    
    // Verify next steps
    await expect(page.locator('[data-testid="next-steps"]')).toBeVisible();
    await expect(page.locator('[data-testid="next-steps"]')).toContainText('document verification');
  });
});

techTest.describe('TECH Contractor Training Workflow', () => {
  techTest('should handle training requirements for new contractors', async ({ 
    page, 
    authHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    contractor.certificationLevel = 'basic'; // New contractor requiring training
    
    await authHelper.loginAsContractor(contractor);
    
    // Complete enrollment without training certificates
    await page.goto('/tech/enrollment');
    await page.selectOption('[data-testid="certification-level"]', 'basic');
    await page.check('[data-testid="service-territory-pge"]');
    await page.fill('[data-testid="business-license"]', contractor.businessLicense);
    await page.fill('[data-testid="contractor-license"]', contractor.contractorLicense);
    
    // Submit without training certificates
    await page.click('[data-testid="submit-enrollment"]');
    
    // Should redirect to training requirements
    await expect(page.url()).toContain('/tech/training');
    await expect(page.locator('[data-testid="training-required"]')).toBeVisible();
    
    // Verify training modules listed
    await expect(page.locator('[data-testid="training-module-overview"]')).toBeVisible();
    await expect(page.locator('[data-testid="training-module-installation"]')).toBeVisible();
    await expect(page.locator('[data-testid="training-module-quality"]')).toBeVisible();
    await expect(page.locator('[data-testid="training-module-customer-service"]')).toBeVisible();
    
    // Start training module
    await page.click('[data-testid="start-training-overview"]');
    await expect(page.locator('[data-testid="training-content"]')).toBeVisible();
  });

  techTest('should track training progress', async ({ 
    page, 
    authHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    
    await page.goto('/tech/training');
    
    // Complete first training module
    await page.click('[data-testid="start-training-overview"]');
    await page.click('[data-testid="complete-module"]');
    
    // Verify progress updated
    await expect(page.locator('[data-testid="training-progress"]')).toContainText('25%');
    await expect(page.locator('[data-testid="module-overview-status"]')).toContainText('completed');
    
    // Complete all modules
    const modules = ['installation', 'quality', 'customer-service'];
    for (const module of modules) {
      await page.click(`[data-testid="start-training-${module}"]`);
      await page.click('[data-testid="complete-module"]');
    }
    
    // Verify training completion
    await expect(page.locator('[data-testid="training-progress"]')).toContainText('100%');
    await expect(page.locator('[data-testid="training-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="certification-ready"]')).toBeVisible();
  });

  techTest('should handle advanced certification upgrades', async ({ 
    page, 
    authHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    contractor.certificationLevel = 'advanced';
    
    await authHelper.loginAsContractor(contractor);
    
    await page.goto('/tech/certification/upgrade');
    
    // Verify current certification
    await expect(page.locator('[data-testid="current-certification"]')).toContainText('basic');
    
    // Request advanced certification
    await page.click('[data-testid="request-advanced"]');
    
    // Fill additional requirements
    await page.fill('[data-testid="years-experience"]', '5');
    await page.fill('[data-testid="completed-projects"]', '25');
    
    // Upload additional certificates
    await page.setInputFiles('[data-testid="additional-certifications"]', {
      name: 'advanced-cert.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock certificate')
    });
    
    // Submit upgrade request
    await page.click('[data-testid="submit-upgrade"]');
    
    // Verify submission
    await expect(page.locator('[data-testid="upgrade-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-timeline"]')).toContainText('5-7 business days');
  });
});

techTest.describe('TECH Contractor Profile Management', () => {
  techTest('should display contractor profile information', async ({ 
    page, 
    authHelper, 
    techHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    await page.goto('/tech/profile');
    
    // Verify profile information
    await expect(page.locator('[data-testid="contractor-id"]')).toBeVisible();
    await expect(page.locator('[data-testid="enrollment-status"]')).toContainText('pending');
    await expect(page.locator('[data-testid="certification-level"]')).toContainText(contractor.certificationLevel);
    await expect(page.locator('[data-testid="service-territories"]')).toContainText('PG&E');
    await expect(page.locator('[data-testid="business-license"]')).toContainText(contractor.businessLicense);
    
    // Verify performance metrics section
    await expect(page.locator('[data-testid="performance-metrics"]')).toBeVisible();
    await expect(page.locator('[data-testid="projects-completed"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-score"]')).toBeVisible();
    await expect(page.locator('[data-testid="customer-satisfaction"]')).toBeVisible();
  });

  techTest('should allow profile updates', async ({ 
    page, 
    authHelper, 
    techHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    await page.goto('/tech/profile');
    
    // Click edit profile
    await page.click('[data-testid="edit-profile"]');
    
    // Update service territories
    await page.uncheck('[data-testid="service-territory-sce"]');
    await page.check('[data-testid="service-territory-smud"]');
    
    // Update contact information
    await page.fill('[data-testid="phone-number"]', '(555) 987-6543');
    await page.fill('[data-testid="emergency-contact"]', 'Jane Doe - (555) 123-4567');
    
    // Save changes
    await page.click('[data-testid="save-profile"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="profile-updated"]')).toBeVisible();
    
    // Verify changes persisted
    await page.reload();
    await expect(page.locator('[data-testid="service-territories"]')).not.toContainText('SCE');
    await expect(page.locator('[data-testid="service-territories"]')).toContainText('SMUD');
    await expect(page.locator('[data-testid="phone-number"]')).toHaveValue('(555) 987-6543');
  });

  techTest('should show contractor activity timeline', async ({ 
    page, 
    authHelper, 
    techHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    await page.goto('/tech/profile');
    
    // Navigate to activity tab
    await page.click('[data-testid="activity-tab"]');
    
    // Verify timeline elements
    await expect(page.locator('[data-testid="activity-timeline"]')).toBeVisible();
    await expect(page.locator('[data-testid="enrollment-activity"]')).toBeVisible();
    await expect(page.locator('[data-testid="enrollment-activity"]')).toContainText('Enrollment submitted');
    
    // Verify activity details
    await page.click('[data-testid="enrollment-activity"]');
    await expect(page.locator('[data-testid="activity-details"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-timestamp"]')).toBeVisible();
    await expect(page.locator('[data-testid="activity-description"]')).toContainText('TECH program enrollment');
  });
});

techTest.describe('TECH Contractor Re-certification', () => {
  techTest('should show re-certification reminders', async ({ 
    page, 
    authHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    
    // Simulate contractor with certification expiring soon
    await page.goto('/tech/profile');
    
    // Mock certification expiry (this would normally be set in the database)
    await page.evaluate(() => {
      localStorage.setItem('tech_cert_expiry', new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString());
    });
    
    await page.reload();
    
    // Verify re-certification reminder
    await expect(page.locator('[data-testid="recertification-reminder"]')).toBeVisible();
    await expect(page.locator('[data-testid="recertification-reminder"]')).toContainText('expires in 60 days');
    
    // Click re-certification link
    await page.click('[data-testid="start-recertification"]');
    
    // Verify navigation to re-certification page
    await expect(page.url()).toContain('/tech/recertification');
    await expect(page.locator('[data-testid="recertification-form"]')).toBeVisible();
  });

  techTest('should handle re-certification process', async ({ 
    page, 
    authHelper 
  }) => {
    const contractor = TestDataGenerator.createContractor();
    await authHelper.loginAsContractor(contractor);
    
    await page.goto('/tech/recertification');
    
    // Verify current certification info
    await expect(page.locator('[data-testid="current-certification"]')).toBeVisible();
    await expect(page.locator('[data-testid="expiry-date"]')).toBeVisible();
    
    // Complete continuing education requirements
    await page.check('[data-testid="ce-requirement-safety"]');
    await page.check('[data-testid="ce-requirement-efficiency"]');
    await page.check('[data-testid="ce-requirement-regulations"]');
    
    // Upload CE certificates
    await page.setInputFiles('[data-testid="ce-certificates"]', {
      name: 'ce-certificate.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock CE certificate')
    });
    
    // Submit re-certification
    await page.click('[data-testid="submit-recertification"]');
    
    // Verify submission
    await expect(page.locator('[data-testid="recertification-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-timeline"]')).toContainText('review within 10 business days');
    
    // Verify status updated
    await page.goto('/tech/profile');
    await expect(page.locator('[data-testid="certification-status"]')).toContainText('renewal under review');
  });
});