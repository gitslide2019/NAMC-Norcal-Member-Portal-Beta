import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/lib/auth'
import { handleAPIError, createSuccessResponse, generateRequestId, ValidationError, NotFoundError } from '@/lib/error-handler'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required')
})

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const { token } = verifyEmailSchema.parse(body)

    // Find user with matching verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        },
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        emailVerificationExpires: true
      }
    })

    if (!user) {
      throw new ValidationError('Invalid or expired verification token')
    }

    // Update user as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    // Log successful verification
    await AuthService.logAuthAction(
      'EMAIL_VERIFICATION_SENT', // Using existing enum value
      user.id,
      `Email ${user.email} verified successfully`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    )

    return createSuccessResponse(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          company: user.company,
          isVerified: true
        }
      },
      'Email verified successfully! You can now access all features.',
      { 
        timestamp: new Date().toISOString(),
        requestId 
      }
    )

  } catch (error) {
    return handleAPIError(error, requestId)
  }
}

// GET endpoint for token-based verification (from email links)
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      throw new ValidationError('Verification token is required')
    }

    // Find user with matching verification token
    const user = await prisma.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date()
        },
        isVerified: false
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        company: true,
        emailVerificationExpires: true
      }
    })

    if (!user) {
      // Return HTML error page for invalid tokens
      return new NextResponse(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Email Verification - NAMC NorCal</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
            .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 0.5rem; }
            .button { display: inline-block; background: #2563eb; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; margin-top: 1rem; }
          </style>
        </head>
        <body>
          <h1>Email Verification Failed</h1>
          <div class="error">
            <p><strong>Invalid or expired verification token.</strong></p>
            <p>The verification link may have expired or been used already. Please request a new verification email.</p>
          </div>
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Go to Login</a>
        </body>
        </html>
      `, {
        status: 400,
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Update user as verified and clear verification token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        emailVerificationToken: null,
        emailVerificationExpires: null
      }
    })

    // Log successful verification
    await AuthService.logAuthAction(
      'EMAIL_VERIFICATION_SENT', // Using existing enum value
      user.id,
      `Email ${user.email} verified successfully via link`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    )

    // Return HTML success page
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified - NAMC NorCal</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
          .success { background: #f0fdf4; border: 1px solid #bbf7d0; color: #166534; padding: 1rem; border-radius: 0.5rem; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <h1>Email Verified Successfully!</h1>
        <div class="success">
          <p><strong>Welcome to NAMC NorCal, ${user.firstName}!</strong></p>
          <p>Your email address has been verified. You now have full access to the member portal.</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Sign In to Your Account</a>
      </body>
      </html>
    `, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    })

  } catch (error) {
    console.error('Email verification error:', error)
    
    // Return HTML error page for server errors
    return new NextResponse(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Error - NAMC NorCal</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 2rem; max-width: 600px; margin: 0 auto; }
          .error { background: #fef2f2; border: 1px solid #fecaca; color: #dc2626; padding: 1rem; border-radius: 0.5rem; }
          .button { display: inline-block; background: #2563eb; color: white; padding: 0.75rem 1.5rem; text-decoration: none; border-radius: 0.375rem; margin-top: 1rem; }
        </style>
      </head>
      <body>
        <h1>Verification Error</h1>
        <div class="error">
          <p><strong>An error occurred during email verification.</strong></p>
          <p>Please try again or contact support if the problem persists.</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/login" class="button">Go to Login</a>
      </body>
      </html>
    `, {
      status: 500,
      headers: { 'Content-Type': 'text/html' }
    })
  }
}