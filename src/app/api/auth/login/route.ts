import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/auth'
import { loginSchema } from '@/lib/validation'
import { handleAPIError, createSuccessResponse, AuthenticationError, generateRequestId } from '@/lib/error-handler'
import Logger from '@/lib/logger'

export async function POST(request: NextRequest) {
  const requestId = generateRequestId()
  
  try {
    const body = await request.json()
    
    // Validate request body
    const { email, password, rememberMe } = loginSchema.parse(body)

    // Authenticate user
    const user = await AuthService.authenticateUser(email, password)
    
    if (!user) {
      throw new AuthenticationError('Invalid email or password')
    }

    // Generate JWT token
    const token = AuthService.generateToken(user)

    // Log successful login with structured logging
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    Logger.auth.login(user.id, user.email, {
      requestId,
      ip: clientIP,
      userAgent
    })

    // Log to audit system
    await AuthService.logAuthAction(
      'USER_LOGIN',
      user.id,
      `User ${user.email} logged in successfully`,
      clientIP,
      userAgent
    )

    // Create success response
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        memberType: user.memberType,
        isActive: user.isActive,
        isVerified: user.isVerified,
      },
      token // Include token for client-side use if needed
    }
    
    const response = createSuccessResponse(responseData, 'Login successful', { requestId })

    // Set secure httpOnly cookie
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60 // 30 days or 7 days
    response.cookies.set('namc-auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge,
      path: '/'
    })

    return response
  } catch (error) {
    return handleAPIError(error, requestId)
  }
}