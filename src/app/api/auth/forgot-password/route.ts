import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { forgotPasswordSchema } from '@/lib/validation'
import { handleAPIError, createSuccessResponse, generateRequestId } from '@/lib/error-handler'
import { emailService } from '@/lib/email'
import { generateSecureSessionId } from '@/lib/security'


export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const { email } = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
      },
    })

    // Always return success to prevent email enumeration attacks
    const successMessage = 'If an account with this email exists, password reset instructions have been sent.'

    if (!user || !user.isActive) {
      // Log the attempt but still return success
      await AuthService.logAuthAction(
        'PASSWORD_RESET_ATTEMPT',
        'unknown',
        `Password reset attempt for non-existent/inactive email: ${email}`,
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      )
      
      return createSuccessResponse(
        { message: successMessage },
        successMessage,
        { 
          timestamp: new Date().toISOString(),
          requestId 
        }
      )
    }

    // Generate secure password reset token
    const resetToken = generateSecureSessionId()
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour expiration

    // Store reset token in database with expiration
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: expiresAt,
      },
    })

    // Log the password reset request
    await AuthService.logAuthAction(
      'PASSWORD_RESET_REQUESTED',
      user.id,
      `Password reset requested for ${user.email}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    )

    // Send password reset email via HubSpot
    const emailResult = await emailService.sendPasswordResetEmail(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      resetToken,
      {
        expiresIn: '1 hour',
        requestTimestamp: new Date().toISOString()
      }
    )

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error)
      
      // Log email failure but still return success to user
      await AuthService.logAuthAction(
        'PASSWORD_RESET_EMAIL_FAILED',
        user.id,
        `Failed to send password reset email: ${emailResult.error}`,
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      )
    } else {
      // Log successful email sending
      await AuthService.logAuthAction(
        'PASSWORD_RESET_EMAIL_SENT',
        user.id,
        `Password reset email sent successfully. Message ID: ${emailResult.messageId}`,
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      )
    }

    return createSuccessResponse(
      { 
        message: successMessage,
        emailSent: emailResult.success 
      },
      successMessage,
      { 
        timestamp: new Date().toISOString(),
        requestId 
      }
    )

  } catch (error) {
    return handleAPIError(error, requestId)
  }
}