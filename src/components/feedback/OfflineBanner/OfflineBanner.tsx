import React, { useState, useEffect } from 'react'
import { WifiOff, Wifi } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './OfflineBanner.css'

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation()
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false
  })
  const [showRestored, setShowRestored] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOffline = () => {
      setIsOffline(true)
      setShowRestored(false)
    }

    const handleOnline = () => {
      setIsOffline(false)
      setShowRestored(true)
      const timer = setTimeout(() => {
        setShowRestored(false)
      }, 4000)
      return () => clearTimeout(timer)
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline && !showRestored) {
    return null
  }

  return (
    <div
      className={`offline-banner-container ${isOffline ? 'is-offline' : 'is-restored'}`}
      role="status"
      aria-live="assertive"
    >
      <div className="offline-banner-content">
        {isOffline ? (
          <>
            <WifiOff size={16} className="offline-banner-icon" aria-hidden="true" />
            <div className="offline-banner-text">
              <strong>{t('common.offlineStatus', 'You are currently offline.')}</strong>
              <span className="offline-banner-sub">
                {' '}
                {t(
                  'common.offlineNotice',
                  'Live financial ledgers, audit requests, and document uploads require an active internet connection.'
                )}
              </span>
            </div>
          </>
        ) : (
          <>
            <Wifi size={16} className="offline-banner-icon icon-success" aria-hidden="true" />
            <div className="offline-banner-text">
              <strong>{t('common.onlineStatus', 'Connection restored. You are back online.')}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
