'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Palette } from 'lucide-react'
import { useTheme } from '@/contexts/theme-context'
import { getThemePreview } from '@/lib/themes'
import { cn } from '@/lib/utils'

interface ThemeButtonProps {
  onClick: () => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showPreview?: boolean
}

export function ThemeButton({ 
  onClick, 
  variant = 'outline', 
  size = 'sm',
  showPreview = true 
}: ThemeButtonProps) {
  const { theme } = useTheme()

  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className="relative overflow-hidden"
    >
      {showPreview && (
        <div className={cn(
          "absolute inset-0 opacity-20",
          getThemePreview(theme.id)
        )} />
      )}
      <Palette className="h-4 w-4 relative z-10" />
    </Button>
  )
}
