import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from './prisma'
import { AuthUser, User, MemberType } from '@/types'
import Logger from './logger'

function getJWTSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required')
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long')
  }
  return secret
}
const JWT_EXPIRES_IN = '7d'

export interface JWTPayload {
  userId: string
  email: string
  memberType: string
  iat: number
  exp: number
}

export class AuthService {
  /**
   * Hash a password using bcrypt
   */
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
  }

  /**
   * Compare a password with its hash
   */
  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  /**
   * Generate JWT token for user
   */
  static generateToken(user: AuthUser): string {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      memberType: user.memberType,
    }

    return jwt.sign(payload, getJWTSecret(), {
      expiresIn: JWT_EXPIRES_IN,
    })
  }

  /**
   * Verify and decode JWT token, returning user data if valid
   */
  static async verifyToken(token: string): Promise<AuthUser | null> {
    try {
      const payload = jwt.verify(token, getJWTSecret()) as JWTPayload
      if (!payload) return null

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          memberType: true,
          isActive: true,
          isVerified: true,
        },
      })

      if (!user || !user.isActive || !user.isVerified) {
        return null
      }

      return user as AuthUser
    } catch (error) {
      return null
    }
  }

  /**
   * Authenticate user with email and password
   */
  static async authenticateUser(email: string, password: string): Promise<AuthUser | null> {
    try {
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          email: true,
          password: true,
          firstName: true,
          lastName: true,
          memberType: true,
          isActive: true,
          isVerified: true,
          failedLoginAttempts: true,
          lockedUntil: true,
        },
      })

      if (!user) {
        return null
      }

      // Check if account is locked
      if (user.lockedUntil && user.lockedUntil > new Date()) {
        Logger.audit('Login failed for ' + email + ': Authentication failed', {
          error: 'Account is temporarily locked due to too many failed login attempts',
          email,
          action: 'LOGIN_FAILED',
          reason: 'Authentication failed',
          auditEvent: true
        })
        return null
      }

      // Check if account is active
      if (!user.isActive) {
        Logger.audit('Login failed for ' + email + ': Authentication failed', {
          error: 'Account is deactivated',
          email,
          action: 'LOGIN_FAILED',
          reason: 'Authentication failed',
          auditEvent: true
        })
        return null
      }

      // Verify password
      const isValidPassword = await this.comparePassword(password, user.password)
      if (!isValidPassword) {
        // Update failed login attempts
        await this.updateFailedLoginAttempts(user.id)
        return null
      }

      // Reset failed login attempts on successful login
      if (user.failedLoginAttempts > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: 0,
            lockedUntil: null,
            lastSuccessfulLogin: new Date(),
          },
        })
      }

      // Update last successful login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastSuccessfulLogin: new Date() },
      })

      return {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        memberType: user.memberType as MemberType,
        isActive: user.isActive,
        isVerified: user.isVerified,
      }
    } catch (error) {
      // Log authentication errors securely without exposing sensitive details
      Logger.auth.loginFailed(email, 'Authentication failed', { error: error instanceof Error ? error.message : 'Unknown error' })
      throw error
    }
  }

  /**
   * Update failed login attempts and lock account if necessary
   */
  private static async updateFailedLoginAttempts(userId: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { failedLoginAttempts: true },
    })

    if (!user) return

    const newFailedAttempts = user.failedLoginAttempts + 1
    const maxAttempts = 5
    const lockDuration = 15 * 60 * 1000 // 15 minutes in milliseconds

    const updateData: {
      failedLoginAttempts: number
      lastFailedLogin: Date
      lockedUntil?: Date
    } = {
      failedLoginAttempts: newFailedAttempts,
      lastFailedLogin: new Date(),
    }

    // Lock account after max attempts
    if (newFailedAttempts >= maxAttempts) {
      updateData.lockedUntil = new Date(Date.now() + lockDuration)
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })
  }

  /**
   * Get user from token
   */
  static async getUserFromToken(token: string): Promise<AuthUser | null> {
    return await this.verifyToken(token)
  }

  /**
   * Check if user has required permissions (simplified for minimal schema)
   */
  static async hasPermission(userId: string, resource: string, action: string): Promise<boolean> {
    try {
      // Simplified permission check - admin has all permissions
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { memberType: true, isActive: true, isVerified: true }
      })

      if (!user || !user.isActive || !user.isVerified) {
        return false
      }

      // Admin has all permissions in minimal schema
      return user.memberType === 'admin'
    } catch (error) {
      // Log permission check errors securely
      Logger.security.accessDenied(userId, `${resource}:${action}`, { error: error instanceof Error ? error.message : 'Unknown error' })
      return false
    }
  }

  /**
   * Check if user is admin
   */
  static isAdmin(user: AuthUser): boolean {
    return user.memberType === 'admin'
  }

  /**
   * Check if user can access admin features
   */
  static canAccessAdmin(user: AuthUser): boolean {
    return this.isAdmin(user) && user.isActive && user.isVerified
  }

  /**
   * Create audit log for authentication events (simplified for minimal schema)
   */
  static async logAuthAction(
    action: string,
    userId: string,
    details: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      // For minimal schema, just log to console/logger instead of database
      Logger.audit(`Auth action: ${action}`, {
        userId,
        details,
        ipAddress,
        userAgent,
        action,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      // Log audit logging errors (critical for security)
      Logger.error('Failed to log auth action', error, { 
        action, 
        userId, 
        operation: 'auditLog',
        critical: true 
      })
    }
  }
}

export default AuthService 