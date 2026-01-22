import * as React from 'react'
import { generateMockFriends, updateMockFriendStatus, type MockFriend } from '@/lib/mock/mock-friends'

export function useMockFriends() {
  const [friends, setFriends] = React.useState<MockFriend[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  React.useEffect(() => {
    const initialFriends = generateMockFriends(8)
    
    setTimeout(() => {
      setFriends(initialFriends)
      setIsLoading(false)
    }, 1000)

    const statusInterval = setInterval(() => {
      setFriends(prev => prev.map(friend => updateMockFriendStatus(friend)))
    }, 5000)

    return () => {
      clearInterval(statusInterval)
    }
  }, [])

  const refreshFriends = React.useCallback(async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    setIsRefreshing(false)
  }, [])

  return {
    friends,
    isLoading,
    isRefreshing,
    refreshFriends
  }
}
