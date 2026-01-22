export function isDevMode(): boolean {
  if (typeof window === 'undefined') {
    return process.env.NODE_ENV === 'development'
  }
  return process.env.NODE_ENV === 'development'
}

export const DEV_MOCK_CODE = '123456'
