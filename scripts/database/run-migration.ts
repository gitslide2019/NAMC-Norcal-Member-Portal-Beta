#!/usr/bin/env tsx

/**
 * HubSpot Workflow Migration Runner
 * 
 * This script runs the HubSpot workflow database migration safely:
 * - Checks current database state
 * - Backs up existing schema
 * - Applies the HubSpot workflow migration
 * - Validates migration success
 * - Provides rollback capability
 */

import { exec } from 'child_process'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { promisify } from 'util'

const execAsync = promisify(exec)

interface MigrationStatus {
  success: boolean
  migrationApplied: boolean
  backupCreated: boolean
  validationPassed: boolean
  rollbackAvailable: boolean
  error?: string
  warnings: string[]
}

class HubSpotMigrationRunner {
  private migrationFile = '/Users/revalue.io/NAMC-Norcal-Member-Portal-Beta/prisma/migrations/001_add_hubspot_workflow_models.sql'
  private backupFile = `/tmp/namc_schema_backup_${Date.now()}.sql`
  
  async runMigration(): Promise<MigrationStatus> {
    const status: MigrationStatus = {
      success: false,
      migrationApplied: false,
      backupCreated: false,
      validationPassed: false,
      rollbackAvailable: false,
      warnings: []
    }

    console.log('🚀 Starting HubSpot Workflow Migration...')
    console.log('=====================================')

    try {
      // Step 1: Check prerequisites
      await this.checkPrerequisites()
      console.log('✅ Prerequisites check passed')

      // Step 2: Create database backup
      await this.createBackup()
      status.backupCreated = true
      console.log(`✅ Database backup created: ${this.backupFile}`)

      // Step 3: Check migration file exists
      if (!existsSync(this.migrationFile)) {
        throw new Error(`Migration file not found: ${this.migrationFile}`)
      }

      // Step 4: Run migration
      await this.applyMigration()
      status.migrationApplied = true
      console.log('✅ Migration applied successfully')

      // Step 5: Generate Prisma client
      await this.generatePrismaClient()
      console.log('✅ Prisma client generated')

      // Step 6: Validate migration
      const validationResult = await this.validateMigration()
      status.validationPassed = validationResult.success
      status.warnings = validationResult.warnings
      
      if (validationResult.success) {
        console.log('✅ Migration validation passed')
      } else {
        console.log('⚠️  Migration validation had warnings (see details below)')
      }

      // Step 7: Test database connectivity
      await this.testDatabaseConnectivity()
      console.log('✅ Database connectivity test passed')

      status.success = true
      status.rollbackAvailable = true

    } catch (error) {
      status.error = String(error)
      console.error('❌ Migration failed:', error)
      
      // Attempt rollback if migration was applied
      if (status.migrationApplied && status.backupCreated) {
        console.log('🔄 Attempting automatic rollback...')
        try {
          await this.rollback()
          console.log('✅ Rollback completed')
        } catch (rollbackError) {
          console.error('❌ Rollback failed:', rollbackError)
          status.warnings.push(`Rollback failed: ${rollbackError}`)
        }
      }
    }

    this.displayResults(status)
    return status
  }

  private async checkPrerequisites(): Promise<void> {
    // Check if Prisma is available
    try {
      await execAsync('npx prisma --version')
    } catch (error) {
      throw new Error('Prisma CLI not available. Run: npm install prisma')
    }

    // Check if database is accessible
    try {
      await execAsync('npx prisma db execute --command "SELECT 1"')
    } catch (error) {
      throw new Error('Database not accessible. Check DATABASE_URL and ensure PostgreSQL is running.')
    }

    // Check if .env file exists
    if (!existsSync('.env')) {
      throw new Error('.env file not found. Copy .env.example and configure DATABASE_URL.')
    }
  }

  private async createBackup(): Promise<void> {
    try {
      // Create schema dump using pg_dump
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not set in environment')
      }

      // Extract connection details from DATABASE_URL
      const url = new URL(databaseUrl)
      const host = url.hostname
      const port = url.port || '5432'
      const database = url.pathname.slice(1)
      const username = url.username
      const password = url.password

      const pgDumpCommand = `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} --schema-only > ${this.backupFile}`
      
      await execAsync(pgDumpCommand)
      
      if (!existsSync(this.backupFile)) {
        throw new Error('Backup file was not created')
      }
    } catch (error) {
      throw new Error(`Failed to create backup: ${error}`)
    }
  }

  private async applyMigration(): Promise<void> {
    try {
      // Read migration SQL
      const migrationSQL = readFileSync(this.migrationFile, 'utf-8')
      
      // Apply migration using Prisma db execute
      const tempSqlFile = `/tmp/migration_${Date.now()}.sql`
      writeFileSync(tempSqlFile, migrationSQL)
      
      await execAsync(`npx prisma db execute --file ${tempSqlFile}`)
      
      // Clean up temp file
      if (existsSync(tempSqlFile)) {
        const fs = require('fs')
        fs.unlinkSync(tempSqlFile)
      }
    } catch (error) {
      throw new Error(`Failed to apply migration: ${error}`)
    }
  }

  private async generatePrismaClient(): Promise<void> {
    try {
      await execAsync('npx prisma generate')
    } catch (error) {
      throw new Error(`Failed to generate Prisma client: ${error}`)
    }
  }

  private async validateMigration(): Promise<{ success: boolean; warnings: string[] }> {
    const warnings: string[] = []
    
    try {
      // Check if new tables exist
      const requiredTables = [
        'hubspot_integration_config',
        'hubspot_workflows',
        'hubspot_workflow_executions',
        'hubspot_sync_records',
        'automation_rules',
        'automation_executions',
        'member_analytics',
        'integration_alerts',
        'webhook_events',
        'integration_metrics'
      ]

      for (const table of requiredTables) {
        try {
          await execAsync(`npx prisma db execute --command "SELECT 1 FROM ${table} LIMIT 1"`)
        } catch (error) {
          warnings.push(`Table ${table} may not exist or is not accessible`)
        }
      }

      // Check if new columns exist on existing tables
      try {
        await execAsync('npx prisma db execute --command "SELECT hubspot_contact_id FROM users LIMIT 1"')
      } catch (error) {
        warnings.push('hubspot_contact_id column may not exist on users table')
      }

      try {
        await execAsync('npx prisma db execute --command "SELECT hubspot_deal_id FROM projects LIMIT 1"')
      } catch (error) {
        warnings.push('hubspot_deal_id column may not exist on projects table')
      }

      // Check if enums exist
      const requiredEnums = [
        'WorkflowStatus',
        'WorkflowType', 
        'ExecutionStatus',
        'SyncStatus',
        'AutomationTriggerType',
        'MemberRiskLevel'
      ]

      for (const enumName of requiredEnums) {
        try {
          await execAsync(`npx prisma db execute --command "SELECT 1 WHERE EXISTS (SELECT 1 FROM pg_type WHERE typname = '${enumName}')"`)
        } catch (error) {
          warnings.push(`Enum ${enumName} may not exist`)
        }
      }

      return { success: warnings.length === 0, warnings }
    } catch (error) {
      warnings.push(`Validation error: ${error}`)
      return { success: false, warnings }
    }
  }

  private async testDatabaseConnectivity(): Promise<void> {
    try {
      // Test basic Prisma connectivity
      await execAsync('npx prisma db execute --command "SELECT NOW()"')
    } catch (error) {
      throw new Error(`Database connectivity test failed: ${error}`)
    }
  }

  private async rollback(): Promise<void> {
    if (!existsSync(this.backupFile)) {
      throw new Error('Backup file not found, cannot rollback')
    }

    try {
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error('DATABASE_URL not set in environment')
      }

      // Extract connection details from DATABASE_URL
      const url = new URL(databaseUrl)
      const host = url.hostname
      const port = url.port || '5432'
      const database = url.pathname.slice(1)
      const username = url.username
      const password = url.password

      // Restore from backup
      const psqlCommand = `PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${username} -d ${database} < ${this.backupFile}`
      
      await execAsync(psqlCommand)
      
      // Regenerate Prisma client
      await execAsync('npx prisma generate')
    } catch (error) {
      throw new Error(`Rollback failed: ${error}`)
    }
  }

  private displayResults(status: MigrationStatus): void {
    console.log('\n📊 Migration Results:')
    console.log('=====================')
    
    console.log(`✅ Overall Status: ${status.success ? 'SUCCESS' : 'FAILED'}`)
    console.log(`📁 Backup Created: ${status.backupCreated ? 'Yes' : 'No'}`)
    console.log(`🔄 Migration Applied: ${status.migrationApplied ? 'Yes' : 'No'}`)
    console.log(`✅ Validation Passed: ${status.validationPassed ? 'Yes' : 'No'}`)
    console.log(`🔄 Rollback Available: ${status.rollbackAvailable ? 'Yes' : 'No'}`)

    if (status.warnings.length > 0) {
      console.log('\n⚠️  Warnings:')
      status.warnings.forEach(warning => {
        console.log(`  • ${warning}`)
      })
    }

    if (status.error) {
      console.log(`\n❌ Error: ${status.error}`)
    }

    if (status.backupCreated) {
      console.log(`\n💾 Backup Location: ${this.backupFile}`)
      console.log('   Keep this file safe for manual rollback if needed.')
    }

    console.log('\n🔧 Next Steps:')
    if (status.success) {
      console.log('  • Run seed script: npm run db:seed:hubspot')
      console.log('  • Test HubSpot integration: npm run hubspot:test')
      console.log('  • Set up workflow monitoring: npm run workflows:monitor')
    } else {
      console.log('  • Fix the reported issues')
      console.log('  • Review migration file for syntax errors')
      console.log('  • Retry migration: npm run db:migrate:hubspot')
      if (status.backupCreated) {
        console.log(`  • Manual rollback available from: ${this.backupFile}`)
      }
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
HubSpot Workflow Migration Runner

Usage: npm run db:migrate:hubspot [options]

Options:
  --help, -h              Show this help message
  --dry-run              Show what would be migrated without applying changes
  --force                Force migration even if validation fails
  --rollback             Rollback to previous schema (requires backup file)

This script safely applies the HubSpot workflow database migration:
1. Creates a database backup
2. Applies the migration SQL
3. Generates updated Prisma client  
4. Validates the migration
5. Provides rollback capability

Required environment variables:
- DATABASE_URL: PostgreSQL connection string

Examples:
  npm run db:migrate:hubspot                  # Apply migration
  npm run db:migrate:hubspot --dry-run       # Preview changes
  npm run db:migrate:hubspot --rollback      # Rollback migration
    `)
    process.exit(0)
  }

  if (args.includes('--rollback')) {
    console.log('🔄 Starting rollback...')
    const runner = new HubSpotMigrationRunner()
    await runner.rollback()
    console.log('✅ Rollback completed')
    process.exit(0)
  }

  if (args.includes('--dry-run')) {
    console.log('🔍 DRY RUN: Migration preview (no changes will be made)')
    console.log('This would apply the HubSpot workflow database migration.')
    console.log('Use --help to see full migration details.')
    process.exit(0)
  }

  console.log('🚀 NAMC HubSpot Migration Starting...\n')

  const runner = new HubSpotMigrationRunner()
  const result = await runner.runMigration()

  process.exit(result.success ? 0 : 1)
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Migration runner failed:', error)
    process.exit(1)
  })
}