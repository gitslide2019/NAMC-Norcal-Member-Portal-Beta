'use client'

import { useEffect } from 'react'
import { X, CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react'
import { useNotifications, Notification } from '@/store'
import { useIsHydrated } from './hydration-boundary'
import { cn } from '@/lib/utils'

const notificationIcons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info,
}

const notificationStyles = {
  success: 'bg-namc-green-50 border-namc-green-200 text-namc-green-800',
  error: 'bg-namc-red-50 border-namc-red-200 text-namc-red-800',
  warning: 'bg-namc-gold-50 border-namc-gold-200 text-namc-gold-800',
  info: 'bg-namc-blue-50 border-namc-blue-200 text-namc-blue-800',
}

const iconStyles = {
  success: 'text-namc-green-600',
  error: 'text-namc-red-600',
  warning: 'text-namc-gold-600',
  info: 'text-namc-blue-600',
}

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
}

function NotificationItem({ notification, onRemove }: NotificationItemProps) {
  const Icon = notificationIcons[notification.type]

  useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id)
      }, notification.duration)

      return () => clearTimeout(timer)
    }
  }, [notification.id, notification.duration, onRemove])

  return (
    <div
      className={cn(
        'relative p-4 rounded-lg border shadow-lg max-w-sm w-full transition-all duration-300 ease-in-out',
        'animate-slide-in',
        notificationStyles[notification.type]
      )}
      role="alert"
    >
      <div className="flex items-start space-x-3">
        <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconStyles[notification.type])} />
        
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold truncate">
            {notification.title}
          </h4>
          
          {notification.message && (
            <p className="text-sm mt-1 opacity-90">
              {notification.message}
            </p>
          )}

          {notification.action && (
            <button
              onClick={notification.action.onClick}
              className="text-sm font-medium underline mt-2 hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
            >
              {notification.action.label}
            </button>
          )}
        </div>

        <button
          onClick={() => onRemove(notification.id)}
          className="flex-shrink-0 p-1 rounded-md hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export function NotificationSystem() {
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
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  )
}

// Utility function to show notifications from anywhere in the app
export function useNotify() {
  const { addNotification } = useNotifications()

  const notify = {
    success: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'success', title, message, ...options }),
    
    error: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'error', title, message, duration: 8000, ...options }),
    
    warning: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'warning', title, message, duration: 6000, ...options }),
    
    info: (title: string, message?: string, options?: Partial<Omit<Notification, 'id' | 'type' | 'title' | 'message'>>) =>
      addNotification({ type: 'info', title, message, ...options }),
  }

  return notify
}