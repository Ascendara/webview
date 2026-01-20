'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { DownloadCard } from '@/components/download-card'
import { DownloadSkeleton } from '@/components/download-skeleton'
import { Button } from '@/components/ui/button'
import { ThemeSelectorModal } from '@/components/theme-selector-modal'
import { ThemeButton } from '@/components/theme-button'
import { InstallPrompt } from '@/components/install-prompt'
import { BottomNavbar } from '@/components/bottom-navbar'
import { apiClient, Download } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '@/contexts/theme-context'
import { RefreshCw, LogOut, Download as DownloadIcon, Inbox, AlertTriangle } from 'lucide-react'
import { config } from '@/lib/config'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

export default function Dashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const { themeColors } = useTheme()
  const [downloads, setDownloads] = React.useState<Download[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [lastUpdated, setLastUpdated] = React.useState<Date | null>(null)
  const [showThemeSelector, setShowThemeSelector] = React.useState(false)
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = React.useState(false)
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const sessionId = apiClient.getSessionId()
    if (!sessionId) {
      router.push('/')
      return
    }

    let isMounted = true
    console.log('[Dashboard] Effect running, isMounted:', isMounted)
    console.log('[Dashboard] Setting up polling with interval:', config.pollingInterval, 'ms')
    console.log('[Dashboard] This equals', config.pollingInterval / 1000, 'seconds')
    
    const fetchDownloads = async (showLoading = false) => {
      if (!isMounted) {
        console.log('[Dashboard] Component unmounted, skipping fetch')
        return
      }
      
      const now = new Date();
      console.log(`[Dashboard] fetchDownloads called at ${now.toLocaleTimeString()}.${now.getMilliseconds()}`)
      
      if (showLoading) setIsRefreshing(true)

      try {
        const response = await apiClient.getDownloads()

        if (!isMounted) return

        if (response.success && response.data) {
          setDownloads(response.data.downloads)
          setLastUpdated(new Date())
        } else {
          if (response.error?.includes('Unauthorized') || response.error?.includes('session')) {
            // Session was revoked or expired - show alert dialog
            console.warn('[Dashboard] Session expired or revoked:', response.error)
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            setShowSessionExpiredDialog(true)
          } else {
            toast({
              title: 'Failed to fetch downloads',
              description: response.error,
              variant: 'destructive',
            })
          }
        }
      } catch (error) {
        if (!isMounted) return
        console.error('[Dashboard] Fetch error:', error)
        toast({
          title: 'Connection Error',
          description: 'Unable to reach Ascendara',
          variant: 'destructive',
        })
      } finally {
        if (isMounted) {
          setIsLoading(false)
          if (showLoading) setIsRefreshing(false)
        }
      }
    }
    
    fetchDownloads()

    if (pollingIntervalRef.current) {
      console.log('[Dashboard] Clearing existing interval before creating new one')
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(() => {
      console.log('[Dashboard] Polling interval triggered')
      fetchDownloads(false)
    }, config.pollingInterval)
    
    console.log('[Dashboard] Polling interval created with ID:', pollingIntervalRef.current)

    return () => {
      console.log('[Dashboard] Cleanup function called')
      isMounted = false
      if (pollingIntervalRef.current) {
        console.log('[Dashboard] Clearing interval:', pollingIntervalRef.current)
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
    }
  }, [])

  const refreshDownloads = React.useCallback(async () => {
    setIsRefreshing(true)
    try {
      const response = await apiClient.getDownloads()
      if (response.success && response.data) {
        setDownloads(response.data.downloads)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('[Dashboard] Error refreshing downloads:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handlePause = async (id: string) => {
    const response = await apiClient.pauseDownload(id)
    if (response.success) {
      toast({
        title: 'Download Paused',
        description: 'Download has been paused',
      })
      refreshDownloads()
    } else {
      toast({
        title: 'Failed to pause',
        description: response.error,
        variant: 'destructive',
      })
    }
  }

  const handleResume = async (id: string) => {
    const response = await apiClient.resumeDownload(id)
    if (response.success) {
      toast({
        title: 'Download Resumed',
        description: 'Download has been resumed',
      })
      refreshDownloads()
    } else {
      toast({
        title: 'Failed to resume',
        description: response.error,
        variant: 'destructive',
      })
    }
  }

  const handleCancel = async (id: string) => {
    const response = await apiClient.cancelDownload(id)
    if (response.success) {
      toast({
        title: 'Download Cancelled',
        description: 'Download has been cancelled',
      })
      refreshDownloads()
    } else {
      toast({
        title: 'Failed to cancel',
        description: response.error,
        variant: 'destructive',
      })
    }
  }

  const handleDisconnect = async () => {
    console.log('[Dashboard] Disconnect button clicked')
    
    try {
      const response = await apiClient.disconnect()
      
      if (response.success) {
        toast({
          title: 'Disconnected',
          description: 'Device has been removed from your account',
        })
      } else {
        console.warn('[Dashboard] Disconnect failed:', response.error)
        toast({
          title: 'Disconnected Locally',
          description: 'Session cleared from this device',
        })
      }
    } catch (error) {
      console.error('[Dashboard] Disconnect error:', error)
      toast({
        title: 'Disconnected Locally',
        description: 'Session cleared from this device',
      })
    }
    
    router.push('/')
  }

  const activeDownloads = downloads.filter(d => 
    d.status === 'downloading' || d.status === 'queued'
  )
  const pausedDownloads = downloads.filter(d => d.status === 'paused')
  const completedDownloads = downloads.filter(d => d.status === 'completed')
  const errorDownloads = downloads.filter(d => d.status === 'error')

  return (
    <>
      <div className={cn("min-h-screen bg-gradient-to-br pb-16", themeColors.bg)}>
        <div className={cn("sticky top-0 z-10 backdrop-blur-lg border-b", themeColors.card, themeColors.border)}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className={cn("text-xl font-bold", themeColors.text)}>Downloads</h1>
                  {lastUpdated && (
                    <p className="text-xs text-muted-foreground">
                      Updated {lastUpdated.toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeButton onClick={() => setShowThemeSelector(true)} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={refreshDownloads}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        </div>

      <div className="container mx-auto px-4 py-6 space-y-8">
        {isLoading ? (
          <div className="space-y-4">
            <DownloadSkeleton />
            <DownloadSkeleton />
            <DownloadSkeleton />
          </div>
        ) : downloads.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
              <Inbox className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No Active Downloads</h2>
            <p className="text-muted-foreground max-w-md">
              Start a download in Ascendara to monitor it here
            </p>
          </div>
        ) : (
          <>
            {activeDownloads.length > 0 && (
              <div className="space-y-4">
                <h2 className={cn("text-lg font-semibold flex items-center gap-2", themeColors.text)}>
                  <div className={cn("w-2 h-2 rounded-full animate-pulse", themeColors.primary)} />
                  Active Downloads ({activeDownloads.length})
                </h2>
                <div className="space-y-4">
                  {activeDownloads.map((download) => (
                    <DownloadCard
                      key={download.id}
                      download={download}
                      onPause={handlePause}
                      onResume={handleResume}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </div>
            )}

            {pausedDownloads.length > 0 && (
              <div className="space-y-4">
                <h2 className={cn("text-lg font-semibold", themeColors.text)}>
                  Paused Downloads ({pausedDownloads.length})
                </h2>
                <div className="space-y-4">
                  {pausedDownloads.map((download) => (
                    <DownloadCard
                      key={download.id}
                      download={download}
                      onPause={handlePause}
                      onResume={handleResume}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </div>
            )}

            {errorDownloads.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  Failed Downloads ({errorDownloads.length})
                </h2>
                <div className="space-y-4">
                  {errorDownloads.map((download) => (
                    <DownloadCard
                      key={download.id}
                      download={download}
                      onPause={handlePause}
                      onResume={handleResume}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedDownloads.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-green-600 dark:text-green-400">
                  Completed ({completedDownloads.length})
                </h2>
                <div className="space-y-4">
                  {completedDownloads.map((download) => (
                    <DownloadCard
                      key={download.id}
                      download={download}
                      onPause={handlePause}
                      onResume={handleResume}
                      onCancel={handleCancel}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
    
    <ThemeSelectorModal 
      isOpen={showThemeSelector} 
      onClose={() => setShowThemeSelector(false)} 
    />

    <AlertDialog 
      open={showSessionExpiredDialog}
      onOpenChange={setShowSessionExpiredDialog}
    >
      <AlertDialogContent className="max-w-[90vw] sm:max-w-md p-4 sm:p-6 gap-3">
        <AlertDialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-base sm:text-lg">Session Expired</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs sm:text-sm">
            Your session was revoked or expired.
            <ul className="list-disc list-inside mt-2 space-y-0.5 text-xs sm:text-sm">
              <li>Disconnected from another device</li>
              <li>Session timed out</li>
              <li>Connection code expired</li>
            </ul>
            <p className="mt-2 sm:mt-3 font-medium text-xs sm:text-sm">
              Please reconnect with a new code.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-2">
          <AlertDialogAction
            onClick={() => {
              apiClient.clearSession()
              setShowSessionExpiredDialog(false)
              router.push('/')
            }}
            className="w-full sm:w-auto text-sm"
          >
            Reconnect
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <InstallPrompt />
    <BottomNavbar />
  </>
  )
}
