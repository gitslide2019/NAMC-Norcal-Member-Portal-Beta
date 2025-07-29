/**
 * TECH Clean California Projects API
 * 
 * API endpoints for managing TECH projects within the NAMC portal.
 * Handles project creation, updates, and tracking throughout the workflow.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { defaultRateLimit, createRateLimitResponse } from '@/lib/api/rate-limiting';

/**
 * GET /api/tech/projects
 * Get projects for the authenticated member
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitPassed = await defaultRateLimit(request)
    if (!rateLimitPassed) {
      return createRateLimitResponse()
    }

    // Authenticate user
    const user = await requireAuth(request)
    
    // Mock project data
    const mockProjects = [
      {
        id: '1',
        title: 'HVAC Upgrade - Oakland Residence',
        type: 'hvac',
        status: 'installation_complete',
        customerId: 'cust-001',
        contractorId: user.id,
        estimatedIncentive: 2500,
        installationAddress: {
          street: '123 Oak Street',
          city: 'Oakland',
          state: 'CA',
          zipCode: '94601'
        },
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-20')
      },
      {
        id: '2',
        title: 'Heat Pump Water Heater - Berkeley Home',
        type: 'hpwh',
        status: 'documentation_pending',
        customerId: 'cust-002',
        contractorId: user.id,
        estimatedIncentive: 1800,
        installationAddress: {
          street: '456 Pine Avenue',
          city: 'Berkeley',
          state: 'CA',
          zipCode: '94702'
        },
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-18')
      }
    ]
    
    // Filter projects based on user permissions
    const filteredProjects = user.memberType === 'admin' 
      ? mockProjects 
      : mockProjects.filter(p => p.contractorId === user.id)
    
    return NextResponse.json({
      success: true,
      data: {
        projects: filteredProjects,
        total: filteredProjects.length,
        limit: 50,
        offset: 0
      },
      message: 'Projects retrieved successfully'
    })
    
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message === 'Authentication required' ? 'Authentication required' : 'Failed to fetch projects' 
      },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/tech/projects
 * Create new TECH project
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitPassed = await defaultRateLimit(request)
    if (!rateLimitPassed) {
      return createRateLimitResponse()
    }

    // Authenticate user
    const user = await requireAuth(request)
    
    const body = await request.json()
    
    // Create mock project
    const newProject = {
      id: Date.now().toString(),
      title: body.title || 'New TECH Project',
      type: body.type || 'hvac',
      status: 'inquiry',
      customerId: body.customerId || 'new-customer',
      contractorId: user.id,
      estimatedIncentive: body.estimatedIncentive || 0,
      installationAddress: body.installationAddress || {},
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    return NextResponse.json({
      success: true,
      data: newProject,
      message: 'TECH project created successfully'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error creating project:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message === 'Authentication required' ? 'Authentication required' : 'Failed to create project' 
      },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    )
  }
}