#!/usr/bin/env tsx

/**
 * HubSpot Data Export Script
 * 
 * This script exports data from HubSpot for analysis, backup, or migration:
 * - Exports contacts, deals, and workflow data
 * - Supports multiple export formats (CSV, JSON, Excel)
 * - Includes filtering and field selection
 * - Provides export analytics and statistics
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { 
  hubspotContactsService,
  hubspotDealsService,
  hubspotWorkflowsService,
  hubspotPropertiesService
} from '@/features/hubspot/services'

interface ExportOptions {
  dataTypes: ('contacts' | 'deals' | 'workflows' | 'properties')[]
  format: 'csv' | 'json' | 'excel'
  outputDir: string
  includeAll: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  filters?: Record<string, any>
  fields?: string[]
  batchSize: number
  includeAnalytics: boolean
}

interface ExportStats {
  dataType: string
  totalRecords: number
  exportedRecords: number
  skippedRecords: number
  errors: number
  filePath: string
  fileSize: number
  duration: number
}

interface ExportSummary {
  timestamp: Date
  options: ExportOptions
  stats: ExportStats[]
  totalDuration: number
  overallSuccess: boolean
}

class HubSpotDataExporter {
  private options: ExportOptions
  private summary: ExportSummary

  constructor(options: ExportOptions) {
    this.options = options
    this.summary = {
      timestamp: new Date(),
      options,
      stats: [],
      totalDuration: 0,
      overallSuccess: true
    }
  }

  async runExport(): Promise<void> {
    const startTime = Date.now()
    
    console.log('📤 Starting HubSpot Data Export...')
    console.log(`📊 Data types: ${this.options.dataTypes.join(', ')}`)
    console.log(`📁 Format: ${this.options.format}`)
    console.log(`📂 Output directory: ${this.options.outputDir}`)
    console.log('')

    try {
      // Ensure output directory exists
      this.ensureOutputDirectory()

      // Export each data type
      for (const dataType of this.options.dataTypes) {
        await this.exportDataType(dataType)
      }

      this.summary.totalDuration = Date.now() - startTime
      this.displaySummary()

    } catch (error) {
      console.error('💥 Export failed:', error)
      this.summary.overallSuccess = false
      throw error
    }
  }

  private ensureOutputDirectory(): void {
    if (!existsSync(this.options.outputDir)) {
      mkdirSync(this.options.outputDir, { recursive: true })
      console.log(`📁 Created output directory: ${this.options.outputDir}`)
    }
  }

  private async exportDataType(dataType: string): Promise<void> {
    const startTime = Date.now()
    console.log(`\n📤 Exporting ${dataType}...`)

    const stats: ExportStats = {
      dataType,
      totalRecords: 0,
      exportedRecords: 0,
      skippedRecords: 0,
      errors: 0,
      filePath: '',
      fileSize: 0,
      duration: 0
    }

    try {
      let data: any[] = []
      let filename = ''

      switch (dataType) {
        case 'contacts':
          const contactsResult = await this.exportContacts()
          data = contactsResult.data
          filename = contactsResult.filename
          break
        
        case 'deals':
          const dealsResult = await this.exportDeals()
          data = dealsResult.data
          filename = dealsResult.filename
          break
        
        case 'workflows':
          const workflowsResult = await this.exportWorkflows()
          data = workflowsResult.data
          filename = workflowsResult.filename
          break
        
        case 'properties':
          const propertiesResult = await this.exportProperties()
          data = propertiesResult.data
          filename = propertiesResult.filename
          break
        
        default:
          throw new Error(`Unknown data type: ${dataType}`)
      }

      stats.totalRecords = data.length
      stats.exportedRecords = data.length

      // Save data to file
      const filePath = await this.saveDataToFile(data, filename)
      stats.filePath = filePath
      stats.fileSize = this.getFileSize(filePath)
      stats.duration = Date.now() - startTime

      console.log(`  ✅ Exported ${stats.exportedRecords} ${dataType} records`)
      console.log(`  📁 File: ${filePath}`)
      console.log(`  📊 Size: ${this.formatFileSize(stats.fileSize)}`)
      console.log(`  ⏱️  Duration: ${(stats.duration / 1000).toFixed(1)}s`)

    } catch (error) {
      stats.errors++
      stats.duration = Date.now() - startTime
      this.summary.overallSuccess = false
      
      console.log(`  ❌ Failed to export ${dataType}: ${error}`)
    }

    this.summary.stats.push(stats)
  }

  private async exportContacts(): Promise<{ data: any[], filename: string }> {
    console.log('  🔍 Fetching contacts from HubSpot...')
    
    const allContacts: any[] = []
    let after: string | undefined
    let hasMore = true
    let batchCount = 0

    // Get available properties first
    const propertiesResponse = await hubspotPropertiesService.getProperties('contacts')
    const availableProperties = propertiesResponse.success ? 
      propertiesResponse.data?.results?.map(p => p.name) || [] : []

    // Use specified fields or default NAMC-relevant fields
    const fieldsToExport = this.options.fields || [
      'email', 'firstname', 'lastname', 'company', 'phone',
      'hs_createdate', 'hs_lastmodifieddate', 'lastdate',
      // NAMC custom fields
      'namc_member_type', 'namc_member_since', 'namc_engagement_score',
      'namc_risk_level', 'namc_total_savings', 'namc_trade_specialties',
      'namc_service_areas', 'namc_years_in_business', 'namc_employee_count'
    ].filter(field => availableProperties.includes(field))

    while (hasMore) {
      try {
        batchCount++
        console.log(`    📦 Fetching batch ${batchCount}...`)

        const response = await hubspotContactsService.listContacts(
          fieldsToExport,
          this.options.batchSize,
          after
        )

        if (response.success && response.data?.results) {
          const batch = response.data.results
          
          // Apply date range filter if specified
          const filteredBatch = this.applyDateRangeFilter(batch, 'hs_createdate')
          allContacts.push(...filteredBatch)

          after = response.data.paging?.next?.after
          hasMore = !!after

          console.log(`    ✅ Retrieved ${batch.length} contacts (${filteredBatch.length} after filtering)`)
        } else {
          console.log(`    ⚠️  Batch ${batchCount} failed: ${response.message}`)
          hasMore = false
        }
      } catch (error) {
        console.log(`    ❌ Batch ${batchCount} error: ${error}`)
        hasMore = false
      }
    }

    // Transform data for export
    const transformedContacts = allContacts.map(contact => {
      const transformed: any = {
        id: contact.id,
        ...contact.properties
      }

      // Add analytics if requested
      if (this.options.includeAnalytics) {
        transformed._export_timestamp = new Date().toISOString()
        transformed._record_age_days = contact.properties.hs_createdate ? 
          Math.floor((Date.now() - new Date(contact.properties.hs_createdate).getTime()) / (1000 * 60 * 60 * 24)) : null
      }

      return transformed
    })

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `namc_contacts_${timestamp}`

    return { data: transformedContacts, filename }
  }

  private async exportDeals(): Promise<{ data: any[], filename: string }> {
    console.log('  🔍 Fetching deals from HubSpot...')
    
    const allDeals: any[] = []
    let after: string | undefined
    let hasMore = true
    let batchCount = 0

    // Get available properties first
    const propertiesResponse = await hubspotPropertiesService.getProperties('deals')
    const availableProperties = propertiesResponse.success ? 
      propertiesResponse.data?.results?.map(p => p.name) || [] : []

    // Use specified fields or default NAMC-relevant fields
    const fieldsToExport = this.options.fields || [
      'dealname', 'amount', 'dealstage', 'pipeline', 'closedate',
      'hs_createdate', 'hs_lastmodifieddate', 'dealtype',
      // NAMC custom fields
      'namc_project_type', 'namc_project_location', 'namc_bid_deadline',
      'namc_bonding_required', 'namc_client_name', 'namc_specialties_required',
      'namc_service_type', 'namc_urgency', 'namc_estimated_savings'
    ].filter(field => availableProperties.includes(field))

    while (hasMore) {
      try {
        batchCount++
        console.log(`    📦 Fetching batch ${batchCount}...`)

        const response = await hubspotDealsService.listDeals(
          fieldsToExport,
          this.options.batchSize,
          after
        )

        if (response.success && response.data?.results) {
          const batch = response.data.results
          
          // Apply date range filter if specified
          const filteredBatch = this.applyDateRangeFilter(batch, 'hs_createdate')
          allDeals.push(...filteredBatch)

          after = response.data.paging?.next?.after
          hasMore = !!after

          console.log(`    ✅ Retrieved ${batch.length} deals (${filteredBatch.length} after filtering)`)
        } else {
          console.log(`    ⚠️  Batch ${batchCount} failed: ${response.message}`)
          hasMore = false
        }
      } catch (error) {
        console.log(`    ❌ Batch ${batchCount} error: ${error}`)
        hasMore = false
      }
    }

    // Transform data for export
    const transformedDeals = allDeals.map(deal => {
      const transformed: any = {
        id: deal.id,
        ...deal.properties
      }

      // Add analytics if requested
      if (this.options.includeAnalytics) {
        transformed._export_timestamp = new Date().toISOString()
        transformed._deal_age_days = deal.properties.hs_createdate ? 
          Math.floor((Date.now() - new Date(deal.properties.hs_createdate).getTime()) / (1000 * 60 * 60 * 24)) : null
        transformed._time_to_close_days = deal.properties.closedate && deal.properties.hs_createdate ?
          Math.floor((new Date(deal.properties.closedate).getTime() - new Date(deal.properties.hs_createdate).getTime()) / (1000 * 60 * 60 * 24)) : null
      }

      return transformed
    })

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `namc_deals_${timestamp}`

    return { data: transformedDeals, filename }
  }

  private async exportWorkflows(): Promise<{ data: any[], filename: string }> {
    console.log('  🔍 Fetching workflows from HubSpot...')
    
    const response = await hubspotWorkflowsService.listWorkflows(500)
    
    if (!response.success) {
      throw new Error(`Failed to fetch workflows: ${response.message}`)
    }

    const allWorkflows = response.data?.results || []
    
    // Filter to NAMC workflows or all workflows based on options
    const filteredWorkflows = this.options.includeAll ? allWorkflows : 
      allWorkflows.filter(w => 
        w.name.toLowerCase().includes('namc') || 
        w.name.toLowerCase().includes('member') ||
        w.name.toLowerCase().includes('project') ||
        w.name.toLowerCase().includes('service')
      )

    console.log(`    ✅ Retrieved ${allWorkflows.length} total workflows (${filteredWorkflows.length} after filtering)`)

    // Get detailed workflow information
    const detailedWorkflows = []
    for (const workflow of filteredWorkflows) {
      try {
        const detailResponse = await hubspotWorkflowsService.getWorkflow(workflow.id)
        if (detailResponse.success) {
          const workflowData = {
            id: workflow.id,
            name: workflow.name,
            type: workflow.type,
            enabled: workflow.enabled,
            ...detailResponse.data
          }

          // Add analytics if requested
          if (this.options.includeAnalytics) {
            workflowData._export_timestamp = new Date().toISOString()
            workflowData._steps_count = detailResponse.data?.actions?.length || 0
            workflowData._enrollment_count = detailResponse.data?.enrollmentSummary?.enrolled || 0
          }

          detailedWorkflows.push(workflowData)
        }
      } catch (error) {
        console.log(`    ⚠️  Failed to get details for workflow ${workflow.name}: ${error}`)
        detailedWorkflows.push(workflow) // Add basic info if details fail
      }
    }

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `namc_workflows_${timestamp}`

    return { data: detailedWorkflows, filename }
  }

  private async exportProperties(): Promise<{ data: any[], filename: string }> {
    console.log('  🔍 Fetching properties from HubSpot...')
    
    const allProperties: any[] = []
    
    // Get properties for contacts and deals
    const objectTypes = ['contacts', 'deals', 'companies']
    
    for (const objectType of objectTypes) {
      try {
        const response = await hubspotPropertiesService.getProperties(objectType)
        
        if (response.success && response.data?.results) {
          const properties = response.data.results.map(prop => ({
            objectType,
            name: prop.name,
            label: prop.label,
            type: prop.type,
            fieldType: prop.fieldType,
            description: prop.description,
            groupName: prop.groupName,
            options: prop.options,
            calculated: prop.calculated,
            externalOptions: prop.externalOptions,
            hasUniqueValue: prop.hasUniqueValue,
            hidden: prop.hidden,
            displayOrder: prop.displayOrder,
            createdAt: prop.createdAt,
            updatedAt: prop.updatedAt,
            // Mark NAMC custom properties
            isNamcCustom: prop.name.startsWith('namc_') || prop.groupName?.toLowerCase().includes('namc')
          }))
          
          allProperties.push(...properties)
          console.log(`    ✅ Retrieved ${properties.length} ${objectType} properties`)
        }
      } catch (error) {
        console.log(`    ❌ Failed to fetch ${objectType} properties: ${error}`)
      }
    }

    // Filter to NAMC properties if not including all
    const filteredProperties = this.options.includeAll ? allProperties :
      allProperties.filter(prop => prop.isNamcCustom)

    console.log(`    📊 Total: ${allProperties.length} properties (${filteredProperties.length} after filtering)`)

    const timestamp = new Date().toISOString().split('T')[0]
    const filename = `namc_properties_${timestamp}`

    return { data: filteredProperties, filename }
  }

  private applyDateRangeFilter(records: any[], dateField: string): any[] {
    if (!this.options.dateRange) {
      return records
    }

    return records.filter(record => {
      const recordDate = record.properties?.[dateField]
      if (!recordDate) return true // Include records without date

      const date = new Date(recordDate)
      return date >= this.options.dateRange!.start && date <= this.options.dateRange!.end
    })
  }

  private async saveDataToFile(data: any[], filename: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const fullFilename = `${filename}_${timestamp}`
    let filePath = ''

    switch (this.options.format) {
      case 'json':
        filePath = `${this.options.outputDir}/${fullFilename}.json`
        writeFileSync(filePath, JSON.stringify(data, null, 2))
        break
      
      case 'csv':
        filePath = `${this.options.outputDir}/${fullFilename}.csv`
        const csv = this.convertToCSV(data)
        writeFileSync(filePath, csv)
        break
      
      case 'excel':
        // For Excel export, we'll save as CSV with .xlsx extension
        // In a real implementation, you'd use a library like 'xlsx'
        filePath = `${this.options.outputDir}/${fullFilename}.xlsx`
        const csvForExcel = this.convertToCSV(data)
        writeFileSync(filePath, csvForExcel)
        console.log('    ℹ️  Excel format saved as CSV (install xlsx library for true Excel format)')
        break
    }

    return filePath
  }

  private convertToCSV(data: any[]): string {
    if (data.length === 0) return ''

    // Get all unique keys from all objects
    const allKeys = new Set<string>()
    data.forEach(item => {
      Object.keys(item).forEach(key => allKeys.add(key))
    })

    const headers = Array.from(allKeys)
    const csvRows = [headers.join(',')]

    data.forEach(item => {
      const row = headers.map(header => {
        const value = item[header]
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) return ''
        if (typeof value === 'object') return JSON.stringify(value)
        const stringValue = String(value)
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      csvRows.push(row.join(','))
    })

    return csvRows.join('\n')
  }

  private getFileSize(filePath: string): number {
    try {
      const fs = require('fs')
      const stats = fs.statSync(filePath)
      return stats.size
    } catch {
      return 0
    }
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  private displaySummary(): void {
    console.log('\n📊 Export Summary:')
    console.log('='.repeat(50))

    const totalRecords = this.summary.stats.reduce((sum, stat) => sum + stat.exportedRecords, 0)
    const totalErrors = this.summary.stats.reduce((sum, stat) => sum + stat.errors, 0)
    const totalSize = this.summary.stats.reduce((sum, stat) => sum + stat.fileSize, 0)

    console.log(`✅ Overall Status: ${this.summary.overallSuccess ? 'SUCCESS' : 'COMPLETED WITH ERRORS'}`)
    console.log(`📊 Total Records: ${totalRecords}`)
    console.log(`❌ Total Errors: ${totalErrors}`)
    console.log(`📁 Total Size: ${this.formatFileSize(totalSize)}`)
    console.log(`⏱️  Total Duration: ${(this.summary.totalDuration / 1000).toFixed(1)}s`)

    console.log('\n📋 Detailed Results:')
    this.summary.stats.forEach(stat => {
      const status = stat.errors > 0 ? '❌' : '✅'
      console.log(`  ${status} ${stat.dataType}: ${stat.exportedRecords} records, ${this.formatFileSize(stat.fileSize)}`)
      if (stat.filePath) {
        console.log(`      📁 ${stat.filePath}`)
      }
    })

    console.log('\n🔧 Next Steps:')
    console.log('  • Review exported files for data accuracy')
    console.log('  • Import data into your analytics or backup system')
    console.log('  • Schedule regular exports for ongoing data management')

    if (totalErrors > 0) {
      console.log('  ⚠️  Review error logs and retry failed exports if needed')
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
HubSpot Data Export Script

Usage: npm run hubspot:export [options]

Options:
  --help, -h              Show this help message
  --types TYPE1,TYPE2     Data types to export: contacts, deals, workflows, properties
  --format FORMAT         Export format: csv, json, excel (default: csv)
  --output DIR            Output directory (default: ./exports)
  --all                   Include all data (not just NAMC-specific)
  --fields FIELD1,FIELD2  Specific fields to export (optional)
  --start DATE            Start date for date range filter (YYYY-MM-DD)
  --end DATE              End date for date range filter (YYYY-MM-DD)
  --batch-size N          Batch size for API requests (default: 100)
  --no-analytics          Exclude analytics fields
  --verbose               Show detailed progress

Examples:
  npm run hubspot:export                              # Export all data types as CSV
  npm run hubspot:export --types contacts,deals      # Export only contacts and deals
  npm run hubspot:export --format json               # Export as JSON
  npm run hubspot:export --all                       # Include all HubSpot data
  npm run hubspot:export --start 2024-01-01          # Export data from 2024 onwards
  npm run hubspot:export --fields email,firstname    # Export specific fields only

This script exports:
1. Contacts with NAMC member data and engagement metrics
2. Deals representing project opportunities and service requests
3. Workflows with configuration and performance data
4. Custom properties and their definitions

Required environment variables:
- HUBSPOT_API_KEY: Your HubSpot private app access token
    `)
    process.exit(0)
  }

  // Parse options
  const dataTypesArg = args.find(arg => arg.startsWith('--types'))?.split('=')[1]
  const defaultTypes = ['contacts', 'deals', 'workflows', 'properties']
  
  const options: ExportOptions = {
    dataTypes: dataTypesArg ? 
      dataTypesArg.split(',').map(t => t.trim()) as ('contacts' | 'deals' | 'workflows' | 'properties')[] :
      defaultTypes,
    format: (args.find(arg => arg.startsWith('--format'))?.split('=')[1] as 'csv' | 'json' | 'excel') || 'csv',
    outputDir: args.find(arg => arg.startsWith('--output'))?.split('=')[1] || './exports',
    includeAll: args.includes('--all'),
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size'))?.split('=')[1] || '100'),
    includeAnalytics: !args.includes('--no-analytics')
  }

  // Parse date range
  const startDate = args.find(arg => arg.startsWith('--start'))?.split('=')[1]
  const endDate = args.find(arg => arg.startsWith('--end'))?.split('=')[1]
  
  if (startDate || endDate) {
    options.dateRange = {
      start: startDate ? new Date(startDate) : new Date('1900-01-01'),
      end: endDate ? new Date(endDate) : new Date()
    }
  }

  // Parse fields
  const fieldsArg = args.find(arg => arg.startsWith('--fields'))?.split('=')[1]
  if (fieldsArg) {
    options.fields = fieldsArg.split(',').map(f => f.trim())
  }

  // Validate environment variables
  if (!process.env.HUBSPOT_API_KEY) {
    console.error('❌ Error: HUBSPOT_API_KEY environment variable is required')
    process.exit(1)
  }

  console.log('🚀 NAMC HubSpot Data Export Starting...\n')

  const exporter = new HubSpotDataExporter(options)
  await exporter.runExport()
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Export failed with error:', error)
    process.exit(1)
  })
}