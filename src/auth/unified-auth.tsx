'use client'

import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/types'

// Zustand store for state management
interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  hasHydrated: boolean
  error: string | null
}

interface AuthActions {
  login: (token: string, user: AuthUser) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
  checkAuth: () => Promise<void>
  setHasHydrated: (hasHydrated: boolean) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

type AuthStore = AuthState & AuthActions

const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,
      hasHydrated: false,
      error: null,

      // Actions
      login: async (token: string, user: AuthUser) => {
        set({ 
          token, 
          user, 
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
      },

      logout: () => {
        // Call logout API to clear httpOnly cookie
        fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        }).catch(console.error)

        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false,
          error: null
        })
      },

      updateUser: (userData: Partial<AuthUser>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ 
            user: { ...currentUser, ...userData } 
          })
        }
      },

      checkAuth: async () => {
        // Don't check auth if not hydrated yet
        if (!get().hasHydrated) {
          return
        }

        try {
          set({ isLoading: true, error: null })
          
          const response = await fetch('/api/auth/me', {
            credentials: 'include', // Include httpOnly cookies
          })

          if (response.ok) {
            const data = await response.json()
            if (data.success && data.user) {
              set({ 
                user: data.user, 
                token: data.token || get().token,
                isAuthenticated: true,
                isLoading: false,
                error: null
              })
            } else {
              set({ 
                user: null, 
                token: null, 
                isAuthenticated: false,
                isLoading: false,
                error: null
              })
            }
          } else {
            // For 401 errors, just clear auth state without showing error
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false,
              isLoading: false,
              error: null
            })
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          // Don't show auth check failures as errors to users
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false,
            error: null
          })
        }
      },

      setHasHydrated: (hasHydrated: boolean) => {
        set({ hasHydrated })
      },

      setLoading: (isLoading: boolean) => {
        set({ isLoading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'namc-unified-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// React Context for component access
interface AuthContextType {
  user: AuthUser | null
  isAuthenticated: boolean
  isLoading: boolean
  hasHydrated: boolean
  error: string | null
  login: (token: string, user: AuthUser) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
  checkAuth: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter()
  
  const {
    user,
    token,
    isLoading,
    isAuthenticated,
    hasHydrated,
    error,
    login,
    logout: storeLogout,
    updateUser,
    checkAuth,
    setLoading,
    setError,
    clearError,
  } = useAuthStore()

  // Enhanced logout with navigation
  const logout = () => {
    storeLogout()
    router.push('/login')
  }

  // Check for existing session on mount and after hydration
  useEffect(() => {
    if (hasHydrated && typeof window !== 'undefined') {
      // Only run on client side after hydration
      checkAuth()
    }
  }, [hasHydrated, checkAuth])

  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    hasHydrated,
    error,
    login,
    logout,
    updateUser,
    checkAuth,
    setLoading,
    setError,
    clearError,
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook for accessing auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Convenience hooks for specific use cases
export function useRequireAuth(redirectTo = '/login') {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, router, redirectTo])

  return { isAuthenticated, isLoading }
}

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

// Export the store for direct access when needed
export { useAuthStore }