import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  setUser: (user: AuthUser | null) => void
  setToken: (token: string | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  login: (user: AuthUser, token: string) => void
  logout: () => void
  clearError: () => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      setUser: (user) => set({ 
        user, 
        isAuthenticated: !!user 
      }),

      setToken: (token) => set({ token }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error }),

      login: (user, token) => set({
        user,
        token,
        isAuthenticated: true,
        error: null,
        isLoading: false
      }),

      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
        isLoading: false
      }),

      clearError: () => set({ error: null })
    }),
    {
      name: 'namc-auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Selectors for common use cases
export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error } = useAuthStore()
  return { user, isAuthenticated, isLoading, error }
}

export const useAuthActions = () => {
  const { login, logout, setLoading, setError, clearError } = useAuthStore()
  return { login, logout, setLoading, setError, clearError }
}

export const useIsAdmin = () => {
  const user = useAuthStore((state) => state.user)
  return user?.memberType === 'admin'
}