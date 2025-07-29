/**
 * TECH Clean California API Tests
 * 
 * Comprehensive API testing for TECH Clean California endpoints.
 * Tests authentication, CRUD operations, data validation, and error handling.
 */

import { test, expect } from '@playwright/test';
import { randomBytes } from 'crypto';

const BASE_URL = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://localhost:3000';

// Test data
const createTestContractor = () => {
  const id = randomBytes(4).toString('hex');
  return {
    namcMemberId: `NAMC-${id}`,
    certificationLevel: 'basic',
    serviceTerritories: ['pge', 'sce'],
    businessLicense: `BL-${id}`,
    contractorLicense: `CL-${id}`,
    insuranceCertificate: `IC-${id}`,
    trainingCertificates: []
  };
};

const createTestProject = (contractorId: string) => {
  const id = randomBytes(4).toString('hex');
  return {
    customerId: `CUST-${id}`,
    contractorId,
    projectType: 'hvac',
    utilityTerritory: 'pge',
    estimatedIncentive: 3000,
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
};

// Helper function to get auth token
async function getAuthToken(request: any, userType: 'contractor' | 'admin' = 'contractor') {
  const credentials = userType === 'admin' 
    ? { email: 'admin@namcnorcal.org', password: 'admin123' }
    : { email: 'john.doe@example.com', password: 'member123' };

  const response = await request.post(`${BASE_URL}/api/auth/login`, {
    data: credentials
  });
  
  expect(response.ok()).toBeTruthy();
  const result = await response.json();
  return result.data.token;
}

test.describe('TECH Contractors API', () => {
  test('should create contractor enrollment successfully', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const contractorData = createTestContractor();

    const response = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: contractorData
    });

    expect(response.status()).toBe(201);
    const result = await response.json();
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
    expect(result.data.namcMemberId).toBe(contractorData.namcMemberId);
    expect(result.data.enrollmentStatus).toBe('pending');
    expect(result.data.certificationLevel).toBe(contractorData.certificationLevel);
  });

  test('should prevent duplicate contractor enrollment', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const contractorData = createTestContractor();

    // First enrollment
    const firstResponse = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: contractorData
    });
    expect(firstResponse.status()).toBe(201);

    // Duplicate enrollment attempt
    const duplicateResponse = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: contractorData
    });
    
    expect(duplicateResponse.status()).toBe(409);
    const result = await duplicateResponse.json();
    expect(result.success).toBe(false);
    expect(result.message).toContain('already enrolled');
  });

  test('should validate required fields in contractor enrollment', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const invalidData = {
      namcMemberId: '', // Missing required field
      certificationLevel: 'invalid_level', // Invalid enum value
      serviceTerritories: [] // Empty array when at least one required
    };

    const response = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: invalidData
    });

    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should get contractor by ID', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const contractorData = createTestContractor();

    // Create contractor
    const createResponse = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: contractorData
    });
    const createdContractor = (await createResponse.json()).data;

    // Get contractor
    const getResponse = await request.get(`${BASE_URL}/api/tech/contractors?contractorId=${createdContractor.id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(getResponse.status()).toBe(200);
    const result = await getResponse.json();
    expect(result.success).toBe(true);
    expect(result.data.id).toBe(createdContractor.id);
    expect(result.data.namcMemberId).toBe(contractorData.namcMemberId);
  });

  test('should update contractor information', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const contractorData = createTestContractor();

    // Create contractor
    const createResponse = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: contractorData
    });
    const createdContractor = (await createResponse.json()).data;

    // Update contractor
    const updateData = {
      certificationLevel: 'advanced',
      serviceTerritories: ['pge', 'sce', 'smud']
    };

    const updateResponse = await request.patch(`${BASE_URL}/api/tech/contractors/${createdContractor.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: updateData
    });

    expect(updateResponse.status()).toBe(200);
    const result = await updateResponse.json();
    expect(result.success).toBe(true);
    expect(result.data.certificationLevel).toBe('advanced');
    expect(result.data.serviceTerritories).toEqual(updateData.serviceTerritories);
  });

  test('should require authentication for contractor operations', async ({ request }) => {
    const contractorData = createTestContractor();

    const response = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: { 'Content-Type': 'application/json' },
      data: contractorData
    });

    expect(response.status()).toBe(401);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.message).toContain('Authentication required');
  });
});

test.describe('TECH Projects API', () => {
  let contractorId: string;

  test.beforeEach(async ({ request }) => {
    // Create a contractor for project tests
    const token = await getAuthToken(request, 'contractor');
    const contractorData = createTestContractor();

    const response = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: contractorData
    });

    contractorId = (await response.json()).data.id;
  });

  test('should create project successfully', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const projectData = createTestProject(contractorId);

    const response = await request.post(`${BASE_URL}/api/tech/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: projectData
    });

    expect(response.status()).toBe(201);
    const result = await response.json();
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('id');
    expect(result.data).toHaveProperty('projectId');
    expect(result.data.contractorId).toBe(contractorId);
    expect(result.data.projectType).toBe(projectData.projectType);
    expect(result.data.utilityTerritory).toBe(projectData.utilityTerritory);
    expect(result.data.projectStatus).toBe('inquiry');
  });

  test('should validate project data', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const invalidProjectData = {
      contractorId: 'invalid-id',
      projectType: 'invalid-type',
      utilityTerritory: 'invalid-utility',
      installationAddress: {
        street: '', // Required field
        city: '',   // Required field
        state: 'INVALID', // Invalid state format
        zipCode: '123' // Invalid ZIP format
      },
      equipmentDetails: {
        // Missing required fields
      }
    };

    const response = await request.post(`${BASE_URL}/api/tech/projects`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: invalidProjectData
    });

    expect(response.status()).toBe(400);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.errors).toBeDefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('should get projects for contractor', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    
    // Create multiple projects
    const project1 = createTestProject(contractorId);
    const project2 = createTestProject(contractorId);

    await request.post(`${BASE_URL}/api/tech/projects`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: project1
    });

    await request.post(`${BASE_URL}/api/tech/projects`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: project2
    });

    // Get projects
    const response = await request.get(`${BASE_URL}/api/tech/projects?contractorId=${contractorId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.projects).toHaveLength(2);
    expect(result.data.total).toBe(2);
  });

  test('should update project status', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const projectData = createTestProject(contractorId);

    // Create project
    const createResponse = await request.post(`${BASE_URL}/api/tech/projects`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: projectData
    });
    const project = (await createResponse.json()).data;

    // Update project
    const updateData = {
      projectStatus: 'agreement_signed',
      installationDate: new Date().toISOString(),
      customerAgreementSigned: true
    };

    const updateResponse = await request.patch(`${BASE_URL}/api/tech/projects/${project.id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: updateData
    });

    expect(updateResponse.status()).toBe(200);
    const result = await updateResponse.json();
    expect(result.success).toBe(true);
    expect(result.data.projectStatus).toBe('agreement_signed');
    expect(result.data.customerAgreementSigned).toBe(true);
  });

  test('should filter projects by status', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    
    // Create projects with different statuses
    const project1Data = createTestProject(contractorId);
    const project2Data = createTestProject(contractorId);

    const project1Response = await request.post(`${BASE_URL}/api/tech/projects`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: project1Data
    });
    const project1 = (await project1Response.json()).data;

    const project2Response = await request.post(`${BASE_URL}/api/tech/projects`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: project2Data
    });

    // Update one project to different status
    await request.patch(`${BASE_URL}/api/tech/projects/${project1.id}`, {
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      data: { projectStatus: 'agreement_signed' }
    });

    // Filter by status
    const response = await request.get(`${BASE_URL}/api/tech/projects?contractorId=${contractorId}&status=agreement_signed`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data.projects).toHaveLength(1);
    expect(result.data.projects[0].projectStatus).toBe('agreement_signed');
  });
});

test.describe('TECH Dashboard API', () => {
  test('should return dashboard data for contractor', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');

    const response = await request.get(`${BASE_URL}/api/tech/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('summary');
    expect(result.data).toHaveProperty('projectsByStatus');
    expect(result.data).toHaveProperty('projectsByUtility');
    expect(result.data).toHaveProperty('recentActivity');
    expect(result.data).toHaveProperty('upcomingDeadlines');
    expect(result.data).toHaveProperty('performanceMetrics');

    // Validate summary structure
    expect(result.data.summary).toHaveProperty('totalProjects');
    expect(result.data.summary).toHaveProperty('activeProjects');
    expect(result.data.summary).toHaveProperty('completedProjects');
    expect(result.data.summary).toHaveProperty('totalIncentives');
    expect(result.data.summary).toHaveProperty('averageProcessingTime');
    expect(result.data.summary).toHaveProperty('successRate');

    // Validate performance metrics structure
    expect(result.data.performanceMetrics).toHaveProperty('complianceScore');
    expect(result.data.performanceMetrics).toHaveProperty('customerSatisfaction');
    expect(result.data.performanceMetrics).toHaveProperty('documentationScore');
    expect(result.data.performanceMetrics).toHaveProperty('timeToCompletion');
  });

  test('should return dashboard data with date filtering', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = new Date().toISOString();

    const response = await request.get(`${BASE_URL}/api/tech/dashboard?startDate=${startDate}&endDate=${endDate}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    expect(response.status()).toBe(200);
    const result = await response.json();
    expect(result.success).toBe(true);
    expect(result.data).toHaveProperty('summary');
  });

  test('should require authentication for dashboard', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/tech/dashboard`);

    expect(response.status()).toBe(401);
    const result = await response.json();
    expect(result.success).toBe(false);
    expect(result.message).toContain('Authentication required');
  });

  test('should handle contractor not enrolled in TECH program', async ({ request }) => {
    // Use a regular member token who hasn't enrolled in TECH
    const token = await getAuthToken(request, 'contractor');

    const response = await request.get(`${BASE_URL}/api/tech/dashboard`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Should either return empty data or not found error
    expect([200, 404]).toContain(response.status());
    
    if (response.status() === 404) {
      const result = await response.json();
      expect(result.message).toContain('Contractor profile not found');
    }
  });
});

test.describe('TECH API Error Handling', () => {
  test('should handle invalid JSON in request body', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');

    const response = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: '{"invalid": json}'
    });

    expect(response.status()).toBe(400);
  });

  test('should handle missing Content-Type header', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    const contractorData = createTestContractor();

    const response = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: { 'Authorization': `Bearer ${token}` },
      data: JSON.stringify(contractorData)
    });

    // Should still work or return appropriate error
    expect([200, 201, 400]).toContain(response.status());
  });

  test('should handle malformed authorization header', async ({ request }) => {
    const contractorData = createTestContractor();

    const response = await request.post(`${BASE_URL}/api/tech/contractors`, {
      headers: {
        'Authorization': 'InvalidTokenFormat',
        'Content-Type': 'application/json'
      },
      data: contractorData
    });

    expect(response.status()).toBe(401);
  });

  test('should handle rate limiting gracefully', async ({ request }) => {
    const token = await getAuthToken(request, 'contractor');
    
    // Make multiple rapid requests to trigger rate limiting
    const promises = Array(20).fill(null).map(() =>
      request.get(`${BASE_URL}/api/tech/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    );

    const responses = await Promise.all(promises);
    
    // Check if any responses indicate rate limiting
    const rateLimited = responses.some(response => response.status() === 429);
    
    if (rateLimited) {
      const rateLimitedResponse = responses.find(response => response.status() === 429);
      const result = await rateLimitedResponse?.json();
      expect(result?.message).toContain('rate limit');
    }
  });
});