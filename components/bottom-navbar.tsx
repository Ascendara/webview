'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/theme-context'
import { Shield } from 'lucide-react'

export function BottomNavbar() {
  const { themeColors } = useTheme()
  const pathname = usePathname()
  const [isMonitorOnline, setIsMonitorOnline] = React.useState(false)

  React.useEffect(() => {
    const monitorStatus = sessionStorage.getItem('monitor_status')
    setIsMonitorOnline(monitorStatus === 'online')
  }, [])

  return (
    <div className={cn(
      "fixed bottom-4 left-4 mb-4 right-4 z-40 border rounded-lg backdrop-blur-lg shadow-lg",
      themeColors.card,
      themeColors.border
    )}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center">
              <Image src="/icon.png" alt="Ascendara" width={30} height={30} />
            </div>
            <div className="flex flex-col">
              <span className={cn("text-sm font-semibold leading-none", themeColors.text)}>
                Ascendara Webview
              </span>
              {isMonitorOnline && (
                <div className={cn(
                  "text-xs leading-none mt-1 flex items-center gap-1.5 px-2 py-0.5 rounded-md",
                  "bg-emerald-500/10 border border-emerald-500/20",
                  "animate-in fade-in slide-in-from-left-2 duration-500"
                )}>
                  <Shield className="h-3 w-3 text-emerald-500 animate-pulse" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                    Encrypted Connection
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === '/dashboard' ? 'bg-accent' : '',
                themeColors.text
              )}
            >
              Downloads
            </Link>
            <Link
              href="/friends"
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5",
                "hover:bg-accent hover:text-accent-foreground",
                pathname === '/friends' ? 'bg-accent' : '',
                themeColors.text
              )}
            >
              Friends
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
