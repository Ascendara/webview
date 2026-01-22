'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ThemeButton } from '@/components/theme-button'
import { ThemeSelectorModal } from '@/components/theme-selector-modal'
import { BottomNavbar } from '@/components/bottom-navbar'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '@/contexts/theme-context'
import { RefreshCw, LogOut, Users, Circle } from 'lucide-react'
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
import { isDevMode } from '@/lib/dev-mode'
import { useMockFriends } from '@/hooks/use-mock-friends'
interface FriendStatus {
  status: string
  preferredStatus: string
  customMessage: string
  updatedAt?: string
}

interface Friend {
  uid: string
  displayName: string
  email: string
  photoURL: string
  status: FriendStatus
}

export default function Friends() {
  const router = useRouter()
  const [isMockMode, setIsMockMode] = React.useState(false)
  const [isChecking, setIsChecking] = React.useState(true)
  
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const mockMode = localStorage.getItem('mock_mode') === 'true'
      const inMockMode = isDevMode() && mockMode
      setIsMockMode(inMockMode)
      
      if (!inMockMode) {
        const sessionId = apiClient.getSessionId()
        if (!sessionId) {
          console.log('[Friends] No session found, redirecting to connection page')
          router.push('/')
          return
        }
      }
      
      setIsChecking(false)
    }
  }, [router])
  
  if (isChecking) {
    return null
  }
  
  if (isMockMode) {
    return <MockFriendsPage />
  }
  
  return <RealFriendsPage />
}

function MockFriendsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { themeColors } = useTheme()
  const [showThemeSelector, setShowThemeSelector] = React.useState(false)
  
  const { friends, isLoading, isRefreshing, refreshFriends } = useMockFriends()

  const handleRefresh = async () => {
    await refreshFriends()
    toast({
      title: 'Refreshed',
      description: 'Friends list updated',
    })
  }

  const handleLogout = () => {
    localStorage.removeItem('mock_mode')
    toast({
      title: 'Disconnected',
      description: 'Exited dev mock mode',
    })
    router.push('/')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500'
      case 'away':
        return 'text-yellow-500'
      case 'busy':
        return 'text-red-500'
      case 'offline':
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'away':
        return 'Away'
      case 'busy':
        return 'Busy'
      case 'offline':
      default:
        return 'Offline'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className={cn("min-h-screen bg-gradient-to-br pb-16", themeColors.bg)}>
        <div className={cn("sticky top-0 z-10 backdrop-blur-lg border-b", themeColors.card, themeColors.border)}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className={cn("text-xl font-bold", themeColors.text)}>
                    Friends
                  </h1>
                  <p className={cn("text-xs opacity-70", themeColors.text)}>
                    {friends.length} {friends.length === 1 ? 'friend' : 'friends'} (Mock)
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeButton onClick={() => setShowThemeSelector(true)} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  className={cn(themeColors.text)}
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg p-4 animate-pulse"
                style={{ backgroundColor: themeColors.card }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4" />
                    <div className="h-3 bg-gray-300 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div
            className="rounded-lg p-12 text-center"
            style={{ backgroundColor: themeColors.card }}
          >
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: themeColors.text }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: themeColors.text }}>
              No friends yet
            </h2>
            <p className="opacity-70" style={{ color: themeColors.text }}>
              Add friends to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.uid}
                className="rounded-lg p-4 transition-all duration-200 hover:scale-[1.01]"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                  borderWidth: '1px',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {friend.photoURL ? (
                      <img 
                        src={friend.photoURL} 
                        alt={friend.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${friend.photoURL ? 'hidden' : ''}`} style={{ backgroundColor: themeColors.primary.split(' ')[0].replace('bg-', '#3b82f6') }}>
                      {getInitials(friend.displayName)}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <Circle
                        className={cn(
                          'h-4 w-4 rounded-full border-2',
                          getStatusColor(friend.status.status)
                        )}
                        style={{ borderColor: themeColors.card.split(' ')[0].replace('bg-', '#ffffff') }}
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" style={{ color: themeColors.text }}>
                      {friend.displayName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="opacity-70" style={{ color: themeColors.text }}>
                        {getStatusText(friend.status.status)}
                      </span>
                      {friend.status.customMessage && friend.status.status !== 'offline' && friend.status.status !== 'invisible' && (
                        <>
                          <span className="opacity-50" style={{ color: themeColors.text }}>•</span>
                          <span className="opacity-70 truncate" style={{ color: themeColors.text }}>
                            {friend.status.customMessage}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      <BottomNavbar />

      <ThemeSelectorModal 
        isOpen={showThemeSelector} 
        onClose={() => setShowThemeSelector(false)}
      />
    </>
  )
}

function RealFriendsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { themeColors } = useTheme()
  const [friends, setFriends] = React.useState<Friend[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [showSessionExpiredDialog, setShowSessionExpiredDialog] = React.useState(false)
  const [showThemeSelector, setShowThemeSelector] = React.useState(false)
  const pollingIntervalRef = React.useRef<NodeJS.Timeout | null>(null)
  const errorCountRef = React.useRef(0)
  const isFetchingRef = React.useRef(false)

  React.useEffect(() => {

    let isMounted = true
    
    // Reset fetching flag on mount
    isFetchingRef.current = false

    const fetchFriends = async (showLoading = false) => {
      if (!isMounted) return
      
      // Skip if already fetching (prevents duplicate requests)
      if (isFetchingRef.current) {
        console.log('[Friends] Already fetching, skipping...')
        return
      }
      
      isFetchingRef.current = true
      if (showLoading) setIsRefreshing(true)

      try {
        const response = await apiClient.getFriends()

        if (!isMounted) return

        if (response.success && response.data) {
          setFriends(response.data.friends)
          errorCountRef.current = 0
        } else if (response.error === 'Session expired') {
          setShowSessionExpiredDialog(true)
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        } else {
          errorCountRef.current++
          console.error('[Friends] Error response:', response.error)
          
          if (errorCountRef.current >= 3) {
            console.error('[Friends] Too many errors, stopping polling')
            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current)
              pollingIntervalRef.current = null
            }
            toast({
              title: 'Error',
              description: 'Failed to load friends list. Please refresh the page.',
              variant: 'destructive',
            })
          }
        }
      } catch (error) {
        console.error('[Friends] Error fetching friends:', error)
        if (!isMounted) return
        
        errorCountRef.current++
        if (errorCountRef.current >= 3) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current)
            pollingIntervalRef.current = null
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
          setIsRefreshing(false)
          isFetchingRef.current = false
        }
      }
    }

    fetchFriends(true)

    pollingIntervalRef.current = setInterval(() => {
      fetchFriends(false)
    }, 10000)

    return () => {
      isMounted = false
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
        pollingIntervalRef.current = null
      }
      isFetchingRef.current = false
    }
  }, [])

  const handleRefresh = async () => {
    if (isFetchingRef.current) {
      console.log('[Friends] Already fetching, skipping manual refresh')
      return
    }
    
    setIsRefreshing(true)
    isFetchingRef.current = true
    
    try {
      const response = await apiClient.getFriends()
      if (response.success && response.data) {
        setFriends(response.data.friends)
        errorCountRef.current = 0
        toast({
          title: 'Refreshed',
          description: 'Friends list updated',
        })
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to refresh friends list',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('[Friends] Refresh error:', error)
      toast({
        title: 'Error',
        description: 'Failed to refresh friends list',
        variant: 'destructive',
      })
    } finally {
      setIsRefreshing(false)
      isFetchingRef.current = false
    }
  }

  const handleLogout = () => {
    apiClient.clearSession()
    router.push('/')
  }

  const handleSessionExpired = () => {
    setShowSessionExpiredDialog(false)
    handleLogout()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-500'
      case 'away':
        return 'text-yellow-500'
      case 'busy':
        return 'text-red-500'
      case 'offline':
      default:
        return 'text-gray-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Online'
      case 'away':
        return 'Away'
      case 'busy':
        return 'Busy'
      case 'offline':
      default:
        return 'Offline'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <>
      <div className={cn("min-h-screen bg-gradient-to-br pb-16", themeColors.bg)}>
        <div className={cn("sticky top-0 z-10 backdrop-blur-lg border-b", themeColors.card, themeColors.border)}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className={cn("text-xl font-bold", themeColors.text)}>
                    Friends
                  </h1>
                  <p className={cn("text-xs opacity-70", themeColors.text)}>
                    {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ThemeButton onClick={() => setShowThemeSelector(true)} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </Button>
                <Button
                  variant="ghost"
                  className={cn(themeColors.text)}
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-lg p-4 animate-pulse"
                style={{ backgroundColor: themeColors.card }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-300" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-1/4" />
                    <div className="h-3 bg-gray-300 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : friends.length === 0 ? (
          <div
            className="rounded-lg p-12 text-center"
            style={{ backgroundColor: themeColors.card }}
          >
            <Users className="h-16 w-16 mx-auto mb-4 opacity-50" style={{ color: themeColors.text }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: themeColors.text }}>
              No friends yet
            </h2>
            <p className="opacity-70" style={{ color: themeColors.text }}>
              Add friends to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div
                key={friend.uid}
                className="rounded-lg p-4 transition-all duration-200 hover:scale-[1.01]"
                style={{
                  backgroundColor: themeColors.card,
                  borderColor: themeColors.border,
                  borderWidth: '1px',
                }}
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {friend.photoURL ? (
                      <img 
                        src={friend.photoURL} 
                        alt={friend.displayName}
                        className="h-12 w-12 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'
                          e.currentTarget.nextElementSibling?.classList.remove('hidden')
                        }}
                      />
                    ) : null}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${friend.photoURL ? 'hidden' : ''}`} style={{ backgroundColor: themeColors.primary.split(' ')[0].replace('bg-', '#3b82f6') }}>
                      {getInitials(friend.displayName)}
                    </div>
                    <div className="absolute -bottom-1 -right-1">
                      <Circle
                        className={cn(
                          'h-4 w-4 rounded-full border-2',
                          getStatusColor(friend.status.status)
                        )}
                        style={{ borderColor: themeColors.card.split(' ')[0].replace('bg-', '#ffffff') }}
                        fill="currentColor"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg truncate" style={{ color: themeColors.text }}>
                      {friend.displayName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="opacity-70" style={{ color: themeColors.text }}>
                        {getStatusText(friend.status.status)}
                      </span>
                      {friend.status.customMessage && friend.status.status !== 'offline' && friend.status.status !== 'invisible' && (
                        <>
                          <span className="opacity-50" style={{ color: themeColors.text }}>•</span>
                          <span className="opacity-70 truncate" style={{ color: themeColors.text }}>
                            {friend.status.customMessage}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        </div>
      </div>

      <BottomNavbar />

      <ThemeSelectorModal 
        isOpen={showThemeSelector} 
        onClose={() => setShowThemeSelector(false)}
      />

      <AlertDialog open={showSessionExpiredDialog} onOpenChange={setShowSessionExpiredDialog}>
        <AlertDialogContent style={{ backgroundColor: themeColors.card }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: themeColors.text }}>Session Expired</AlertDialogTitle>
            <AlertDialogDescription style={{ color: themeColors.text, opacity: 0.7 }}>
              Your session has expired. Please connect again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={handleSessionExpired}
              className={themeColors.primary}
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
