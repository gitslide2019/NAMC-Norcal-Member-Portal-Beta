/**
 * TECH Clean California E2E Test Setup
 * 
 * Setup utilities and test data for TECH Clean California Playwright tests.
 * Provides authentication, test data generation, and helper functions.
 */

import { test as base, expect, Page } from '@playwright/test';
import { randomBytes } from 'crypto';

// Test data interfaces
export interface TestContractor {
  namcMemberId: string;
  email: string;
  password: string;
  certificationLevel: 'basic' | 'advanced' | 'master';
  serviceTerritories: string[];
  businessLicense: string;
  contractorLicense: string;
}

export interface TestProject {
  customerId: string;
  contractorId: string;
  projectType: 'hvac' | 'hpwh' | 'both';
  utilityTerritory: 'pge' | 'sce' | 'sdge' | 'smud' | 'ladwp';
  installationAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  equipmentDetails: {
    manufacturer: string;
    model: string;
    capacity: string;
    efficiency: string;
  };
}

// Extended test context
export interface TechTestContext {
  authHelper: AuthHelper;
  techHelper: TechHelper;
  testData: TestDataGenerator;
}

// Authentication helper
export class AuthHelper {
  constructor(private page: Page) {}

  async loginAsContractor(contractor?: TestContractor): Promise<void> {
    const testContractor = contractor || TestDataGenerator.createContractor();
    
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', testContractor.email);
    await this.page.fill('input[name="password"]', testContractor.password);
    await this.page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await this.page.waitForURL('**/dashboard');
    await expect(this.page.locator('[data-testid="user-menu"]')).toBeVisible();
  }

  async loginAsAdmin(): Promise<void> {
    await this.page.goto('/login');
    await this.page.fill('input[name="email"]', 'admin@namcnorcal.org');
    await this.page.fill('input[name="password"]', 'admin123');
    await this.page.click('button[type="submit"]');
    
    // Wait for admin dashboard
    await this.page.waitForURL('**/admin/dashboard');
    await expect(this.page.locator('[data-testid="admin-header"]')).toBeVisible();
  }

  async logout(): Promise<void> {
    await this.page.click('[data-testid="user-menu"]');
    await this.page.click('[data-testid="logout-button"]');
    await this.page.waitForURL('**/login');
  }
}

// TECH-specific helper functions
export class TechHelper {
  constructor(private page: Page) {}

  async navigateToTechDashboard(): Promise<void> {
    await this.page.goto('/dashboard');
    await this.page.click('[data-testid="tech-dashboard-tab"]');
    await expect(this.page.locator('[data-testid="tech-dashboard-widget"]')).toBeVisible();
  }

  async enrollInTechProgram(contractor: TestContractor): Promise<void> {
    await this.page.goto('/tech/enrollment');
    
    // Fill enrollment form
    await this.page.selectOption('select[name="certificationLevel"]', contractor.certificationLevel);
    
    // Select service territories
    for (const territory of contractor.serviceTerritories) {
      await this.page.check(`input[name="serviceTerritories"][value="${territory}"]`);
    }
    
    await this.page.fill('input[name="businessLicense"]', contractor.businessLicense);
    await this.page.fill('input[name="contractorLicense"]', contractor.contractorLicense);
    
    // Upload mock documents
    await this.uploadMockDocument('input[name="insuranceCertificate"]', 'insurance-cert.pdf');
    
    // Submit enrollment
    await this.page.click('button[type="submit"]');
    
    // Wait for success message
    await expect(this.page.locator('[data-testid="enrollment-success"]')).toBeVisible();
  }

  async createProject(project: TestProject): Promise<string> {
    await this.page.goto('/tech/projects/new');
    
    // Fill project form
    await this.page.selectOption('select[name="projectType"]', project.projectType);
    await this.page.selectOption('select[name="utilityTerritory"]', project.utilityTerritory);
    
    // Installation address
    await this.page.fill('input[name="installationAddress.street"]', project.installationAddress.street);
    await this.page.fill('input[name="installationAddress.city"]', project.installationAddress.city);
    await this.page.fill('input[name="installationAddress.state"]', project.installationAddress.state);
    await this.page.fill('input[name="installationAddress.zipCode"]', project.installationAddress.zipCode);
    
    // Equipment details
    await this.page.fill('input[name="equipmentDetails.manufacturer"]', project.equipmentDetails.manufacturer);
    await this.page.fill('input[name="equipmentDetails.model"]', project.equipmentDetails.model);
    await this.page.fill('input[name="equipmentDetails.capacity"]', project.equipmentDetails.capacity);
    await this.page.fill('input[name="equipmentDetails.efficiency"]', project.equipmentDetails.efficiency);
    
    // Submit project
    await this.page.click('button[type="submit"]');
    
    // Wait for success and get project ID
    await expect(this.page.locator('[data-testid="project-created"]')).toBeVisible();
    const projectId = await this.page.locator('[data-testid="project-id"]').textContent();
    
    return projectId || '';
  }

  async uploadDocumentation(projectId: string, documentType: string): Promise<void> {
    await this.page.goto(`/tech/projects/${projectId}/documentation`);
    
    // Upload different document types
    switch (documentType) {
      case 'installation_photos':
        await this.uploadMockPhotos();
        break;
      case 'equipment_specs':
        await this.uploadMockDocument('input[name="equipmentSpecs"]', 'equipment-specs.pdf');
        break;
      case 'invoices':
        await this.uploadMockDocument('input[name="invoices"]', 'project-invoice.pdf');
        break;
      case 'permits':
        await this.uploadMockDocument('input[name="permits"]', 'building-permit.pdf');
        break;
    }
    
    await this.page.click('button[data-testid="submit-documentation"]');
    await expect(this.page.locator('[data-testid="documentation-submitted"]')).toBeVisible();
  }

  async uploadMockPhotos(): Promise<void> {
    const photoTypes = ['equipment_front', 'equipment_back', 'installation_site', 'electrical_connections'];
    
    for (const photoType of photoTypes) {
      await this.uploadMockImage(`input[name="photos_${photoType}"]`, `${photoType}.jpg`);
    }
  }

  async checkProjectStatus(projectId: string, expectedStatus: string): Promise<void> {
    await this.page.goto(`/tech/projects/${projectId}`);
    await expect(this.page.locator('[data-testid="project-status"]')).toHaveText(expectedStatus);
  }

  async verifyIncentiveCalculation(projectId: string, expectedAmount: number): Promise<void> {
    await this.page.goto(`/tech/projects/${projectId}`);
    const incentiveAmount = await this.page.locator('[data-testid="incentive-amount"]').textContent();
    const amount = parseFloat(incentiveAmount?.replace(/[$,]/g, '') || '0');
    expect(amount).toBeCloseTo(expectedAmount, 2);
  }

  async verifyDashboardMetrics(expectedMetrics: {
    totalProjects?: number;
    activeProjects?: number;
    completedProjects?: number;
    totalIncentives?: number;
  }): Promise<void> {
    await this.navigateToTechDashboard();
    
    if (expectedMetrics.totalProjects !== undefined) {
      await expect(this.page.locator('[data-testid="total-projects"]')).toHaveText(expectedMetrics.totalProjects.toString());
    }
    
    if (expectedMetrics.activeProjects !== undefined) {
      await expect(this.page.locator('[data-testid="active-projects"]')).toHaveText(expectedMetrics.activeProjects.toString());
    }
    
    if (expectedMetrics.completedProjects !== undefined) {
      await expect(this.page.locator('[data-testid="completed-projects"]')).toHaveText(expectedMetrics.completedProjects.toString());
    }
    
    if (expectedMetrics.totalIncentives !== undefined) {
      const incentiveText = await this.page.locator('[data-testid="total-incentives"]').textContent();
      const amount = parseFloat(incentiveText?.replace(/[$,]/g, '') || '0');
      expect(amount).toBeCloseTo(expectedMetrics.totalIncentives, 2);
    }
  }

  private async uploadMockDocument(selector: string, filename: string): Promise<void> {
    // Create a mock PDF file
    const mockPdf = Buffer.from('Mock PDF content');
    await this.page.setInputFiles(selector, {
      name: filename,
      mimeType: 'application/pdf',
      buffer: mockPdf
    });
  }

  private async uploadMockImage(selector: string, filename: string): Promise<void> {
    // Create a mock JPEG file with basic structure
    const mockJpeg = Buffer.from([
      0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, // JPEG header
      ...Array(100).fill(0xFF), // Mock image data
      0xFF, 0xD9 // JPEG end marker
    ]);
    
    await this.page.setInputFiles(selector, {
      name: filename,
      mimeType: 'image/jpeg',
      buffer: mockJpeg
    });
  }
}

// Test data generator
export class TestDataGenerator {
  static createContractor(): TestContractor {
    const id = randomBytes(4).toString('hex');
    return {
      namcMemberId: `NAMC-${id}`,
      email: `contractor-${id}@example.com`,
      password: 'Test123!',
      certificationLevel: 'basic',
      serviceTerritories: ['pge', 'sce'],
      businessLicense: `BL-${id}`,
      contractorLicense: `CL-${id}`
    };
  }

  static createProject(contractorId?: string): TestProject {
    const id = randomBytes(4).toString('hex');
    return {
      customerId: `CUST-${id}`,
      contractorId: contractorId || `TECH-${id}`,
      projectType: 'hvac',
      utilityTerritory: 'pge',
      installationAddress: {
        street: `123 Test St ${id}`,
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94102'
      },
      equipmentDetails: {
        manufacturer: 'Mitsubishi',
        model: 'MSZ-FH09NA',
        capacity: '9,000 BTU/h',
        efficiency: '33.1 SEER'
      }
    };
  }

  static createCustomer() {
    const id = randomBytes(4).toString('hex');
    return {
      customerId: `CUST-${id}`,
      firstName: 'John',
      lastName: 'Doe',
      email: `customer-${id}@example.com`,
      phone: '(555) 123-4567',
      address: {
        street: `456 Customer Ave ${id}`,
        city: 'Oakland',
        state: 'CA',
        zipCode: '94601'
      }
    };
  }
}

// Extended test with TECH context
export const techTest = base.extend<TechTestContext>({
  authHelper: async ({ page }, use) => {
    await use(new AuthHelper(page));
  },
  
  techHelper: async ({ page }, use) => {
    await use(new TechHelper(page));
  },
  
  testData: async ({}, use) => {
    await use(TestDataGenerator);
  }
});

export { expect } from '@playwright/test';