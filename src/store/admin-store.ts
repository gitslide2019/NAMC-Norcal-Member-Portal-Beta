import { create } from 'zustand'
import { User, AdminAction, SystemMetric } from '@/types'

interface AdminState {
  users: User[]
  totalUsers: number
  adminActions: AdminAction[]
  systemMetrics: SystemMetric[]
  selectedUser: User | null
  filters: {
    userType: 'all' | 'regular' | 'admin'
    status: 'all' | 'active' | 'inactive'
    dateRange: {
      start: Date | null
      end: Date | null
    }
  }
  pagination: {
    page: number
    limit: number
    total: number
  }
  isLoading: boolean
  error: string | null
}

interface AdminActions {
  // User management
  setUsers: (users: User[]) => void
  addUser: (user: User) => void
  updateUser: (user: User) => void
  deleteUser: (userId: string) => void
  setSelectedUser: (user: User | null) => void
  
  // Admin actions (audit log)
  setAdminActions: (actions: AdminAction[]) => void
  addAdminAction: (action: AdminAction) => void
  
  // System metrics
  setSystemMetrics: (metrics: SystemMetric[]) => void
  addSystemMetric: (metric: SystemMetric) => void
  
  // Filters and pagination
  setFilter: (key: keyof AdminState['filters'], value: any) => void
  setPagination: (pagination: Partial<AdminState['pagination']>) => void
  resetFilters: () => void
  
  // Loading and error states
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
}

export type AdminStore = AdminState & AdminActions

const initialFilters: AdminState['filters'] = {
  userType: 'all',
  status: 'all',
  dateRange: {
    start: null,
    end: null
  }
}

const initialPagination: AdminState['pagination'] = {
  page: 1,
  limit: 20,
  total: 0
}

export const useAdminStore = create<AdminStore>()((set, get) => ({
  // State
  users: [],
  totalUsers: 0,
  adminActions: [],
  systemMetrics: [],
  selectedUser: null,
  filters: initialFilters,
  pagination: initialPagination,
  isLoading: false,
  error: null,

  // User management actions
  setUsers: (users) => set({ users }),

  addUser: (user) => set((state) => ({
    users: [...state.users, user],
    totalUsers: state.totalUsers + 1
  })),

  updateUser: (updatedUser) => set((state) => ({
    users: state.users.map(user => 
      user.id === updatedUser.id ? updatedUser : user
    ),
    selectedUser: state.selectedUser?.id === updatedUser.id ? updatedUser : state.selectedUser
  })),

  deleteUser: (userId) => set((state) => ({
    users: state.users.filter(user => user.id !== userId),
    totalUsers: state.totalUsers - 1,
    selectedUser: state.selectedUser?.id === userId ? null : state.selectedUser
  })),

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  // Admin actions
  setAdminActions: (adminActions) => set({ adminActions }),

  addAdminAction: (action) => set((state) => ({
    adminActions: [action, ...state.adminActions]
  })),

  // System metrics
  setSystemMetrics: (systemMetrics) => set({ systemMetrics }),

  addSystemMetric: (metric) => set((state) => ({
    systemMetrics: [metric, ...state.systemMetrics]
  })),

  // Filters and pagination
  setFilter: (key, value) => set((state) => ({
    filters: { ...state.filters, [key]: value },
    pagination: { ...state.pagination, page: 1 } // Reset to first page when filtering
  })),

  setPagination: (pagination) => set((state) => ({
    pagination: { ...state.pagination, ...pagination }
  })),

  resetFilters: () => set({
    filters: initialFilters,
    pagination: initialPagination
  }),

  // Loading and error states
  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null })
}))

// Selectors for common use cases
export const useAdminUsers = () => {
  const { users, totalUsers, selectedUser, setSelectedUser } = useAdminStore()
  return { users, totalUsers, selectedUser, setSelectedUser }
}

export const useAdminActions = () => {
  const { adminActions, setAdminActions, addAdminAction } = useAdminStore()
  return { adminActions, setAdminActions, addAdminAction }
}

export const useAdminFilters = () => {
  const { filters, setFilter, resetFilters } = useAdminStore()
  return { filters, setFilter, resetFilters }
}

export const useAdminPagination = () => {
  const { pagination, setPagination } = useAdminStore()
  return { pagination, setPagination }
}

export const useAdminState = () => {
  const { isLoading, error, setLoading, setError, clearError } = useAdminStore()
  return { isLoading, error, setLoading, setError, clearError }
}