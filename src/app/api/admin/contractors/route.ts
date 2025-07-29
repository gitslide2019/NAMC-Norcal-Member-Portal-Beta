import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'

// GET /api/admin/contractors - List contractors with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await AuthService.getUserFromToken(token)

    if (!user || !AuthService.canAccessAdmin(user)) {
      return NextResponse.json(
        { success: false, message: 'Admin access required' },
        { status: 403 }
      )
    }

    // Parse query parameters
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '25'), 100)
    const search = url.searchParams.get('search') || ''
    const city = url.searchParams.get('city') || ''
    const county = url.searchParams.get('county') || ''
    const classification = url.searchParams.get('classification') || ''
    const licenseStatus = url.searchParams.get('licenseStatus') || ''
    const hasEmail = url.searchParams.get('hasEmail')
    const hasPhone = url.searchParams.get('hasPhone')
    const outreachStatus = url.searchParams.get('outreachStatus') || ''
    const sortBy = url.searchParams.get('sortBy') || 'businessName'
    const sortOrder = url.searchParams.get('sortOrder') || 'asc'

    // Build where conditions
    const whereConditions: any = {}

    if (search) {
      whereConditions.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { dbaName: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (city) {
      whereConditions.city = { contains: city, mode: 'insensitive' }
    }

    if (county) {
      whereConditions.county = { contains: county, mode: 'insensitive' }
    }

    if (classification) {
      whereConditions.classifications = { has: classification }
    }

    if (licenseStatus) {
      whereConditions.licenseStatus = licenseStatus
    }

    if (hasEmail === 'true') {
      whereConditions.email = { not: null }
    } else if (hasEmail === 'false') {
      whereConditions.email = null
    }

    if (hasPhone === 'true') {
      whereConditions.phone = { not: null }
    } else if (hasPhone === 'false') {
      whereConditions.phone = null
    }

    if (outreachStatus) {
      whereConditions.outreachStatus = outreachStatus
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Build sort object
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    // Mock contractor data (replace with actual Prisma query when schema is ready)
    const mockContractors = [
      {
        id: '1',
        name: 'Green Build Solutions',
        licenseNumber: 'CA-12345',
        specialties: ['Solar', 'HVAC'],
        location: 'Oakland, CA',
        status: 'active',
        memberSince: new Date('2023-01-15'),
        projectCount: 25,
        rating: 4.8
      },
      {
        id: '2', 
        name: 'EcoConstruct Inc',
        licenseNumber: 'CA-67890',
        specialties: ['Heat Pumps', 'Insulation'],
        location: 'San Francisco, CA',
        status: 'active',
        memberSince: new Date('2023-03-22'),
        projectCount: 18,
        rating: 4.6
      }
    ]

    // Apply basic filtering and pagination to mock data
    let filteredContractors = mockContractors
    if (search) {
      filteredContractors = mockContractors.filter(c => 
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.licenseNumber.toLowerCase().includes(search.toLowerCase())
      )
    }

    const [contractors, totalCount] = [
      filteredContractors.slice(skip, skip + limit),
      filteredContractors.length
    ]

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit)
    const hasNext = page < totalPages
    const hasPrev = page > 1

    return NextResponse.json({
      success: true,
      data: contractors,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages,
        hasNext,
        hasPrev,
      },
      message: `Retrieved ${contractors.length} contractors`,
    })
  } catch (error) {
    console.error('Error fetching contractors:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contractors' },
      { status: 500 }
    )
  }
}