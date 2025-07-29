/**
 * TECH Clean California Documentation & Compliance E2E Tests
 * 
 * End-to-end tests for documentation upload, validation, and compliance
 * checking workflows in the TECH Clean California program.
 */

import { techTest, expect, TestDataGenerator } from './setup';

techTest.describe('TECH Documentation Upload Workflow', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
  });

  techTest('should upload installation photos successfully', async ({ 
    page, 
    techHelper 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Verify documentation upload section
    await expect(page.locator('[data-testid="documentation-upload"]')).toBeVisible();
    await expect(page.locator('[data-testid="photo-upload-section"]')).toBeVisible();
    
    // Upload required installation photos
    const photoTypes = ['equipment_front', 'equipment_back', 'installation_site', 'electrical_connections'];
    
    for (const photoType of photoTypes) {
      await page.setInputFiles(`[data-testid="photo-${photoType}"]`, {
        name: `${photoType}.jpg`,
        mimeType: 'image/jpeg',
        buffer: Buffer.from([
          0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, // JPEG header
          ...Array(100).fill(0xFF), // Mock image data
          0xFF, 0xD9 // JPEG end marker
        ])
      });
      
      // Verify upload success
      await expect(page.locator(`[data-testid="photo-${photoType}-uploaded"]`)).toBeVisible();
    }
    
    // Submit photo documentation
    await page.click('[data-testid="submit-photos"]');
    
    // Verify submission success
    await expect(page.locator('[data-testid="photos-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="photos-submitted"]')).toContainText('photos uploaded successfully');
    
    // Verify project status updated
    await page.goto(`/tech/projects/${projectId}`);
    await expect(page.locator('[data-testid="documentation-status"]')).toContainText('photos_uploaded');
  });

  techTest('should validate geotagged photo requirements', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Upload photo without geolocation data
    await page.setInputFiles('[data-testid="photo-equipment_front"]', {
      name: 'no-geotag.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('Mock JPEG without EXIF geolocation')
    });
    
    // Verify geolocation warning
    await expect(page.locator('[data-testid="geolocation-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="geolocation-warning"]')).toContainText('photo must include GPS coordinates');
    
    // Mock photo with geolocation
    await page.evaluate(() => {
      // Simulate EXIF data with GPS coordinates
      localStorage.setItem('photo_geolocation', JSON.stringify({
        latitude: 37.7749,
        longitude: -122.4194,
        timestamp: new Date().toISOString()
      }));
    });
    
    // Upload photo with geolocation
    await page.setInputFiles('[data-testid="photo-equipment_front"]', {
      name: 'geotagged.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('Mock JPEG with EXIF geolocation')
    });
    
    // Verify geolocation validation passed
    await expect(page.locator('[data-testid="geolocation-verified"]')).toBeVisible();
    await expect(page.locator('[data-testid="photo-equipment_front-uploaded"]')).toBeVisible();
  });

  techTest('should upload equipment documentation', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Navigate to equipment documentation tab
    await page.click('[data-testid="equipment-docs-tab"]');
    
    // Upload equipment specifications
    await page.setInputFiles('[data-testid="equipment-specs"]', {
      name: 'equipment-specs.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock equipment specification document')
    });
    
    // Upload manufacturer warranty
    await page.setInputFiles('[data-testid="manufacturer-warranty"]', {
      name: 'warranty.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock warranty document')
    });
    
    // Upload AHRI certificate
    await page.setInputFiles('[data-testid="ahri-certificate"]', {
      name: 'ahri-cert.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock AHRI certificate')
    });
    
    // Submit equipment documentation
    await page.click('[data-testid="submit-equipment-docs"]');
    
    // Verify submission
    await expect(page.locator('[data-testid="equipment-docs-submitted"]')).toBeVisible();
    
    // Verify document validation started
    await expect(page.locator('[data-testid="validation-in-progress"]')).toBeVisible();
    await expect(page.locator('[data-testid="validation-status"]')).toContainText('under review');
  });

  techTest('should validate HERS testing requirements', async ({ 
    page 
  }) => {
    // Set project utility territory to SDG&E (requires HERS testing)
    await page.goto(`/tech/projects/${projectId}`);
    await page.evaluate(() => {
      localStorage.setItem('project_utility', 'sdge');
    });
    
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Navigate to testing documentation tab
    await page.click('[data-testid="testing-docs-tab"]');
    
    // Verify HERS testing requirement displayed
    await expect(page.locator('[data-testid="hers-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="hers-required"]')).toContainText('HERS testing required for SDG&E territory');
    
    // Upload HERS test report
    await page.setInputFiles('[data-testid="hers-report"]', {
      name: 'hers-test-report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock HERS test report')
    });
    
    // Fill HERS testing details
    await page.fill('[data-testid="hers-rater-name"]', 'John Smith');
    await page.fill('[data-testid="hers-rater-id"]', 'HERS-12345');
    await page.fill('[data-testid="hers-test-date"]', '2024-01-15');
    
    // Submit HERS documentation
    await page.click('[data-testid="submit-hers-docs"]');
    
    // Verify submission
    await expect(page.locator('[data-testid="hers-docs-submitted"]')).toBeVisible();
    
    // Verify compliance check triggered
    await expect(page.locator('[data-testid="compliance-check-started"]')).toBeVisible();
  });

  techTest('should handle CAS testing for advanced projects', async ({ 
    page 
  }) => {
    // Set project type to advanced requiring CAS testing
    await page.goto(`/tech/projects/${projectId}`);
    await page.evaluate(() => {
      localStorage.setItem('project_type', 'both'); // HVAC + HPWH
      localStorage.setItem('advanced_project', 'true');
    });
    
    await page.goto(`/tech/projects/${projectId}/documentation`);
    await page.click('[data-testid="testing-docs-tab"]');
    
    // Verify CAS testing requirement
    await expect(page.locator('[data-testid="cas-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="cas-required"]')).toContainText('CAS testing required for combined systems');
    
    // Upload CAS test results
    await page.setInputFiles('[data-testid="cas-report"]', {
      name: 'cas-test-report.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock CAS test report')
    });
    
    // Fill CAS testing information
    await page.fill('[data-testid="cas-tester-name"]', 'Jane Doe');
    await page.fill('[data-testid="cas-certification-id"]', 'CAS-67890');
    await page.fill('[data-testid="cas-test-date"]', '2024-01-20');
    await page.selectOption('[data-testid="cas-test-result"]', 'pass');
    
    // Submit CAS documentation
    await page.click('[data-testid="submit-cas-docs"]');
    
    // Verify submission and validation
    await expect(page.locator('[data-testid="cas-docs-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="advanced-validation-started"]')).toBeVisible();
  });
});

techTest.describe('TECH Documentation Compliance Checking', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
  });

  techTest('should automatically validate equipment compliance', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Upload equipment with valid model number
    await page.setInputFiles('[data-testid="equipment-specs"]', {
      name: 'mitsubishi-msz-fh09na.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock equipment spec for approved model')
    });
    
    await page.click('[data-testid="submit-equipment-docs"]');
    
    // Wait for automated validation
    await page.waitForTimeout(2000);
    
    // Verify equipment validation results
    await expect(page.locator('[data-testid="equipment-validation-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="model-approved"]')).toBeVisible();
    await expect(page.locator('[data-testid="efficiency-verified"]')).toBeVisible();
    
    // Check compliance score
    await expect(page.locator('[data-testid="compliance-score"]')).toBeVisible();
    const score = await page.locator('[data-testid="compliance-score"]').textContent();
    expect(parseInt(score || '0')).toBeGreaterThan(80);
  });

  techTest('should flag non-compliant equipment', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Upload equipment with invalid/non-approved model
    await page.setInputFiles('[data-testid="equipment-specs"]', {
      name: 'non-approved-model.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock spec for non-approved equipment model')
    });
    
    await page.click('[data-testid="submit-equipment-docs"]');
    
    // Wait for validation
    await page.waitForTimeout(2000);
    
    // Verify compliance warnings
    await expect(page.locator('[data-testid="compliance-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="model-not-approved"]')).toBeVisible();
    await expect(page.locator('[data-testid="efficiency-below-minimum"]')).toBeVisible();
    
    // Verify project flagged for review
    await expect(page.locator('[data-testid="manual-review-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="compliance-hold"]')).toContainText('project on hold pending compliance review');
  });

  techTest('should validate PNNL Quality Install Tool requirements', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    await page.click('[data-testid="installation-docs-tab"]');
    
    // Verify PNNL tool requirement
    await expect(page.locator('[data-testid="pnnl-tool-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="pnnl-tool-required"]')).toContainText('PNNL Quality Install Tool checklist required');
    
    // Upload PNNL checklist
    await page.setInputFiles('[data-testid="pnnl-checklist"]', {
      name: 'pnnl-quality-checklist.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock PNNL Quality Install Tool checklist')
    });
    
    // Fill quality install details
    await page.check('[data-testid="refrigerant-charge-verified"]');
    await page.check('[data-testid="airflow-tested"]');
    await page.check('[data-testid="electrical-connections-verified"]');
    await page.check('[data-testid="controls-commissioned"]');
    
    // Submit installation documentation
    await page.click('[data-testid="submit-installation-docs"]');
    
    // Verify PNNL validation
    await expect(page.locator('[data-testid="pnnl-validation-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-install-verified"]')).toBeVisible();
    
    // Check quality score
    await expect(page.locator('[data-testid="installation-quality-score"]')).toBeVisible();
    const qualityScore = await page.locator('[data-testid="installation-quality-score"]').textContent();
    expect(parseInt(qualityScore || '0')).toBeGreaterThan(85);
  });

  techTest('should validate utility-specific requirements', async ({ 
    page 
  }) => {
    // Test PG&E specific requirements
    await page.goto(`/tech/projects/${projectId}`);
    await page.evaluate(() => {
      localStorage.setItem('project_utility', 'pge');
    });
    
    await page.goto(`/tech/projects/${projectId}/documentation`);
    await page.click('[data-testid="utility-docs-tab"]');
    
    // Verify PG&E-specific requirements
    await expect(page.locator('[data-testid="pge-requirements"]')).toBeVisible();
    await expect(page.locator('[data-testid="demand-response-required"]')).toBeVisible();
    await expect(page.locator('[data-testid="demand-response-required"]')).toContainText('Demand Response enrollment required');
    
    // Upload demand response enrollment confirmation
    await page.setInputFiles('[data-testid="demand-response-confirmation"]', {
      name: 'pge-demand-response-enrollment.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock PG&E Demand Response enrollment')
    });
    
    // Fill demand response details
    await page.fill('[data-testid="dr-enrollment-id"]', 'DR-PGE-12345');
    await page.fill('[data-testid="dr-enrollment-date"]', '2024-01-10');
    
    // Submit utility documentation
    await page.click('[data-testid="submit-utility-docs"]');
    
    // Verify PG&E compliance validation
    await expect(page.locator('[data-testid="pge-compliance-verified"]')).toBeVisible();
    await expect(page.locator('[data-testid="demand-response-validated"]')).toBeVisible();
  });

  techTest('should handle documentation review workflow', async ({ 
    page 
  }) => {
    // Upload all required documentation
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Upload photos
    const photoTypes = ['equipment_front', 'equipment_back', 'installation_site', 'electrical_connections'];
    for (const photoType of photoTypes) {
      await page.setInputFiles(`[data-testid="photo-${photoType}"]`, {
        name: `${photoType}.jpg`,
        mimeType: 'image/jpeg',
        buffer: Buffer.from('Mock geotagged photo')
      });
    }
    await page.click('[data-testid="submit-photos"]');
    
    // Upload equipment docs
    await page.click('[data-testid="equipment-docs-tab"]');
    await page.setInputFiles('[data-testid="equipment-specs"]', {
      name: 'specs.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock equipment specs')
    });
    await page.click('[data-testid="submit-equipment-docs"]');
    
    // Upload installation docs
    await page.click('[data-testid="installation-docs-tab"]');
    await page.setInputFiles('[data-testid="pnnl-checklist"]', {
      name: 'pnnl.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from('Mock PNNL checklist')
    });
    await page.click('[data-testid="submit-installation-docs"]');
    
    // Submit complete documentation package
    await page.click('[data-testid="submit-complete-documentation"]');
    
    // Verify submission and review process initiated
    await expect(page.locator('[data-testid="documentation-submitted"]')).toBeVisible();
    await expect(page.locator('[data-testid="review-process-started"]')).toBeVisible();
    
    // Verify project status updated
    await page.goto(`/tech/projects/${projectId}`);
    await expect(page.locator('[data-testid="project-status"]')).toContainText('documentation_review');
    
    // Verify estimated review timeline
    await expect(page.locator('[data-testid="review-timeline"]')).toContainText('5-10 business days');
  });
});

techTest.describe('TECH Documentation Quality Scoring', () => {
  let contractor: any;
  let projectId: string;

  techTest.beforeEach(async ({ authHelper, techHelper, testData }) => {
    contractor = testData.createContractor();
    await authHelper.loginAsContractor(contractor);
    await techHelper.enrollInTechProgram(contractor);
    
    const project = testData.createProject();
    projectId = await techHelper.createProject(project);
  });

  techTest('should calculate documentation quality score', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Upload high-quality documentation
    const photoTypes = ['equipment_front', 'equipment_back', 'installation_site', 'electrical_connections'];
    for (const photoType of photoTypes) {
      await page.setInputFiles(`[data-testid="photo-${photoType}"]`, {
        name: `high-quality-${photoType}.jpg`,
        mimeType: 'image/jpeg',
        buffer: Buffer.from('Mock high-resolution geotagged photo')
      });
    }
    
    await page.click('[data-testid="submit-photos"]');
    
    // Wait for quality analysis
    await page.waitForTimeout(3000);
    
    // Verify quality scoring
    await expect(page.locator('[data-testid="quality-analysis-complete"]')).toBeVisible();
    await expect(page.locator('[data-testid="photo-quality-score"]')).toBeVisible();
    
    // Check individual quality metrics
    await expect(page.locator('[data-testid="resolution-score"]')).toContainText('95%');
    await expect(page.locator('[data-testid="clarity-score"]')).toContainText('90%');
    await expect(page.locator('[data-testid="completeness-score"]')).toContainText('100%');
    
    // Verify overall quality rating
    const overallScore = await page.locator('[data-testid="overall-quality-score"]').textContent();
    expect(parseInt(overallScore || '0')).toBeGreaterThan(90);
  });

  techTest('should flag low-quality documentation', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Upload low-quality photos
    await page.setInputFiles('[data-testid="photo-equipment_front"]', {
      name: 'low-quality.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('Mock low-resolution blurry photo')
    });
    
    await page.click('[data-testid="submit-photos"]');
    
    // Wait for quality analysis
    await page.waitForTimeout(2000);
    
    // Verify quality warnings
    await expect(page.locator('[data-testid="quality-warning"]')).toBeVisible();
    await expect(page.locator('[data-testid="resolution-too-low"]')).toBeVisible();
    await expect(page.locator('[data-testid="image-clarity-poor"]')).toBeVisible();
    
    // Verify re-upload suggestion
    await expect(page.locator('[data-testid="reupload-suggested"]')).toBeVisible();
    await expect(page.locator('[data-testid="quality-improvement-tips"]')).toBeVisible();
    
    // Check that submission is blocked
    const submitButton = page.locator('[data-testid="submit-complete-documentation"]');
    await expect(submitButton).toBeDisabled();
  });

  techTest('should provide documentation improvement recommendations', async ({ 
    page 
  }) => {
    await page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Upload partial documentation
    await page.setInputFiles('[data-testid="photo-equipment_front"]', {
      name: 'partial-doc.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('Mock photo')
    });
    
    // Check documentation completeness
    await page.click('[data-testid="check-completeness"]');
    
    // Verify improvement recommendations
    await expect(page.locator('[data-testid="improvement-recommendations"]')).toBeVisible();
    await expect(page.locator('[data-testid="missing-photos"]')).toContainText('3 required photos missing');
    await expect(page.locator('[data-testid="missing-equipment-docs"]')).toContainText('Equipment specifications required');
    await expect(page.locator('[data-testid="missing-installation-docs"]')).toContainText('PNNL checklist required');
    
    // Verify completion progress
    await expect(page.locator('[data-testid="completion-progress"]')).toContainText('25%');
    
    // Verify guided next steps
    await expect(page.locator('[data-testid="next-steps"]')).toBeVisible();
    await expect(page.locator('[data-testid="priority-actions"]')).toContainText('Upload remaining installation photos');
  });
});