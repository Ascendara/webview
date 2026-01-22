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
import { RefreshCw, LogOut, Download as DownloadIcon, Inbox, AlertTriangle, Users, Circle } from 'lucide-react'
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
  const [loadingDownloads, setLoadingDownloads] = React.useState<Set<string>>(new Set())
  const [userName, setUserName] = React.useState<string>('')
  const [friends, setFriends] = React.useState<Array<{
    uid: string;
    displayName: string;
    photoURL: string;
    status: { status: string; customMessage: string };
  }>>([])
  const pausedDownloadCache = React.useRef<Map<string, { progress: number; downloaded: string }>>(new Map())
  const previousDownloadsRef = React.useRef<Map<string, Download>>(new Map())
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
    
    const fetchUserName = async () => {
      try {
        const response = await apiClient.getUserName()
        if (response.success && response.data) {
          setUserName(response.data.displayName)
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching username:', error)
      }
    }
    
    const fetchFriends = async () => {
      try {
        const response = await apiClient.getFriends()
        if (response.success && response.data) {
          setFriends(response.data.friends)
        }
      } catch (error) {
        console.error('[Dashboard] Error fetching friends:', error)
      }
    }
    
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
          // Check if there are new downloads and show immediate feedback
          if (response.data.hasNewDownloads && response.data.newDownloadsInfo && response.data.newDownloadsInfo.length > 0) {
            console.log('[Dashboard] New downloads detected:', response.data.newDownloadsInfo)
            
            // Create placeholder downloads for instant feedback
            const placeholderDownloads: Download[] = response.data.newDownloadsInfo.map(downloadInfo => {
              // Check if this download is already in the response
              const existingDownload = response.data!.downloads.find(d => d.id === downloadInfo.id)
              if (existingDownload) {
                return existingDownload
              }
              
              // Create placeholder for downloads not yet in the list with actual name
              return {
                id: downloadInfo.id,
                name: downloadInfo.name,
                status: 'queued' as const,
                progress: 0,
                downloaded: '0 B',
                size: 'Unknown',
                speed: '0 B/s',
                eta: 'Calculating...',
                error: null,
                paused: false,
                stopped: false,
                timestamp: new Date().toISOString()
              }
            })
            
            // Add placeholders immediately
            setDownloads(prev => {
              const existingIds = new Set(prev.map(d => d.id))
              const newPlaceholders = placeholderDownloads.filter(p => !existingIds.has(p.id))
              return [...newPlaceholders, ...prev]
            })
          }
          
          const downloadsWithCache = response.data.downloads.map(download => {
            const previousDownload = previousDownloadsRef.current.get(download.id)
            
            // Detect transition from downloading/queued to paused/stopped
            if ((download.status === 'paused' || download.status === 'stopped')) {
              console.log(`[Dashboard] Processing paused download ${download.id}, current API values:`, { 
                progress: download.progress, 
                downloaded: download.downloaded,
                hasCache: pausedDownloadCache.current.has(download.id)
              })
              
              // Cache on transition: if previous was downloading/queued and had progress
              if (previousDownload && 
                  (previousDownload.status === 'downloading' || previousDownload.status === 'queued') &&
                  previousDownload.progress > 0) {
                pausedDownloadCache.current.set(download.id, {
                  progress: previousDownload.progress,
                  downloaded: previousDownload.downloaded
                })
                console.log(`[Dashboard] ✓ Cached on transition for ${download.id}:`, { 
                  progress: previousDownload.progress, 
                  downloaded: previousDownload.downloaded 
                })
              }
              
              // If API still has progress (shouldn't happen but handle it), cache it
              if (download.progress > 0 && !pausedDownloadCache.current.has(download.id)) {
                pausedDownloadCache.current.set(download.id, {
                  progress: download.progress,
                  downloaded: download.downloaded
                })
                console.log(`[Dashboard] Cached from API for ${download.id}:`, { 
                  progress: download.progress, 
                  downloaded: download.downloaded 
                })
              }
              
              // Apply cached values
              const cached = pausedDownloadCache.current.get(download.id)
              if (cached) {
                console.log(`[Dashboard] ✓ Applying cache for ${download.id}:`, cached)
                return { ...download, progress: cached.progress, downloaded: cached.downloaded }
              } else {
                console.warn(`[Dashboard] ⚠ No cache for paused ${download.id}!`)
              }
            }
            
            // Clear cache when download resumes
            if (download.status === 'downloading' || download.status === 'queued') {
              if (pausedDownloadCache.current.has(download.id)) {
                console.log(`[Dashboard] Clearing cache for resumed ${download.id}`)
                pausedDownloadCache.current.delete(download.id)
              }
            }
            
            return download
          })
          
          // Update previousDownloadsRef with RAW API data (not cached)
          // This allows us to detect transitions on the next poll
          response.data.downloads.forEach(download => {
            previousDownloadsRef.current.set(download.id, download)
          })
          
          // Merge with existing downloads to preserve placeholders that haven't appeared in API yet
          setDownloads(prev => {
            const apiDownloadIds = new Set(downloadsWithCache.map(d => d.id))
            // Keep placeholders that aren't in the API response yet (they're still being processed)
            const preservedPlaceholders = prev.filter(d => 
              !apiDownloadIds.has(d.id) && d.status === 'queued' && d.eta === 'Calculating...'
            )
            // Combine API downloads with preserved placeholders
            return [...downloadsWithCache, ...preservedPlaceholders]
          })
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
          setIsRefreshing(false)
        }
      }
    }
    
    fetchUserName()
    fetchFriends()
    fetchDownloads()

    if (pollingIntervalRef.current) {
      console.log('[Dashboard] Clearing existing interval before creating new one')
      clearInterval(pollingIntervalRef.current)
    }

    pollingIntervalRef.current = setInterval(() => {
      console.log('[Dashboard] Polling interval triggered')
      fetchDownloads(false)
      fetchFriends()
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
        const downloadsWithCache = response.data.downloads.map(download => {
          const previousDownload = previousDownloadsRef.current.get(download.id)
          
          if ((download.status === 'paused' || download.status === 'stopped')) {
            console.log(`[Dashboard/Refresh] Processing paused download ${download.id}, current API values:`, { 
              progress: download.progress, 
              downloaded: download.downloaded,
              hasCache: pausedDownloadCache.current.has(download.id)
            })
            
            // Cache on transition: if previous was downloading/queued and had progress
            if (previousDownload && 
                (previousDownload.status === 'downloading' || previousDownload.status === 'queued') &&
                previousDownload.progress > 0) {
              pausedDownloadCache.current.set(download.id, {
                progress: previousDownload.progress,
                downloaded: previousDownload.downloaded
              })
              console.log(`[Dashboard/Refresh] ✓ Cached on transition for ${download.id}:`, { 
                progress: previousDownload.progress, 
                downloaded: previousDownload.downloaded 
              })
            }
            
            // If API still has progress (shouldn't happen but handle it), cache it
            if (download.progress > 0 && !pausedDownloadCache.current.has(download.id)) {
              pausedDownloadCache.current.set(download.id, {
                progress: download.progress,
                downloaded: download.downloaded
              })
              console.log(`[Dashboard/Refresh] Cached from API for ${download.id}:`, { 
                progress: download.progress, 
                downloaded: download.downloaded 
              })
            }
            
            const cached = pausedDownloadCache.current.get(download.id)
            if (cached) {
              console.log(`[Dashboard/Refresh] ✓ Applying cache for ${download.id}:`, cached)
              return { ...download, progress: cached.progress, downloaded: cached.downloaded }
            } else {
              console.warn(`[Dashboard/Refresh] ⚠ No cache for paused ${download.id}!`)
            }
          }
          
          if (download.status === 'downloading' || download.status === 'queued') {
            if (pausedDownloadCache.current.has(download.id)) {
              console.log(`[Dashboard/Refresh] Clearing cache for resumed ${download.id}`)
              pausedDownloadCache.current.delete(download.id)
            }
          }
          
          return download
        })
        
        // Update previousDownloadsRef with RAW API data (not cached)
        response.data.downloads.forEach(download => {
          previousDownloadsRef.current.set(download.id, download)
        })
        
        setDownloads(downloadsWithCache)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error('[Dashboard] Error refreshing downloads:', error)
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const handlePause = async (id: string) => {
    setLoadingDownloads(prev => new Set(prev).add(id))
    try {
      console.log('[Dashboard] Pausing download:', id)
      
      // Cache the current progress BEFORE pausing
      const download = downloads.find(d => d.id === id)
      if (download && download.progress > 0) {
        pausedDownloadCache.current.set(id, {
          progress: download.progress,
          downloaded: download.downloaded
        })
        console.log(`[Dashboard] Pre-cached progress before pause for ${id}:`, { progress: download.progress, downloaded: download.downloaded })
      }
      
      const response = await apiClient.pauseDownload(id)
      console.log('[Dashboard] Pause command queued:', response)
      
      if (response.success) {
        // Command queued successfully, now wait for status change
        console.log('[Dashboard] Waiting for download to pause...')
        
        // Poll for status change (max 30 seconds)
        const maxAttempts = 60 // 60 attempts * 500ms = 30 seconds
        let attempts = 0
        
        const checkStatus = async (): Promise<boolean> => {
          if (attempts >= maxAttempts) {
            console.log('[Dashboard] Timeout waiting for pause confirmation')
            return false
          }
          
          attempts++
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const downloadsResponse = await apiClient.getDownloads()
          if (downloadsResponse.success && downloadsResponse.data) {
            const download = downloadsResponse.data.downloads.find(d => d.id === id)
            if (download && (download.status === 'paused' || download.status === 'stopped')) {
              console.log('[Dashboard] Download paused successfully')
              
              // Apply cached values immediately
              const downloadsWithCache = downloadsResponse.data.downloads.map(d => {
                if (d.id === id) {
                  const cached = pausedDownloadCache.current.get(id)
                  if (cached) {
                    console.log(`[Dashboard] Applying cached values immediately for ${id}:`, cached)
                    return { ...d, progress: cached.progress, downloaded: cached.downloaded }
                  }
                }
                return d
              })
              
              // Update previousDownloadsRef with RAW API data (not cached)
              downloadsResponse.data.downloads.forEach(download => {
                previousDownloadsRef.current.set(download.id, download)
              })
              
              setDownloads(downloadsWithCache)
              setLastUpdated(new Date())
              return true
            }
          }
          
          return checkStatus()
        }
        
        const success = await checkStatus()
        
        if (success) {
          toast({
            title: 'Download Paused',
            description: 'Download has been paused',
          })
        } else {
          toast({
            title: 'Pause Timeout',
            description: 'Command sent but status not confirmed',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Failed to pause',
          description: response.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[Dashboard] Error pausing download:', error)
      toast({
        title: 'Failed to pause',
        description: 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoadingDownloads(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleResume = async (id: string) => {
    setLoadingDownloads(prev => new Set(prev).add(id))
    try {
      console.log('[Dashboard] Resuming download:', id)
      const response = await apiClient.resumeDownload(id)
      console.log('[Dashboard] Resume command queued:', response)
      
      if (response.success) {
        // Command queued successfully, now wait for status change
        console.log('[Dashboard] Waiting for download to resume...')
        
        // Poll for status change (max 30 seconds)
        const maxAttempts = 60
        let attempts = 0
        
        const checkStatus = async (): Promise<boolean> => {
          if (attempts >= maxAttempts) {
            console.log('[Dashboard] Timeout waiting for resume confirmation')
            return false
          }
          
          attempts++
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const downloadsResponse = await apiClient.getDownloads()
          if (downloadsResponse.success && downloadsResponse.data) {
            const download = downloadsResponse.data.downloads.find(d => d.id === id)
            if (download && (download.status === 'downloading' || download.status === 'queued')) {
              console.log('[Dashboard] Download resumed successfully')
              setDownloads(downloadsResponse.data.downloads)
              setLastUpdated(new Date())
              return true
            }
          }
          
          return checkStatus()
        }
        
        const success = await checkStatus()
        
        if (success) {
          if (pausedDownloadCache.current.has(id)) {
            console.log(`[Dashboard] Clearing cached progress for resumed download ${id}`)
            pausedDownloadCache.current.delete(id)
          }
          
          toast({
            title: 'Download Resumed',
            description: 'Download has been resumed',
          })
        } else {
          toast({
            title: 'Resume Timeout',
            description: 'Command sent but status not confirmed',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Failed to resume',
          description: response.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[Dashboard] Error resuming download:', error)
      toast({
        title: 'Failed to resume',
        description: 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoadingDownloads(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }
  }

  const handleCancel = async (id: string) => {
    setLoadingDownloads(prev => new Set(prev).add(id))
    try {
      console.log('[Dashboard] Killing download:', id)
      const response = await apiClient.cancelDownload(id)
      console.log('[Dashboard] Kill command queued:', response)
      
      if (response.success) {
        // Command queued successfully, now wait for download to disappear or change status
        console.log('[Dashboard] Waiting for download to be killed...')
        
        // Poll for status change (max 30 seconds)
        const maxAttempts = 60
        let attempts = 0
        
        const checkStatus = async (): Promise<boolean> => {
          if (attempts >= maxAttempts) {
            console.log('[Dashboard] Timeout waiting for kill confirmation')
            return false
          }
          
          attempts++
          await new Promise(resolve => setTimeout(resolve, 500))
          
          const downloadsResponse = await apiClient.getDownloads()
          if (downloadsResponse.success && downloadsResponse.data) {
            const download = downloadsResponse.data.downloads.find(d => d.id === id)
            // Download should be removed or marked as error/completed
            if (!download || download.status === 'error' || download.status === 'completed') {
              console.log('[Dashboard] Download killed successfully')
              setDownloads(downloadsResponse.data.downloads)
              setLastUpdated(new Date())
              return true
            }
          }
          
          return checkStatus()
        }
        
        const success = await checkStatus()
        
        if (success) {
          toast({
            title: 'Download Killed',
            description: 'Download has been killed',
          })
        } else {
          toast({
            title: 'Kill Timeout',
            description: 'Command sent but status not confirmed',
            variant: 'destructive',
          })
        }
      } else {
        toast({
          title: 'Failed to kill',
          description: response.error,
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[Dashboard] Error killing download:', error)
      toast({
        title: 'Failed to kill',
        description: 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoadingDownloads(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
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
    d.status === 'downloading' || d.status === 'queued' || d.status === 'extracting'
  )
  const pausedDownloads = downloads.filter(d => d.status === 'paused' || d.status === 'stopped')
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
                  <h1 className={cn("text-xl font-bold", themeColors.text)}>
                    {userName ? `Hey, ${userName}!` : 'Downloads'}
                  </h1>
                  {lastUpdated && (
                    <p className={cn("text-xs opacity-70", themeColors.text)}>
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
                  className={cn(themeColors.text)}
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
            <div className={cn("w-20 h-20 rounded-full flex items-center justify-center mb-4", themeColors.secondary)}>
              <Inbox className={cn("h-10 w-10 opacity-50", themeColors.text)} />
            </div>
            <h2 className={cn("text-2xl font-semibold mb-2", themeColors.text)}>No Active Downloads</h2>
            <p className={cn("max-w-md opacity-70", themeColors.text)}>
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
                      disabled={loadingDownloads.has(download.id)}
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
                      disabled={loadingDownloads.has(download.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {errorDownloads.length > 0 && (
              <div className="space-y-4">
                <h2 className={cn("text-lg font-semibold", themeColors.text)}>
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
                      disabled={loadingDownloads.has(download.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {completedDownloads.length > 0 && (
              <div className="space-y-4">
                <h2 className={cn("text-lg font-semibold", themeColors.text)}>
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
                      disabled={loadingDownloads.has(download.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {friends.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className={cn("text-lg font-semibold flex items-center gap-2", themeColors.text)}>
                    <Users className="h-5 w-5" />
                    Friends ({friends.filter(f => f.status.status !== 'offline').length} online)
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push('/friends')}
                    className={cn("text-xs", themeColors.text)}
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {friends
                    .filter(f => f.status.status !== 'offline')
                    .slice(0, 6)
                    .map((friend) => (
                      <div
                        key={friend.uid}
                        className={cn(
                          "rounded-lg p-3 transition-all duration-200 hover:scale-[1.02] border",
                          themeColors.card,
                          themeColors.border
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            {friend.photoURL ? (
                              <img 
                                src={friend.photoURL} 
                                alt={friend.displayName}
                                className="h-10 w-10 rounded-full object-cover"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                                {friend.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                              </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5">
                              <Circle
                                className={cn(
                                  'h-3 w-3 rounded-full border-2',
                                  friend.status.status === 'online' && 'bg-green-500',
                                  friend.status.status === 'away' && 'bg-yellow-500',
                                  friend.status.status === 'dnd' && 'bg-red-500'
                                )}
                                style={{ borderColor: themeColors.card.split(' ')[0].includes('bg-') ? '#ffffff' : themeColors.card }}
                                fill="currentColor"
                              />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className={cn("font-medium text-sm truncate", themeColors.text)}>
                              {friend.displayName}
                            </h3>
                            {friend.status.customMessage && (
                              <p className={cn("text-xs opacity-70 truncate", themeColors.text)}>
                                {friend.status.customMessage}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
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
