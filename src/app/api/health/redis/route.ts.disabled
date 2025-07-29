import { NextRequest, NextResponse } from 'next/server'
import redisClient from '@/lib/redis'
import { createSuccessResponse, createErrorResponse, AuthorizationError } from '@/lib/error-handler'
import { AuthService } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Check if user is admin (only admins can view detailed Redis health)
    const token = request.cookies.get('namc-auth-token')?.value
    if (!token) {
      return createErrorResponse(new AuthorizationError('Admin access required'))
    }

    const user = await AuthService.getUserFromToken(token)
    if (!user || !AuthService.isAdmin(user)) {
      return createErrorResponse(new AuthorizationError('Admin access required'))
    }

    // Get detailed Redis health information
    const healthInfo = await redisClient.healthCheck()
    
    const response = {
      ...healthInfo,
      configuration: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || '6379',
        database: process.env.REDIS_DB || '0'
      },
      performance: {
        latency: healthInfo.latency ? `${healthInfo.latency}ms` : 'N/A',
        memory_usage: healthInfo.memory || 'N/A',
        uptime: healthInfo.uptime ? `${Math.floor(healthInfo.uptime / 3600)}h ${Math.floor((healthInfo.uptime % 3600) / 60)}m` : 'N/A'
      }
    }

    return createSuccessResponse(response, 'Redis health information retrieved')
  } catch (error) {
    console.error('Redis health check failed:', error)
    return createErrorResponse(new Error('Failed to retrieve Redis health information'))
  }
}