'use client'

import * as React from 'react'
import { ThemeSelector } from '@/components/theme-selector'
import { X } from 'lucide-react'

interface ThemeSelectorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function ThemeSelectorModal({ isOpen, onClose }: ThemeSelectorModalProps) {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <ThemeSelector onClose={onClose} />
      </div>
    </div>
  )
}
