'use client'

import { useEffect, useState } from 'react'
import { useUIStore } from '@/store/ui-store'

interface HydrationBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function HydrationBoundary({ children, fallback }: HydrationBoundaryProps) {
  const [isMounted, setIsMounted] = useState(false)
  const hasHydrated = useUIStore((state) => state.hasHydrated)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Don't render children until both mounted and hydrated
  if (!isMounted || !hasHydrated) {
    return fallback || (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <>{children}</>
}

// Hook to check if component is safely hydrated
export function useIsHydrated() {
  const [isMounted, setIsMounted] = useState(false)
  const hasHydrated = useUIStore((state) => state.hasHydrated)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return isMounted && hasHydrated
}