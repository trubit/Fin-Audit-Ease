import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Terminal, RefreshCw, LogOut } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { devAuthService } from '../../services/devAuthService'
import { isDevAuthEnabled } from '../../utils/isDevAuthEnabled'
import type { DevRole } from '../../types'
import './DevRoleSwitcher.css'

export const DevRoleSwitcher: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user, authMode } = useAuth()

  // Guard: Disabled when dev auth is disabled or for non-dev sessions
  if (!isDevAuthEnabled() || authMode !== 'development' || !user) {
    return null
  }

  const roleTitle = formatUserRole(user.role, t)

  const handleSwitchRole = (targetRole?: DevRole) => {
    let nextRole: DevRole
    if (targetRole) {
      nextRole = targetRole
    } else if (user.role === 'AUDITOR') {
      nextRole = 'FINANCE_USER'
    } else if (user.role === 'FINANCE_USER') {
      nextRole = 'ADMIN'
    } else {
      nextRole = 'AUDITOR'
    }
    devAuthService.switchDevRole(nextRole)
    if (nextRole === 'ADMIN') {
      navigate('/admin/dashboard')
    } else {
      navigate('/dashboard')
    }
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
              {roleTitle}
            </span>
          </span>
        </div>

        <div className="dev-role-switcher-actions">
          <button
            type="button"
            className="dev-switcher-btn dev-switcher-btn-switch"
            onClick={() => handleSwitchRole()}
            aria-label="Cycle Dev Role"
          >
            <RefreshCw size={13} aria-hidden="true" />
            <span>Switch Role ({user.role === 'AUDITOR' ? 'Finance' : user.role === 'FINANCE_USER' ? 'Admin' : 'Auditor'})</span>
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
