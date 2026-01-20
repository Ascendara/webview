'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'

export function ConnectionGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [isChecking, setIsChecking] = React.useState(true)

  React.useEffect(() => {
    const sessionId = apiClient.getSessionId()
    if (!sessionId) {
      router.push('/')
    } else {
      setIsChecking(false)
    }
  }, [router])

  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return <>{children}</>
}
