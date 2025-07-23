'use client'

import { ReactNode } from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { NotificationSystem } from '@/components/ui/notification-system'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <NotificationSystem />
    </AuthProvider>
  )
}