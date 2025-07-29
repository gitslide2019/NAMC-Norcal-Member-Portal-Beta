import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { emailService, EmailTemplate } from '@/lib/email'
import { handleAPIError, createSuccessResponse, generateRequestId, AuthorizationError, ValidationError } from '@/lib/error-handler'
import { z } from 'zod'

const testEmailSchema = z.object({
  template: z.enum(['welcome', 'email_verification', 'password_reset', 'contractor_invitation', 'admin_notification']),
  email: z.string().email('Valid email address is required'),
  firstName: z.string().min(1, 'First name is required').optional().default('Test'),
  lastName: z.string().min(1, 'Last name is required').optional().default('User'),
  company: z.string().optional().default('Test Company')
})

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Check if user is admin
    const token = request.cookies.get('namc-auth-token')?.value
    if (!token) {
      throw new AuthorizationError('Admin access required')
    }

    const user = await AuthService.getUserFromToken(token)
    if (!user || !AuthService.isAdmin(user)) {
      throw new AuthorizationError('Admin access required')
    }

    const body = await request.json()
    const { template, email, firstName, lastName, company } = testEmailSchema.parse(body)

    let emailResult
    const recipient = { email, firstName, lastName, company }

    // Send different test emails based on template type
    switch (template) {
      case 'welcome':
        emailResult = await emailService.sendWelcomeEmail(recipient, {
          registrationDate: new Date().toISOString(),
          memberType: 'REGULAR'
        })
        break

      case 'email_verification':
        const verificationToken = 'test-verification-token-' + Date.now()
        emailResult = await emailService.sendVerificationEmail(recipient, verificationToken, {
          registrationDate: new Date().toISOString()
        })
        break

      case 'password_reset':
        const resetToken = 'test-reset-token-' + Date.now()
        emailResult = await emailService.sendPasswordResetEmail(recipient, resetToken, {
          requestTimestamp: new Date().toISOString()
        })
        break

      case 'contractor_invitation':
        const invitationToken = 'test-invitation-token-' + Date.now()
        emailResult = await emailService.sendContractorInvitation(recipient, invitationToken, {
          invitedBy: `${user.firstName} ${user.lastName} (Admin)`
        })
        break

      case 'admin_notification':
        emailResult = await emailService.sendAdminNotification(
          [recipient],
          'Test Admin Notification',
          'This is a test admin notification sent from the email testing endpoint.',
          {
            testMessage: true,
            sentBy: `${user.firstName} ${user.lastName}`,
            timestamp: new Date().toISOString()
          }
        )
        // sendAdminNotification returns an array, so get the first result
        emailResult = emailResult[0]
        break

      default:
        throw new ValidationError('Invalid email template type')
    }

    // Log the test email
    await AuthService.logAuthAction(
      'SYSTEM_CONFIG_CHANGED',
      user.id,
      `Admin ${user.email} sent test email (${template}) to ${email}. Success: ${emailResult.success}`,
      request.headers.get('x-forwarded-for') || 'unknown',
      request.headers.get('user-agent') || 'unknown'
    )

    return createSuccessResponse(
      {
        template,
        recipient: email,
        success: emailResult.success,
        messageId: emailResult.messageId,
        error: emailResult.error,
        rateLimited: emailResult.rateLimited,
        retryAfter: emailResult.retryAfter
      },
      emailResult.success 
        ? 'Test email sent successfully' 
        : `Test email failed: ${emailResult.error}`,
      { requestId }
    )

  } catch (error) {
    return handleAPIError(error, requestId)
  }
}

// GET endpoint to list available email templates
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    // Check if user is admin
    const token = request.cookies.get('namc-auth-token')?.value
    if (!token) {
      throw new AuthorizationError('Admin access required')
    }

    const user = await AuthService.getUserFromToken(token)
    if (!user || !AuthService.isAdmin(user)) {
      throw new AuthorizationError('Admin access required')
    }

    // Get email configuration status
    const configValidation = emailService.validateConfiguration()
    const emailTemplates = emailService.getEmailTemplates()

    return createSuccessResponse(
      {
        availableTemplates: emailTemplates,
        configuration: {
          valid: configValidation.valid,
          errors: configValidation.errors,
          warnings: configValidation.warnings,
          environment: process.env.NODE_ENV
        },
        usage: {
          description: 'Send a POST request to this endpoint with template type and recipient email',
          example: {
            template: 'welcome',
            email: 'test@example.com',
            firstName: 'John',
            lastName: 'Doe',
            company: 'Test Company'
          }
        }
      },
      'Email testing endpoint information',
      { requestId }
    )

  } catch (error) {
    return handleAPIError(error, requestId)
  }
}