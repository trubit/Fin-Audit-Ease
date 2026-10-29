import React from 'react'
import { Download, Share2, X, Smartphone, Sparkles } from 'lucide-react'
import { usePWA } from '@/hooks/usePWA'
import { useLanguage } from '@/hooks/useLanguage'
import './PWAInstallPrompt.css'

export const PWAInstallPrompt: React.FC = () => {
  const { canInstall, isIOS, isInstalled, isDismissed, promptInstall, dismissPrompt } = usePWA()
  const { t } = useLanguage()

  if (isInstalled || isDismissed || (!canInstall && !isIOS)) {
    return null
  }

  return (
    <aside
      className="pwa-install-banner"
      role="region"
      aria-label={t('pwa.installBannerLabel', 'Install FinAuditEase application')}
    >
      <div className="pwa-install-card">
        <div className="pwa-install-icon-wrapper" aria-hidden="true">
          <Smartphone size={24} className="pwa-install-icon" />
          <Sparkles size={12} className="pwa-install-sparkle" />
        </div>

        <div className="pwa-install-content">
          <h4 className="pwa-install-title">
            {isIOS
              ? t('pwa.iosTitle', 'Install FinAuditEase on iOS')
              : t('pwa.installTitle', 'Install FinAuditEase Application')}
          </h4>
          <p className="pwa-install-desc">
            {isIOS ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                <span>{t('pwa.iosInstructionPrefix', 'Tap')}</span>
                <Share2 size={13} aria-hidden="true" style={{ verticalAlign: 'middle' }} />
                <span>{t('pwa.iosInstructionSuffix', 'Share in Safari, then select "Add to Home Screen".')}</span>
              </span>
            ) : (
              t(
                'pwa.installDesc',
                'Fast launch from your home screen or desktop with optimized mobile data usage.'
              )
            )}
          </p>
        </div>

        <div className="pwa-install-actions">
          {!isIOS && (
            <button
              type="button"
              className="btn btn-primary btn-sm pwa-install-btn"
              onClick={() => void promptInstall()}
              aria-label={t('pwa.installAction', 'Install FinAuditEase App')}
            >
              <Download size={14} aria-hidden="true" />
              <span>{t('pwa.installBtn', 'Install')}</span>
            </button>
          )}

          <button
            type="button"
            className="pwa-dismiss-btn"
            onClick={dismissPrompt}
            aria-label={t('pwa.dismissLabel', 'Dismiss install prompt')}
            title={t('common.dismiss', 'Dismiss')}
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  )
}
