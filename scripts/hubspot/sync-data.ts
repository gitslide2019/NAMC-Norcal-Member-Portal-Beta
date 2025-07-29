#!/usr/bin/env tsx

/**
 * HubSpot Data Synchronization Script
 * 
 * This script synchronizes data between NAMC portal and HubSpot:
 * - Syncs member data to HubSpot contacts
 * - Syncs project opportunities to HubSpot deals
 * - Syncs service requests to HubSpot deals
 * - Updates engagement scores and member analytics
 */

import { PrismaClient } from '@prisma/client'
import { 
  hubspotContactsService,
  hubspotDealsService 
} from '@/features/hubspot/services'

interface SyncStats {
  contacts: {
    total: number
    created: number
    updated: number
    errors: number
  }
  deals: {
    total: number
    created: number
    updated: number
    errors: number
  }
  duration: number
  startTime: Date
  endTime?: Date
}

interface SyncOptions {
  dryRun: boolean
  batchSize: number
  includeContacts: boolean
  includeDeals: boolean
  verbose: boolean
  fullSync: boolean
}

class HubSpotDataSyncer {
  private prisma: PrismaClient
  private stats: SyncStats
  private options: SyncOptions

  constructor(options: SyncOptions) {
    this.prisma = new PrismaClient()
    this.options = options
    this.stats = {
      contacts: { total: 0, created: 0, updated: 0, errors: 0 },
      deals: { total: 0, created: 0, updated: 0, errors: 0 },
      duration: 0,
      startTime: new Date()
    }
  }

  async runSync(): Promise<void> {
    console.log('🔄 Starting HubSpot Data Synchronization...')
    console.log(`📊 Mode: ${this.options.dryRun ? 'DRY RUN' : 'LIVE SYNC'}`)
    console.log(`📦 Batch size: ${this.options.batchSize}`)
    console.log(`🔍 Full sync: ${this.options.fullSync ? 'Yes' : 'Incremental'}`)
    console.log('')

    try {
      if (this.options.includeContacts) {
        await this.syncMembers()
      }

      if (this.options.includeDeals) {
        await this.syncProjects()
        await this.syncServiceRequests()
      }

      this.stats.endTime = new Date()
      this.stats.duration = this.stats.endTime.getTime() - this.stats.startTime.getTime()

      this.displayResults()

    } catch (error) {
      console.error('💥 Sync failed:', error)
      throw error
    } finally {
      await this.prisma.$disconnect()
    }
  }

  private async syncMembers(): Promise<void> {
    console.log('👥 Syncing Members to HubSpot Contacts...')

    try {
      // Get members to sync
      const whereCondition = this.options.fullSync 
        ? {} 
        : { 
            OR: [
              { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
              { hubspotContactId: null }
            ]
          }

      const totalMembers = await this.prisma.user.count({ where: whereCondition })
      this.stats.contacts.total = totalMembers

      console.log(`📋 Found ${totalMembers} members to sync`)

      if (totalMembers === 0) {
        console.log('  ✅ No members to sync')
        return
      }

      // Process in batches
      let processed = 0
      const batchSize = this.options.batchSize

      while (processed < totalMembers) {
        const members = await this.prisma.user.findMany({
          where: whereCondition,
          skip: processed,
          take: batchSize,
          include: {
            profile: true,
            memberships: true,
            eventRegistrations: {
              include: { event: true }
            }
          }
        })

        if (members.length === 0) break

        console.log(`  📦 Processing batch ${Math.floor(processed / batchSize) + 1} (${members.length} members)`)

        for (const member of members) {
          try {
            await this.syncMember(member)
            this.stats.contacts.updated++
          } catch (error) {
            this.stats.contacts.errors++
            if (this.options.verbose) {
              console.log(`    ❌ Failed to sync member ${member.email}: ${error}`)
            }
          }
        }

        processed += members.length

        // Rate limiting - small delay between batches
        if (processed < totalMembers) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }

      console.log(`  ✅ Completed member sync: ${this.stats.contacts.updated} updated, ${this.stats.contacts.errors} errors`)

    } catch (error) {
      console.error('❌ Member sync failed:', error)
      throw error
    }
  }

  private async syncMember(member: any): Promise<void> {
    if (this.options.dryRun) {
      if (this.options.verbose) {
        console.log(`    🔍 Would sync member: ${member.email}`)
      }
      return
    }

    // Calculate engagement metrics
    const engagementScore = await this.calculateEngagementScore(member)
    const riskLevel = this.calculateRiskLevel(member, engagementScore)
    const memberSavings = await this.calculateMemberSavings(member.id)

    const memberData = {
      id: member.id,
      email: member.email,
      firstName: member.firstName,
      lastName: member.lastName,
      company: member.profile?.company || '',
      phone: member.profile?.phone || '',
      memberType: member.memberType,
      memberSince: member.createdAt,
      lastLogin: member.lastLoginAt,
      engagementScore,
      riskLevel,
      totalSavings: memberSavings.total,
      // Additional NAMC-specific data
      tradeSpecialties: member.profile?.tradeSpecialties || [],
      serviceAreas: member.profile?.serviceAreas || [],
      yearsInBusiness: member.profile?.yearsInBusiness,
      employeeCount: member.profile?.employeeCount,
      eventsAttendedThisYear: member.eventRegistrations?.length || 0
    }

    const result = await hubspotContactsService.syncMemberToContact(memberData)

    if (result.success && result.data?.id) {
      // Update member with HubSpot contact ID if needed
      if (!member.hubspotContactId) {
        await this.prisma.user.update({
          where: { id: member.id },
          data: { hubspotContactId: result.data.id }
        })
      }

      if (this.options.verbose) {
        console.log(`    ✅ Synced member: ${member.email} → ${result.data.id}`)
      }
    } else {
      throw new Error(result.message || 'Sync failed')
    }
  }

  private async syncProjects(): Promise<void> {
    console.log('🏗️  Syncing Projects to HubSpot Deals...')

    try {
      const whereCondition = this.options.fullSync 
        ? {} 
        : { 
            OR: [
              { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
              { hubspotDealId: null }
            ]
          }

      const projects = await this.prisma.project.findMany({
        where: whereCondition,
        include: {
          applications: true,
          matches: true
        }
      })

      this.stats.deals.total += projects.length
      console.log(`📋 Found ${projects.length} projects to sync`)

      for (const project of projects) {
        try {
          await this.syncProject(project)
          this.stats.deals.updated++
        } catch (error) {
          this.stats.deals.errors++
          if (this.options.verbose) {
            console.log(`    ❌ Failed to sync project ${project.title}: ${error}`)
          }
        }
      }

      console.log(`  ✅ Completed project sync: ${this.stats.deals.updated} updated, ${this.stats.deals.errors} errors`)

    } catch (error) {
      console.error('❌ Project sync failed:', error)
      throw error
    }
  }

  private async syncProject(project: any): Promise<void> {
    if (this.options.dryRun) {
      if (this.options.verbose) {
        console.log(`    🔍 Would sync project: ${project.title}`)
      }
      return
    }

    const projectData = {
      id: project.id,
      title: project.title,
      description: project.description,
      category: project.category,
      location: project.location,
      estimatedValue: project.estimatedValue,
      bidDeadline: project.bidDeadline,
      projectStartDate: project.startDate,
      requiredSpecialties: project.requiredSpecialties,
      bondingRequired: project.bondingRequired,
      clientName: project.clientName,
      status: project.status,
      interestedMembersCount: project.matches?.length || 0,
      applicationsReceived: project.applications?.length || 0
    }

    const result = await hubspotDealsService.syncProjectToDeal(projectData)

    if (result.success && result.data?.id) {
      // Update project with HubSpot deal ID if needed
      if (!project.hubspotDealId) {
        await this.prisma.project.update({
          where: { id: project.id },
          data: { hubspotDealId: result.data.id }
        })
      }

      if (this.options.verbose) {
        console.log(`    ✅ Synced project: ${project.title} → ${result.data.id}`)
      }
    } else {
      throw new Error(result.message || 'Project sync failed')
    }
  }

  private async syncServiceRequests(): Promise<void> {
    console.log('🛠️  Syncing Service Requests to HubSpot Deals...')

    try {
      const whereCondition = this.options.fullSync 
        ? {} 
        : { 
            OR: [
              { updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
              { hubspotDealId: null }
            ]
          }

      const serviceRequests = await this.prisma.serviceRequest.findMany({
        where: whereCondition,
        include: {
          requester: true
        }
      })

      this.stats.deals.total += serviceRequests.length
      console.log(`📋 Found ${serviceRequests.length} service requests to sync`)

      for (const serviceRequest of serviceRequests) {
        try {
          await this.syncServiceRequest(serviceRequest)
          this.stats.deals.updated++
        } catch (error) {
          this.stats.deals.errors++
          if (this.options.verbose) {
            console.log(`    ❌ Failed to sync service request ${serviceRequest.title}: ${error}`)
          }
        }
      }

      console.log(`  ✅ Completed service request sync`)

    } catch (error) {
      console.error('❌ Service request sync failed:', error)
      throw error
    }
  }

  private async syncServiceRequest(serviceRequest: any): Promise<void> {
    if (this.options.dryRun) {
      if (this.options.verbose) {
        console.log(`    🔍 Would sync service request: ${serviceRequest.title}`)
      }
      return
    }

    const serviceData = {
      id: serviceRequest.id,
      title: serviceRequest.title,
      description: serviceRequest.description,
      serviceType: serviceRequest.serviceType,
      urgency: serviceRequest.urgency,
      expectedStartDate: serviceRequest.expectedStartDate,
      budget: {
        minBudget: serviceRequest.minBudget,
        maxBudget: serviceRequest.maxBudget
      },
      requesterName: `${serviceRequest.requester.firstName} ${serviceRequest.requester.lastName}`,
      status: serviceRequest.status,
      estimatedSavings: serviceRequest.estimatedSavings,
      actualSavings: serviceRequest.actualSavings
    }

    const result = await hubspotDealsService.syncServiceRequestToDeal(serviceData)

    if (result.success && result.data?.id) {
      // Update service request with HubSpot deal ID if needed
      if (!serviceRequest.hubspotDealId) {
        await this.prisma.serviceRequest.update({
          where: { id: serviceRequest.id },
          data: { hubspotDealId: result.data.id }
        })
      }

      if (this.options.verbose) {
        console.log(`    ✅ Synced service request: ${serviceRequest.title} → ${result.data.id}`)
      }
    } else {
      throw new Error(result.message || 'Service request sync failed')
    }
  }

  private async calculateEngagementScore(member: any): Promise<number> {
    // Simple engagement score calculation
    let score = 50 // Base score

    // Login frequency (0-25 points)
    const daysSinceLastLogin = member.lastLoginAt 
      ? Math.floor((Date.now() - member.lastLoginAt.getTime()) / (1000 * 60 * 60 * 24))
      : 999
    
    if (daysSinceLastLogin <= 7) score += 25
    else if (daysSinceLastLogin <= 30) score += 15
    else if (daysSinceLastLogin <= 90) score += 5

    // Event participation (0-15 points)
    const eventsThisYear = member.eventRegistrations?.length || 0
    score += Math.min(eventsThisYear * 3, 15)

    // Profile completeness (0-10 points)
    if (member.profile?.company) score += 2
    if (member.profile?.phone) score += 2
    if (member.profile?.tradeSpecialties?.length > 0) score += 3
    if (member.profile?.serviceAreas?.length > 0) score += 3

    return Math.min(Math.max(score, 0), 100)
  }

  private calculateRiskLevel(member: any, engagementScore: number): string {
    if (engagementScore < 25) return 'at_risk_intervention'
    if (engagementScore < 50) return 'high_risk'
    if (engagementScore < 75) return 'medium_risk'
    return 'standard'
  }

  private async calculateMemberSavings(memberId: string): Promise<{ total: number; breakdown: any }> {
    // Calculate various savings for the member
    // This is a simplified calculation - implement based on your business logic
    
    const savings = {
      rebates: 0,
      toolRental: 0,
      events: 0,
      financing: 0
    }

    // TODO: Implement actual savings calculations based on your data models
    
    return {
      total: Object.values(savings).reduce((sum, value) => sum + value, 0),
      breakdown: savings
    }
  }

  private displayResults(): void {
    console.log('\n📊 Sync Results Summary:')
    console.log('=' .repeat(50))

    const totalProcessed = this.stats.contacts.total + this.stats.deals.total
    const totalSuccessful = this.stats.contacts.updated + this.stats.deals.updated
    const totalErrors = this.stats.contacts.errors + this.stats.deals.errors

    console.log(`📈 Overall Results:`)
    console.log(`  Total records: ${totalProcessed}`)
    console.log(`  Successful: ${totalSuccessful}`)
    console.log(`  Errors: ${totalErrors}`)
    console.log(`  Success rate: ${totalProcessed > 0 ? Math.round((totalSuccessful / totalProcessed) * 100) : 0}%`)
    console.log(`  Duration: ${(this.stats.duration / 1000).toFixed(1)}s`)

    console.log(`\n👥 Contact Sync:`)
    console.log(`  Members processed: ${this.stats.contacts.total}`)
    console.log(`  Successfully synced: ${this.stats.contacts.updated}`)
    console.log(`  Errors: ${this.stats.contacts.errors}`)

    console.log(`\n💼 Deal Sync:`)
    console.log(`  Projects & Services: ${this.stats.deals.total}`)
    console.log(`  Successfully synced: ${this.stats.deals.updated}`)
    console.log(`  Errors: ${this.stats.deals.errors}`)

    if (this.options.dryRun) {
      console.log('\n🔍 DRY RUN MODE - No actual changes were made')
      console.log('Run without --dry-run to perform actual synchronization')
    }

    console.log('\n🔧 Next Steps:')
    console.log('  • Run `npm run hubspot:health` to monitor sync health')
    console.log('  • Check HubSpot portal to verify synced data')
    console.log('  • Review error logs if any sync failures occurred')

    if (totalErrors > 0) {
      console.log('\n⚠️  Some records failed to sync. Check logs for details.')
      process.exit(1)
    } else {
      console.log('\n🎉 Data synchronization completed successfully!')
      process.exit(0)
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
HubSpot Data Synchronization Script

Usage: npm run hubspot:sync [options]

Options:
  --help, -h          Show this help message
  --dry-run           Show what would be synced without making changes
  --full-sync         Sync all data instead of incremental
  --contacts-only     Sync only contacts (members)
  --deals-only        Sync only deals (projects & services)
  --batch-size N      Number of records to process in each batch (default: 50)
  --verbose           Show detailed progress information

Examples:
  npm run hubspot:sync                    # Incremental sync
  npm run hubspot:sync --full-sync        # Sync all data
  npm run hubspot:sync --dry-run          # Preview what would be synced
  npm run hubspot:sync --contacts-only    # Sync only member contacts
  npm run hubspot:sync --verbose          # Detailed output

This script syncs:
1. NAMC members → HubSpot contacts with engagement data
2. Project opportunities → HubSpot deals in project pipeline
3. Service requests → HubSpot deals in service pipeline
4. Member analytics and engagement scores

Required environment variables:
- HUBSPOT_API_KEY: Your HubSpot private app access token
- DATABASE_URL: PostgreSQL connection string
    `)
    process.exit(0)
  }

  // Validate environment variables
  if (!process.env.HUBSPOT_API_KEY) {
    console.error('❌ Error: HUBSPOT_API_KEY environment variable is required')
    process.exit(1)
  }

  if (!process.env.DATABASE_URL) {
    console.error('❌ Error: DATABASE_URL environment variable is required')
    process.exit(1)
  }

  // Parse options
  const options: SyncOptions = {
    dryRun: args.includes('--dry-run'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size'))?.split('=')[1] || '50'),
    includeContacts: !args.includes('--deals-only'),
    includeDeals: !args.includes('--contacts-only'),
    verbose: args.includes('--verbose'),
    fullSync: args.includes('--full-sync')
  }

  console.log('🚀 NAMC HubSpot Data Sync Starting...\n')

  const syncer = new HubSpotDataSyncer(options)
  await syncer.runSync()
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Sync failed with error:', error)
    process.exit(1)
  })
}