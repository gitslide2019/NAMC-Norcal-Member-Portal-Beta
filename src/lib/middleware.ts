import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { AuthService } from './auth'

export async function adminMiddleware(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'No authorization token provided' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    const user = await AuthService.getUserFromToken(token)

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired token' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (!AuthService.canAccessAdmin(user)) {
      return NextResponse.json(
        { success: false, message: 'Insufficient permissions. Admin access required.' },
        { status: 403 }
      )
    }

    // Add user to request headers for downstream handlers
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', user.id)
    requestHeaders.set('x-user-email', user.email)
    requestHeaders.set('x-user-role', user.memberType)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Admin middleware error:', error)
    return NextResponse.json(
      { success: false, message: 'Authentication error' },
      { status: 500 }
    )
  }
}

export async function withAdminAuth<T>(
  handler: (request: NextRequest, context: any) => Promise<NextResponse<T>>
) {
  return async (request: NextRequest, context: any) => {
    const authResult = await adminMiddleware(request)
    
    // If middleware returns a response (error), return it
    if (authResult.status !== 200) {
      return authResult
    }

    // Otherwise, continue with the handler
    return handler(request, context)
  }
}