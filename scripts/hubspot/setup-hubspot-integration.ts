#!/usr/bin/env tsx

/**
 * HubSpot Integration Setup Script
 * 
 * This script sets up the complete HubSpot integration for NAMC:
 * - Creates custom properties for contacts and deals
 * - Sets up webhook subscriptions
 * - Creates NAMC-specific workflows
 * - Validates integration health
 */

import { 
  hubspotPropertiesService, 
  hubspotWebhooksService, 
  hubspotWorkflowsService,
  hubspotApiClient 
} from '@/features/hubspot/services'

interface SetupResult {
  step: string
  success: boolean
  message: string
  details?: any
  error?: any
}

class HubSpotSetupManager {
  private results: SetupResult[] = []

  async runSetup(): Promise<void> {
    console.log('🚀 Starting HubSpot Integration Setup for NAMC...\n')

    // Step 1: Test HubSpot connection
    await this.testConnection()

    // Step 2: Create custom properties
    await this.createCustomProperties()

    // Step 3: Setup webhook subscriptions
    await this.setupWebhooks()

    // Step 4: Create NAMC workflows
    await this.createWorkflows()

    // Step 5: Final validation
    await this.validateSetup()

    // Display results
    this.displayResults()
  }

  private async testConnection(): Promise<void> {
    console.log('📡 Testing HubSpot API connection...')
    
    try {
      const response = await hubspotApiClient.get('/crm/v3/objects/contacts', { limit: 1 })
      
      if (response.success) {
        this.addResult('Connection Test', true, 'Successfully connected to HubSpot API')
      } else {
        this.addResult('Connection Test', false, 'Failed to connect to HubSpot API', null, response.error)
      }
    } catch (error) {
      this.addResult('Connection Test', false, 'Connection test failed', null, error)
    }
  }

  private async createCustomProperties(): Promise<void> {
    console.log('🏗️  Creating NAMC custom properties...')

    try {
      // Create contact properties
      console.log('  📋 Creating contact properties...')
      const contactProperties = await hubspotPropertiesService.createNAMCContactProperties()
      
      if (contactProperties.success) {
        this.addResult(
          'Contact Properties', 
          true, 
          `Created ${contactProperties.data.created.length} contact properties`,
          {
            created: contactProperties.data.created.length,
            errors: contactProperties.data.errors.length,
            errorDetails: contactProperties.data.errors
          }
        )
      } else {
        this.addResult('Contact Properties', false, 'Failed to create contact properties', null, contactProperties.error)
      }

      // Create deal properties
      console.log('  💼 Creating deal properties...')
      const dealProperties = await hubspotPropertiesService.createNAMCDealProperties()
      
      if (dealProperties.success) {
        this.addResult(
          'Deal Properties', 
          true, 
          `Created ${dealProperties.data.created.length} deal properties`,
          {
            created: dealProperties.data.created.length,
            errors: dealProperties.data.errors.length,
            errorDetails: dealProperties.data.errors
          }
        )
      } else {
        this.addResult('Deal Properties', false, 'Failed to create deal properties', null, dealProperties.error)
      }

    } catch (error) {
      this.addResult('Custom Properties', false, 'Property creation failed', null, error)
    }
  }

  private async setupWebhooks(): Promise<void> {
    console.log('🔗 Setting up webhook subscriptions...')

    try {
      const webhooks = await hubspotWebhooksService.setupNAMCWebhooks()
      
      if (webhooks.success) {
        this.addResult(
          'Webhook Setup', 
          true, 
          `Created ${webhooks.data.created.length} webhook subscriptions`,
          {
            created: webhooks.data.created.length,
            errors: webhooks.data.errors.length,
            errorDetails: webhooks.data.errors
          }
        )
      } else {
        this.addResult('Webhook Setup', false, 'Failed to setup webhooks', null, webhooks.error)
      }

    } catch (error) {
      this.addResult('Webhook Setup', false, 'Webhook setup failed', null, error)
    }
  }

  private async createWorkflows(): Promise<void> {
    console.log('⚙️  Creating NAMC workflows...')

    const workflows = [
      {
        name: 'Member Onboarding',
        createMethod: () => hubspotWorkflowsService.createMemberOnboardingWorkflow()
      },
      {
        name: 'Project Matching',
        createMethod: () => hubspotWorkflowsService.createProjectMatchingWorkflow()
      },
      {
        name: 'Member Lifecycle',
        createMethod: () => hubspotWorkflowsService.createMemberLifecycleWorkflow()
      },
      {
        name: 'Renewal Management',
        createMethod: () => hubspotWorkflowsService.createRenewalManagementWorkflow()
      }
    ]

    for (const workflow of workflows) {
      try {
        console.log(`  🔄 Creating ${workflow.name} workflow...`)
        const result = await workflow.createMethod()
        
        if (result.success) {
          this.addResult(
            `${workflow.name} Workflow`, 
            true, 
            `Successfully created ${workflow.name} workflow`,
            { workflowId: result.data?.id }
          )
        } else {
          this.addResult(
            `${workflow.name} Workflow`, 
            false, 
            `Failed to create ${workflow.name} workflow`,
            null,
            result.error
          )
        }
      } catch (error) {
        this.addResult(
          `${workflow.name} Workflow`, 
          false, 
          `Error creating ${workflow.name} workflow`,
          null,
          error
        )
      }
    }
  }

  private async validateSetup(): Promise<void> {
    console.log('✅ Validating integration setup...')

    try {
      // Check if we can list workflows
      const workflows = await hubspotWorkflowsService.listWorkflows(10)
      
      if (workflows.success) {
        const namcWorkflows = workflows.data.results.filter(w => 
          w.name.toLowerCase().includes('namc') || 
          w.name.toLowerCase().includes('member') ||
          w.name.toLowerCase().includes('project')
        )
        
        this.addResult(
          'Integration Validation', 
          true, 
          `Found ${namcWorkflows.length} NAMC workflows in HubSpot`,
          { totalWorkflows: workflows.data.results.length, namcWorkflows: namcWorkflows.length }
        )
      } else {
        this.addResult('Integration Validation', false, 'Failed to validate workflows', null, workflows.error)
      }

      // Check webhook subscriptions
      const webhookList = await hubspotWebhooksService.listWebhookSubscriptions()
      
      if (webhookList.success) {
        this.addResult(
          'Webhook Validation', 
          true, 
          `Found ${webhookList.data.results.length} webhook subscriptions`,
          { webhookCount: webhookList.data.results.length }
        )
      } else {
        this.addResult('Webhook Validation', false, 'Failed to validate webhooks', null, webhookList.error)
      }

    } catch (error) {
      this.addResult('Integration Validation', false, 'Validation failed', null, error)
    }
  }

  private addResult(step: string, success: boolean, message: string, details?: any, error?: any): void {
    this.results.push({ step, success, message, details, error })
    
    const icon = success ? '✅' : '❌'
    console.log(`    ${icon} ${step}: ${message}`)
    
    if (error && process.env.NODE_ENV === 'development') {
      console.log(`      Error details:`, error)
    }
  }

  private displayResults(): void {
    console.log('\n📊 Setup Results Summary:')
    console.log('=' .repeat(50))

    const successful = this.results.filter(r => r.success).length
    const failed = this.results.filter(r => !r.success).length

    console.log(`✅ Successful steps: ${successful}`)
    console.log(`❌ Failed steps: ${failed}`)
    console.log(`📈 Success rate: ${Math.round((successful / this.results.length) * 100)}%`)

    if (failed > 0) {
      console.log('\n❌ Failed Steps:')
      this.results.filter(r => !r.success).forEach(result => {
        console.log(`  • ${result.step}: ${result.message}`)
        if (result.error) {
          console.log(`    Error: ${result.error}`)
        }
      })
    }

    console.log('\n🎯 Next Steps:')
    console.log('  1. Run `npm run hubspot:test` to test the integration')
    console.log('  2. Run `npm run hubspot:health` to monitor system health')
    console.log('  3. Run `npm run hubspot:sync` to perform initial data sync')
    console.log('  4. Check HubSpot portal for created properties and workflows')

    if (successful === this.results.length) {
      console.log('\n🎉 HubSpot integration setup completed successfully!')
      process.exit(0)
    } else {
      console.log('\n⚠️  Setup completed with errors. Please review and fix failed steps.')
      process.exit(1)
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
HubSpot Integration Setup Script

Usage: npm run hubspot:setup [options]

Options:
  --help, -h     Show this help message
  --dry-run      Show what would be done without making changes
  --verbose      Show detailed progress information

Examples:
  npm run hubspot:setup
  npm run hubspot:setup --dry-run
  npm run hubspot:setup --verbose

This script will:
1. Test HubSpot API connection
2. Create NAMC custom properties for contacts and deals
3. Setup webhook subscriptions for real-time sync
4. Create NAMC-specific workflows for automation
5. Validate the complete integration setup

Make sure you have the following environment variables set:
- HUBSPOT_API_KEY: Your HubSpot private app access token
- NEXT_PUBLIC_API_URL: Your application's API URL for webhooks
    `)
    process.exit(0)
  }

  if (args.includes('--dry-run')) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n')
    console.log('This would perform the following actions:')
    console.log('  1. Test HubSpot API connection')
    console.log('  2. Create 40+ custom contact properties')
    console.log('  3. Create 15+ custom deal properties')
    console.log('  4. Setup 7 webhook subscriptions')
    console.log('  5. Create 4 NAMC workflows')
    console.log('  6. Validate integration health')
    console.log('\nRun without --dry-run to execute these actions.')
    process.exit(0)
  }

  if (args.includes('--verbose')) {
    process.env.HUBSPOT_SETUP_VERBOSE = 'true'
  }

  // Validate environment variables
  if (!process.env.HUBSPOT_API_KEY) {
    console.error('❌ Error: HUBSPOT_API_KEY environment variable is required')
    console.error('Please set your HubSpot private app access token')
    process.exit(1)
  }

  if (!process.env.NEXT_PUBLIC_API_URL) {
    console.error('❌ Error: NEXT_PUBLIC_API_URL environment variable is required')
    console.error('Please set your application API URL for webhook endpoints')
    process.exit(1)
  }

  const setup = new HubSpotSetupManager()
  await setup.runSetup()
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Setup failed with error:', error)
    process.exit(1)
  })
}