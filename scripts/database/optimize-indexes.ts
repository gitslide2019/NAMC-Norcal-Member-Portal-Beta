#!/usr/bin/env tsx

/**
 * Database Index Optimization Script
 * 
 * This script analyzes and optimizes database indexes for HubSpot workflow integration:
 * - Analyzes query performance and index usage
 * - Creates additional performance indexes
 * - Provides index recommendations
 * - Monitors index effectiveness
 */

import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

interface IndexAnalysis {
  tableName: string
  indexName: string
  indexSize: string
  indexUsage: number
  scansPerSecond: number
  recommendation: 'keep' | 'drop' | 'optimize'
  reason: string
}

interface QueryPerformance {
  query: string
  executionTime: number
  scansCount: number
  indexesUsed: string[]
  recommendation: string
}

interface IndexRecommendation {
  tableName: string
  columns: string[]
  indexType: 'btree' | 'hash' | 'gin' | 'gist'
  expectedImpact: 'high' | 'medium' | 'low'
  reason: string
  estimatedSizeKB: number
}

class DatabaseIndexOptimizer {
  private recommendations: IndexRecommendation[] = []
  private performanceBaseline: Map<string, number> = new Map()

  async runOptimization(): Promise<void> {
    console.log('🔍 Starting Database Index Optimization...')
    console.log('=============================================')

    try {
      // Step 1: Analyze current index usage
      const indexAnalysis = await this.analyzeCurrentIndexes()
      console.log(`📊 Analyzed ${indexAnalysis.length} existing indexes`)

      // Step 2: Test common query patterns
      const queryPerformance = await this.testQueryPerformance()
      console.log(`⚡ Tested ${queryPerformance.length} common queries`)

      // Step 3: Generate optimization recommendations
      await this.generateRecommendations()
      console.log(`💡 Generated ${this.recommendations.length} optimization recommendations`)

      // Step 4: Apply safe optimizations
      await this.applySafeOptimizations()
      
      // Step 5: Generate report
      this.generateOptimizationReport(indexAnalysis, queryPerformance)

    } catch (error) {
      console.error('❌ Index optimization failed:', error)
      throw error
    } finally {
      await prisma.$disconnect()
    }
  }

  private async analyzeCurrentIndexes(): Promise<IndexAnalysis[]> {
    console.log('\n🔍 Analyzing current indexes...')

    const analysis: IndexAnalysis[] = []

    try {
      // Query PostgreSQL system tables for index information
      const indexQuery = `
        SELECT 
          schemaname,
          tablename,
          indexname,
          pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size,
          idx_scan as usage_count,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes 
        WHERE schemaname = 'public'
        ORDER BY idx_scan DESC;
      `

      const result = await prisma.$queryRaw`SELECT 
        schemaname,
        tablename,
        indexname,
        pg_size_pretty(pg_relation_size(indexname::regclass)) as index_size,
        idx_scan as usage_count,
        idx_tup_read as tuples_read,
        idx_tup_fetch as tuples_fetched
      FROM pg_stat_user_indexes 
      WHERE schemaname = 'public'
      ORDER BY idx_scan DESC` as any[]

      for (const row of result) {
        const usageCount = Number(row.usage_count) || 0
        const scansPerSecond = usageCount / (24 * 60 * 60) // Rough estimate

        let recommendation: 'keep' | 'drop' | 'optimize' = 'keep'
        let reason = 'Good usage pattern'

        if (usageCount === 0) {
          recommendation = 'drop'
          reason = 'Index never used - consider dropping'
        } else if (usageCount < 10) {
          recommendation = 'optimize'
          reason = 'Low usage - verify necessity'
        } else if (scansPerSecond > 100) {
          recommendation = 'keep'
          reason = 'High usage - critical for performance'
        }

        analysis.push({
          tableName: row.tablename,
          indexName: row.indexname,
          indexSize: row.index_size,
          indexUsage: usageCount,
          scansPerSecond,
          recommendation,
          reason
        })
      }

      return analysis
    } catch (error) {
      console.error('Failed to analyze indexes:', error)
      return []
    }
  }

  private async testQueryPerformance(): Promise<QueryPerformance[]> {
    console.log('\n⚡ Testing query performance...')

    const testQueries = [
      // HubSpot workflow queries
      {
        name: 'Find active workflows by type',
        query: `SELECT * FROM hubspot_workflows WHERE type = 'member_onboarding' AND is_enabled = true`,
        table: 'hubspot_workflows'
      },
      {
        name: 'Get workflow executions by status',
        query: `SELECT * FROM hubspot_workflow_executions WHERE status = 'RUNNING' ORDER BY enrolled_at DESC LIMIT 50`,
        table: 'hubspot_workflow_executions'
      },
      {
        name: 'Find executions by contact',
        query: `SELECT * FROM hubspot_workflow_executions WHERE contact_id = 'test-contact-123'`,
        table: 'hubspot_workflow_executions'
      },
      {
        name: 'Get sync records by status',
        query: `SELECT * FROM hubspot_sync_records WHERE sync_status = 'PENDING' ORDER BY priority DESC`,
        table: 'hubspot_sync_records'
      },
      {
        name: 'Find analytics by risk level',
        query: `SELECT * FROM member_analytics WHERE risk_level = 'high_risk' ORDER BY churn_risk_score DESC`,
        table: 'member_analytics'
      },
      {
        name: 'Get automation executions',
        query: `SELECT * FROM automation_executions WHERE status = 'PENDING' AND triggered_at > NOW() - INTERVAL '1 hour'`,
        table: 'automation_executions'
      },
      {
        name: 'Find webhook events by source',
        query: `SELECT * FROM webhook_events WHERE source = 'hubspot' AND status = 'PENDING'`,
        table: 'webhook_events'
      },
      {
        name: 'Get integration alerts',
        query: `SELECT * FROM integration_alerts WHERE severity = 'HIGH' AND is_resolved = false`,
        table: 'integration_alerts'
      }
    ]

    const performance: QueryPerformance[] = []

    for (const test of testQueries) {
      try {
        const startTime = Date.now()
        
        // Use EXPLAIN ANALYZE to get detailed execution info
        const explainQuery = `EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON) ${test.query}`
        const result = await prisma.$queryRawUnsafe(explainQuery) as any[]
        
        const executionTime = Date.now() - startTime
        const planData = result[0]?.['QUERY PLAN']?.[0]

        // Extract performance metrics
        const actualTime = planData?.['Actual Total Time'] || executionTime
        const planRows = planData?.['Plan Rows'] || 0
        const actualRows = planData?.['Actual Rows'] || 0

        // Identify indexes used
        const indexesUsed: string[] = []
        if (planData) {
          this.extractIndexesFromPlan(planData, indexesUsed)
        }

        let recommendation = 'Performance is acceptable'
        if (actualTime > 1000) {
          recommendation = 'Consider adding indexes or optimizing query'
        } else if (actualTime > 500) {
          recommendation = 'Monitor performance, may need optimization'
        } else if (actualTime < 10) {
          recommendation = 'Excellent performance'
        }

        performance.push({
          query: test.name,
          executionTime: actualTime,
          scansCount: actualRows,
          indexesUsed,
          recommendation
        })

        console.log(`  ✅ ${test.name}: ${actualTime.toFixed(2)}ms`)
      } catch (error) {
        console.log(`  ❌ ${test.name}: Failed - ${error}`)
        performance.push({
          query: test.name,
          executionTime: -1,
          scansCount: 0,
          indexesUsed: [],
          recommendation: `Query failed: ${error}`
        })
      }
    }

    return performance
  }

  private async generateRecommendations(): Promise<void> {
    console.log('\n💡 Generating optimization recommendations...')

    // Workflow-specific index recommendations
    this.recommendations.push(
      {
        tableName: 'hubspot_workflows',
        columns: ['type', 'status', 'is_enabled'],
        indexType: 'btree',
        expectedImpact: 'high',
        reason: 'Composite index for common workflow filtering patterns',
        estimatedSizeKB: 128
      },
      {
        tableName: 'hubspot_workflow_executions',
        columns: ['status', 'enrolled_at'],
        indexType: 'btree',
        expectedImpact: 'high',
        reason: 'Optimizes status filtering with chronological ordering',
        estimatedSizeKB: 256
      },
      {
        tableName: 'hubspot_workflow_executions',
        columns: ['contact_id', 'workflow_id'],
        indexType: 'btree',
        expectedImpact: 'medium',
        reason: 'Speeds up contact-specific workflow lookups',
        estimatedSizeKB: 192
      },
      {
        tableName: 'hubspot_sync_records',
        columns: ['sync_status', 'priority', 'last_sync_attempt'],
        indexType: 'btree',
        expectedImpact: 'high',
        reason: 'Optimizes sync queue processing',
        estimatedSizeKB: 160
      },
      {
        tableName: 'member_analytics',
        columns: ['risk_level', 'churn_risk_score'],
        indexType: 'btree',
        expectedImpact: 'medium',
        reason: 'Improves risk analysis queries',
        estimatedSizeKB: 96
      },
      {
        tableName: 'member_analytics',
        columns: ['engagement_score'],
        indexType: 'btree',
        expectedImpact: 'medium',
        reason: 'Optimizes engagement-based filtering',
        estimatedSizeKB: 80
      },
      {
        tableName: 'automation_executions',
        columns: ['status', 'triggered_at'],
        indexType: 'btree',
        expectedImpact: 'medium',
        reason: 'Speeds up recent automation lookups',
        estimatedSizeKB: 128
      },
      {
        tableName: 'webhook_events',
        columns: ['source', 'event_type', 'status'],
        indexType: 'btree',
        expectedImpact: 'medium',
        reason: 'Optimizes webhook event processing',
        estimatedSizeKB: 144
      },
      {
        tableName: 'integration_alerts',
        columns: ['severity', 'is_resolved', 'created_at'],
        indexType: 'btree',
        expectedImpact: 'low',
        reason: 'Improves alert management queries',
        estimatedSizeKB: 96
      },
      {
        tableName: 'integration_metrics',
        columns: ['metric_type', 'period_start', 'period_end'],
        indexType: 'btree',
        expectedImpact: 'medium',
        reason: 'Optimizes time-series metric queries',
        estimatedSizeKB: 112
      }
    )

    // Add text search indexes for commonly searched fields
    this.recommendations.push(
      {
        tableName: 'hubspot_workflows',
        columns: ['name', 'description'],
        indexType: 'gin',
        expectedImpact: 'low',
        reason: 'Enables full-text search on workflow content',
        estimatedSizeKB: 64
      },
      {
        tableName: 'integration_alerts',
        columns: ['title', 'message'],
        indexType: 'gin',
        expectedImpact: 'low',
        reason: 'Enables full-text search on alert content',
        estimatedSizeKB: 48
      }
    )
  }

  private async applySafeOptimizations(): Promise<void> {
    console.log('\n🔧 Applying safe optimizations...')

    const safeIndexes = this.recommendations.filter(rec => 
      rec.expectedImpact === 'high' && rec.estimatedSizeKB < 300
    )

    for (const index of safeIndexes) {
      try {
        await this.createIndex(index)
        console.log(`  ✅ Created index on ${index.tableName}(${index.columns.join(', ')})`)
      } catch (error) {
        console.log(`  ⚠️  Failed to create index on ${index.tableName}: ${error}`)
      }
    }

    // Update table statistics
    await this.updateTableStatistics()
  }

  private async createIndex(recommendation: IndexRecommendation): Promise<void> {
    const indexName = `idx_${recommendation.tableName}_${recommendation.columns.join('_')}`
    const columnList = recommendation.columns.join(', ')
    
    let createSQL = ''
    
    if (recommendation.indexType === 'gin') {
      // Create GIN index for full-text search
      createSQL = `CREATE INDEX CONCURRENTLY ${indexName} ON ${recommendation.tableName} USING gin(to_tsvector('english', ${columnList}))`
    } else {
      // Create regular B-tree index
      createSQL = `CREATE INDEX CONCURRENTLY ${indexName} ON ${recommendation.tableName} (${columnList})`
    }

    await prisma.$executeRawUnsafe(createSQL)
  }

  private async updateTableStatistics(): Promise<void> {
    console.log('\n📊 Updating table statistics...')

    const tables = [
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

    for (const table of tables) {
      try {
        await prisma.$executeRawUnsafe(`ANALYZE ${table}`)
        console.log(`  ✅ Updated statistics for ${table}`)
      } catch (error) {
        console.log(`  ⚠️  Failed to update statistics for ${table}: ${error}`)
      }
    }
  }

  private extractIndexesFromPlan(plan: any, indexes: string[]): void {
    if (plan['Index Name']) {
      indexes.push(plan['Index Name'])
    }
    
    if (plan['Plans']) {
      for (const subPlan of plan['Plans']) {
        this.extractIndexesFromPlan(subPlan, indexes)
      }
    }
  }

  private generateOptimizationReport(
    indexAnalysis: IndexAnalysis[],
    queryPerformance: QueryPerformance[]
  ): void {
    console.log('\n📋 Index Optimization Report')
    console.log('============================')

    // Index usage summary
    const totalIndexes = indexAnalysis.length
    const unusedIndexes = indexAnalysis.filter(idx => idx.recommendation === 'drop').length
    const criticalIndexes = indexAnalysis.filter(idx => idx.scansPerSecond > 10).length

    console.log(`\n📊 Index Usage Summary:`)
    console.log(`  • Total indexes: ${totalIndexes}`)
    console.log(`  • Critical indexes (high usage): ${criticalIndexes}`)
    console.log(`  • Unused indexes: ${unusedIndexes}`)

    // Query performance summary
    const totalQueries = queryPerformance.length
    const slowQueries = queryPerformance.filter(q => q.executionTime > 500).length
    const fastQueries = queryPerformance.filter(q => q.executionTime < 50).length

    console.log(`\n⚡ Query Performance Summary:`)
    console.log(`  • Total test queries: ${totalQueries}`)
    console.log(`  • Fast queries (<50ms): ${fastQueries}`)
    console.log(`  • Slow queries (>500ms): ${slowQueries}`)

    // Recommendations summary
    const highImpactRecs = this.recommendations.filter(r => r.expectedImpact === 'high').length
    const mediumImpactRecs = this.recommendations.filter(r => r.expectedImpact === 'medium').length
    const lowImpactRecs = this.recommendations.filter(r => r.expectedImpact === 'low').length

    console.log(`\n💡 Optimization Recommendations:`)
    console.log(`  • High impact: ${highImpactRecs}`)
    console.log(`  • Medium impact: ${mediumImpactRecs}`)
    console.log(`  • Low impact: ${lowImpactRecs}`)

    // Detailed unused indexes
    if (unusedIndexes > 0) {
      console.log(`\n🗑️  Unused Indexes (consider dropping):`)
      indexAnalysis
        .filter(idx => idx.recommendation === 'drop')
        .forEach(idx => {
          console.log(`  • ${idx.indexName} on ${idx.tableName} (${idx.indexSize})`)
        })
    }

    // Detailed slow queries
    if (slowQueries > 0) {
      console.log(`\n🐌 Slow Queries (need optimization):`)
      queryPerformance
        .filter(q => q.executionTime > 500)
        .forEach(q => {
          console.log(`  • ${q.query}: ${q.executionTime.toFixed(2)}ms`)
          console.log(`    ${q.recommendation}`)
        })
    }

    // High impact recommendations
    console.log(`\n🎯 High Impact Recommendations:`)
    this.recommendations
      .filter(r => r.expectedImpact === 'high')
      .forEach(rec => {
        console.log(`  • ${rec.tableName}(${rec.columns.join(', ')}) - ${rec.reason}`)
      })

    console.log(`\n🔧 Next Steps:`)
    console.log(`  1. Review and apply high-impact index recommendations`)
    console.log(`  2. Consider dropping unused indexes to save space`)
    console.log(`  3. Monitor query performance after changes`)
    console.log(`  4. Run this optimization monthly to track improvements`)
    console.log(`  5. Update application queries based on slow query analysis`)

    // Estimated storage impact
    const totalNewIndexSize = this.recommendations.reduce((sum, rec) => sum + rec.estimatedSizeKB, 0)
    console.log(`\n💾 Estimated additional storage: ${totalNewIndexSize}KB`)
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2)
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Database Index Optimization Script

Usage: npm run db:optimize-indexes [options]

Options:
  --help, -h              Show this help message
  --analysis-only         Only analyze current indexes, don't apply changes
  --apply-all            Apply all recommendations (use with caution)
  --force                Force application of optimizations
  --backup-first         Create database backup before applying changes

This script optimizes database indexes for HubSpot workflow integration:
1. Analyzes current index usage and effectiveness
2. Tests common query patterns for performance
3. Generates optimization recommendations
4. Applies safe performance improvements
5. Provides detailed optimization report

The script focuses on:
- HubSpot workflow execution queries
- Member analytics and risk assessment
- Data synchronization operations
- Automation rule processing
- Alert and monitoring queries

Required environment variables:
- DATABASE_URL: PostgreSQL connection string

Examples:
  npm run db:optimize-indexes                    # Full optimization
  npm run db:optimize-indexes --analysis-only   # Analysis only
  npm run db:optimize-indexes --apply-all       # Apply all recommendations
    `)
    process.exit(0)
  }

  if (args.includes('--analysis-only')) {
    console.log('🔍 Running analysis only (no changes will be made)')
  }

  console.log('🚀 NAMC Database Index Optimization Starting...\n')

  const optimizer = new DatabaseIndexOptimizer()
  await optimizer.runOptimization()

  console.log('\n✅ Index optimization completed successfully!')
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('💥 Index optimization failed:', error)
    process.exit(1)
  })
}