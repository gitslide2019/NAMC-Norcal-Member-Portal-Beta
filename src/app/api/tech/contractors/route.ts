/**
 * TECH Clean California Contractors API
 * 
 * API endpoints for managing TECH contractors within the NAMC portal.
 * Handles contractor enrollment, certification, and profile management.
 */

import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { hubspotIntegration, TechContractor } from '@/features/tech-clean-california/services/hubspot-integration';
import { defaultRateLimit, createRateLimitResponse } from '@/lib/api/rate-limiting';
import { z } from 'zod';

/**
 * GET /api/tech/contractors
 * Get contractors for the authenticated member
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
    
    // Get TECH contractors
    const contractors = await hubspotIntegration.getTechContractors()
    
    // Filter based on user permissions
    const filteredContractors = user.memberType === 'admin' 
      ? contractors 
      : contractors.filter(c => c.email === user.email)
    
    return NextResponse.json({
      success: true,
      data: filteredContractors,
      message: 'Contractors retrieved successfully'
    })
    
  } catch (error: any) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message === 'Authentication required' ? 'Authentication required' : 'Failed to fetch contractors' 
      },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    )
  }
}

/**
 * POST /api/tech/contractors
 * Sync current user to TECH program
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
    
    // Sync user to TECH program
    const contractor = await hubspotIntegration.syncUserToTech(user)
    
    if (!contractor) {
      return NextResponse.json(
        { success: false, message: 'Failed to sync user to TECH program' },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      success: true,
      data: contractor,
      message: 'User synchronized to TECH program successfully'
    }, { status: 201 })
    
  } catch (error: any) {
    console.error('Error syncing user to TECH:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: error.message === 'Authentication required' ? 'Authentication required' : 'Failed to sync user to TECH program' 
      },
      { status: error.message === 'Authentication required' ? 401 : 500 }
    )
  }
}