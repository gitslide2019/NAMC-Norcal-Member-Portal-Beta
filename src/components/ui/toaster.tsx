'use client'

import { useNotifications } from '@/store/ui-store'
import { useIsHydrated } from './hydration-boundary'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { useEffect } from 'react'

const notificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const notificationStyles = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
}

const iconStyles = {
  success: 'text-green-600',
  error: 'text-red-600',
  warning: 'text-yellow-600',
  info: 'text-blue-600',
}

interface ToastProps {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
  onRemove: (id: string) => void
}

function Toast({ id, type, title, message, duration, onRemove }: ToastProps) {
  const Icon = notificationIcons[type]

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        onRemove(id)
      }, duration)

      return () => clearTimeout(timer)
    }
  }, [id, duration, onRemove])

  return (
    <div
      className={`relative p-4 rounded-lg border shadow-lg max-w-sm w-full transition-all duration-300 ease-in-out transform translate-x-0 ${notificationStyles[type]}`}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${iconStyles[type]}`} />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">
            {title}
          </h4>
          
          {message && (
            <p className="text-sm mt-1 opacity-90">
              {message}
            </p>
          )}
        </div>

        <button
          onClick={() => onRemove(id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function Toaster() {
  const isHydrated = useIsHydrated()
  const { notifications, removeNotification } = useNotifications()

  // Don't render until hydrated to prevent SSR mismatch
  if (!isHydrated || notifications.length === 0) {
    return null
  }

  return (
    <div 
      className="fixed top-4 right-4 z-50 space-y-2 max-h-screen overflow-y-auto"
      aria-live="polite"
      aria-label="Notifications"
    >
      {notifications.map((notification) => (
        <Toast
          key={notification.id}
          id={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          duration={notification.duration}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}