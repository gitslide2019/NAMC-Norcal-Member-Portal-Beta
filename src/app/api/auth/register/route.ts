import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { registerSchema } from '@/lib/validation'
import { handleAPIError, createSuccessResponse, generateRequestId, ConflictError } from '@/lib/error-handler'
import { emailService } from '@/lib/email'
import { generateSecureSessionId } from '@/lib/security'
import Logger from '@/lib/logger'


export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email.toLowerCase() },
    })

    if (existingUser) {
      throw new ConflictError('An account with this email already exists')
    }

    // Hash password
    const hashedPassword = await AuthService.hashPassword(validatedData.password)

    // Generate email verification token
    const emailVerificationToken = generateSecureSessionId()
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email.toLowerCase(),
        phone: validatedData.phone,
        company: validatedData.company,
        title: validatedData.title,
        password: hashedPassword,
        memberType: 'REGULAR',
        isActive: true,
        isVerified: false, // Requires email verification
        emailVerificationToken,
        emailVerificationExpires,
      },
    })

    // Log registration
    await AuthService.logAuthAction(
      'USER_CREATED',
      user.id,
      `User ${user.email} registered successfully`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    )

    // Send verification email via HubSpot
    const emailResult = await emailService.sendVerificationEmail(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company
      },
      emailVerificationToken,
      {
        registrationDate: new Date().toISOString(),
        company: user.company
      }
    )

    if (!emailResult.success) {
      Logger.auth.emailVerification(user.id, user.email, false, {
        requestId,
        error: emailResult.error
      })
      
      // Log email failure
      await AuthService.logAuthAction(
        'EMAIL_VERIFICATION_FAILED',
        user.id,
        `Failed to send verification email: ${emailResult.error}`,
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      )
    } else {
      // Log successful email sending
      await AuthService.logAuthAction(
        'EMAIL_VERIFICATION_SENT',
        user.id,
        `Verification email sent successfully. Message ID: ${emailResult.messageId}`,
        request.headers.get('x-forwarded-for') || 'unknown',
        request.headers.get('user-agent') || 'unknown'
      )
    }

    // Send welcome email (asynchronously, don't block registration)
    emailService.sendWelcomeEmail(
      {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        company: user.company
      },
      {
        registrationDate: new Date().toISOString(),
        memberType: 'REGULAR'
      }
    ).catch(error => {
      Logger.email.failed('welcome', user.email, error instanceof Error ? error.message : 'Unknown error', {
        requestId,
        type: 'async_welcome_email'
      })
    })

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          isVerified: user.isVerified
        },
        emailSent: emailResult.success
      },
      'Registration successful. Please check your email to verify your account.',
      { requestId }
    )

  } catch (error) {
    return handleAPIError(error, requestId)
  }
}