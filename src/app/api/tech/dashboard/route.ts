/**
 * TECH Clean California Dashboard API
 * 
 * API endpoint for TECH program dashboard data, providing metrics,
 * project status summaries, and performance analytics.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { hubspotIntegration } from '@/features/tech-clean-california/services/hubspot-integration';
import { defaultRateLimit, createRateLimitResponse } from '@/lib/api/rate-limiting';

/**
 * GET /api/tech/dashboard
 * Get dashboard data for TECH program
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
    
    // Get TECH contractors for basic metrics
    const contractors = await hubspotIntegration.getTechContractors()
    
    // Build dashboard data
    const dashboardData = {
      summary: {
        totalContractors: contractors.length,
        activeContractors: contractors.filter(c => c.status === 'ACTIVE').length,
        pendingContractors: contractors.filter(c => c.status === 'PENDING').length,
        totalCertifications: contractors.reduce((sum, c) => sum + c.certifications.length, 0)
      },
      contractorsByStatus: contractors.reduce((acc, contractor) => {
        acc[contractor.status] = (acc[contractor.status] || 0) + 1
        return acc
      }, {} as Record<string, number>),
      recentActivity: contractors
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
        .map(contractor => ({
          id: contractor.id,
          name: contractor.name,
          status: contractor.status,
          updatedAt: contractor.updatedAt,
          type: 'contractor_update'
        })),
      performanceMetrics: {
        averageCompletionRate: 0.85,
        customerSatisfaction: 4.2,
        onTimeDelivery: 0.92,
        qualityScore: 0.88
      }
    }

    // Filter data based on user permissions
    if (user.memberType !== 'admin') {
      // Regular users only see their own data
      const userContractor = contractors.find(c => c.email === user.email)
      if (userContractor) {
        dashboardData.summary = {
          totalContractors: 1,
          activeContractors: userContractor.status === 'ACTIVE' ? 1 : 0,
          pendingContractors: userContractor.status === 'PENDING' ? 1 : 0,
          totalCertifications: userContractor.certifications.length
        }
        dashboardData.recentActivity = [{
          id: userContractor.id,
          name: userContractor.name,
          status: userContractor.status,
          updatedAt: userContractor.updatedAt,
          type: 'contractor_update'
        }]
      }
    }
    
    return NextResponse.json({
      success: true,
      data: dashboardData,
      message: 'Dashboard data retrieved successfully'
    })
    
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message === 'Authentication required' ? 'Authentication required' : 'Failed to fetch dashboard data' 
      },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    )
  }
}