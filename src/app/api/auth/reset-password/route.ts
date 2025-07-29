import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { resetPasswordSchema } from '@/lib/validation'
import { handleAPIError, createSuccessResponse, generateRequestId, ValidationError } from '@/lib/error-handler'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const { token, password } = resetPasswordSchema.parse(body)

    // Find user with matching reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordResetExpires: true
      }
    })

    if (!user) {
      throw new ValidationError('Invalid or expired password reset token')
    }

    // Hash the new password
    const hashedPassword = await AuthService.hashPassword(password)

    // Update user password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        // Reset failed login attempts on successful password reset
        failedLoginAttempts: 0,
        lockedUntil: null
      }
    })

    // Log successful password reset
    await AuthService.logAuthAction(
      'PASSWORD_RESET_REQUESTED', // Using existing enum value
      user.id,
      `Password reset completed successfully for ${user.email}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    )

    return createSuccessResponse(
      {
        message: 'Password reset successful. You can now log in with your new password.'
      },
      'Password reset completed successfully',
      { 
        timestamp: new Date().toISOString(),
        requestId 
      }
    )

  } catch (error) {
    return handleAPIError(error, requestId)
  }
}

// GET endpoint to validate reset token (for frontend to check token validity)
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      throw new ValidationError('Reset token is required')
    }

    // Find user with matching reset token
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date()
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        passwordResetExpires: true
      }
    })

    if (!user) {
      throw new ValidationError('Invalid or expired password reset token')
    }

    return createSuccessResponse(
      {
        valid: true,
        email: user.email,
        firstName: user.firstName,
        expiresAt: user.passwordResetExpires
      },
      'Reset token is valid',
      { 
        timestamp: new Date().toISOString(),
        requestId 
      }
    )

  } catch (error) {
    return handleAPIError(error, requestId)
  }
}