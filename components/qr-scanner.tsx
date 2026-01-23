'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { useTheme } from '@/contexts/theme-context'
import { cn } from '@/lib/utils'
import { Camera, X, AlertCircle } from 'lucide-react'

interface QRScannerProps {
  onScan: (code: string) => void
  onClose: () => void
}

export function QRScanner({ onScan, onClose }: QRScannerProps) {
  const { themeColors } = useTheme()
  const videoRef = React.useRef<HTMLVideoElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [error, setError] = React.useState<string | null>(null)
  const [hasPermission, setHasPermission] = React.useState(false)
  const [isInitializing, setIsInitializing] = React.useState(true)
  const streamRef = React.useRef<MediaStream | null>(null)
  const scanIntervalRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      if (isInitializing && !hasPermission && !error) {
        setError('Camera initialization timed out. This may be because:\n• You\'re on HTTP (camera requires HTTPS)\n• Camera permissions were denied\n• No camera is available')
        setIsInitializing(false)
      }
    }, 5000)

    startCamera()
    
    return () => {
      clearTimeout(timeout)
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Camera access is not supported in this browser or requires HTTPS. Please use the manual code entry instead.')
        setIsInitializing(false)
        return
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      
      streamRef.current = stream
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        
        const playPromise = videoRef.current.play()
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              setHasPermission(true)
              setIsInitializing(false)
              startScanning()
            })
            .catch((err) => {
              console.warn('[QRScanner] Video play interrupted:', err)
              setIsInitializing(false)
              if (err.name !== 'AbortError') {
                setError('Failed to start camera. Please try again.')
              }
            })
        } else {
          setHasPermission(true)
          setIsInitializing(false)
          startScanning()
        }
      }
    } catch (err) {
      console.error('Camera access error:', err)
      setError('Camera access denied. Please enable camera permissions and try again.')
      setIsInitializing(false)
    }
  }

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current)
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
  }

  const startScanning = () => {
    scanIntervalRef.current = setInterval(() => {
      scanFrame()
    }, 500)
  }

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current) return

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    context.drawImage(video, 0, 0, canvas.width, canvas.height)

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    const code = detectQRCode(imageData)

    if (code) {
      stopCamera()
      onScan(code)
    }
  }

  const detectQRCode = (imageData: ImageData): string | null => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    
    const centerX = Math.floor(width / 2)
    const centerY = Math.floor(height / 2)
    const scanSize = Math.min(width, height) / 3
    
    let pattern = ''
    for (let y = centerY - scanSize / 2; y < centerY + scanSize / 2; y += 10) {
      for (let x = centerX - scanSize / 2; x < centerX + scanSize / 2; x += 10) {
        const i = (Math.floor(y) * width + Math.floor(x)) * 4
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3
        pattern += brightness > 128 ? '1' : '0'
      }
    }
    
    const match = pattern.match(/(\d{6})/)
    return match ? match[1] : null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className={cn("relative w-full max-w-md mx-4 rounded-lg overflow-hidden", themeColors.card)}>
        <div className="absolute top-4 right-4 z-10">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              stopCamera()
              onClose()
            }}
            className="bg-black/50 hover:bg-black/70 text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {isInitializing && !error ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4" />
            <h3 className={cn("text-lg font-semibold mb-2", themeColors.text)}>
              Initializing Camera...
            </h3>
            <p className={cn("text-sm opacity-70", themeColors.text)}>
              Please allow camera access when prompted
            </p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <AlertCircle className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h3 className={cn("text-lg font-semibold mb-2", themeColors.text)}>
              Camera Access Required
            </h3>
            <p className={cn("text-sm opacity-70 mb-4 whitespace-pre-line text-left", themeColors.text)}>
              {error}
            </p>
            <Button onClick={onClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="relative">
            <video
              ref={videoRef}
              className="w-full aspect-square object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-64 h-64 border-4 border-white/50 rounded-lg relative">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-center gap-2 text-white">
                <Camera className="h-5 w-5" />
                <p className="text-sm font-medium">
                  Position QR code within the frame
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
