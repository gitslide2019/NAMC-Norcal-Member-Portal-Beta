import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import redisClient from '@/lib/redis'

export async function GET(request: NextRequest) {
  const checks = {
    api: true,
    database: false,
    redis: false,
    timestamp: new Date().toISOString()
  }

  let overallStatus = 'healthy'
  const errors: string[] = []

  // Check database connection
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.database = true
  } catch (error) {
    checks.database = false
    overallStatus = 'unhealthy'
    errors.push('Database connection failed')
  }

  // Check Redis connection
  try {
    const redisHealth = await redisClient.healthCheck()
    checks.redis = redisHealth.connected
    
    if (!redisHealth.connected) {
      overallStatus = 'degraded' // Redis is optional, so degraded rather than unhealthy
      errors.push('Redis connection failed - using fallback storage')
    }
  } catch (error) {
    checks.redis = false
    overallStatus = 'degraded'
    errors.push('Redis health check failed - using fallback storage')
  }

  const statusCode = overallStatus === 'healthy' ? 200 : 
                     overallStatus === 'degraded' ? 200 : 503

  return NextResponse.json({
    status: overallStatus,
    checks,
    errors: errors.length > 0 ? errors : undefined,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  }, { status: statusCode })
}