import { useState, useEffect, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

const DISMISS_KEY = 'fae_pwa_install_dismissed_at'
const DISMISS_COOLDOWN_DAYS = 7

export interface UsePWAResult {
  readonly canInstall: boolean
  readonly isInstalled: boolean
  readonly isIOS: boolean
  readonly isDismissed: boolean
  readonly promptInstall: () => Promise<'accepted' | 'dismissed' | 'unavailable'>
  readonly dismissPrompt: () => void
}

export function usePWA(): UsePWAResult {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as unknown as { standalone?: boolean }).standalone)
    )
  })
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    try {
      const stored = localStorage.getItem(DISMISS_KEY)
      if (!stored) return false
      const dismissedAt = Number.parseInt(stored, 10)
      const now = Date.now()
      const diffDays = (now - dismissedAt) / (1000 * 60 * 60 * 24)
      return diffDays < DISMISS_COOLDOWN_DAYS
    } catch {
      return false
    }
  })

  const isIOS = typeof navigator !== 'undefined' &&
    /iPad|iPhone|iPod/.test(navigator.userAgent) &&
    !isInstalled

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    const handleAppInstalled = () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
      try {
        localStorage.removeItem(DISMISS_KEY)
      } catch {
        // Ignore storage error
      }
    }

    const mediaQuery = window.matchMedia('(display-mode: standalone)')
    const handleDisplayModeChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsInstalled(true)
        setDeferredPrompt(null)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    mediaQuery.addEventListener('change', handleDisplayModeChange)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      mediaQuery.removeEventListener('change', handleDisplayModeChange)
    }
  }, [])

  const promptInstall = useCallback(async (): Promise<'accepted' | 'dismissed' | 'unavailable'> => {
    if (!deferredPrompt) return 'unavailable'

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      if (outcome === 'accepted') {
        setIsInstalled(true)
        setDeferredPrompt(null)
      }
      return outcome
    } catch {
      return 'unavailable'
    }
  }, [deferredPrompt])

  const dismissPrompt = useCallback(() => {
    setIsDismissed(true)
    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString())
    } catch {
      // Ignore storage error
    }
  }, [])

  return {
    canInstall: Boolean(deferredPrompt) && !isInstalled && !isDismissed,
    isInstalled,
    isIOS: isIOS && !isDismissed,
    isDismissed,
    promptInstall,
    dismissPrompt,
  }
}
