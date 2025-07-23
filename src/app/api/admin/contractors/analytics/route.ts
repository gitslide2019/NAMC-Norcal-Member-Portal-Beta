import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'

// GET /api/admin/contractors/analytics - Get contractor analytics and metrics
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

    // Execute analytics queries in parallel
    const [
      totalContractors,
      contractorsWithEmail,
      contractorsWithPhone,
      contractorsWithBoth,
      validatedEmails,
      validatedPhones,
      namcMembers,
      outreachStats,
      geographicDistribution,
      classificationDistribution,
      licenseStatusDistribution,
      priorityScoreDistribution,
      membershipInterestDistribution,
    ] = await Promise.all([
      // Total contractors
      prisma.californiaContractor.count(),

      // Contractors with email
      prisma.californiaContractor.count({
        where: { email: { not: null } },
      }),

      // Contractors with phone
      prisma.californiaContractor.count({
        where: { phone: { not: null } },
      }),

      // Contractors with both email and phone
      prisma.californiaContractor.count({
        where: {
          AND: [{ email: { not: null } }, { phone: { not: null } }],
        },
      }),

      // Validated emails
      prisma.californiaContractor.count({
        where: { emailValidated: true },
      }),

      // Validated phones
      prisma.californiaContractor.count({
        where: { phoneValidated: true },
      }),

      // NAMC members
      prisma.californiaContractor.count({
        where: { isNamcMember: true },
      }),

      // Outreach status distribution
      prisma.californiaContractor.groupBy({
        by: ['outreachStatus'],
        _count: { _all: true },
      }),

      // Geographic distribution by county
      prisma.californiaContractor.groupBy({
        by: ['county'],
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
        take: 20,
      }),

      // Classification distribution
      prisma.$queryRaw`
        SELECT unnest(classifications) as classification, COUNT(*) as count
        FROM california_contractors 
        WHERE classifications IS NOT NULL 
        GROUP BY unnest(classifications) 
        ORDER BY count DESC 
        LIMIT 20
      `,

      // License status distribution
      prisma.californiaContractor.groupBy({
        by: ['licenseStatus'],
        _count: { _all: true },
      }),

      // Priority score distribution
      prisma.$queryRaw`
        SELECT 
          CASE 
            WHEN priority_score >= 80 THEN 'High (80-100)'
            WHEN priority_score >= 60 THEN 'Medium (60-79)'
            WHEN priority_score >= 40 THEN 'Low (40-59)'
            ELSE 'Very Low (0-39)'
          END as priority_range,
          COUNT(*) as count
        FROM california_contractors 
        WHERE priority_score IS NOT NULL
        GROUP BY 
          CASE 
            WHEN priority_score >= 80 THEN 'High (80-100)'
            WHEN priority_score >= 60 THEN 'Medium (60-79)'
            WHEN priority_score >= 40 THEN 'Low (40-59)'
            ELSE 'Very Low (0-39)'
          END
        ORDER BY count DESC
      `,

      // Membership interest distribution
      prisma.californiaContractor.groupBy({
        by: ['membershipInterest'],
        _count: { _all: true },
      }),
    ])

    // Calculate data quality metrics
    const emailCoverage = totalContractors > 0 ? (contractorsWithEmail / totalContractors) * 100 : 0
    const phoneCoverage = totalContractors > 0 ? (contractorsWithPhone / totalContractors) * 100 : 0
    const bothContactsCoverage = totalContractors > 0 ? (contractorsWithBoth / totalContractors) * 100 : 0
    const emailValidationRate = contractorsWithEmail > 0 ? (validatedEmails / contractorsWithEmail) * 100 : 0
    const phoneValidationRate = contractorsWithPhone > 0 ? (validatedPhones / contractorsWithPhone) * 100 : 0

    // Calculate conversion metrics
    const memberConversionRate = totalContractors > 0 ? (namcMembers / totalContractors) * 100 : 0

    // Build analytics response
    const analytics = {
      overview: {
        totalContractors,
        contractorsWithEmail,
        contractorsWithPhone,
        contractorsWithBoth,
        validatedEmails,
        validatedPhones,
        namcMembers,
      },
      metrics: {
        emailCoverage: Number(emailCoverage.toFixed(2)),
        phoneCoverage: Number(phoneCoverage.toFixed(2)),
        bothContactsCoverage: Number(bothContactsCoverage.toFixed(2)),
        emailValidationRate: Number(emailValidationRate.toFixed(2)),
        phoneValidationRate: Number(phoneValidationRate.toFixed(2)),
        memberConversionRate: Number(memberConversionRate.toFixed(2)),
      },
      distributions: {
        outreachStatus: outreachStats.map(item => ({
          status: item.outreachStatus || 'Unknown',
          count: item._count._all,
        })),
        geographic: geographicDistribution.map(item => ({
          county: item.county || 'Unknown',
          count: item._count._all,
        })),
        classifications: classificationDistribution,
        licenseStatus: licenseStatusDistribution.map(item => ({
          status: item.licenseStatus || 'Unknown',
          count: item._count._all,
        })),
        priorityScore: priorityScoreDistribution,
        membershipInterest: membershipInterestDistribution.map(item => ({
          interest: item.membershipInterest || 'Unknown',
          count: item._count._all,
        })),
      },
    }

    // Log admin action
    await AuthService.logAuthAction(
      'CONTRACTOR_ANALYTICS_VIEWED',
      user.id,
      'Viewed contractor database analytics dashboard',
      request.ip,
      request.headers.get('user-agent') || undefined
    )

    return NextResponse.json({
      success: true,
      data: analytics,
      message: 'Analytics data retrieved successfully',
    })
  } catch (error) {
    console.error('Error fetching contractor analytics:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}