'use client'

import * as React from 'react'
import { themes, getThemeColors, type Theme, type ThemeColors } from '@/lib/themes'

interface ThemeContextType {
  theme: Theme
  themeColors: ThemeColors
  setTheme: (themeId: string) => void
  isDark: boolean
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined)

const THEME_STORAGE_KEY = 'ascendara-theme'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = React.useState<Theme>(themes[0])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY)
    if (savedThemeId) {
      const savedTheme = themes.find(t => t.id === savedThemeId)
      if (savedTheme) {
        setCurrentTheme(savedTheme)
      }
    }
  }, [])

  const setTheme = React.useCallback((themeId: string) => {
    const newTheme = themes.find(t => t.id === themeId)
    if (newTheme) {
      setCurrentTheme(newTheme)
      if (mounted) {
        localStorage.setItem(THEME_STORAGE_KEY, themeId)
      }
    }
  }, [mounted])

  const themeColors = React.useMemo(() => getThemeColors(currentTheme.id), [currentTheme.id])
  const isDark = currentTheme.group === 'dark'

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, themeColors, setTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
