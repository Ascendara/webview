'use client'

import * as React from 'react'
import { useTheme } from '@/contexts/theme-context'
import { themes, getThemePreview } from '@/lib/themes'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Palette, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeSelectorProps {
  onClose?: () => void
}

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
  const { theme: currentTheme, setTheme } = useTheme()

  const lightThemes = themes.filter(t => t.group === 'light')
  const darkThemes = themes.filter(t => t.group === 'dark')

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId)
    if (onClose) {
      setTimeout(onClose, 300)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Palette className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Choose Your Theme</CardTitle>
            <CardDescription className="text-xs">Personalize your experience</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Light Themes
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {lightThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={cn(
                  "relative group rounded-md overflow-hidden transition-all",
                  "border-2 hover:scale-105 active:scale-95",
                  currentTheme.id === theme.id
                    ? "border-primary shadow-lg"
                    : "border-transparent hover:border-muted-foreground/20"
                )}
              >
                <div className={cn("h-14 w-full", getThemePreview(theme.id))} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-1.5">
                  <p className="text-[10px] font-semibold text-white text-center leading-tight">
                    {theme.name}
                  </p>
                </div>
                {currentTheme.id === theme.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Dark Themes
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {darkThemes.map((theme) => (
              <button
                key={theme.id}
                onClick={() => handleThemeSelect(theme.id)}
                className={cn(
                  "relative group rounded-md overflow-hidden transition-all",
                  "border-2 hover:scale-105 active:scale-95",
                  currentTheme.id === theme.id
                    ? "border-primary shadow-lg"
                    : "border-transparent hover:border-muted-foreground/20"
                )}
              >
                <div className={cn("h-14 w-full", getThemePreview(theme.id))} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-1.5">
                  <p className="text-[10px] font-semibold text-white text-center leading-tight">
                    {theme.name}
                  </p>
                </div>
                {currentTheme.id === theme.id && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-[10px] text-muted-foreground text-center">
            Your theme preference is saved automatically
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
