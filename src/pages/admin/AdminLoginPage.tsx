import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AlertTriangle, ShieldCheck, Loader2, ArrowLeft, KeyRound, ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAdminAuth } from '@/features/admin-auth/hooks/useAdminAuth'
import { PasswordInput } from '@/features/auth/components/PasswordInput/PasswordInput'
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher/LanguageSwitcher'
import { AppApiError } from '@/services/api/apiErrors'
import { isDevAuthEnabled } from '@/features/dev-auth/utils/isDevAuthEnabled'
import { devAuthService } from '@/features/dev-auth/services/devAuthService'
import './AdminLoginPage.css'

export const AdminLoginPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { login, verify2FA } = useAdminAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [temporaryToken, setTemporaryToken] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const returnPath = (location.state as { from?: { pathname?: string } })?.from?.pathname || '/admin/dashboard'

  const handleDevLogin = () => {
    devAuthService.loginAsDev('ADMIN')
    navigate(returnPath, { replace: true })
  }

  const handleAutoFillDemo = () => {
    setEmail('admin.platform@finauditease.ng')
    setPassword('AdminSecurePassword2026!')
  }

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)

    if (!email.trim() || !password) {
      setErrorMessage(t('admin.auth.requiredFields', 'Please provide both work email and administrator password.'))
      return
    }

    setIsSubmitting(true)
    try {
      const response = await login({
        email: email.trim(),
        password,
      })

      if (response.requires2FA && response.temporaryToken) {
        setTemporaryToken(response.temporaryToken)
      } else if (response.adminUser) {
        navigate(returnPath, { replace: true })
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        if (err.status === 401 || err.code === 'UNAUTHORIZED') {
          setErrorMessage(t('admin.auth.invalidCredentials', 'Invalid administrator credentials or unauthorized device.'))
        } else if (err.status === 403 || err.code === 'FORBIDDEN') {
          setErrorMessage(
            t(
              'admin.auth.accessDenied',
              'Access Denied. Your account does not possess administrative privileges for the FinAuditEase Administration Platform. Please use the main application portal.'
            )
          )
        } else {
          setErrorMessage(err.message)
        }
      } else {
        setErrorMessage(t('admin.auth.genericError', 'An unexpected error occurred during administrative authentication.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!temporaryToken || twoFactorCode.trim().length !== 6) {
      setErrorMessage(t('admin.auth.invalid2FACode', 'Please enter a valid 6-digit TOTP authentication code.'))
      return
    }

    setIsSubmitting(true)
    setErrorMessage(null)
    try {
      const response = await verify2FA({
        temporaryToken,
        code: twoFactorCode.trim(),
      })

      if (response.adminUser) {
        navigate(returnPath, { replace: true })
      }
    } catch (err: unknown) {
      if (err instanceof AppApiError) {
        setErrorMessage(err.message)
      } else {
        setErrorMessage(t('admin.auth.invalid2FACode', 'Invalid or expired 6-digit authentication code.'))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="admin-login-page-wrapper">
      {/* Official Top Navigation Bar */}
      <header className="admin-auth-header" role="banner">
        <div className="admin-auth-header-container">
          <div
            className="admin-auth-header-brand"
            aria-label="FinAuditEase | Powered by Sabi Africa Innovations Limited"
          >
            <img
              src="/images/sabi-africa-logo.jpg"
              alt="Sabi Africa Innovations Limited Logo"
              className="admin-auth-header-logo"
              width="38"
              height="38"
            />
            <div className="admin-auth-header-brand-text">
              <span className="admin-auth-header-title">FinAuditEase</span>
              <span className="admin-auth-header-subtitle">
                {t('admin.auth.headerSubtitle', 'Administration Platform • Sabi Africa Innovations')}
              </span>
            </div>
          </div>

          <div className="admin-auth-header-actions">
            <LanguageSwitcher variant="header" />
          </div>
        </div>
      </header>

      {/* Main Authentication Surface */}
      <main
        className="admin-login-main-content"
        role="main"
        aria-label="FinAuditEase Administration Platform Authentication"
      >
        <div className="admin-login-card-container">
          {/* Eyebrow Security Pill */}
          <div className="admin-login-eyebrow-wrapper">
            <span className="admin-login-eyebrow">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>{t('admin.auth.portalBadge', 'Restricted Security Zone • Platform Operations')}</span>
            </span>
          </div>

          <div className="admin-login-card-header">
            <h1 className="admin-login-card-title">
              {t('admin.auth.portalTitle', 'Platform Administration Portal')}
            </h1>
            <p className="admin-login-card-subtitle">
              {t('admin.auth.portalSubtitle', 'Authoritative administrative governance for FinAuditEase operations')}
            </p>
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div className="admin-login-error-alert" role="alert">
              <AlertTriangle size={16} aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Development Preview Mode Box */}
          {isDevAuthEnabled() && !temporaryToken && (
            <div className="admin-dev-preview-box">
              <div className="admin-dev-preview-header">
                <ShieldCheck size={18} className="admin-dev-preview-icon" aria-hidden="true" />
                <span className="admin-dev-preview-title">{t('devAuth.bannerTitle', 'DEVELOPMENT PREVIEW MODE')}</span>
              </div>
              <p className="admin-dev-preview-desc">
                {t('devAuth.adminPreviewDesc', 'Instant administrator preview access is enabled for frontend inspection. Bypass credentials and enter the console directly.')}
              </p>
              <div className="admin-dev-preview-actions">
                <button
                  type="button"
                  className="admin-dev-preview-btn admin-dev-enter-btn"
                  onClick={handleDevLogin}
                >
                  <ShieldCheck size={15} aria-hidden="true" />
                  <span>{t('devAuth.enterAdmin', 'Enter Admin Platform')}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="admin-dev-preview-btn admin-dev-autofill-btn"
                  onClick={handleAutoFillDemo}
                >
                  <span>{t('devAuth.autoFillDemo', 'Auto-fill Demo Credentials')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Initial Credentials Form */}
          {!temporaryToken ? (
            <form onSubmit={handleSubmitCredentials} className="admin-login-form" noValidate>
              <div className="admin-form-group">
                <label htmlFor="admin-email" className="admin-form-label">
                  {t('admin.auth.workEmailLabel', 'Administrator Work Email')}
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  required
                  className="admin-form-input"
                  placeholder="admin.ops@sabi-africa.ng"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-password" className="admin-form-label">
                  {t('admin.auth.passwordLabel', 'Master Security Password')}
                </label>
                <PasswordInput
                  id="admin-password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <button type="submit" disabled={isSubmitting} className="admin-login-submit-btn">
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spinner" aria-hidden="true" />
                    <span>{t('admin.auth.submitting', 'Authenticating Credentials...')}</span>
                  </>
                ) : (
                  <>
                    <KeyRound size={16} aria-hidden="true" />
                    <span>{t('admin.auth.loginButton', 'Authenticate & Enter Console')}</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Subsequent 2FA Challenge Step */
            <form onSubmit={handleVerify2FA} className="admin-login-form" noValidate>
              <div className="admin-2fa-step-banner">
                <h2 className="admin-2fa-step-title">
                  {t('admin.auth.twoFactorPrompt', 'Enter 6-Digit Authenticator Code')}
                </h2>
                <p className="admin-2fa-step-desc">
                  {t(
                    'admin.auth.twoFactorInstruction',
                    'Open your mobile authenticator app (e.g. Google Authenticator) and enter the 6-digit verification code to complete administrator authentication.'
                  )}
                </p>
              </div>

              <div className="admin-form-group">
                <label htmlFor="admin-2fa-code" className="admin-form-label">
                  {t('admin.auth.twoFactorLabel', 'Two-Factor TOTP Authenticator Code')}
                </label>
                <input
                  id="admin-2fa-code"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  required
                  autoFocus
                  className="admin-form-input admin-code-input"
                  placeholder="123456"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || twoFactorCode.trim().length !== 6}
                className="admin-login-submit-btn"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="spinner" aria-hidden="true" />
                    <span>{t('admin.auth.submitting', 'Verifying Token...')}</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={16} aria-hidden="true" />
                    <span>{t('admin.auth.verifyButton', 'Verify & Enter Console')}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setTemporaryToken(null)
                  setTwoFactorCode('')
                  setErrorMessage(null)
                }}
                className="admin-login-back-btn"
              >
                <ArrowLeft size={14} aria-hidden="true" />
                <span>{t('admin.auth.backToCredentials', 'Back to Email & Password')}</span>
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}

export default AdminLoginPage
