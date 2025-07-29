'use client'

import { useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/auth/unified-auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface ProtectedRouteProps {
  children: ReactNode
  requireAuth?: boolean
  requireAdmin?: boolean
  redirectTo?: string
  fallback?: ReactNode
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo,
  fallback
}: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading, hasHydrated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Don't redirect until hydration is complete and we're not loading
    if (!hasHydrated || isLoading) return

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo || '/login')
      return
    }

    // If admin access is required but user is not admin  
    if (requireAdmin && user?.memberType !== 'admin') {
      router.push(redirectTo || '/dashboard')  
      return
    }

    // If user is authenticated but accessing auth pages, redirect to dashboard
    if (isAuthenticated && typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
      const redirect = user?.memberType === 'admin' ? '/admin/dashboard' : '/dashboard'
      router.push(redirect)
      return
    }
  }, [isAuthenticated, user, isLoading, hasHydrated, requireAuth, requireAdmin, router, redirectTo])

  // Show loading spinner while hydrating or checking authentication
  if (!hasHydrated || isLoading) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">
            {!hasHydrated ? 'Loading...' : 'Checking authentication...'}
          </p>
        </div>
      </div>
    )
  }

  // Show loading spinner while redirecting (auth required but not authenticated)
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  // Show loading spinner for admin check (admin required but user not admin)
  if (requireAdmin && user?.memberType !== 'admin') {
    return fallback || (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">  
          <LoadingSpinner size="lg" />
          <p className="text-muted-foreground">Access denied. Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Convenience components for common use cases
export function AuthRequiredRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth={true} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function AdminRequiredRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAdmin'>) {
  return (
    <ProtectedRoute requireAuth={true} requireAdmin={true} {...props}>
      {children}
    </ProtectedRoute>
  )
}

export function PublicOnlyRoute({ children, ...props }: Omit<ProtectedRouteProps, 'requireAuth'>) {
  return (
    <ProtectedRoute requireAuth={false} {...props}>
      {children}
    </ProtectedRoute>
  )
}