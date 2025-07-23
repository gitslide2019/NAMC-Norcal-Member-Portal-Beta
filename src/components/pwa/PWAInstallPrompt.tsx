'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DynamicIcon } from '@/components/ui/dynamic-icon'
import { usePWA } from '@/hooks/usePWA'
import { cn } from '@/lib/utils'

export interface PWAInstallPromptProps {
  className?: string
  compact?: boolean
  autoShow?: boolean
  onInstalled?: () => void
  onDismissed?: () => void
}

export function PWAInstallPrompt({
  className,
  compact = false,
  autoShow = true,
  onInstalled,
  onDismissed,
}: PWAInstallPromptProps) {
  const { isInstallable, isInstalled, isOnline, installPWA } = usePWA()
  const [isDismissed, setIsDismissed] = React.useState(false)
  const [showPrompt, setShowPrompt] = React.useState(false)

  // Auto-show prompt after a delay when installable
  React.useEffect(() => {
    if (autoShow && isInstallable && !isInstalled && !isDismissed) {
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 3000) // Show after 3 seconds
      
      return () => clearTimeout(timer)
    }
  }, [autoShow, isInstallable, isInstalled, isDismissed])

  const handleInstall = async () => {
    const success = await installPWA()
    if (success) {
      onInstalled?.()
      setShowPrompt(false)
    }
  }

  const handleDismiss = () => {
    setIsDismissed(true)
    setShowPrompt(false)
    onDismissed?.()
  }

  // Don't show if not installable, already installed, or dismissed
  if (!isInstallable || isInstalled || isDismissed) {
    return null
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 p-2 bg-namc-blue-50 border border-namc-blue-200 rounded-lg", className)}>
        <DynamicIcon name="Smartphone" className="w-5 h-5 text-namc-blue-600" size={20} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-namc-blue-900">Install NAMC Portal</p>
          <p className="text-xs text-namc-blue-700">Access your contractor tools offline</p>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" onClick={handleInstall} className="h-8 px-3 text-xs">
            Install
          </Button>
          <Button variant="ghost" size="sm" onClick={handleDismiss} className="h-8 w-8 p-0">
            <DynamicIcon name="X" size={14} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Backdrop */}
      {showPrompt && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className={cn("w-full max-w-md shadow-xl", className)}>
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 w-16 h-16 bg-namc-blue-100 rounded-2xl flex items-center justify-center">
                <DynamicIcon name="Smartphone" className="w-8 h-8 text-namc-blue-600" size={32} />
              </div>
              <CardTitle className="text-xl font-bold text-namc-gray-900">
                Install NAMC Portal
              </CardTitle>
              <p className="text-namc-gray-600 text-sm">
                Get the full contractor experience with offline access and notifications
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Features */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <DynamicIcon name="Wifi" className="w-3 h-3 text-green-600" size={12} />
                  </div>
                  <div>
                    <h4 className="font-medium text-namc-gray-900 text-sm">Work Offline</h4>
                    <p className="text-xs text-namc-gray-600">Access contractor directory and forms without internet</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <DynamicIcon name="Bell" className="w-3 h-3 text-blue-600" size={12} />
                  </div>
                  <div>
                    <h4 className="font-medium text-namc-gray-900 text-sm">Push Notifications</h4>
                    <p className="text-xs text-namc-gray-600">Get notified about new projects and messages</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <DynamicIcon name="Zap" className="w-3 h-3 text-purple-600" size={12} />
                  </div>
                  <div>
                    <h4 className="font-medium text-namc-gray-900 text-sm">Fast Access</h4>
                    <p className="text-xs text-namc-gray-600">Launch directly from your home screen</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <DynamicIcon name="Shield" className="w-3 h-3 text-orange-600" size={12} />
                  </div>
                  <div>
                    <h4 className="font-medium text-namc-gray-900 text-sm">Secure & Private</h4>
                    <p className="text-xs text-namc-gray-600">Your contractor data stays protected</p>
                  </div>
                </div>
              </div>
              
              {/* Status Indicators */}
              <div className="flex items-center justify-center gap-4 py-2 bg-namc-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "w-2 h-2 rounded-full",
                    isOnline ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-xs text-namc-gray-600">
                    {isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                <div className="w-px h-4 bg-namc-gray-300" />
                <div className="flex items-center gap-2">
                  <DynamicIcon name="Download" className="w-3 h-3 text-namc-gray-600" size={12} />
                  <span className="text-xs text-namc-gray-600">~2MB</span>
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleInstall}
                  className="flex-1 h-12 text-base font-medium"
                >
                  <DynamicIcon name="Download" className="w-5 h-5 mr-2" size={20} />
                  Install App
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleDismiss}
                  className="h-12 px-6"
                >
                  <DynamicIcon name="X" className="w-5 h-5" size={20} />
                </Button>
              </div>
              
              <p className="text-xs text-namc-gray-500 text-center">
                Free to install • Works on all devices • No app store required
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  )
}

// Floating install button for persistent access
export function PWAInstallButton({ className }: { className?: string }) {
  const { isInstallable, isInstalled, installPWA } = usePWA()
  const [isLoading, setIsLoading] = React.useState(false)

  if (!isInstallable || isInstalled) {
    return null
  }

  const handleInstall = async () => {
    setIsLoading(true)
    await installPWA()
    setIsLoading(false)
  }

  return (
    <Button
      onClick={handleInstall}
      disabled={isLoading}
      className={cn(
        "fixed bottom-4 right-4 z-40 shadow-lg hover:shadow-xl transition-shadow",
        "bg-namc-blue-600 hover:bg-namc-blue-700 text-white",
        className
      )}
      size="lg"
    >
      {isLoading ? (
        <DynamicIcon name="Loader2" className="w-5 h-5 mr-2 animate-spin" size={20} />
      ) : (
        <DynamicIcon name="Download" className="w-5 h-5 mr-2" size={20} />
      )}
      Install App
    </Button>
  )
}

// Offline indicator for when user is offline  
export function OfflineIndicator({ className }: { className?: string }) {
  const { isOnline, offlineQueue } = usePWA()

  if (isOnline) {
    return null
  }

  return (
    <div className={cn(
      "fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 text-center text-sm font-medium",
      className
    )}>
      <div className="flex items-center justify-center gap-2">
        <DynamicIcon name="WifiOff" className="w-4 h-4" size={16} />
        <span>You're offline</span>
        {offlineQueue.length > 0 && (
          <Badge variant="secondary" className="bg-white/20 text-white ml-2">
            {offlineQueue.length} pending
          </Badge>
        )}
      </div>
    </div>
  )
}

export default PWAInstallPrompt