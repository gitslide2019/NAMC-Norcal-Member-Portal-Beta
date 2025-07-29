#!/usr/bin/env tsx

/**
 * Workflow Monitoring Script
 * 
 * This script provides continuous monitoring of NAMC workflow execution:
 * - Real-time workflow status monitoring
 * - Performance metrics tracking
 * - Error detection and alerting
 * - Execution analytics and reporting
 */

import { 
  hubspotWorkflowsService,
  hubspotContactsService,
  hubspotDealsService
} from '@/features/hubspot/services'

interface WorkflowMetrics {
  workflowId: string
  workflowName: string
  status: 'active' | 'inactive' | 'error'
  enrollments: {
    total: number
    active: number
    completed: number
    failed: number
  }
  performance: {
    averageExecutionTime: number
    successRate: number
    errorRate: number
    lastExecution?: Date
  }
  trends: {
    enrollmentsToday: number
    enrollmentsYesterday: number
    successesToday: number
    errorsToday: number
  }
}

interface MonitoringReport {
  timestamp: Date
  overallHealth: 'healthy' | 'warning' | 'critical'
  totalWorkflows: number
  activeWorkflows: number
  metrics: WorkflowMetrics[]
  alerts: Array<{
    severity: 'info' | 'warning' | 'critical'
    workflowId: string
    message: string
    timestamp: Date
  }>
  recommendations: string[]
}

interface MonitoringOptions {
  interval: number
  maxRuns: number
  alertThresholds: {
    errorRate: number
    responseTime: number
    failureCount: number
  }
  enableAlerts: boolean
  outputFormat: 'console' | 'json' | 'dashboard'
}

class WorkflowMonitor {
  private options: MonitoringOptions
  private runCount = 0
  private isRunning = false
  private intervalId?: NodeJS.Timeout

  constructor(options: MonitoringOptions) {
    this.options = options
  }

  async startMonitoring(): Promise<void> {
    if (this.isRunning) {
      console.log('⚠️  Monitoring is already running')
      return
    }

    this.isRunning = true
    console.log('🔄 Starting NAMC Workflow Monitoring...')
    console.log(`📊 Monitoring interval: ${this.options.interval}s`)
    console.log(`🔢 Max runs: ${this.options.maxRuns === 0 ? 'unlimited' : this.options.maxRuns}`)
    console.log(`🚨 Alerts: ${this.options.enableAlerts ? 'enabled' : 'disabled'}`)
    console.log('')

    // Initial check
    await this.runMonitoringCycle()

    // Start periodic monitoring
    if (this.options.interval > 0) {
      this.intervalId = setInterval(async () => {
        await this.runMonitoringCycle()
      }, this.options.interval * 1000)
    }
  }

  async stopMonitoring(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    this.isRunning = false
    console.log('🛑 Workflow monitoring stopped')
  }

  private async runMonitoringCycle(): Promise<void> {
    try {
      this.runCount++
      
      if (this.options.outputFormat === 'console') {
        console.log(`\n📊 Monitoring Cycle #${this.runCount} - ${new Date().toISOString()}`)
        console.log('='.repeat(60))
      }

      const report = await this.generateMonitoringReport()
      await this.displayReport(report)
      await this.processAlerts(report)

      // Check if we should stop
      if (this.options.maxRuns > 0 && this.runCount >= this.options.maxRuns) {
        await this.stopMonitoring()
        process.exit(0)
      }

    } catch (error) {
      console.error('💥 Monitoring cycle failed:', error)
      
      if (this.options.enableAlerts) {
        console.log('🚨 CRITICAL: Monitoring system failure detected')
      }
    }
  }

  private async generateMonitoringReport(): Promise<MonitoringReport> {
    const report: MonitoringReport = {
      timestamp: new Date(),
      overallHealth: 'healthy',
      totalWorkflows: 0,
      activeWorkflows: 0,
      metrics: [],
      alerts: [],
      recommendations: []
    }

    try {
      // Get all NAMC workflows
      const workflowsResponse = await hubspotWorkflowsService.listWorkflows(100)
      
      if (!workflowsResponse.success) {
        report.alerts.push({
          severity: 'critical',
          workflowId: 'system',
          message: 'Failed to retrieve workflow list from HubSpot',
          timestamp: new Date()
        })
        report.overallHealth = 'critical'
        return report
      }

      const allWorkflows = workflowsResponse.data?.results || []
      const namcWorkflows = allWorkflows.filter(w => 
        w.name.toLowerCase().includes('namc') || 
        w.name.toLowerCase().includes('member') ||
        w.name.toLowerCase().includes('project') ||
        w.name.toLowerCase().includes('service')
      )

      report.totalWorkflows = namcWorkflows.length
      report.activeWorkflows = namcWorkflows.filter(w => w.enabled).length

      // Generate metrics for each workflow
      for (const workflow of namcWorkflows) {
        const metrics = await this.generateWorkflowMetrics(workflow)
        report.metrics.push(metrics)

        // Check for alerts
        this.checkWorkflowAlerts(metrics, report)
      }

      // Calculate overall health
      this.calculateOverallHealth(report)

      // Generate recommendations
      this.generateRecommendations(report)

    } catch (error) {
      report.alerts.push({
        severity: 'critical',
        workflowId: 'system',
        message: `Monitoring report generation failed: ${error}`,
        timestamp: new Date()
      })
      report.overallHealth = 'critical'
    }

    return report
  }

  private async generateWorkflowMetrics(workflow: any): Promise<WorkflowMetrics> {
    const metrics: WorkflowMetrics = {
      workflowId: workflow.id,
      workflowName: workflow.name,
      status: workflow.enabled ? 'active' : 'inactive',
      enrollments: {
        total: 0,
        active: 0,
        completed: 0,
        failed: 0
      },
      performance: {
        averageExecutionTime: 0,
        successRate: 0,
        errorRate: 0
      },
      trends: {
        enrollmentsToday: 0,
        enrollmentsYesterday: 0,
        successesToday: 0,
        errorsToday: 0
      }
    }

    try {
      // Get workflow executions for the last 7 days
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const executionsResponse = await hubspotWorkflowsService.getWorkflowExecutions(
        workflow.id,
        sevenDaysAgo,
        new Date(),
        100
      )

      if (executionsResponse.success && executionsResponse.data?.results) {
        const executions = executionsResponse.data.results
        
        // Calculate enrollment stats
        metrics.enrollments.total = executions.length
        metrics.enrollments.active = executions.filter(e => e.status === 'ENROLLED').length
        metrics.enrollments.completed = executions.filter(e => e.status === 'COMPLETED').length
        metrics.enrollments.failed = executions.filter(e => e.status === 'FAILED').length

        // Calculate performance metrics
        const completedExecutions = executions.filter(e => e.status === 'COMPLETED')
        if (completedExecutions.length > 0) {
          const totalTime = completedExecutions.reduce((sum, e) => {
            const duration = e.completedAt ? 
              new Date(e.completedAt).getTime() - new Date(e.enrolledAt).getTime() : 0
            return sum + duration
          }, 0)
          metrics.performance.averageExecutionTime = totalTime / completedExecutions.length
        }

        metrics.performance.successRate = executions.length > 0 ? 
          (metrics.enrollments.completed / executions.length) * 100 : 0
        metrics.performance.errorRate = executions.length > 0 ? 
          (metrics.enrollments.failed / executions.length) * 100 : 0

        if (executions.length > 0) {
          metrics.performance.lastExecution = new Date(executions[0].enrolledAt)
        }

        // Calculate trends
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        metrics.trends.enrollmentsToday = executions.filter(e => 
          new Date(e.enrolledAt) >= today
        ).length

        metrics.trends.enrollmentsYesterday = executions.filter(e => {
          const enrolledDate = new Date(e.enrolledAt)
          return enrolledDate >= yesterday && enrolledDate < today
        }).length

        metrics.trends.successesToday = executions.filter(e => 
          e.status === 'COMPLETED' && new Date(e.enrolledAt) >= today
        ).length

        metrics.trends.errorsToday = executions.filter(e => 
          e.status === 'FAILED' && new Date(e.enrolledAt) >= today
        ).length
      }

    } catch (error) {
      console.log(`  ⚠️  Failed to get metrics for workflow ${workflow.name}: ${error}`)
      metrics.status = 'error'
    }

    return metrics
  }

  private checkWorkflowAlerts(metrics: WorkflowMetrics, report: MonitoringReport): void {
    const { alertThresholds } = this.options

    // High error rate alert
    if (metrics.performance.errorRate > alertThresholds.errorRate) {
      report.alerts.push({
        severity: 'warning',
        workflowId: metrics.workflowId,
        message: `High error rate: ${metrics.performance.errorRate.toFixed(1)}% (threshold: ${alertThresholds.errorRate}%)`,
        timestamp: new Date()
      })
    }

    // High response time alert
    if (metrics.performance.averageExecutionTime > alertThresholds.responseTime) {
      report.alerts.push({
        severity: 'warning',
        workflowId: metrics.workflowId,
        message: `Slow execution: ${(metrics.performance.averageExecutionTime / 1000 / 60).toFixed(1)} minutes (threshold: ${alertThresholds.responseTime / 1000 / 60} minutes)`,
        timestamp: new Date()
      })
    }

    // High failure count alert
    if (metrics.trends.errorsToday >= alertThresholds.failureCount) {
      report.alerts.push({
        severity: 'critical',
        workflowId: metrics.workflowId,
        message: `High daily failure count: ${metrics.trends.errorsToday} failures today (threshold: ${alertThresholds.failureCount})`,
        timestamp: new Date()
      })
    }

    // Inactive workflow alert
    if (metrics.status === 'inactive' && metrics.workflowName.toLowerCase().includes('member')) {
      report.alerts.push({
        severity: 'info',
        workflowId: metrics.workflowId,
        message: 'Critical member workflow is inactive',
        timestamp: new Date()
      })
    }

    // No recent executions alert
    if (metrics.performance.lastExecution) {
      const hoursSinceLastExecution = (Date.now() - metrics.performance.lastExecution.getTime()) / (1000 * 60 * 60)
      if (hoursSinceLastExecution > 24 && metrics.status === 'active') {
        report.alerts.push({
          severity: 'warning',
          workflowId: metrics.workflowId,
          message: `No executions in ${Math.round(hoursSinceLastExecution)} hours`,
          timestamp: new Date()
        })
      }
    }
  }

  private calculateOverallHealth(report: MonitoringReport): void {
    const criticalAlerts = report.alerts.filter(a => a.severity === 'critical').length
    const warningAlerts = report.alerts.filter(a => a.severity === 'warning').length

    if (criticalAlerts > 0) {
      report.overallHealth = 'critical'
    } else if (warningAlerts > 0) {
      report.overallHealth = 'warning'
    } else {
      report.overallHealth = 'healthy'
    }
  }

  private generateRecommendations(report: MonitoringReport): void {
    const inactiveWorkflows = report.metrics.filter(m => m.status === 'inactive')
    const slowWorkflows = report.metrics.filter(m => m.performance.averageExecutionTime > 30 * 60 * 1000) // >30 mins
    const errorProneWorkflows = report.metrics.filter(m => m.performance.errorRate > 5)

    if (inactiveWorkflows.length > 0) {
      report.recommendations.push(`Review ${inactiveWorkflows.length} inactive workflows and activate if needed`)
    }

    if (slowWorkflows.length > 0) {
      report.recommendations.push(`Optimize ${slowWorkflows.length} slow-performing workflows`)
    }

    if (errorProneWorkflows.length > 0) {
      report.recommendations.push(`Investigate ${errorProneWorkflows.length} workflows with high error rates`)
    }

    if (report.activeWorkflows < report.totalWorkflows * 0.8) {
      report.recommendations.push('Consider activating more workflows to improve automation coverage')
    }

    if (report.alerts.length === 0) {
      report.recommendations.push('All workflows are performing well - maintain current monitoring schedule')
    }
  }

  private async displayReport(report: MonitoringReport): Promise<void> {
    switch (this.options.outputFormat) {
      case 'json':
        console.log(JSON.stringify(report, null, 2))
        break
      
      case 'dashboard':
        await this.displayDashboard(report)
        break
      
      default:
        await this.displayConsoleReport(report)
    }
  }

  private async displayConsoleReport(report: MonitoringReport): Promise<void> {
    const healthIcon = {
      'healthy': '✅',
      'warning': '⚠️',
      'critical': '❌'
    }[report.overallHealth]

    console.log(`${healthIcon} Overall Health: ${report.overallHealth.toUpperCase()}`)
    console.log(`📈 Workflows: ${report.activeWorkflows}/${report.totalWorkflows} active`)
    console.log(`🚨 Alerts: ${report.alerts.length}`)

    if (report.metrics.length > 0) {
      console.log('\n📊 Workflow Metrics:')
      report.metrics.forEach(metric => {
        const statusIcon = {
          'active': '✅',
          'inactive': '⏸️',
          'error': '❌'
        }[metric.status]

        console.log(`\n${statusIcon} ${metric.workflowName}`)
        console.log(`  📊 Enrollments: ${metric.enrollments.total} total, ${metric.enrollments.active} active, ${metric.enrollments.completed} completed`)
        console.log(`  ⚡ Performance: ${metric.performance.successRate.toFixed(1)}% success, ${metric.performance.errorRate.toFixed(1)}% errors`)
        console.log(`  📈 Today: ${metric.trends.enrollmentsToday} enrollments, ${metric.trends.successesToday} successes, ${metric.trends.errorsToday} errors`)
        
        if (metric.performance.averageExecutionTime > 0) {
          console.log(`  ⏱️  Avg execution: ${(metric.performance.averageExecutionTime / 1000 / 60).toFixed(1)} minutes`)
        }
      })
    }

    if (report.alerts.length > 0) {
      console.log('\n🚨 Active Alerts:')
      report.alerts.forEach(alert => {
        const alertIcon = {
          'info': 'ℹ️',
          'warning': '⚠️',
          'critical': '❌'
        }[alert.severity]
        console.log(`  ${alertIcon} ${alert.message}`)
      })
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:')
      report.recommendations.forEach(rec => {
        console.log(`  • ${rec}`)
      })
    }
  }

  private async displayDashboard(report: MonitoringReport): Promise<void> {
    // Clear screen for dashboard view
    console.clear()
    
    console.log('╔══════════════════════════════════════════════════════════════╗')
    console.log('║                    NAMC Workflow Monitor                     ║')
    console.log('╚══════════════════════════════════════════════════════════════╝')
    
    const healthIcon = {
      'healthy': '✅',
      'warning': '⚠️',
      'critical': '❌'
    }[report.overallHealth]

    console.log(`\n${healthIcon} System Health: ${report.overallHealth.toUpperCase()}`)
    console.log(`🕐 Last Update: ${report.timestamp.toLocaleString()}`)
    console.log(`📊 Workflows: ${report.activeWorkflows}/${report.totalWorkflows} active`)
    console.log(`🚨 Active Alerts: ${report.alerts.length}`)

    // Dashboard grid
    if (report.metrics.length > 0) {
      console.log('\n┌─────────────────────────────────────────────────────────────┐')
      console.log('│                       Workflow Status                      │')
      console.log('├─────────────────────────────────────────────────────────────┤')
      
      report.metrics.slice(0, 5).forEach(metric => { // Show top 5 workflows
        const statusIcon = metric.status === 'active' ? '🟢' : '🔴'
        const name = metric.workflowName.substring(0, 30).padEnd(30)
        const enrollments = metric.enrollments.active.toString().padStart(4)
        const successRate = `${metric.performance.successRate.toFixed(0)}%`.padStart(4)
        
        console.log(`│ ${statusIcon} ${name} │ ${enrollments} │ ${successRate} │`)
      })
      
      console.log('└─────────────────────────────────────────────────────────────┘')
    }

    console.log(`\n⏱️  Next update in ${this.options.interval}s...`)
  }

  private async processAlerts(report: MonitoringReport): Promise<void> {
    if (!this.options.enableAlerts || report.alerts.length === 0) {
      return
    }

    // Group alerts by severity
    const criticalAlerts = report.alerts.filter(a => a.severity === 'critical')
    const warningAlerts = report.alerts.filter(a => a.severity === 'warning')

    if (criticalAlerts.length > 0) {
      console.log(`\n🚨 CRITICAL ALERTS: ${criticalAlerts.length} issues require immediate attention`)
      
      // Here you could integrate with external alerting systems:
      // - Send Slack notifications
      // - Send email alerts
      // - Create PagerDuty incidents
      // - Post to monitoring dashboards
    }

    if (warningAlerts.length > 0) {
      console.log(`\n⚠️  WARNING: ${warningAlerts.length} issues need review`)
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
NAMC Workflow Monitoring Script

Usage: npm run workflows:monitor [options]

Options:
  --help, -h            Show this help message
  --interval N          Monitoring interval in seconds (default: 30, 0 for single run)
  --max-runs N          Maximum number of monitoring cycles (default: 0 = unlimited)
  --error-threshold N   Error rate threshold for alerts (default: 10%)
  --response-threshold N Response time threshold in ms (default: 300000 = 5 minutes)
  --failure-threshold N Daily failure count threshold (default: 5)
  --no-alerts          Disable alert generation
  --format FORMAT      Output format: console, json, dashboard (default: console)
  --dashboard          Use dashboard view (same as --format dashboard)

Examples:
  npm run workflows:monitor                          # Continuous monitoring
  npm run workflows:monitor --interval 60           # Check every minute
  npm run workflows:monitor --max-runs 1            # Single check
  npm run workflows:monitor --dashboard              # Dashboard view
  npm run workflows:monitor --format json           # JSON output
  npm run workflows:monitor --interval 0            # Single run

This script monitors:
1. Workflow execution status and performance
2. Enrollment metrics and trends
3. Error rates and failure patterns
4. System health and availability
5. Performance bottlenecks

Required environment variables:
- HUBSPOT_API_KEY: Your HubSpot private app access token
    `)
    process.exit(0)
  }

  // Parse options
  const options: MonitoringOptions = {
    interval: parseInt(args.find(arg => arg.startsWith('--interval'))?.split('=')[1] || '30'),
    maxRuns: parseInt(args.find(arg => arg.startsWith('--max-runs'))?.split('=')[1] || '0'),
    alertThresholds: {
      errorRate: parseFloat(args.find(arg => arg.startsWith('--error-threshold'))?.split('=')[1] || '10'),
      responseTime: parseInt(args.find(arg => arg.startsWith('--response-threshold'))?.split('=')[1] || '300000'),
      failureCount: parseInt(args.find(arg => arg.startsWith('--failure-threshold'))?.split('=')[1] || '5')
    },
    enableAlerts: !args.includes('--no-alerts'),
    outputFormat: args.includes('--dashboard') ? 'dashboard' : 
                  (args.find(arg => arg.startsWith('--format'))?.split('=')[1] as 'console' | 'json' | 'dashboard') || 'console'
  }

  // Validate environment variables
  if (!process.env.HUBSPOT_API_KEY) {
    console.error('❌ Error: HUBSPOT_API_KEY environment variable is required')
    process.exit(1)
  }

  // Handle graceful shutdown
  const monitor = new WorkflowMonitor(options)
  
  process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down monitoring...')
    await monitor.stopMonitoring()
    process.exit(0)
  })

  process.on('SIGTERM', async () => {
    console.log('\n🛑 Received termination signal...')
    await monitor.stopMonitoring()
    process.exit(0)
  })

  await monitor.startMonitoring()
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Monitoring failed with error:', error)
    process.exit(1)
  })
}