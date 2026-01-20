export const config = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://monitor.ascendara.app',
  pollingInterval: parseInt(process.env.NEXT_PUBLIC_POLLING_INTERVAL || '30000', 10),
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'Ascendara Monitor',
} as const

// Log configuration on load
if (typeof window !== 'undefined') {
  console.log('[Config] Application configuration loaded:')
  console.log('[Config] API Base URL:', config.apiBaseUrl)
  console.log('[Config] Polling Interval:', config.pollingInterval)
  console.log('[Config] App Name:', config.appName)
  console.log('[Config] Current origin:', window.location.origin)
}
