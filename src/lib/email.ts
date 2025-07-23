import { withRedis } from './redis'
import redisClient from './redis'
import Logger from './logger'

// Email template types for NAMC portal
export enum EmailTemplate {
  WELCOME = 'welcome',
  EMAIL_VERIFICATION = 'email_verification',
  PASSWORD_RESET = 'password_reset',
  CONTRACTOR_INVITATION = 'contractor_invitation',
  EVENT_REGISTRATION = 'event_registration',
  ADMIN_NOTIFICATION = 'admin_notification'
}

// Email recipient interface
export interface EmailRecipient {
  email: string
  name?: string
  firstName?: string
  lastName?: string
  company?: string
  memberType?: string
}

// Email template data interface
export interface EmailTemplateData {
  [key: string]: string | number | boolean | undefined
  // Common template variables
  firstName?: string
  lastName?: string
  email?: string
  company?: string
  resetToken?: string
  verificationToken?: string
  resetUrl?: string
  verificationUrl?: string
  eventName?: string
  eventDate?: string
  adminMessage?: string
}

// Email sending result
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  rateLimited?: boolean
  retryAfter?: number
}

// Email service configuration
interface EmailConfig {
  fromEmail: string
  fromName: string
  replyToEmail?: string
  hubspotApiKey?: string
  environment: 'development' | 'production'
}

class EmailService {
  private config: EmailConfig

  constructor() {
    this.config = {
      fromEmail: process.env.FROM_EMAIL || 'noreply@namc-norcal.org',
      fromName: process.env.FROM_NAME || 'NAMC NorCal',
      replyToEmail: process.env.REPLY_TO_EMAIL || 'info@namc-norcal.org',
      hubspotApiKey: process.env.HUBSPOT_API_KEY,
      environment: (process.env.NODE_ENV || 'development') as 'development' | 'production'
    }

    if (!this.config.hubspotApiKey && this.config.environment === 'production') {
      Logger.warn('HUBSPOT_API_KEY not configured - email functionality will be limited', {
        environment: this.config.environment,
        type: 'configuration_warning'
      })
    }
  }

  /**
   * Send email using HubSpot MCP
   */
  async sendEmail(
    recipient: EmailRecipient,
    template: EmailTemplate,
    templateData: EmailTemplateData = {},
    options: {
      subject?: string
      priority?: 'normal' | 'high'
      trackOpens?: boolean
      trackClicks?: boolean
    } = {}
  ): Promise<EmailResult> {
    try {
      // Check rate limiting for email sending
      const rateLimitKey = `email_rate_limit:${recipient.email}`
      const isRateLimited = await this.checkEmailRateLimit(recipient.email)
      
      if (isRateLimited.limited) {
        return {
          success: false,
          error: 'Email rate limit exceeded',
          rateLimited: true,
          retryAfter: isRateLimited.retryAfter
        }
      }

      // Development mode - log email instead of sending
      if (this.config.environment === 'development') {
        return this.logEmailForDevelopment(recipient, template, templateData, options)
      }

      // Production mode - use HubSpot MCP
      return await this.sendViaHubSpot(recipient, template, templateData, options)

    } catch (error) {
      Logger.email.failed(template, recipient.email, error instanceof Error ? error.message : 'Unknown error')
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown email error'
      }
    }
  }

  /**
   * Send welcome email to new members
   */
  async sendWelcomeEmail(
    recipient: EmailRecipient,
    templateData: Partial<EmailTemplateData> = {}
  ): Promise<EmailResult> {
    const data: EmailTemplateData = {
      firstName: recipient.firstName || recipient.name?.split(' ')[0] || 'Member',
      lastName: recipient.lastName || recipient.name?.split(' ').slice(1).join(' ') || '',
      email: recipient.email,
      company: recipient.company || '',
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      supportEmail: this.config.replyToEmail,
      ...templateData
    }

    return await this.sendEmail(
      recipient,
      EmailTemplate.WELCOME,
      data,
      {
        subject: `Welcome to NAMC NorCal, ${data.firstName}!`,
        priority: 'normal',
        trackOpens: true,
        trackClicks: true
      }
    )
  }

  /**
   * Send email verification
   */
  async sendVerificationEmail(
    recipient: EmailRecipient,
    verificationToken: string,
    templateData: Partial<EmailTemplateData> = {}
  ): Promise<EmailResult> {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${verificationToken}`
    
    const data: EmailTemplateData = {
      firstName: recipient.firstName || recipient.name?.split(' ')[0] || 'Member',
      email: recipient.email,
      verificationToken,
      verificationUrl,
      expiresIn: '24 hours',
      supportEmail: this.config.replyToEmail,
      ...templateData
    }

    return await this.sendEmail(
      recipient,
      EmailTemplate.EMAIL_VERIFICATION,
      data,
      {
        subject: 'Verify your NAMC NorCal email address',
        priority: 'high',
        trackOpens: true,
        trackClicks: true
      }
    )
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(
    recipient: EmailRecipient,
    resetToken: string,
    templateData: Partial<EmailTemplateData> = {}
  ): Promise<EmailResult> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`
    
    const data: EmailTemplateData = {
      firstName: recipient.firstName || recipient.name?.split(' ')[0] || 'Member',
      email: recipient.email,
      resetToken,
      resetUrl,
      expiresIn: '1 hour',
      supportEmail: this.config.replyToEmail,
      ...templateData
    }

    return await this.sendEmail(
      recipient,
      EmailTemplate.PASSWORD_RESET,
      data,
      {
        subject: 'Reset your NAMC NorCal password',
        priority: 'high',
        trackOpens: true,
        trackClicks: false // Don't track clicks on security-related emails
      }
    )
  }

  /**
   * Send contractor invitation email
   */
  async sendContractorInvitation(
    recipient: EmailRecipient,
    invitationToken: string,
    templateData: Partial<EmailTemplateData> = {}
  ): Promise<EmailResult> {
    const invitationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/register?invitation=${invitationToken}`
    
    const data: EmailTemplateData = {
      firstName: recipient.firstName || recipient.name?.split(' ')[0] || 'Contractor',
      company: recipient.company || '',
      invitationUrl,
      invitedBy: templateData.invitedBy || 'NAMC NorCal Team',
      supportEmail: this.config.replyToEmail,
      ...templateData
    }

    return await this.sendEmail(
      recipient,
      EmailTemplate.CONTRACTOR_INVITATION,
      data,
      {
        subject: 'Join NAMC NorCal - Exclusive Contractor Network',
        priority: 'normal',
        trackOpens: true,
        trackClicks: true
      }
    )
  }

  /**
   * Send admin notification email
   */
  async sendAdminNotification(
    recipients: EmailRecipient[],
    subject: string,
    message: string,
    templateData: Partial<EmailTemplateData> = {}
  ): Promise<EmailResult[]> {
    const results: EmailResult[] = []

    for (const recipient of recipients) {
      const data: EmailTemplateData = {
        firstName: recipient.firstName || 'Admin',
        adminMessage: message,
        timestamp: new Date().toISOString(),
        supportEmail: this.config.replyToEmail,
        ...templateData
      }

      const result = await this.sendEmail(
        recipient,
        EmailTemplate.ADMIN_NOTIFICATION,
        data,
        {
          subject: `[NAMC Admin] ${subject}`,
          priority: 'high',
          trackOpens: false,
          trackClicks: false
        }
      )

      results.push(result)

      // Add delay between admin notifications to avoid rate limiting
      if (recipients.length > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  /**
   * Check email rate limiting
   */
  private async checkEmailRateLimit(email: string): Promise<{
    limited: boolean
    retryAfter?: number
  }> {
    const key = `email_rate_limit:${email}`
    const windowMs = 60 * 60 * 1000 // 1 hour
    const maxEmails = 10 // Maximum 10 emails per hour per recipient

    return await withRedis(
      async () => {
        const current = await redisClient.get(key)
        const count = current ? parseInt(current) : 0

        if (count >= maxEmails) {
          const ttl = await redisClient.ttl(key)
          return {
            limited: true,
            retryAfter: ttl > 0 ? ttl : windowMs / 1000
          }
        }

        // Increment counter
        if (count === 0) {
          await redisClient.set(key, '1', windowMs / 1000)
        } else {
          await redisClient.incr(key)
        }

        return { limited: false }
      },
      () => ({ limited: false }), // In fallback mode, don't limit emails
      'Email rate limit check'
    )
  }

  /**
   * Development mode email logging
   */
  private async logEmailForDevelopment(
    recipient: EmailRecipient,
    template: EmailTemplate,
    templateData: EmailTemplateData,
    options: any
  ): Promise<EmailResult> {
    Logger.info('📧 EMAIL (Development Mode)', {
      to: recipient.email,
      name: recipient.name,
      template,
      subject: options.subject || 'No subject',
      templateData,
      options,
      from: this.config.fromEmail,
      type: 'email_development'
    })

    return {
      success: true,
      messageId: `dev-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }
  }

  /**
   * Send email via HubSpot MCP
   */
  private async sendViaHubSpot(
    recipient: EmailRecipient,
    template: EmailTemplate,
    templateData: EmailTemplateData,
    options: any
  ): Promise<EmailResult> {
    try {
      // This will be the actual HubSpot MCP integration
      // For now, implementing the structure for when MCP is available
      
      const emailData = {
        to: recipient.email,
        from: this.config.fromEmail,
        fromName: this.config.fromName,
        replyTo: this.config.replyToEmail,
        subject: options.subject,
        template: template,
        templateData: {
          ...templateData,
          fromName: this.config.fromName,
          fromEmail: this.config.fromEmail,
          replyToEmail: this.config.replyToEmail
        },
        options: {
          trackOpens: options.trackOpens ?? true,
          trackClicks: options.trackClicks ?? true,
          priority: options.priority ?? 'normal'
        }
      }

      // TODO: Integrate with HubSpot MCP when available
      // const result = await hubspotMCP.sendEmail(emailData)
      
      // Temporary mock implementation until MCP is integrated
      Logger.info('🚀 HUBSPOT EMAIL (Production)', {
        emailData,
        type: 'email_hubspot_mock'
      })
      
      return {
        success: true,
        messageId: `hubspot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      }

    } catch (error) {
      Logger.email.failed(template, recipient.email, error instanceof Error ? error.message : 'HubSpot integration error', {
        service: 'hubspot'
      })
      return {
        success: false,
        error: error instanceof Error ? error.message : 'HubSpot integration error'
      }
    }
  }

  /**
   * Get email templates for different types
   */
  getEmailTemplates(): Record<EmailTemplate, { subject: string; description: string }> {
    return {
      [EmailTemplate.WELCOME]: {
        subject: 'Welcome to NAMC NorCal!',
        description: 'Welcome new members to the platform'
      },
      [EmailTemplate.EMAIL_VERIFICATION]: {
        subject: 'Verify your email address',
        description: 'Email verification for new registrations'
      },
      [EmailTemplate.PASSWORD_RESET]: {
        subject: 'Reset your password',
        description: 'Password reset instructions'
      },
      [EmailTemplate.CONTRACTOR_INVITATION]: {
        subject: 'Join NAMC NorCal',
        description: 'Invite contractors to join the platform'
      },
      [EmailTemplate.EVENT_REGISTRATION]: {
        subject: 'Event registration confirmation',
        description: 'Confirm event registration and provide details'
      },
      [EmailTemplate.ADMIN_NOTIFICATION]: {
        subject: 'Admin notification',
        description: 'System notifications for administrators'
      }
    }
  }

  /**
   * Validate email configuration
   */
  validateConfiguration(): {
    valid: boolean
    errors: string[]
    warnings: string[]
  } {
    const errors: string[] = []
    const warnings: string[] = []

    if (!this.config.fromEmail) {
      errors.push('FROM_EMAIL environment variable is required')
    }

    if (!this.config.hubspotApiKey && this.config.environment === 'production') {
      warnings.push('HUBSPOT_API_KEY not configured for production environment')
    }

    if (!process.env.NEXT_PUBLIC_APP_URL) {
      errors.push('NEXT_PUBLIC_APP_URL environment variable is required for email links')
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    }
  }
}

// Export singleton instance
export const emailService = new EmailService()
export default emailService