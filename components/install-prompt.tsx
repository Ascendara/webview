'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X, Smartphone, Share, Plus, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'ascendara-install-prompt-dismissed'

export function InstallPrompt() {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isIOS, setIsIOS] = React.useState(false)
  const [isAndroid, setIsAndroid] = React.useState(false)

  React.useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed === 'true') {
      return
    }

    const userAgent = window.navigator.userAgent.toLowerCase()
    const ios = /iphone|ipad|ipod/.test(userAgent)
    const android = /android/.test(userAgent)
    
    setIsIOS(ios)
    setIsAndroid(android)

    if (ios || android) {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isInWebAppiOS = (window.navigator as any).standalone === true
      
      if (!isStandalone && !isInWebAppiOS) {
        setTimeout(() => setIsVisible(true), 2000)
      }
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem(STORAGE_KEY, 'true')
  }

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 pointer-events-none">
      <div 
        className="fixed inset-0 bg-black/60 pointer-events-auto animate-in fade-in-0"
        onClick={handleDismiss}
      />
      <Card className="relative w-full max-w-md pointer-events-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-2 h-8 w-8"
          onClick={handleDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-lg">Add to Home Screen</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Install Ascendara Monitor for quick access and a better experience!
          </p>

          {isIOS && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">For iPhone/iPad:</p>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap the <Share className="inline h-4 w-4 mx-1" /> Share button at the bottom of Safari</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Scroll down and tap <Plus className="inline h-3 w-3 mx-1" /> <strong>Add to Home Screen</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Tap <strong>Add</strong> in the top right corner</span>
                </li>
              </ol>
            </div>
          )}

          {isAndroid && (
            <div className="space-y-3">
              <p className="text-sm font-semibold">For Android:</p>
              <ol className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">1</span>
                  <span>Tap the <MoreVertical className="inline h-4 w-4 mx-1" /> menu button (three dots)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">2</span>
                  <span>Select <strong>Add to Home screen</strong> or <strong>Install app</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold">3</span>
                  <span>Tap <strong>Add</strong> or <strong>Install</strong></span>
                </li>
              </ol>
            </div>
          )}

          <div className="pt-2">
            <Button 
              onClick={handleDismiss}
              className="w-full"
              variant="outline"
            >
              Got it, thanks!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
