import * as React from 'react'
import { Download } from '@/lib/api'
import { generateMockDownloads, updateMockDownloadProgress } from '@/lib/mock/mock-data'
import { generateMockFriends, updateMockFriendStatus, type MockFriend } from '@/lib/mock/mock-friends'

interface MockDashboardState {
  downloads: Download[]
  isLoading: boolean
  userName: string
  friends: MockFriend[]
}

export function useMockDashboard() {
  const [state, setState] = React.useState<MockDashboardState>({
    downloads: [],
    isLoading: true,
    userName: 'Dev User',
    friends: []
  })

  const [loadingDownloads, setLoadingDownloads] = React.useState<Set<string>>(new Set())

  React.useEffect(() => {
    const initialDownloads = generateMockDownloads(6)
    const initialFriends = generateMockFriends(6)
    
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        downloads: initialDownloads,
        friends: initialFriends,
        isLoading: false
      }))
    }, 1500)

    const progressInterval = setInterval(() => {
      setState(prev => ({
        ...prev,
        downloads: prev.downloads.map(download => 
          updateMockDownloadProgress(download)
        ),
        friends: prev.friends.map(friend =>
          updateMockFriendStatus(friend)
        )
      }))
    }, 2000)

    return () => {
      clearInterval(progressInterval)
    }
  }, [])

  const handlePause = React.useCallback(async (id: string) => {
    setLoadingDownloads(prev => new Set(prev).add(id))
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setState(prev => ({
      ...prev,
      downloads: prev.downloads.map(d => 
        d.id === id ? { ...d, status: 'paused' as const, paused: true, speed: '0 B/s', eta: '-' } : d
      )
    }))
    
    setLoadingDownloads(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const handleResume = React.useCallback(async (id: string) => {
    setLoadingDownloads(prev => new Set(prev).add(id))
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setState(prev => ({
      ...prev,
      downloads: prev.downloads.map(d => 
        d.id === id ? { ...d, status: 'downloading' as const, paused: false } : d
      )
    }))
    
    setLoadingDownloads(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const handleCancel = React.useCallback(async (id: string) => {
    setLoadingDownloads(prev => new Set(prev).add(id))
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    setState(prev => ({
      ...prev,
      downloads: prev.downloads.filter(d => d.id !== id)
    }))
    
    setLoadingDownloads(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const refreshDownloads = React.useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }))
    
    await new Promise(resolve => setTimeout(resolve, 800))
    
    setState(prev => ({ ...prev, isLoading: false }))
  }, [])

  return {
    downloads: state.downloads,
    isLoading: state.isLoading,
    userName: state.userName,
    friends: state.friends,
    loadingDownloads,
    handlePause,
    handleResume,
    handleCancel,
    refreshDownloads
  }
}
