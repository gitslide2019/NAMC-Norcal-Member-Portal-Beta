// Auth middleware utilities for API routes
import { NextRequest } from 'next/server'
import { verify } from 'jsonwebtoken'
import { AuthUser } from '@/types'

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser
}

/**
 * Verify JWT token from Authorization header or cookies
 */
export async function verifyToken(request: NextRequest): Promise<AuthUser | null> {
  try {
    let token: string | null = null

    // Try to get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    }

    // If no token in header, try cookies
    if (!token) {
      token = request.cookies.get('token')?.value || null
    }

    if (!token) {
      return null
    }

    const JWT_SECRET = process.env.JWT_SECRET
    if (!JWT_SECRET) {
      throw new Error('JWT_SECRET is not configured')
    }

    const decoded = verify(token, JWT_SECRET) as any
    
    // Return user data from token
    return {
      id: decoded.id,
      email: decoded.email,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
      memberType: decoded.memberType || 'REGULAR',
      isActive: decoded.isActive !== false,
      isVerified: decoded.isVerified !== false,
    }
  } catch (error) {
    console.error('Token verification failed:', error)
    return null
  }
}

/**
 * Middleware to require authentication
 */
export async function requireAuth(request: NextRequest): Promise<AuthUser> {
  const user = await verifyToken(request)
  if (!user) {
    throw new Error('Authentication required')
  }
  return user
}

/**
 * Middleware to require admin access
 */
export async function requireAdmin(request: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(request)
  if (user.memberType !== 'admin') {
    throw new Error('Admin access required')
  }
  return user
}

/**
 * Extract user from request (optional)
 */
export async function getOptionalUser(request: NextRequest): Promise<AuthUser | null> {
  return verifyToken(request)
}

/**
 * Alias for requireAuth (backward compatibility)
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthUser> {
  return requireAuth(request)
}

/**
 * Alias for requireAdmin (backward compatibility)
 */
export async function requireAdminAccess(request: NextRequest): Promise<AuthUser> {
  return requireAdmin(request)
}