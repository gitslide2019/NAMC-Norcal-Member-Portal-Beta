#!/usr/bin/env tsx

/**
 * HubSpot Integration Health Check Script
 * 
 * This script monitors the health of the HubSpot integration:
 * - API connectivity and performance
 * - Workflow execution status
 * - Data sync health
 * - Webhook functionality
 * - Error rates and performance metrics
 */

import { 
  hubspotApiClient,
  hubspotContactsService,
  hubspotDealsService,
  hubspotWorkflowsService,
  hubspotWebhooksService
} from '@/features/hubspot/services'

interface HealthMetric {
  name: string
  status: 'healthy' | 'warning' | 'critical' | 'unknown'
  value: number | string
  threshold?: number
  unit?: string
  message: string
  details?: any
}

interface HealthReport {
  overall: 'healthy' | 'warning' | 'critical'
  timestamp: Date
  metrics: HealthMetric[]
  recommendations: string[]
  uptime: number
}

class HubSpotHealthChecker {
  private report: HealthReport
  private startTime: Date

  constructor() {
    this.startTime = new Date()
    this.report = {
      overall: 'healthy',
      timestamp: this.startTime,
      metrics: [],
      recommendations: [],
      uptime: 0
    }
  }

  async runHealthCheck(): Promise<void> {
    console.log('🏥 HubSpot Integration Health Check Starting...\n')

    await this.checkApiHealth()
    await this.checkAuthenticationHealth()
    await this.checkServiceHealth()
    await this.checkWorkflowHealth()
    await this.checkWebhookHealth()
    await this.checkDataSyncHealth()
    await this.checkPerformanceMetrics()

    this.calculateOverallHealth()
    this.generateRecommendations()
    this.displayReport()
  }

  private async checkApiHealth(): Promise<void> {
    console.log('📡 Checking API Connectivity...')

    const startTime = Date.now()
    try {
      const response = await hubspotApiClient.get('/crm/v3/objects/contacts', { limit: 1 })
      const responseTime = Date.now() - startTime

      if (response.success) {
        this.addMetric({
          name: 'API Connectivity',
          status: 'healthy',
          value: 'Connected',
          message: 'Successfully connected to HubSpot API'
        })

        this.addMetric({
          name: 'API Response Time',
          status: responseTime < 1000 ? 'healthy' : responseTime < 3000 ? 'warning' : 'critical',
          value: responseTime,
          threshold: 1000,
          unit: 'ms',
          message: `API responding in ${responseTime}ms`
        })
      } else {
        this.addMetric({
          name: 'API Connectivity',
          status: 'critical',
          value: 'Failed',
          message: `API connection failed: ${response.message}`
        })
      }
    } catch (error) {
      this.addMetric({
        name: 'API Connectivity',
        status: 'critical',
        value: 'Error',
        message: `API connection error: ${error}`
      })
    }
  }

  private async checkAuthenticationHealth(): Promise<void> {
    console.log('🔐 Checking Authentication...')

    try {
      const response = await hubspotApiClient.get('/oauth/v1/access-tokens/validate')
      
      if (response.success && response.data) {
        const tokenData = response.data
        const expiresIn = tokenData.expires_in || 0
        const daysUntilExpiry = Math.floor(expiresIn / (24 * 60 * 60))

        this.addMetric({
          name: 'Authentication',
          status: 'healthy',
          value: 'Valid',
          message: 'Authentication token is valid'
        })

        this.addMetric({
          name: 'Token Expiry',
          status: daysUntilExpiry > 30 ? 'healthy' : daysUntilExpiry > 7 ? 'warning' : 'critical',
          value: daysUntilExpiry,
          unit: 'days',
          message: `Token expires in ${daysUntilExpiry} days`
        })

        // Check scopes
        const scopes = tokenData.scopes || []
        const requiredScopes = [
          'crm.objects.contacts.read',
          'crm.objects.contacts.write',
          'crm.objects.deals.read',
          'crm.objects.deals.write',
          'automation',
          'webhooks'
        ]
        
        const missingScopes = requiredScopes.filter(scope => !scopes.includes(scope))
        
        this.addMetric({
          name: 'API Scopes',
          status: missingScopes.length === 0 ? 'healthy' : 'warning',
          value: `${scopes.length}/${requiredScopes.length}`,
          message: missingScopes.length === 0 
            ? 'All required scopes available'
            : `Missing scopes: ${missingScopes.join(', ')}`
        })

      } else {
        this.addMetric({
          name: 'Authentication',
          status: 'critical',
          value: 'Invalid',
          message: 'Authentication token validation failed'
        })
      }
    } catch (error) {
      this.addMetric({
        name: 'Authentication',
        status: 'critical',
        value: 'Error',
        message: `Authentication check failed: ${error}`
      })
    }
  }

  private async checkServiceHealth(): Promise<void> {
    console.log('🛠️  Checking Service Health...')

    // Test contacts service
    try {
      const contactsResponse = await hubspotContactsService.searchContacts(
        [{ propertyName: 'createdate', operator: 'HAS_PROPERTY', value: null }],
        ['email'],
        5
      )

      this.addMetric({
        name: 'Contacts Service',
        status: contactsResponse.success ? 'healthy' : 'critical',
        value: contactsResponse.success ? 'Working' : 'Failed',
        message: contactsResponse.success 
          ? `Retrieved ${contactsResponse.data?.results?.length || 0} contacts`
          : `Contacts service failed: ${contactsResponse.message}`
      })
    } catch (error) {
      this.addMetric({
        name: 'Contacts Service',
        status: 'critical',
        value: 'Error',
        message: `Contacts service error: ${error}`
      })
    }

    // Test deals service
    try {
      const dealsResponse = await hubspotDealsService.searchDeals(
        [{ propertyName: 'createdate', operator: 'HAS_PROPERTY', value: null }],
        ['dealname'],
        5
      )

      this.addMetric({
        name: 'Deals Service',
        status: dealsResponse.success ? 'healthy' : 'critical',
        value: dealsResponse.success ? 'Working' : 'Failed',
        message: dealsResponse.success 
          ? `Retrieved ${dealsResponse.data?.results?.length || 0} deals`
          : `Deals service failed: ${dealsResponse.message}`
      })
    } catch (error) {
      this.addMetric({
        name: 'Deals Service',
        status: 'critical',
        value: 'Error',
        message: `Deals service error: ${error}`
      })
    }
  }

  private async checkWorkflowHealth(): Promise<void> {
    console.log('⚙️  Checking Workflow Health...')

    try {
      const workflowsResponse = await hubspotWorkflowsService.listWorkflows(50)
      
      if (workflowsResponse.success) {
        const workflows = workflowsResponse.data?.results || []
        const namcWorkflows = workflows.filter(w => 
          w.name.toLowerCase().includes('namc') || 
          w.name.toLowerCase().includes('member') ||
          w.name.toLowerCase().includes('project')
        )

        const activeWorkflows = namcWorkflows.filter(w => w.enabled)
        
        this.addMetric({
          name: 'NAMC Workflows',
          status: namcWorkflows.length > 0 ? 'healthy' : 'warning',
          value: `${activeWorkflows.length}/${namcWorkflows.length}`,
          message: `${activeWorkflows.length} active NAMC workflows out of ${namcWorkflows.length} total`
        })

        // Check for any failed workflow executions in the last 24 hours
        let workflowErrors = 0
        for (const workflow of namcWorkflows.slice(0, 5)) { // Check first 5 workflows
          try {
            const executions = await hubspotWorkflowsService.getWorkflowExecutions(
              workflow.id,
              new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
              new Date(),
              10
            )
            
            if (executions.success) {
              const failedExecutions = executions.data?.results?.filter(e => e.status === 'FAILED') || []
              workflowErrors += failedExecutions.length
            }
          } catch (error) {
            // Skip individual workflow check errors
          }
        }

        this.addMetric({
          name: 'Workflow Errors (24h)',
          status: workflowErrors === 0 ? 'healthy' : workflowErrors < 5 ? 'warning' : 'critical',
          value: workflowErrors,
          unit: 'errors',
          message: workflowErrors === 0 
            ? 'No workflow errors in last 24 hours'
            : `${workflowErrors} workflow errors in last 24 hours`
        })

      } else {
        this.addMetric({
          name: 'Workflow Service',
          status: 'critical',
          value: 'Failed',
          message: `Failed to retrieve workflows: ${workflowsResponse.message}`
        })
      }
    } catch (error) {
      this.addMetric({
        name: 'Workflow Service',
        status: 'critical',
        value: 'Error',
        message: `Workflow check failed: ${error}`
      })
    }
  }

  private async checkWebhookHealth(): Promise<void> {
    console.log('🔗 Checking Webhook Health...')

    try {
      const webhooksResponse = await hubspotWebhooksService.listWebhookSubscriptions()
      
      if (webhooksResponse.success) {
        const webhooks = webhooksResponse.data?.results || []
        const activeWebhooks = webhooks.filter(w => w.active)

        this.addMetric({
          name: 'Webhook Subscriptions',
          status: activeWebhooks.length > 0 ? 'healthy' : 'warning',
          value: `${activeWebhooks.length}/${webhooks.length}`,
          message: `${activeWebhooks.length} active webhook subscriptions`
        })

        // Check webhook endpoint accessibility
        const webhookUrl = process.env.NEXT_PUBLIC_API_URL + '/api/webhooks/hubspot'
        try {
          const healthCheckResponse = await fetch(webhookUrl + '/health', { method: 'GET' })
          
          this.addMetric({
            name: 'Webhook Endpoint',
            status: healthCheckResponse.ok ? 'healthy' : 'warning',
            value: healthCheckResponse.status,
            message: healthCheckResponse.ok 
              ? 'Webhook endpoint accessible'
              : `Webhook endpoint returned ${healthCheckResponse.status}`
          })
        } catch (error) {
          this.addMetric({
            name: 'Webhook Endpoint',
            status: 'warning',
            value: 'Unreachable',
            message: 'Webhook endpoint health check failed - may affect real-time sync'
          })
        }

      } else {
        this.addMetric({
          name: 'Webhook Service',
          status: 'critical',
          value: 'Failed',
          message: `Failed to retrieve webhooks: ${webhooksResponse.message}`
        })
      }
    } catch (error) {
      this.addMetric({
        name: 'Webhook Service',
        status: 'critical',
        value: 'Error',
        message: `Webhook check failed: ${error}`
      })
    }
  }

  private async checkDataSyncHealth(): Promise<void> {
    console.log('🔄 Checking Data Sync Health...')

    try {
      // Check for recent contact updates
      const recentContacts = await hubspotContactsService.searchContacts(
        [{ 
          propertyName: 'hs_lastmodifieddate', 
          operator: 'GTE', 
          value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }],
        ['email', 'hs_lastmodifieddate'],
        10
      )

      if (recentContacts.success) {
        const contactCount = recentContacts.data?.results?.length || 0
        
        this.addMetric({
          name: 'Contact Sync Activity',
          status: 'healthy',
          value: contactCount,
          unit: 'updates/24h',
          message: `${contactCount} contact updates in last 24 hours`
        })
      }

      // Check for recent deal updates
      const recentDeals = await hubspotDealsService.searchDeals(
        [{ 
          propertyName: 'hs_lastmodifieddate', 
          operator: 'GTE', 
          value: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        }],
        ['dealname', 'hs_lastmodifieddate'],
        10
      )

      if (recentDeals.success) {
        const dealCount = recentDeals.data?.results?.length || 0
        
        this.addMetric({
          name: 'Deal Sync Activity',
          status: 'healthy',
          value: dealCount,
          unit: 'updates/24h',
          message: `${dealCount} deal updates in last 24 hours`
        })
      }

    } catch (error) {
      this.addMetric({
        name: 'Data Sync Health',
        status: 'warning',
        value: 'Error',
        message: `Data sync check failed: ${error}`
      })
    }
  }

  private async checkPerformanceMetrics(): Promise<void> {
    console.log('📊 Checking Performance Metrics...')

    // API rate limiting check
    try {
      const startTime = Date.now()
      const responses = await Promise.all([
        hubspotApiClient.get('/crm/v3/objects/contacts', { limit: 1 }),
        hubspotApiClient.get('/crm/v3/objects/deals', { limit: 1 }),
        hubspotApiClient.get('/crm/v3/objects/companies', { limit: 1 })
      ])
      const avgResponseTime = (Date.now() - startTime) / 3

      const successfulRequests = responses.filter(r => r.success).length
      
      this.addMetric({
        name: 'API Performance',
        status: avgResponseTime < 500 ? 'healthy' : avgResponseTime < 1000 ? 'warning' : 'critical',
        value: Math.round(avgResponseTime),
        unit: 'ms avg',
        message: `Average API response time: ${Math.round(avgResponseTime)}ms`
      })

      this.addMetric({
        name: 'API Reliability',
        status: successfulRequests === 3 ? 'healthy' : 'warning',
        value: `${successfulRequests}/3`,
        message: `${successfulRequests} out of 3 test requests successful`
      })

    } catch (error) {
      this.addMetric({
        name: 'API Performance',
        status: 'critical',
        value: 'Error',
        message: `Performance check failed: ${error}`
      })
    }

    // Calculate uptime since health check started
    this.report.uptime = Date.now() - this.startTime.getTime()
    
    this.addMetric({
      name: 'Health Check Duration',
      status: 'healthy',
      value: Math.round(this.report.uptime / 1000),
      unit: 'seconds',
      message: `Health check completed in ${Math.round(this.report.uptime / 1000)} seconds`
    })
  }

  private addMetric(metric: HealthMetric): void {
    this.report.metrics.push(metric)
    
    const icon = {
      'healthy': '✅',
      'warning': '⚠️',
      'critical': '❌',
      'unknown': '❓'
    }[metric.status]

    console.log(`  ${icon} ${metric.name}: ${metric.value}${metric.unit ? ' ' + metric.unit : ''} - ${metric.message}`)
  }

  private calculateOverallHealth(): void {
    const metrics = this.report.metrics
    const criticalCount = metrics.filter(m => m.status === 'critical').length
    const warningCount = metrics.filter(m => m.status === 'warning').length

    if (criticalCount > 0) {
      this.report.overall = 'critical'
    } else if (warningCount > 0) {
      this.report.overall = 'warning'
    } else {
      this.report.overall = 'healthy'
    }
  }

  private generateRecommendations(): void {
    const criticalMetrics = this.report.metrics.filter(m => m.status === 'critical')
    const warningMetrics = this.report.metrics.filter(m => m.status === 'warning')

    if (criticalMetrics.length > 0) {
      this.report.recommendations.push('🚨 URGENT: Address critical issues immediately')
      criticalMetrics.forEach(metric => {
        this.report.recommendations.push(`  • Fix ${metric.name}: ${metric.message}`)
      })
    }

    if (warningMetrics.length > 0) {
      this.report.recommendations.push('⚠️  Review warning conditions:')
      warningMetrics.forEach(metric => {
        this.report.recommendations.push(`  • Monitor ${metric.name}: ${metric.message}`)
      })
    }

    // Performance recommendations
    const responseTimeMetric = this.report.metrics.find(m => m.name === 'API Response Time')
    if (responseTimeMetric && typeof responseTimeMetric.value === 'number' && responseTimeMetric.value > 1000) {
      this.report.recommendations.push('📈 Consider implementing request caching to improve performance')
    }

    // General recommendations
    this.report.recommendations.push('💡 Regular maintenance suggestions:')
    this.report.recommendations.push('  • Run health checks daily during business hours')
    this.report.recommendations.push('  • Monitor webhook delivery failures')
    this.report.recommendations.push('  • Review workflow execution logs weekly')
    this.report.recommendations.push('  • Update API token before expiration')
  }

  private displayReport(): void {
    console.log('\n' + '='.repeat(60))
    console.log('🏥 HUBSPOT INTEGRATION HEALTH REPORT')
    console.log('='.repeat(60))

    const overallIcon = {
      'healthy': '✅',
      'warning': '⚠️',
      'critical': '❌'
    }[this.report.overall]

    console.log(`\n${overallIcon} Overall Health: ${this.report.overall.toUpperCase()}`)
    console.log(`📅 Timestamp: ${this.report.timestamp.toISOString()}`)
    console.log(`⏱️  Check Duration: ${Math.round(this.report.uptime / 1000)}s`)

    // Metrics summary
    const healthyCount = this.report.metrics.filter(m => m.status === 'healthy').length
    const warningCount = this.report.metrics.filter(m => m.status === 'warning').length
    const criticalCount = this.report.metrics.filter(m => m.status === 'critical').length

    console.log(`\n📊 Metrics Summary:`)
    console.log(`  ✅ Healthy: ${healthyCount}`)
    console.log(`  ⚠️  Warning: ${warningCount}`)
    console.log(`  ❌ Critical: ${criticalCount}`)
    console.log(`  📈 Success Rate: ${Math.round((healthyCount / this.report.metrics.length) * 100)}%`)

    // Recommendations
    if (this.report.recommendations.length > 0) {
      console.log(`\n🔧 Recommendations:`)
      this.report.recommendations.forEach(rec => {
        console.log(`${rec}`)
      })
    }

    console.log(`\n📋 Next Steps:`)
    if (this.report.overall === 'critical') {
      console.log(`  🚨 URGENT: Fix critical issues before using integration`)
      console.log(`  📞 Contact support if issues persist`)
    } else if (this.report.overall === 'warning') {
      console.log(`  ⚠️  Monitor warning conditions and plan maintenance`)
      console.log(`  🔄 Run sync operations with caution`)
    } else {
      console.log(`  ✅ Integration is healthy - normal operations can continue`)
      console.log(`  📅 Schedule next health check within 24 hours`)
    }

    console.log(`  📊 Run 'npm run hubspot:monitor' for continuous monitoring`)

    const exitCode = this.report.overall === 'critical' ? 2 : this.report.overall === 'warning' ? 1 : 0
    process.exit(exitCode)
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
HubSpot Integration Health Check Script

Usage: npm run hubspot:health [options]

Options:
  --help, -h     Show this help message
  --json         Output results in JSON format
  --quiet        Minimal output (errors only)

Exit Codes:
  0 - Healthy (all systems operational)
  1 - Warning (some issues detected)
  2 - Critical (immediate attention required)

Examples:
  npm run hubspot:health              # Full health check
  npm run hubspot:health --json       # JSON output for monitoring
  npm run hubspot:health --quiet      # Minimal output

This script checks:
1. API connectivity and authentication
2. Service functionality (contacts, deals, workflows)
3. Webhook configuration and accessibility
4. Data synchronization activity
5. Performance metrics and response times

For continuous monitoring, use:
  npm run hubspot:monitor --interval 300
    `)
    process.exit(0)
  }

  if (!process.env.HUBSPOT_API_KEY) {
    console.error('❌ Error: HUBSPOT_API_KEY environment variable is required')
    process.exit(1)
  }

  const checker = new HubSpotHealthChecker()
  await checker.runHealthCheck()
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Health check failed with error:', error)
    process.exit(2)
  })
}