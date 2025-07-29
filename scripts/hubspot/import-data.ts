#!/usr/bin/env tsx

/**
 * HubSpot Data Import Script
 * 
 * This script imports data into HubSpot from various sources:
 * - Imports contacts, deals, and custom properties
 * - Supports multiple input formats (CSV, JSON, Excel)
 * - Includes data validation and transformation
 * - Provides import analytics and error reporting
 */

import { readFileSync, existsSync } from 'fs'
import { parse as parseCSV } from 'csv-parse/sync'
import { 
  hubspotContactsService,
  hubspotDealsService,
  hubspotPropertiesService
} from '@/features/hubspot/services'

interface ImportOptions {
  dataType: 'contacts' | 'deals' | 'properties'
  inputFile: string
  format: 'csv' | 'json' | 'excel'
  mappingFile?: string
  batchSize: number
  dryRun: boolean
  validateOnly: boolean
  skipErrors: boolean
  updateExisting: boolean
  createMissing: boolean
  transformationRules?: Record<string, any>
}

interface ImportMapping {
  [sourceField: string]: {
    hubspotField: string
    required?: boolean
    transform?: string
    validate?: string
    defaultValue?: any
  }
}

interface ImportStats {
  totalRecords: number
  validRecords: number
  invalidRecords: number
  createdRecords: number
  updatedRecords: number
  skippedRecords: number
  errorRecords: number
  duration: number
}

interface ValidationError {
  record: number
  field: string
  value: any
  error: string
}

interface ImportResult {
  success: boolean
  stats: ImportStats
  validationErrors: ValidationError[]
  importErrors: Array<{
    record: number
    data: any
    error: string
  }>
}

class HubSpotDataImporter {
  private options: ImportOptions
  private mapping: ImportMapping = {}

  constructor(options: ImportOptions) {
    this.options = options
  }

  async runImport(): Promise<ImportResult> {
    const startTime = Date.now()
    
    console.log('📥 Starting HubSpot Data Import...')
    console.log(`📊 Data type: ${this.options.dataType}`)
    console.log(`📁 Input file: ${this.options.inputFile}`)
    console.log(`📋 Format: ${this.options.format}`)
    console.log(`🔍 Mode: ${this.options.dryRun ? 'DRY RUN' : this.options.validateOnly ? 'VALIDATION ONLY' : 'LIVE IMPORT'}`)
    console.log('')

    const result: ImportResult = {
      success: true,
      stats: {
        totalRecords: 0,
        validRecords: 0,
        invalidRecords: 0,
        createdRecords: 0,
        updatedRecords: 0,
        skippedRecords: 0,
        errorRecords: 0,
        duration: 0
      },
      validationErrors: [],
      importErrors: []
    }

    try {
      // Load mapping if provided
      if (this.options.mappingFile) {
        await this.loadMapping()
      } else {
        this.generateDefaultMapping()
      }

      // Load and validate data
      const rawData = await this.loadData()
      result.stats.totalRecords = rawData.length

      console.log(`📊 Loaded ${rawData.length} records from input file`)

      // Transform and validate data
      const { validRecords, invalidRecords, validationErrors } = await this.validateAndTransformData(rawData)
      result.stats.validRecords = validRecords.length
      result.stats.invalidRecords = invalidRecords.length
      result.validationErrors = validationErrors

      console.log(`✅ Valid records: ${validRecords.length}`)
      console.log(`❌ Invalid records: ${invalidRecords.length}`)

      if (validationErrors.length > 0) {
        console.log(`⚠️  Validation errors: ${validationErrors.length}`)
        
        if (!this.options.skipErrors && validationErrors.length > 0) {
          console.log('\n❌ Stopping import due to validation errors. Use --skip-errors to continue.')
          result.success = false
          return result
        }
      }

      // Stop here if validation only
      if (this.options.validateOnly) {
        console.log('\n✅ Validation completed. Use --live to perform actual import.')
        result.stats.duration = Date.now() - startTime
        return result
      }

      // Import data
      if (validRecords.length > 0 && !this.options.dryRun) {
        const importStats = await this.importRecords(validRecords)
        result.stats.createdRecords = importStats.created
        result.stats.updatedRecords = importStats.updated
        result.stats.errorRecords = importStats.errors
        result.importErrors = importStats.importErrors
      } else if (this.options.dryRun) {
        console.log('\n🔍 DRY RUN: No actual changes made to HubSpot')
        result.stats.createdRecords = validRecords.length // Simulated
      }

      result.stats.duration = Date.now() - startTime
      this.displayResults(result)

    } catch (error) {
      console.error('💥 Import failed:', error)
      result.success = false
      result.stats.duration = Date.now() - startTime
      throw error
    }

    return result
  }

  private async loadMapping(): Promise<void> {
    try {
      const mappingData = readFileSync(this.options.mappingFile!, 'utf-8')
      this.mapping = JSON.parse(mappingData)
      console.log(`📋 Loaded field mapping from ${this.options.mappingFile}`)
    } catch (error) {
      throw new Error(`Failed to load mapping file: ${error}`)
    }
  }

  private generateDefaultMapping(): void {
    console.log('📋 Using default field mapping')
    
    switch (this.options.dataType) {
      case 'contacts':
        this.mapping = {
          'email': { hubspotField: 'email', required: true },
          'first_name': { hubspotField: 'firstname' },
          'last_name': { hubspotField: 'lastname' },
          'company': { hubspotField: 'company' },
          'phone': { hubspotField: 'phone' },
          'member_type': { hubspotField: 'namc_member_type' },
          'member_since': { hubspotField: 'namc_member_since', transform: 'date' },
          'engagement_score': { hubspotField: 'namc_engagement_score', transform: 'number' },
          'risk_level': { hubspotField: 'namc_risk_level' },
          'total_savings': { hubspotField: 'namc_total_savings', transform: 'number' },
          'trade_specialties': { hubspotField: 'namc_trade_specialties', transform: 'array' },
          'service_areas': { hubspotField: 'namc_service_areas', transform: 'array' }
        }
        break
      
      case 'deals':
        this.mapping = {
          'deal_name': { hubspotField: 'dealname', required: true },
          'amount': { hubspotField: 'amount', transform: 'number' },
          'stage': { hubspotField: 'dealstage' },
          'close_date': { hubspotField: 'closedate', transform: 'date' },
          'project_type': { hubspotField: 'namc_project_type' },
          'location': { hubspotField: 'namc_project_location' },
          'bid_deadline': { hubspotField: 'namc_bid_deadline', transform: 'date' },
          'bonding_required': { hubspotField: 'namc_bonding_required', transform: 'boolean' },
          'client_name': { hubspotField: 'namc_client_name' },
          'specialties_required': { hubspotField: 'namc_specialties_required', transform: 'array' }
        }
        break
      
      case 'properties':
        this.mapping = {
          'name': { hubspotField: 'name', required: true },
          'label': { hubspotField: 'label', required: true },
          'type': { hubspotField: 'type', required: true },
          'field_type': { hubspotField: 'fieldType' },
          'description': { hubspotField: 'description' },
          'group_name': { hubspotField: 'groupName' }
        }
        break
    }
  }

  private async loadData(): Promise<any[]> {
    if (!existsSync(this.options.inputFile)) {
      throw new Error(`Input file not found: ${this.options.inputFile}`)
    }

    const fileContent = readFileSync(this.options.inputFile, 'utf-8')

    switch (this.options.format) {
      case 'json':
        return JSON.parse(fileContent)
      
      case 'csv':
        return parseCSV(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        })
      
      case 'excel':
        // For Excel, we'll assume it's been saved as CSV
        // In a real implementation, you'd use a library like 'xlsx'
        return parseCSV(fileContent, {
          columns: true,
          skip_empty_lines: true,
          trim: true
        })
      
      default:
        throw new Error(`Unsupported format: ${this.options.format}`)
    }
  }

  private async validateAndTransformData(rawData: any[]): Promise<{
    validRecords: any[]
    invalidRecords: any[]
    validationErrors: ValidationError[]
  }> {
    console.log('🔍 Validating and transforming data...')

    const validRecords: any[] = []
    const invalidRecords: any[] = []
    const validationErrors: ValidationError[] = []

    for (let i = 0; i < rawData.length; i++) {
      const record = rawData[i]
      let isValid = true
      const transformedRecord: any = {}

      // Transform fields according to mapping
      for (const [sourceField, config] of Object.entries(this.mapping)) {
        const sourceValue = record[sourceField]
        
        // Check required fields
        if (config.required && (sourceValue === null || sourceValue === undefined || sourceValue === '')) {
          validationErrors.push({
            record: i + 1,
            field: sourceField,
            value: sourceValue,
            error: 'Required field is missing or empty'
          })
          isValid = false
          continue
        }

        // Apply transformations
        let transformedValue = sourceValue
        if (sourceValue !== null && sourceValue !== undefined && sourceValue !== '') {
          try {
            transformedValue = this.transformValue(sourceValue, config.transform)
          } catch (error) {
            validationErrors.push({
              record: i + 1,
              field: sourceField,
              value: sourceValue,
              error: `Transformation failed: ${error}`
            })
            isValid = false
            continue
          }
        }

        // Apply validation
        if (config.validate && transformedValue !== null && transformedValue !== undefined) {
          const validationResult = this.validateValue(transformedValue, config.validate)
          if (!validationResult.valid) {
            validationErrors.push({
              record: i + 1,
              field: sourceField,
              value: transformedValue,
              error: validationResult.error
            })
            isValid = false
            continue
          }
        }

        // Use default value if provided and source value is empty
        if ((transformedValue === null || transformedValue === undefined || transformedValue === '') && config.defaultValue !== undefined) {
          transformedValue = config.defaultValue
        }

        transformedRecord[config.hubspotField] = transformedValue
      }

      if (isValid) {
        validRecords.push(transformedRecord)
      } else {
        invalidRecords.push(record)
      }
    }

    return { validRecords, invalidRecords, validationErrors }
  }

  private transformValue(value: any, transform?: string): any {
    if (!transform) return value

    switch (transform) {
      case 'date':
        if (typeof value === 'string') {
          const date = new Date(value)
          if (isNaN(date.getTime())) {
            throw new Error('Invalid date format')
          }
          return date.toISOString()
        }
        return value

      case 'number':
        const num = Number(value)
        if (isNaN(num)) {
          throw new Error('Invalid number format')
        }
        return num

      case 'boolean':
        if (typeof value === 'string') {
          const lowercaseValue = value.toLowerCase()
          if (['true', '1', 'yes', 'on'].includes(lowercaseValue)) return true
          if (['false', '0', 'no', 'off'].includes(lowercaseValue)) return false
          throw new Error('Invalid boolean format')
        }
        return Boolean(value)

      case 'array':
        if (typeof value === 'string') {
          // Split by comma, semicolon, or pipe
          return value.split(/[,;|]/).map(item => item.trim()).filter(item => item.length > 0)
        }
        if (Array.isArray(value)) return value
        return [value]

      case 'uppercase':
        return String(value).toUpperCase()

      case 'lowercase':
        return String(value).toLowerCase()

      case 'trim':
        return String(value).trim()

      default:
        return value
    }
  }

  private validateValue(value: any, validation: string): { valid: boolean; error?: string } {
    switch (validation) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(String(value))) {
          return { valid: false, error: 'Invalid email format' }
        }
        break

      case 'phone':
        const phoneRegex = /^[\+]?[\d\s\-\(\)]+$/
        if (!phoneRegex.test(String(value))) {
          return { valid: false, error: 'Invalid phone format' }
        }
        break

      case 'url':
        try {
          new URL(String(value))
        } catch {
          return { valid: false, error: 'Invalid URL format' }
        }
        break

      case 'positive_number':
        if (typeof value !== 'number' || value <= 0) {
          return { valid: false, error: 'Must be a positive number' }
        }
        break

      case 'not_empty':
        if (!value || String(value).trim().length === 0) {
          return { valid: false, error: 'Cannot be empty' }
        }
        break
    }

    return { valid: true }
  }

  private async importRecords(records: any[]): Promise<{
    created: number
    updated: number
    errors: number
    importErrors: Array<{ record: number; data: any; error: string }>
  }> {
    console.log(`📥 Importing ${records.length} records to HubSpot...`)

    let created = 0
    let updated = 0
    let errors = 0
    const importErrors: Array<{ record: number; data: any; error: string }> = []

    // Process in batches
    for (let i = 0; i < records.length; i += this.options.batchSize) {
      const batch = records.slice(i, i + this.options.batchSize)
      const batchNumber = Math.floor(i / this.options.batchSize) + 1
      
      console.log(`  📦 Processing batch ${batchNumber}/${Math.ceil(records.length / this.options.batchSize)}...`)

      for (let j = 0; j < batch.length; j++) {
        const record = batch[j]
        const recordNumber = i + j + 1

        try {
          const result = await this.importSingleRecord(record)
          
          if (result.created) {
            created++
          } else if (result.updated) {
            updated++
          }

        } catch (error) {
          errors++
          importErrors.push({
            record: recordNumber,
            data: record,
            error: String(error)
          })

          if (!this.options.skipErrors) {
            console.log(`    ❌ Record ${recordNumber} failed: ${error}`)
          }
        }
      }

      // Rate limiting - small delay between batches
      if (i + this.options.batchSize < records.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    console.log(`  ✅ Import completed: ${created} created, ${updated} updated, ${errors} errors`)

    return { created, updated, errors, importErrors }
  }

  private async importSingleRecord(record: any): Promise<{ created: boolean; updated: boolean }> {
    switch (this.options.dataType) {
      case 'contacts':
        return await this.importContact(record)
      
      case 'deals':
        return await this.importDeal(record)
      
      case 'properties':
        return await this.importProperty(record)
      
      default:
        throw new Error(`Unsupported data type: ${this.options.dataType}`)
    }
  }

  private async importContact(contactData: any): Promise<{ created: boolean; updated: boolean }> {
    // Check if contact exists (by email)
    if (this.options.updateExisting && contactData.email) {
      const searchResponse = await hubspotContactsService.searchContacts(
        [{ propertyName: 'email', operator: 'EQ', value: contactData.email }],
        ['email'],
        1
      )

      if (searchResponse.success && searchResponse.data?.results?.length > 0) {
        // Update existing contact
        const contactId = searchResponse.data.results[0].id
        const updateResponse = await hubspotContactsService.updateContact(contactId, contactData)
        
        if (!updateResponse.success) {
          throw new Error(updateResponse.message || 'Failed to update contact')
        }
        
        return { created: false, updated: true }
      }
    }

    // Create new contact
    const createResponse = await hubspotContactsService.createContact(contactData)
    
    if (!createResponse.success) {
      throw new Error(createResponse.message || 'Failed to create contact')
    }
    
    return { created: true, updated: false }
  }

  private async importDeal(dealData: any): Promise<{ created: boolean; updated: boolean }> {
    // For deals, we'll always create new unless we have a specific identifier
    const createResponse = await hubspotDealsService.createDeal(dealData)
    
    if (!createResponse.success) {
      throw new Error(createResponse.message || 'Failed to create deal')
    }
    
    return { created: true, updated: false }
  }

  private async importProperty(propertyData: any): Promise<{ created: boolean; updated: boolean }> {
    // Check if property exists
    const objectType = propertyData.objectType || 'contacts'
    const existingResponse = await hubspotPropertiesService.getProperty(objectType, propertyData.name)

    if (existingResponse.success) {
      if (this.options.updateExisting) {
        // Update existing property
        const updateResponse = await hubspotPropertiesService.updateProperty(objectType, propertyData.name, propertyData)
        
        if (!updateResponse.success) {
          throw new Error(updateResponse.message || 'Failed to update property')
        }
        
        return { created: false, updated: true }
      } else {
        throw new Error(`Property ${propertyData.name} already exists`)
      }
    }

    // Create new property
    const createResponse = await hubspotPropertiesService.createProperty(objectType, propertyData)
    
    if (!createResponse.success) {
      throw new Error(createResponse.message || 'Failed to create property')
    }
    
    return { created: true, updated: false }
  }

  private displayResults(result: ImportResult): void {
    console.log('\n📊 Import Results Summary:')
    console.log('='.repeat(50))

    console.log(`✅ Overall Status: ${result.success ? 'SUCCESS' : 'COMPLETED WITH ERRORS'}`)
    console.log(`📊 Total Records: ${result.stats.totalRecords}`)
    console.log(`✅ Valid Records: ${result.stats.validRecords}`)
    console.log(`❌ Invalid Records: ${result.stats.invalidRecords}`)
    
    if (!this.options.validateOnly && !this.options.dryRun) {
      console.log(`➕ Created: ${result.stats.createdRecords}`)
      console.log(`🔄 Updated: ${result.stats.updatedRecords}`)
      console.log(`❌ Errors: ${result.stats.errorRecords}`)
    }
    
    console.log(`⏱️  Duration: ${(result.stats.duration / 1000).toFixed(1)}s`)

    if (result.validationErrors.length > 0) {
      console.log(`\n⚠️  Validation Errors (first 10):`)
      result.validationErrors.slice(0, 10).forEach(error => {
        console.log(`  Record ${error.record}, Field ${error.field}: ${error.error}`)
      })
      
      if (result.validationErrors.length > 10) {
        console.log(`  ... and ${result.validationErrors.length - 10} more validation errors`)
      }
    }

    if (result.importErrors.length > 0) {
      console.log(`\n❌ Import Errors (first 10):`)
      result.importErrors.slice(0, 10).forEach(error => {
        console.log(`  Record ${error.record}: ${error.error}`)
      })
      
      if (result.importErrors.length > 10) {
        console.log(`  ... and ${result.importErrors.length - 10} more import errors`)
      }
    }

    console.log('\n🔧 Next Steps:')
    if (this.options.validateOnly) {
      console.log('  • Fix validation errors in your source data')
      console.log('  • Run import with --live flag to perform actual import')
    } else if (this.options.dryRun) {
      console.log('  • Review the validation results')
      console.log('  • Run import without --dry-run to perform actual import')
    } else {
      console.log('  • Verify imported data in HubSpot portal')
      console.log('  • Check workflow automations are triggered correctly')
      if (result.stats.errorRecords > 0) {
        console.log('  • Review and fix import errors for failed records')
      }
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
HubSpot Data Import Script

Usage: npm run hubspot:import [options]

Options:
  --help, -h              Show this help message
  --type TYPE             Data type: contacts, deals, properties (required)
  --file PATH             Input file path (required)
  --format FORMAT         Input format: csv, json, excel (default: csv)
  --mapping PATH          Field mapping file (JSON format)
  --batch-size N          Batch size for API requests (default: 20)
  --dry-run               Show what would be imported without making changes
  --validate-only         Only validate data, don't import
  --skip-errors           Continue import even if some records fail
  --update-existing       Update existing records instead of skipping
  --create-missing        Create missing properties automatically

Examples:
  npm run hubspot:import --type contacts --file members.csv
  npm run hubspot:import --type deals --file projects.json --format json
  npm run hubspot:import --type contacts --file data.csv --dry-run
  npm run hubspot:import --type contacts --file data.csv --validate-only
  npm run hubspot:import --type contacts --file data.csv --mapping fields.json

Field Mapping File (JSON):
{
  "source_field": {
    "hubspotField": "target_field",
    "required": true,
    "transform": "date|number|boolean|array|uppercase|lowercase",
    "validate": "email|phone|url|positive_number|not_empty",
    "defaultValue": "default_if_empty"
  }
}

This script can import:
1. Contacts with NAMC member data and engagement metrics
2. Deals representing project opportunities and service requests
3. Custom properties and their configurations

Required environment variables:
- HUBSPOT_API_KEY: Your HubSpot private app access token
    `)
    process.exit(0)
  }

  // Parse required options
  const dataType = args.find(arg => arg.startsWith('--type'))?.split('=')[1]
  const inputFile = args.find(arg => arg.startsWith('--file'))?.split('=')[1]

  if (!dataType || !inputFile) {
    console.error('❌ Error: --type and --file are required')
    console.error('Use --help for usage information')
    process.exit(1)
  }

  if (!['contacts', 'deals', 'properties'].includes(dataType)) {
    console.error('❌ Error: --type must be one of: contacts, deals, properties')
    process.exit(1)
  }

  // Parse other options
  const options: ImportOptions = {
    dataType: dataType as 'contacts' | 'deals' | 'properties',
    inputFile,
    format: (args.find(arg => arg.startsWith('--format'))?.split('=')[1] as 'csv' | 'json' | 'excel') || 'csv',
    mappingFile: args.find(arg => arg.startsWith('--mapping'))?.split('=')[1],
    batchSize: parseInt(args.find(arg => arg.startsWith('--batch-size'))?.split('=')[1] || '20'),
    dryRun: args.includes('--dry-run'),
    validateOnly: args.includes('--validate-only'),
    skipErrors: args.includes('--skip-errors'),
    updateExisting: args.includes('--update-existing'),
    createMissing: args.includes('--create-missing')
  }

  // Validate environment variables
  if (!process.env.HUBSPOT_API_KEY) {
    console.error('❌ Error: HUBSPOT_API_KEY environment variable is required')
    process.exit(1)
  }

  console.log('🚀 NAMC HubSpot Data Import Starting...\n')

  const importer = new HubSpotDataImporter(options)
  const result = await importer.runImport()

  process.exit(result.success ? 0 : 1)
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Import failed with error:', error)
    process.exit(1)
  })
}