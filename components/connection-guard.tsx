'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { useTheme } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'
import { WifiOff, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { themeColors } = useTheme()
  const [isChecking, setIsChecking] = React.useState(true)
  const [isDisconnected, setIsDisconnected] = React.useState(false)

  React.useEffect(() => {
    const checkConnection = () => {
      const sessionError = sessionStorage.getItem('session_error')
      const sessionId = apiClient.getSessionId()
      
      if (sessionError === 'true' || !sessionId) {
        setIsDisconnected(true)
        setIsChecking(false)
        return false
      }
      
      setIsDisconnected(false)
      setIsChecking(false)
      return true
    }

    checkConnection()

    const handleSessionError = () => {
      console.log('[ConnectionGuard] Session error detected')
      setIsDisconnected(true)
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'ascendara_session_id' || e.key === null) {
        checkConnection()
      }
    }

    window.addEventListener('session-error', handleSessionError)
    window.addEventListener('storage', handleStorageChange)

    const interval = setInterval(checkConnection, 1000)

    return () => {
      window.removeEventListener('session-error', handleSessionError)
      window.removeEventListener('storage', handleStorageChange)
      clearInterval(interval)
    }
  }, [])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (isDisconnected) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center bg-gradient-to-br p-4", themeColors.bg)}>
        <div className={cn("max-w-md w-full rounded-lg border p-8 text-center shadow-lg", themeColors.card, themeColors.border)}>
          <div className={cn("mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4", themeColors.secondary)}>
            <WifiOff className={cn("h-8 w-8", themeColors.accent)} />
          </div>
          <h2 className={cn("text-2xl font-bold mb-2", themeColors.text)}>
            Connection Lost
          </h2>
          <p className={cn("mb-6 opacity-70", themeColors.text)}>
            Your session has expired or been disconnected. Please reconnect to continue.
          </p>
          <div className="space-y-2">
            <div className={cn("text-xs opacity-60 mb-4", themeColors.text)}>
              <p>Possible reasons:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Session expired</li>
                <li>Disconnected from another device</li>
                <li>Connection code revoked</li>
              </ul>
            </div>
            <Button
              onClick={() => {
                apiClient.clearSession()
                sessionStorage.removeItem('session_error')
                router.push('/')
              }}
              className="w-full"
            >
              Reconnect
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
