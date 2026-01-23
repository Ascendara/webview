export function getBrowserInfo() {
  if (typeof window === 'undefined') {
    return {
      isSafari: false,
      isChrome: false,
      isFirefox: false,
      isMobile: false,
      isIOS: false,
      isAndroid: false,
    }
  }

  const ua = navigator.userAgent
  
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  const isChrome = /chrome|chromium|crios/i.test(ua) && !/edg/i.test(ua)
  const isFirefox = /firefox|fxios/i.test(ua)
  const isIOS = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isMobile = isIOS || isAndroid || /mobile/i.test(ua)

  return {
    isSafari,
    isChrome,
    isFirefox,
    isMobile,
    isIOS,
    isAndroid,
  }
}

export function shouldShowSafariPrompt(): boolean {
  const { isSafari, isIOS } = getBrowserInfo()
  return isSafari && isIOS
}

export function isInWebView(): boolean {
  if (typeof window === 'undefined') return false
  
  const ua = navigator.userAgent
  const isWebView = /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua) ||
                    /wv/.test(ua) ||
                    /WebView/.test(ua)
  
  return isWebView
}
