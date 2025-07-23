'use client'

import { useEffect, useState, useCallback } from 'react'

export interface PWAInstallPrompt {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface OfflineQueueItem {
  id: string
  type: 'contractor-form' | 'message' | 'project-application'
  data: any
  timestamp: number
  token?: string
}

export interface PWAState {
  isOnline: boolean
  isInstallable: boolean
  isInstalled: boolean
  hasUpdate: boolean
  offlineQueue: OfflineQueueItem[]
  isRegistered: boolean
}

const DB_NAME = 'namc-offline-storage'
const DB_VERSION = 1

export function usePWA() {
  const [state, setState] = useState<PWAState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isInstallable: false,
    isInstalled: false,
    hasUpdate: false,
    offlineQueue: [],
    isRegistered: false,
  })

  const [installPrompt, setInstallPrompt] = useState<PWAInstallPrompt | null>(null)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  // Initialize IndexedDB for offline storage
  const initDB = useCallback(() => {
    return new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)
      
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        
        // Create object stores for different types of offline data
        if (!db.objectStoreNames.contains('contractor-forms')) {
          db.createObjectStore('contractor-forms', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' })
        }
        
        if (!db.objectStoreNames.contains('project-applications')) {
          db.createObjectStore('project-applications', { keyPath: 'id' })
        }
      }
    })
  }, [])

  // Register service worker
  const registerServiceWorker = useCallback(async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
        })
        
        setRegistration(reg)
        setState(prev => ({ ...prev, isRegistered: true }))
        
        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setState(prev => ({ ...prev, hasUpdate: true }))
              }
            })
          }
        })
        
        // Handle service worker messages
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'NOTIFICATION_CLICK') {
            // Handle notification clicks
            window.location.href = event.data.url
          }
        })
        
        console.log('NAMC Portal: Service Worker registered successfully')
        return reg
      } catch (error) {
        console.error('NAMC Portal: Service Worker registration failed', error)
        return null
      }
    }
    return null
  }, [])

  // Install PWA
  const installPWA = useCallback(async () => {
    if (installPrompt) {
      try {
        await installPrompt.prompt()
        const choice = await installPrompt.userChoice
        
        if (choice.outcome === 'accepted') {
          setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }))
          setInstallPrompt(null)
        }
        
        return choice.outcome === 'accepted'
      } catch (error) {
        console.error('NAMC Portal: PWA installation failed', error)
        return false
      }
    }
    return false
  }, [installPrompt])

  // Update service worker
  const updateServiceWorker = useCallback(async () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
      window.location.reload()
    }
  }, [registration])

  // Add item to offline queue
  const addToOfflineQueue = useCallback(async (item: Omit<OfflineQueueItem, 'id' | 'timestamp'>) => {
    try {
      const db = await initDB()
      const queueItem: OfflineQueueItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        ...item,
      }
      
      const transaction = db.transaction([item.type], 'readwrite')
      const store = transaction.objectStore(item.type)
      await store.add(queueItem)
      
      setState(prev => ({
        ...prev,
        offlineQueue: [...prev.offlineQueue, queueItem]
      }))
      
      // Register background sync if available
      if ('serviceWorker' in navigator && registration && 'sync' in registration) {
        await registration.sync.register(`${item.type}-sync`)
      }
      
      return queueItem.id
    } catch (error) {
      console.error('NAMC Portal: Failed to add item to offline queue', error)
      return null
    }
  }, [initDB, registration])

  // Get offline queue
  const getOfflineQueue = useCallback(async () => {
    try {
      const db = await initDB()
      const stores = ['contractor-forms', 'messages', 'project-applications']
      const allItems: OfflineQueueItem[] = []
      
      for (const storeName of stores) {
        const transaction = db.transaction([storeName], 'readonly')
        const store = transaction.objectStore(storeName)
        const items = await store.getAll()
        allItems.push(...items)
      }
      
      setState(prev => ({ ...prev, offlineQueue: allItems }))
      return allItems
    } catch (error) {
      console.error('NAMC Portal: Failed to get offline queue', error)
      return []
    }
  }, [initDB])

  // Clear offline queue item
  const clearOfflineQueueItem = useCallback(async (itemId: string, type: string) => {
    try {
      const db = await initDB()
      const transaction = db.transaction([type], 'readwrite')
      const store = transaction.objectStore(type)
      await store.delete(itemId)
      
      setState(prev => ({
        ...prev,
        offlineQueue: prev.offlineQueue.filter(item => item.id !== itemId)
      }))
      
      return true
    } catch (error) {
      console.error('NAMC Portal: Failed to clear offline queue item', error)
      return false
    }
  }, [initDB])

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }
    return false
  }, [])

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async () => {
    if (registration && 'PushManager' in window) {
      try {
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        })
        
        // Send subscription to server
        await fetch('/api/push/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscription),
        })
        
        return subscription
      } catch (error) {
        console.error('NAMC Portal: Push notification subscription failed', error)
        return null
      }
    }
    return null
  }, [registration])

  // Check if app is installed
  const checkIfInstalled = useCallback(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isIOSStandalone = isIOS && (window.navigator as any).standalone
    
    return isStandalone || isIOSStandalone
  }, [])

  // Initialize PWA functionality
  useEffect(() => {
    const init = async () => {
      // Check if already installed
      setState(prev => ({ ...prev, isInstalled: checkIfInstalled() }))
      
      // Register service worker
      await registerServiceWorker()
      
      // Initialize offline database
      await initDB()
      
      // Load offline queue
      await getOfflineQueue()
      
      // Listen for install prompt
      const handleBeforeInstallPrompt = (e: Event) => {
        e.preventDefault()
        setInstallPrompt(e as any)
        setState(prev => ({ ...prev, isInstallable: true }))
      }
      
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      
      // Listen for app installed
      window.addEventListener('appinstalled', () => {
        setState(prev => ({ ...prev, isInstalled: true, isInstallable: false }))
        setInstallPrompt(null)
      })
      
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      }
    }
    
    init()
  }, [registerServiceWorker, initDB, getOfflineQueue, checkIfInstalled])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setState(prev => ({ ...prev, isOnline: true }))
      
      // Trigger background sync when coming back online
      if (registration && 'sync' in registration) {
        registration.sync.register('contractor-form-sync')
        registration.sync.register('message-sync')
        registration.sync.register('project-application-sync')
      }
    }
    
    const handleOffline = () => {
      setState(prev => ({ ...prev, isOnline: false }))
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [registration])

  return {
    ...state,
    installPWA,
    updateServiceWorker,
    addToOfflineQueue,
    getOfflineQueue,
    clearOfflineQueueItem,
    requestNotificationPermission,
    subscribeToPushNotifications,
  }
}