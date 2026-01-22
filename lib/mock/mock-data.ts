import { Download } from '@/lib/api'

const GAME_NAMES = [
  'Cyberpunk 2077',
  'Red Dead Redemption 2',
  'The Witcher 3: Wild Hunt',
  'Grand Theft Auto V',
  'Elden Ring',
  'Baldur\'s Gate 3',
  'Starfield',
  'Hogwarts Legacy',
  'Spider-Man Remastered',
  'God of War',
  'Resident Evil 4 Remake',
  'Final Fantasy XVI',
  'Assassin\'s Creed Valhalla',
  'Death Stranding',
  'Control Ultimate Edition'
]

const STATUSES: Array<'downloading' | 'queued' | 'paused' | 'completed' | 'error'> = [
  'downloading',
  'downloading',
  'downloading',
  'queued',
  'paused',
  'completed'
]

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomElement<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)]
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatSpeed(bytesPerSecond: number): string {
  return formatBytes(bytesPerSecond) + '/s'
}

function formatETA(seconds: number): string {
  if (seconds < 60) return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  return `${hours}h ${minutes}m`
}

export function generateMockDownload(id?: string): Download {
  const status = randomElement(STATUSES)
  const totalSize = randomInt(5, 100) * 1024 * 1024 * 1024
  const progress = status === 'completed' ? 100 : 
                   status === 'queued' ? 0 :
                   status === 'error' ? randomInt(10, 80) :
                   randomInt(5, 95)
  
  const downloaded = Math.floor((totalSize * progress) / 100)
  const speed = status === 'downloading' ? randomInt(5, 50) * 1024 * 1024 : 0
  const remaining = totalSize - downloaded
  const eta = speed > 0 ? Math.floor(remaining / speed) : 0

  return {
    id: id || `mock-${Date.now()}-${randomInt(1000, 9999)}`,
    name: randomElement(GAME_NAMES),
    status,
    progress,
    downloaded: formatBytes(downloaded),
    size: formatBytes(totalSize),
    speed: formatSpeed(speed),
    eta: status === 'downloading' ? formatETA(eta) : status === 'queued' ? 'Waiting...' : '-',
    error: status === 'error' ? 'Download failed: Network error' : null,
    paused: status === 'paused',
    stopped: false,
    timestamp: new Date().toISOString()
  }
}

export function generateMockDownloads(count: number = 5): Download[] {
  const downloads: Download[] = []
  const usedNames = new Set<string>()
  
  for (let i = 0; i < count; i++) {
    let download = generateMockDownload()
    
    while (usedNames.has(download.name)) {
      download = generateMockDownload()
    }
    
    usedNames.add(download.name)
    downloads.push(download)
  }
  
  return downloads
}

export function updateMockDownloadProgress(download: Download): Download {
  if (download.status !== 'downloading') {
    return download
  }

  const currentProgress = download.progress
  const increment = randomInt(1, 5)
  const newProgress = Math.min(100, currentProgress + increment)
  
  const sizeMatch = download.size.match(/^([\d.]+)\s*(\w+)$/)
  if (!sizeMatch) return download
  
  const sizeValue = parseFloat(sizeMatch[1])
  const sizeUnit = sizeMatch[2]
  
  const unitMultipliers: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024
  }
  
  const totalBytes = sizeValue * (unitMultipliers[sizeUnit] || 1)
  const downloadedBytes = Math.floor((totalBytes * newProgress) / 100)
  
  const speed = randomInt(5, 50) * 1024 * 1024
  const remaining = totalBytes - downloadedBytes
  const eta = speed > 0 ? Math.floor(remaining / speed) : 0

  if (newProgress >= 100) {
    return {
      ...download,
      status: 'completed',
      progress: 100,
      downloaded: download.size,
      speed: '0 B/s',
      eta: '-'
    }
  }

  return {
    ...download,
    progress: newProgress,
    downloaded: formatBytes(downloadedBytes),
    speed: formatSpeed(speed),
    eta: formatETA(eta)
  }
}
