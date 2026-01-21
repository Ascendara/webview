'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function CodeRedirect() {
  const router = useRouter()
  const params = useParams()

  useEffect(() => {
    const code = params.code as string
    
    if (code && /^\d{6}$/.test(code)) {
      console.log('[CodeRedirect] Valid 6-digit code detected:', code)
      router.replace(`/?code=${code}`)
    } else {
      console.log('[CodeRedirect] Invalid code format, redirecting to home')
      router.replace('/')
    }
  }, [params, router])

  return null
}
