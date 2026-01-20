'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Pause, Play, X, Download, AlertCircle, Clock } from 'lucide-react'
import { Download as DownloadType } from '@/lib/api'
import { formatBytes, formatSpeed, formatETA, getStatusColor, getStatusText } from '@/lib/format'
import { useTheme } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'

interface DownloadCardProps {
  download: DownloadType
  onPause: (id: string) => void
  onResume: (id: string) => void
  onCancel: (id: string) => void
  disabled?: boolean
}

export function DownloadCard({ download, onPause, onResume, onCancel, disabled = false }: DownloadCardProps) {
  const { themeColors } = useTheme()
  const [isActionLoading, setIsActionLoading] = React.useState(false)

  const handleAction = async (action: () => void) => {
    setIsActionLoading(true)
    try {
      await action()
    } finally {
      setIsActionLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (download.status) {
      case 'downloading':
        return <Download className="h-4 w-4" />
      case 'paused':
        return <Pause className="h-4 w-4" />
      case 'completed':
        return <Download className="h-4 w-4" />
      case 'error':
        return <AlertCircle className="h-4 w-4" />
      case 'queued':
        return <Clock className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card className={cn("overflow-hidden transition-all border", themeColors.card, themeColors.cardHover)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className={cn("text-lg font-semibold line-clamp-2", themeColors.text)}>
            {download.title}
          </CardTitle>
          <div className={cn('flex items-center gap-1 text-sm font-medium whitespace-nowrap', getStatusColor(download.status))}>
            {getStatusIcon()}
            <span>{getStatusText(download.status)}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-semibold">{download.progress.toFixed(1)}%</span>
          </div>
          <Progress value={download.progress} className="h-2" />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formatBytes(download.downloadedSize)} / {formatBytes(download.totalSize)}</span>
          </div>
        </div>

        {download.status === 'downloading' && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Speed</div>
              <div className="font-semibold">{formatSpeed(download.speed)}</div>
            </div>
            <div>
              <div className="text-muted-foreground">ETA</div>
              <div className="font-semibold">{formatETA(download.eta)}</div>
            </div>
          </div>
        )}

        {download.status === 'error' && download.error && (
          <div className="rounded-md bg-red-50 dark:bg-red-950/20 p-3 text-sm text-red-800 dark:text-red-200">
            {download.error}
          </div>
        )}

        <div className="flex gap-2">
          {download.status === 'downloading' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleAction(() => onPause(download.id))}
              disabled={disabled || isActionLoading}
            >
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          {download.status === 'paused' && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleAction(() => onResume(download.id))}
              disabled={disabled || isActionLoading}
            >
              <Play className="h-4 w-4 mr-2" />
              Resume
            </Button>
          )}
          {(download.status === 'downloading' || download.status === 'paused' || download.status === 'queued') && (
            <Button
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={() => handleAction(() => onCancel(download.id))}
              disabled={disabled || isActionLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
