import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'

// GET /api/admin/contractors/export - Export contractors data as CSV
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

    // Parse query parameters for filtering (same as main list endpoint)
    const url = new URL(request.url)
    const search = url.searchParams.get('search') || ''
    const city = url.searchParams.get('city') || ''
    const county = url.searchParams.get('county') || ''
    const classification = url.searchParams.get('classification') || ''
    const licenseStatus = url.searchParams.get('licenseStatus') || ''
    const hasEmail = url.searchParams.get('hasEmail')
    const hasPhone = url.searchParams.get('hasPhone')
    const outreachStatus = url.searchParams.get('outreachStatus') || ''
    const format = url.searchParams.get('format') || 'csv'

    // Build where conditions (same logic as list endpoint)
    const whereConditions: any = {}

    if (search) {
      whereConditions.OR = [
        { businessName: { contains: search, mode: 'insensitive' } },
        { dbaName: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (city) whereConditions.city = { contains: city, mode: 'insensitive' }
    if (county) whereConditions.county = { contains: county, mode: 'insensitive' }
    if (classification) whereConditions.classifications = { has: classification }
    if (licenseStatus) whereConditions.licenseStatus = licenseStatus
    if (hasEmail === 'true') whereConditions.email = { not: null }
    else if (hasEmail === 'false') whereConditions.email = null
    if (hasPhone === 'true') whereConditions.phone = { not: null }
    else if (hasPhone === 'false') whereConditions.phone = null
    if (outreachStatus) whereConditions.outreachStatus = outreachStatus

    // Fetch all matching contractors (no pagination for export)
    const contractors = await prisma.californiaContractor.findMany({
      where: whereConditions,
      orderBy: { businessName: 'asc' },
      select: {
        licenseNumber: true,
        businessName: true,
        dbaName: true,
        email: true,
        emailValidated: true,
        emailConfidence: true,
        emailSource: true,
        phone: true,
        phoneValidated: true,
        phoneSource: true,
        website: true,
        address: true,
        city: true,
        state: true,
        zipCode: true,
        county: true,
        licenseStatus: true,
        licenseType: true,
        issueDate: true,
        expireDate: true,
        primaryClassification: true,
        classifications: true,
        businessType: true,
        yearsInBusiness: true,
        employeeCount: true,
        priorityScore: true,
        dataQualityScore: true,
        outreachStatus: true,
        lastContactDate: true,
        contactAttempts: true,
        membershipInterest: true,
        isNamcMember: true,
        leadScore: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (format === 'csv') {
      // Generate CSV content
      const csvHeaders = [
        'License Number',
        'Business Name',
        'DBA Name',
        'Email',
        'Email Validated',
        'Email Confidence',
        'Email Source',
        'Phone',
        'Phone Validated',
        'Phone Source',
        'Website',
        'Address',
        'City',
        'State',
        'ZIP Code',
        'County',
        'License Status',
        'License Type',
        'Issue Date',
        'Expire Date',
        'Primary Classification',
        'All Classifications',
        'Business Type',
        'Years in Business',
        'Employee Count',
        'Priority Score',
        'Data Quality Score',
        'Outreach Status',
        'Last Contact Date',
        'Contact Attempts',
        'Membership Interest',
        'Is NAMC Member',
        'Lead Score',
        'Notes',
        'Created At',
        'Updated At',
      ]

      const csvRows = contractors.map(contractor => [
        contractor.licenseNumber || '',
        contractor.businessName || '',
        contractor.dbaName || '',
        contractor.email || '',
        contractor.emailValidated ? 'Yes' : 'No',
        contractor.emailConfidence || '',
        contractor.emailSource || '',
        contractor.phone || '',
        contractor.phoneValidated ? 'Yes' : 'No',
        contractor.phoneSource || '',
        contractor.website || '',
        contractor.address || '',
        contractor.city || '',
        contractor.state || '',
        contractor.zipCode || '',
        contractor.county || '',
        contractor.licenseStatus || '',
        contractor.licenseType || '',
        contractor.issueDate ? contractor.issueDate.toISOString().split('T')[0] : '',
        contractor.expireDate ? contractor.expireDate.toISOString().split('T')[0] : '',
        contractor.primaryClassification || '',
        contractor.classifications?.join('; ') || '',
        contractor.businessType || '',
        contractor.yearsInBusiness || '',
        contractor.employeeCount || '',
        contractor.priorityScore || '',
        contractor.dataQualityScore || '',
        contractor.outreachStatus || '',
        contractor.lastContactDate ? contractor.lastContactDate.toISOString().split('T')[0] : '',
        contractor.contactAttempts || '0',
        contractor.membershipInterest || '',
        contractor.isNamcMember ? 'Yes' : 'No',
        contractor.leadScore || '',
        contractor.notes || '',
        contractor.createdAt.toISOString().split('T')[0],
        contractor.updatedAt.toISOString().split('T')[0],
      ])

      // Escape CSV values that contain commas, quotes, or newlines
      const escapeCsvValue = (value: string): string => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`
        }
        return value
      }

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => escapeCsvValue(String(cell))).join(','))
      ].join('\n')

      // Log admin action
      await AuthService.logAuthAction(
        'CONTRACTOR_DATA_EXPORTED',
        user.id,
        `Exported ${contractors.length} contractors to CSV with filters applied`,
        request.ip,
        request.headers.get('user-agent') || undefined
      )

      const timestamp = new Date().toISOString().split('T')[0]
      const filename = `namc-contractors-${timestamp}.csv`

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    } else {
      // Return JSON format
      await AuthService.logAuthAction(
        'CONTRACTOR_DATA_EXPORTED',
        user.id,
        `Exported ${contractors.length} contractors to JSON with filters applied`,
        request.ip,
        request.headers.get('user-agent') || undefined
      )

      return NextResponse.json({
        success: true,
        data: contractors,
        count: contractors.length,
        message: `Exported ${contractors.length} contractors`,
      })
    }
  } catch (error) {
    console.error('Error exporting contractors:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to export contractor data' },
      { status: 500 }
    )
  }
}