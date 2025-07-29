import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface UIState {
  theme: 'light' | 'dark' | 'system'
  sidebarOpen: boolean
  notifications: Notification[]
  loading: Record<string, boolean>
  modals: Record<string, boolean>
}

interface UIActions {
  setTheme: (theme: 'light' | 'dark' | 'system') => void
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  setLoading: (key: string, loading: boolean) => void
  clearLoading: (key: string) => void
  openModal: (modalId: string) => void
  closeModal: (modalId: string) => void
  toggleModal: (modalId: string) => void
}

// Add hydration state
interface UIStateWithHydration extends UIState {
  hasHydrated: boolean
}

interface UIActionsWithHydration extends UIActions {
  setHasHydrated: (hasHydrated: boolean) => void
}

export type UIStore = UIStateWithHydration & UIActionsWithHydration

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      // State
      theme: 'system',
      sidebarOpen: true,
      notifications: [],
      loading: {},
      modals: {},
      hasHydrated: false,

      // Actions
      setTheme: (theme) => set({ theme }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      toggleSidebar: () => set((state) => ({ 
        sidebarOpen: !state.sidebarOpen 
      })),

      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

      addNotification: (notification) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9)
        const newNotification: Notification = {
          id,
          duration: 5000, // Default 5 seconds
          ...notification
        }

        set((state) => ({
          notifications: [...state.notifications, newNotification]
        }))

        // Only set timeout on client side after hydration
        if (typeof window !== 'undefined' && newNotification.duration && newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id)
          }, newNotification.duration)
        }
      },

      removeNotification: (id) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),

      clearNotifications: () => set({ notifications: [] }),

      setLoading: (key, loading) => set((state) => ({
        loading: { ...state.loading, [key]: loading }
      })),

      clearLoading: (key) => set((state) => {
        const { [key]: _, ...rest } = state.loading
        return { loading: rest }
      }),

      openModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: true }
      })),

      closeModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: false }
      })),

      toggleModal: (modalId) => set((state) => ({
        modals: { ...state.modals, [modalId]: !state.modals[modalId] }
      }))
    }),
    {
      name: 'namc-ui-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      }
    }
  )
)

// Selectors for common use cases
export const useTheme = () => {
  const theme = useUIStore((state) => state.theme)
  const setTheme = useUIStore((state) => state.setTheme)
  return { theme, setTheme }
}

export const useSidebar = () => {
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore()
  return { sidebarOpen, toggleSidebar, setSidebarOpen }
}

export const useNotifications = () => {
  const { notifications, addNotification, removeNotification, clearNotifications } = useUIStore()
  return { notifications, addNotification, removeNotification, clearNotifications }
}

export const useLoading = (key?: string) => {
  const { loading, setLoading, clearLoading } = useUIStore()
  
  if (key) {
    return {
      isLoading: loading[key] || false,
      setLoading: (isLoading: boolean) => setLoading(key, isLoading),
      clearLoading: () => clearLoading(key)
    }
  }
  
  return { loading, setLoading, clearLoading }
}

export const useModal = (modalId: string) => {
  const { modals, openModal, closeModal, toggleModal } = useUIStore()
  
  return {
    isOpen: modals[modalId] || false,
    open: () => openModal(modalId),
    close: () => closeModal(modalId),
    toggle: () => toggleModal(modalId)
  }
}