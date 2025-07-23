'use client'

import React, { useEffect } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/hooks/useAuth'
import { Toaster } from '@/components/ui/toaster'

interface ProvidersProps {
  children: React.ReactNode
}

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

function AuthProvider({ children }: { children: React.ReactNode }) {
  const { checkAuth } = useAuth()

  useEffect(() => {
    // Check authentication status on app load
    checkAuth()
  }, [checkAuth])

  return <>{children}</>
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        {children}
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  )
}