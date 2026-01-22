'use client'

import * as React from 'react'
import { Download, Home, Settings } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useTheme } from '@/contexts/theme-context'
import { VERSION } from '@/lib/version'

export function BottomNavbar() {
  const { themeColors } = useTheme()

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
                Ascendara
              </span>
              <span className={cn("text-xs leading-none mt-0.5 opacity-70", themeColors.text)}>
                Download Monitor v{VERSION.monitor}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <a
              href="https://ascendara.app/discord"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                themeColors.text
              )}
            >
              Join Discord
            </a>
            <a
              href="https://github.com/ascendara/webview"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                themeColors.text
              )}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
