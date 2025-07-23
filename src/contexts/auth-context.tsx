'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useNotifications } from '@/store'
import { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  const { addNotification } = useNotifications()
  
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: storeLogin,
    logout: storeLogout,
    setLoading,
    setError,
    clearError,
    setUser
  } = useAuthStore()

  // Check for existing session on mount
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.user) {
          storeLogin(data.data.user, data.data.token || '')
        } else {
          storeLogout()
        }
      } else {
        storeLogout()
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      storeLogout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string, rememberMe = false) => {
    try {
      setLoading(true)
      clearError()

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        storeLogin(data.data.user, data.data.token || '')
        
        addNotification({
          type: 'success',
          title: 'Welcome back!',
          message: `Good to see you, ${data.data.user.firstName}.`,
        })

        // Redirect based on user type
        if (data.data.user.memberType === 'admin') {
          router.push('/admin/dashboard')
        } else {
          router.push('/dashboard')
        }
      } else {
        const errorMessage = data.message || 'Login failed. Please try again.'
        setError(errorMessage)
        
        addNotification({
          type: 'error',
          title: 'Login Failed',
          message: errorMessage,
        })
      }
    } catch (error) {
      const errorMessage = 'Network error. Please check your connection and try again.'
      setError(errorMessage)
      
      addNotification({
        type: 'error',
        title: 'Connection Error',
        message: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      
      // Call logout API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      // Clear local state regardless of API response
      storeLogout()
      
      addNotification({
        type: 'info',
        title: 'Logged Out',
        message: 'You have been successfully logged out.',
      })

      // Redirect to login page
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still clear local state even if API call fails
      storeLogout()
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  const refreshUser = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data.user) {
          setUser(data.data.user)
        }
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes
export function useRequireAuth(redirectTo = '/auth/login') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}

// Hook for admin-only routes
export function useRequireAdmin(redirectTo = '/dashboard') {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && (!user || user.memberType !== 'admin')) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  return { isAdmin: user?.memberType === 'admin', isLoading }
}