import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'

// GET /api/admin/contractors/[id] - Get single contractor details
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const contractor = await prisma.californiaContractor.findUnique({
      where: { id: params.id },
      include: {
        namcMember: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            memberSince: true,
            isActive: true,
          },
        },
      },
    })

    if (!contractor) {
      return NextResponse.json(
        { success: false, message: 'Contractor not found' },
        { status: 404 }
      )
    }

    // Log admin action
    await AuthService.logAuthAction(
      'CONTRACTOR_VIEWED',
      user.id,
      `Viewed contractor details for ${contractor.businessName} (${contractor.licenseNumber})`,
      request.ip,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({
      success: true,
      data: contractor,
      message: 'Contractor details retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching contractor:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch contractor details' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/contractors/[id] - Update contractor information
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json()

    // Validate and sanitize update data
    const allowedFields = [
      'email',
      'emailValidated',
      'phone',
      'phoneValidated',
      'website',
      'outreachStatus',
      'contactAttempts',
      'lastContactDate',
      'campaignTags',
      'leadScore',
      'membershipInterest',
      'notes',
      'priorityScore',
    ]

    const updateData: any = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    }

    // Special handling for date fields
    if (body.lastContactDate) {
      updateData.lastContactDate = new Date(body.lastContactDate)
    }

    const contractor = await prisma.californiaContractor.update({
      where: { id: params.id },
      data: updateData,
    })

    // Log admin action
    await AuthService.logAuthAction(
      'CONTRACTOR_UPDATED',
      user.id,
      `Updated contractor ${contractor.businessName} (${contractor.licenseNumber}). Fields: ${Object.keys(updateData).join(', ')}`,
      request.ip,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({
      success: true,
      data: contractor,
      message: 'Contractor updated successfully',
    })
  } catch (error) {
    console.error('Error updating contractor:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update contractor' },
      { status: 500 }
    )
  }
}