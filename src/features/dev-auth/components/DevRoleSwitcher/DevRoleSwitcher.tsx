import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, RefreshCw, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { devAuthService } from '../../services/devAuthService'
import { isDevAuthEnabled } from '../../utils/isDevAuthEnabled'
import './DevRoleSwitcher.css'

export const DevRoleSwitcher: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, authMode } = useAuth()

  // Guard: Disabled when dev auth is disabled or for non-dev sessions
  if (!isDevAuthEnabled() || authMode !== 'development' || !user) {
    return null
  }

  const isAuditor = user.role === 'AUDITOR'

  const handleSwitchRole = () => {
    const nextRole = isAuditor ? 'FINANCE_USER' : 'AUDITOR'
    devAuthService.switchDevRole(nextRole)
    // Direct back to dashboard so that the appropriate role dashboard re-evaluates
    navigate('/dashboard')
  }

  const handleExit = () => {
    devAuthService.logoutDev()
    navigate('/dev-login', { replace: true })
  }

  return (
    <aside
      className="dev-role-switcher-banner"
      role="region"
      aria-label="Development Preview Controls"
    >
      <div className="dev-role-switcher-container">
        <div className="dev-role-switcher-badge-group">
          <span className="dev-role-switcher-pill">
            <Terminal size={12} aria-hidden="true" />
            {t('devAuth.bannerTitle')}
          </span>
          <span className="dev-role-switcher-text">
            {t('devAuth.currentRole')}{' '}
            <span className="dev-role-switcher-role-val">
              {isAuditor ? t('devAuth.auditorRole') : t('devAuth.financeRole')}
            </span>
          </span>
        </div>

        <div className="dev-role-switcher-actions">
          <button
            type="button"
            className="dev-switcher-btn dev-switcher-btn-switch"
            onClick={handleSwitchRole}
            aria-label={isAuditor ? t('devAuth.switchToFinance') : t('devAuth.switchToAuditor')}
          >
            <RefreshCw size={13} aria-hidden="true" />
            <span>{isAuditor ? t('devAuth.switchToFinance') : t('devAuth.switchToAuditor')}</span>
          </button>

          <button
            type="button"
            className="dev-switcher-btn dev-switcher-btn-exit"
            onClick={handleExit}
            aria-label={t('devAuth.exitPreview')}
          >
            <LogOut size={13} aria-hidden="true" />
            <span>{t('devAuth.exitPreview')}</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
