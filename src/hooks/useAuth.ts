import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (token: string, user: AuthUser) => Promise<void>
  logout: () => void
  updateUser: (user: Partial<AuthUser>) => void
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (token: string, user: AuthUser) => {
        set({ 
          token, 
          user, 
          isAuthenticated: true,
          isLoading: false 
        })
      },

      logout: () => {
        // Call logout API to clear httpOnly cookie
        fetch('/api/auth/logout', {
          method: 'POST',
        }).catch(console.error)

        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
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
        try {
          set({ isLoading: true })
          
          const response = await fetch('/api/auth/me', {
            credentials: 'include', // Include httpOnly cookies
          })

          if (response.ok) {
            const data = await response.json()
            set({ 
              user: data.user, 
              token: data.token,
              isAuthenticated: true,
              isLoading: false 
            })
          } else {
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false,
              isLoading: false 
            })
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false,
            isLoading: false 
          })
        }
      },
    }),
    {
      name: 'namc-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)