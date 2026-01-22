'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/theme-context'
import { Shield, WifiOff, Code } from 'lucide-react'
import { isDevMode } from '@/lib/dev-mode'

export function BottomNavbar() {
  const { themeColors } = useTheme()
  const pathname = usePathname()
  const [isMonitorOnline, setIsMonitorOnline] = React.useState(false)
  const [connectionStatus, setConnectionStatus] = React.useState<'connected' | 'disconnected'>('disconnected')
  const [isMockMode, setIsMockMode] = React.useState(false)

  React.useEffect(() => {
    const monitorStatus = sessionStorage.getItem('monitor_status')
    setIsMonitorOnline(monitorStatus === 'online')
    
    const mockMode = localStorage.getItem('mock_mode') === 'true'
    setIsMockMode(isDevMode() && mockMode)
    
    // Check initial connection status
    const checkConnectionStatus = () => {
      const sessionError = sessionStorage.getItem('session_error')
      const sessionId = typeof window !== 'undefined' ? localStorage.getItem('ascendara_session_id') : null
      const mockModeActive = localStorage.getItem('mock_mode') === 'true'
      
      if (mockModeActive && isDevMode()) {
        setConnectionStatus('connected')
        return
      }
      
      // Prioritize session error flag - if it's set, we're disconnected
      if (sessionError === 'true') {
        setConnectionStatus('disconnected')
      } else if (!sessionId) {
        setConnectionStatus('disconnected')
      } else {
        setConnectionStatus('connected')
      }
    }
    
    checkConnectionStatus()
    
    // Listen for storage events to update status in real-time
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ascendara_session_id' || e.key === null) {
        checkConnectionStatus()
      }
    }
    
    // Listen for custom session error events (fired by dashboard)
    const handleSessionError = () => {
      console.log('[BottomNavbar] Session error event received')
      checkConnectionStatus()
    }
    
    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('session-error', handleSessionError)
    
    // Poll connection status more frequently (every 500ms) for responsive updates
    const interval = setInterval(checkConnectionStatus, 500)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('session-error', handleSessionError)
      clearInterval(interval)
    }
  }, [])

  return (
    <div className={cn(
      "fixed bottom-4 left-4 mb-4 right-4 z-40 border rounded-lg backdrop-blur-lg shadow-lg",
      themeColors.card,
      themeColors.border
    )}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image src="/icon.png" alt="Ascendara" width={30} height={30} />
            </div>
            <div className="flex flex-col">
              <span className={cn("text-sm font-semibold leading-none", themeColors.text)}>
                Ascendara Webview
              </span>
              <div className="flex items-center gap-2 mt-1">
                {isMockMode && (
                  <div className={cn(
                    "text-xs leading-none inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit",
                    "bg-purple-500/10 border border-purple-500/20",
                    "animate-in fade-in slide-in-from-left-2 duration-500"
                  )}>
                    <Code className="h-3 w-3 text-purple-500" />
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      DEVELOPMENT
                    </span>
                  </div>
                )}
                {isMonitorOnline && !isMockMode && (
                  <div className={cn(
                    "text-xs leading-none inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md w-fit",
                    connectionStatus === 'connected' 
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : "bg-red-500/10 border border-red-500/20",
                    "animate-in fade-in slide-in-from-left-2 duration-500"
                  )}>
                    {connectionStatus === 'connected' ? (
                      <>
                        <Shield className="h-3 w-3 text-emerald-500 animate-pulse" />
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                         Encrypted Connection
                        </span>
                      </>
                    ) : (
                      <>
                        <WifiOff className="h-3 w-3 text-red-500" />
                        <span className="text-red-600 dark:text-red-400 font-medium">
                          Disconnected
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === '/dashboard' ? 'bg-accent' : '',
                themeColors.text
              )}
            >
              Downloads
            </Link>
            <Link
              href="/friends"
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === '/friends' ? 'bg-accent' : '',
                themeColors.text
              )}
            >
              Friends
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
