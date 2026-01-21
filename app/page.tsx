'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { CodeInput } from '@/components/code-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ThemeSelectorModal } from '@/components/theme-selector-modal'
import { ThemeButton } from '@/components/theme-button'
import { apiClient } from '@/lib/api'
import { useToast } from '@/hooks/use-toast'
import { useTheme } from '@/contexts/theme-context'
import { Loader, Loader2, Smartphone, Unplug } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Home() {
  const router = useRouter()
  const { toast } = useToast()
  const { themeColors } = useTheme()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState(false)
  const [showThemeSelector, setShowThemeSelector] = React.useState(false)
  const [initialCode, setInitialCode] = React.useState<string>('')
  const [autoConnecting, setAutoConnecting] = React.useState(false)

  React.useEffect(() => {
    const existingSession = apiClient.getSessionId()
    if (existingSession) {
      console.log('[Connection] Existing session found, redirecting to dashboard')
      router.push('/dashboard')
      return
    }

    const searchParams = new URLSearchParams(window.location.search)
    const codeParam = searchParams.get('code')
    
    if (codeParam && /^\d{6}$/.test(codeParam)) {
      console.log('[Connection] 6-digit code found in URL:', codeParam)
      setInitialCode(codeParam)
      setAutoConnecting(true)
      handleCodeComplete(codeParam)
    }
  }, [router])

  const handleCodeComplete = async (code: string) => {
    console.log('[Connection] Code input completed:', code)
    console.log('[Connection] Code length:', code.length)
    console.log('[Connection] Code is numeric:', /^\d+$/.test(code))
    
    setIsLoading(true)
    setError(false)

    try {
      console.log('[Connection] Calling API to verify code...')
      const response = await apiClient.verifyCode(code)
      console.log('[Connection] API response:', response)

      if (response.success && response.data) {
        console.log('[Connection] Verification successful!')
        console.log('[Connection] Session ID:', response.data.sessionId)
        console.log('[Connection] Display name:', response.data.displayName)
        
        apiClient.setSessionId(response.data.sessionId)
        console.log('[Connection] Session ID saved to localStorage')
        
        toast({
          title: 'Connected',
          description: `Connected to ${response.data.displayName}`,
        })
        
        console.log('[Connection] Redirecting to dashboard...')
        router.push('/dashboard')
      } else {
        console.error('[Connection] Verification failed:', response.error)
        setError(true)
        setAutoConnecting(false)
        toast({
          title: 'Connection Failed',
          description: response.error || 'Invalid or expired code',
          variant: 'destructive',
        })
        setIsLoading(false)
      }
    } catch (err) {
      console.error('[Connection] Exception caught:', err)
      console.error('[Connection] Error details:', err instanceof Error ? err.message : 'Unknown error')
      setError(true)
      setAutoConnecting(false)
      toast({
        title: 'Connection Error',
        description: 'Unable to connect to Ascendara',
        variant: 'destructive',
      })
      setIsLoading(false)
    }
  }

  if (autoConnecting) {
    return (
      <div className={cn("flex min-h-screen items-center justify-center bg-gradient-to-br p-4", themeColors.bg)}>
        <Card className={cn("w-full max-w-md shadow-lg border", themeColors.card)}>
          <CardContent className="py-16">
            <div className="flex flex-col items-center justify-center space-y-6">
              <div className="relative">
                <div className={cn("w-24 h-24 rounded-full flex items-center justify-center", themeColors.secondary)}>
                  <Unplug className={cn("h-12 w-12", themeColors.accent)} />
                </div>
                <div className={cn("absolute inset-0 rounded-full animate-ping opacity-20", themeColors.secondary)} />
              </div>
              
              <div className="text-center space-y-2">
                <h2 className={cn("text-2xl font-bold", themeColors.text)}>
                  Connecting to Ascend
                </h2>
                <p className={cn("text-sm opacity-70", themeColors.text)}>
                  Please wait while we start the session...
                </p>
              </div>
              
              <Loader className={cn("h-8 w-8 animate-spin", themeColors.accent)} />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <>
      <div className={cn("flex min-h-screen items-center justify-center bg-gradient-to-br p-4", themeColors.bg)}>
        <div className="absolute top-4 right-4">
          <ThemeButton onClick={() => setShowThemeSelector(true)} />
        </div>
        
        <Card className={cn("w-full max-w-md shadow-lg border", themeColors.card)}>
          <CardHeader className="text-center space-y-4">
            <div className={cn("mx-auto w-16 h-16 rounded-full flex items-center justify-center", themeColors.secondary)}>
              <Smartphone className={cn("h-8 w-8", themeColors.accent)} />
            </div>
            <div>
              <CardTitle className={cn("text-2xl font-bold", themeColors.text)}>
                Connect to Ascend
              </CardTitle>
              <CardDescription className="mt-2">
                Enter the 6-digit code displayed in Ascendara
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <CodeInput
                length={6}
                onComplete={handleCodeComplete}
                disabled={isLoading}
                error={error}
                initialValue={initialCode}
              />
              {error && (
                <div className="flex items-center justify-center gap-2 text-sm text-red-500">
                  <span>Invalid or expired code. Please try again.</span>
                </div>
              )}
            </div>
            {isLoading && (
              <div className={cn("flex items-center justify-center gap-2 text-sm opacity-70", themeColors.text)}>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Connecting...</span>
              </div>
            )}
            <div className={cn("text-center text-sm opacity-70", themeColors.text)}>
              <p>Open Ascendara on your desktop and navigate to</p>
              <p className="font-semibold mt-1">Ascend → Settings → Remote Access</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <ThemeSelectorModal 
        isOpen={showThemeSelector} 
        onClose={() => setShowThemeSelector(false)} 
      />
    </>
  )
}
