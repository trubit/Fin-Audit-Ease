import React from 'react'
import { Navigate, useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ShieldAlert, UserCheck, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/features/auth/components/AuthLayout/AuthLayout'
import { AuthAlert } from '@/features/auth/components/AuthAlert/AuthAlert'
import { devAuthService } from '../services/devAuthService'
import type { DevRole } from '../types'
import './DevLoginPage.css'

export const DevLoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Guard: Absolutely disabled in production builds
  if (!import.meta.env.DEV) {
    return <Navigate to="/login" replace />
  }

  const isSessionExpired = searchParams.get('session_expired') === 'true'

  const handleSelectRole = (role: DevRole) => {
    devAuthService.loginAsDev(role)
    navigate('/dashboard', { replace: true })
  }

  return (
    <AuthLayout
      title={t('devAuth.title')}
      subtitle={t('devAuth.subtitle')}
      maxWidth="md"
      footerLinks={
        <div className="dev-login-back-wrapper">
          <Link to="/login" className="dev-login-back-link">
            <ArrowLeft size={16} aria-hidden="true" />
            <span>{t('devAuth.backToLogin')}</span>
          </Link>
        </div>
      }
    >
      <div className="dev-login-container">
        {/* Session Inactivity Alert */}
        {isSessionExpired && (
          <AuthAlert variant="warning" message={t('devAuth.sessionExpired')} />
        )}

        {/* Development Preview Alert */}
        <div className="dev-login-alert" role="status">
          <ShieldAlert size={20} className="dev-login-alert-icon" aria-hidden="true" />
          <div>
            <div className="dev-login-alert-title">{t('devAuth.bannerTitle')}</div>
            <div>{t('devAuth.notice')}</div>
          </div>
        </div>

        {/* Role Cards Grid */}
        <div className="dev-roles-grid" role="group" aria-label="Select preview role">
          {/* Auditor Card */}
          <div className="dev-role-card">
            <div>
              <div className="dev-role-header">
                <div className="dev-role-icon-box dev-role-icon-box-auditor" aria-hidden="true">
                  <UserCheck size={22} />
                </div>
                <h2 className="dev-role-title">{t('devAuth.auditorRole')}</h2>
              </div>
              <p className="dev-role-desc" style={{ marginTop: 'var(--spacing-3)' }}>
                {t('devAuth.auditorDescription')}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary dev-role-btn"
              onClick={() => handleSelectRole('AUDITOR')}
            >
              <span>{t('devAuth.enterAuditor')}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Finance User Card */}
          <div className="dev-role-card">
            <div>
              <div className="dev-role-header">
                <div className="dev-role-icon-box dev-role-icon-box-finance" aria-hidden="true">
                  <Briefcase size={22} />
                </div>
                <h2 className="dev-role-title">{t('devAuth.financeRole')}</h2>
              </div>
              <p className="dev-role-desc" style={{ marginTop: 'var(--spacing-3)' }}>
                {t('devAuth.financeDescription')}
              </p>
            </div>

            <button
              type="button"
              className="btn btn-outline dev-role-btn"
              onClick={() => handleSelectRole('FINANCE_USER')}
            >
              <span>{t('devAuth.enterFinance')}</span>
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
