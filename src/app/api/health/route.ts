/**
 * Health Check API Endpoint for NAMC NorCal Member Portal
 * Provides comprehensive health status for monitoring and deployment validation
 */

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { Redis } from 'ioredis'
import { promises as fs } from 'fs'
import { join } from 'path'

// Initialize clients
const prisma = new PrismaClient()
let redis: Redis | null = null

// Initialize Redis client if Redis URL is available
if (process.env.REDIS_URL) {
  redis = new Redis(process.env.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  })
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  version: string
  git_sha: string
  environment: string
  uptime: number
  checks: {
    database: HealthStatus
    redis: HealthStatus
    filesystem: HealthStatus
    hubspot: HealthStatus
    memory: HealthStatus
  }
  performance: {
    response_time: number
    memory_usage: number
    cpu_usage?: number
  }
}

interface HealthStatus {
  status: 'pass' | 'fail' | 'warn'
  response_time?: number
  message?: string
  details?: any
}

/**
 * Check database connectivity and performance
 */
async function checkDatabase(): Promise<HealthStatus> {
  const startTime = Date.now()
  
  try {
    // Simple database query to check connectivity
    await prisma.$queryRaw`SELECT 1 as health_check`
    
    const responseTime = Date.now() - startTime
    
    return {
      status: responseTime < 1000 ? 'pass' : 'warn',
      response_time: responseTime,
      message: responseTime < 1000 ? 'Database healthy' : 'Database slow response',
    }
  } catch (error) {
    return {
      status: 'fail',
      response_time: Date.now() - startTime,
      message: 'Database connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check Redis connectivity and performance
 */
async function checkRedis(): Promise<HealthStatus> {
  if (!redis) {
    return {
      status: 'warn',
      message: 'Redis not configured',
    }
  }

  const startTime = Date.now()
  
  try {
    await redis.ping()
    const responseTime = Date.now() - startTime
    
    return {
      status: responseTime < 500 ? 'pass' : 'warn',
      response_time: responseTime,
      message: responseTime < 500 ? 'Redis healthy' : 'Redis slow response',
    }
  } catch (error) {
    return {
      status: 'fail',
      response_time: Date.now() - startTime,
      message: 'Redis connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check filesystem accessibility and disk space
 */
async function checkFilesystem(): Promise<HealthStatus> {
  const startTime = Date.now()
  
  try {
    // Check if uploads directory is accessible
    const uploadsPath = process.env.FILE_UPLOAD_PATH || './uploads'
    
    try {
      await fs.access(uploadsPath)
    } catch {
      // Create uploads directory if it doesn't exist
      await fs.mkdir(uploadsPath, { recursive: true })
    }
    
    // Test write operation
    const testFile = join(uploadsPath, '.health-check')
    await fs.writeFile(testFile, 'health-check')
    await fs.unlink(testFile)
    
    const responseTime = Date.now() - startTime
    
    return {
      status: 'pass',
      response_time: responseTime,
      message: 'Filesystem healthy',
    }
  } catch (error) {
    return {
      status: 'fail',
      response_time: Date.now() - startTime,
      message: 'Filesystem check failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check HubSpot API connectivity
 */
async function checkHubSpot(): Promise<HealthStatus> {
  const startTime = Date.now()
  
  if (!process.env.HUBSPOT_API_KEY) {
    return {
      status: 'warn',
      message: 'HubSpot API key not configured',
    }
  }
  
  try {
    // Simple API call to check HubSpot connectivity
    const response = await fetch('https://api.hubapi.com/account-info/v3/details', {
      headers: {
        'Authorization': `Bearer ${process.env.HUBSPOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000), // 5 second timeout
    })
    
    const responseTime = Date.now() - startTime
    
    if (response.ok) {
      return {
        status: responseTime < 2000 ? 'pass' : 'warn',
        response_time: responseTime,
        message: responseTime < 2000 ? 'HubSpot API healthy' : 'HubSpot API slow response',
      }
    } else {
      return {
        status: 'fail',
        response_time: responseTime,
        message: `HubSpot API error: ${response.status}`,
        details: await response.text().catch(() => 'Unable to read response'),
      }
    }
  } catch (error) {
    return {
      status: 'fail',
      response_time: Date.now() - startTime,
      message: 'HubSpot API connection failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Check memory usage
 */
function checkMemory(): HealthStatus {
  if (typeof process.memoryUsage !== 'function') {
    return {
      status: 'warn',
      message: 'Memory usage not available',
    }
  }
  
  const memUsage = process.memoryUsage()
  const heapUsedMB = Math.round(memUsage.heapUsed / 1024 / 1024)
  const heapTotalMB = Math.round(memUsage.heapTotal / 1024 / 1024)
  const memoryUsagePercent = (heapUsedMB / heapTotalMB) * 100
  
  let status: 'pass' | 'warn' | 'fail' = 'pass'
  let message = `Memory usage: ${heapUsedMB}MB / ${heapTotalMB}MB (${memoryUsagePercent.toFixed(1)}%)`
  
  if (memoryUsagePercent > 90) {
    status = 'fail'
    message = `High memory usage: ${memoryUsagePercent.toFixed(1)}%`
  } else if (memoryUsagePercent > 75) {
    status = 'warn'
    message = `Elevated memory usage: ${memoryUsagePercent.toFixed(1)}%`
  }
  
  return {
    status,
    message,
    details: {
      heap_used: heapUsedMB,
      heap_total: heapTotalMB,
      usage_percent: memoryUsagePercent,
    },
  }
}

/**
 * Determine overall health status
 */
function determineOverallStatus(checks: HealthCheckResult['checks']): 'healthy' | 'unhealthy' | 'degraded' {
  const statuses = Object.values(checks).map(check => check.status)
  
  if (statuses.some(status => status === 'fail')) {
    return 'unhealthy'
  }
  
  if (statuses.some(status => status === 'warn')) {
    return 'degraded'
  }
  
  return 'healthy'
}

/**
 * GET /api/health - Health check endpoint
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const startTime = Date.now()
  
  try {
    // Run all health checks in parallel
    const [databaseCheck, redisCheck, filesystemCheck, hubspotCheck] = await Promise.all([
      checkDatabase(),
      checkRedis(),
      checkFilesystem(),
      checkHubSpot(),
    ])
    
    const memoryCheck = checkMemory()
    
    const checks = {
      database: databaseCheck,
      redis: redisCheck,
      filesystem: filesystemCheck,
      hubspot: hubspotCheck,
      memory: memoryCheck,
    }
    
    const responseTime = Date.now() - startTime
    const overallStatus = determineOverallStatus(checks)
    
    // Get memory usage for performance metrics
    const memUsage = process.memoryUsage()
    const memoryUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024)
    
    const healthResult: HealthCheckResult = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.BUILD_TIME || 'unknown',
      git_sha: process.env.GIT_SHA || 'unknown',
      environment: process.env.NODE_ENV || 'production',
      uptime: Math.floor(process.uptime()),
      checks,
      performance: {
        response_time: responseTime,
        memory_usage: memoryUsageMB,
      },
    }
    
    // Determine HTTP status code based on health
    let statusCode = 200
    if (overallStatus === 'degraded') {
      statusCode = 200 // Still return 200 for degraded but functional
    } else if (overallStatus === 'unhealthy') {
      statusCode = 503 // Service Unavailable
    }
    
    return NextResponse.json(healthResult, {
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    })
    
  } catch (error) {
    // Emergency fallback response
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.BUILD_TIME || 'unknown',
      git_sha: process.env.GIT_SHA || 'unknown',
      environment: process.env.NODE_ENV || 'production',
      uptime: Math.floor(process.uptime()),
      checks: {
        database: { status: 'fail', message: 'Health check failed' },
        redis: { status: 'fail', message: 'Health check failed' },
        filesystem: { status: 'fail', message: 'Health check failed' },
        hubspot: { status: 'fail', message: 'Health check failed' },
        memory: { status: 'fail', message: 'Health check failed' },
      },
      performance: {
        response_time: Date.now() - startTime,
        memory_usage: 0,
      },
    }
    
    return NextResponse.json(errorResult, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    })
  } finally {
    // Clean up connections
    try {
      await prisma.$disconnect()
    } catch {
      // Ignore disconnect errors
    }
  }
}

/**
 * HEAD /api/health - Lightweight health check for load balancers
 */
export async function HEAD(): Promise<NextResponse> {
  try {
    // Quick database ping
    await prisma.$queryRaw`SELECT 1`
    await prisma.$disconnect()
    
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  }
}