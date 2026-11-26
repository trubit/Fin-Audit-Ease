import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, LogOut, ShieldAlert } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher/LanguageSwitcher'
import { useUIStore } from '@/store/uiStore'
import { useAdminAuth } from '@/features/admin-auth/hooks/useAdminAuth'
import './AdminHeader.css'

export const AdminHeader: React.FC = () => {
  const { t } = useTranslation()
  const { mobileNavOpen, toggleMobileNav } = useUIStore()
  const { adminUser, logout } = useAdminAuth()
  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)

  const handleConfirmSignOut = async () => {
    setIsSigningOut(true)
    try {
      await logout('/admin/login')
    } finally {
      setIsSigningOut(false)
      setShowSignOutConfirm(false)
    }
  }

  const userInitials = adminUser?.fullName
    ? adminUser.fullName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'AD'

  return (
    <>
      <header className="admin-header" role="banner" aria-label="Administration Platform Header">
        <div className="admin-header-container">
          {/* Left: Mobile Toggle & Brand */}
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-header-menu-btn"
              onClick={toggleMobileNav}
              aria-label={mobileNavOpen ? t('admin.nav.closeMenu', 'Close administration navigation') : t('admin.nav.openMenu', 'Open administration navigation')}
              aria-expanded={mobileNavOpen}
            >
              {mobileNavOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>

            <Link to="/admin/dashboard" className="admin-header-brand" aria-label="FinAuditEase Administration Platform Dashboard">
              <img
                src="/images/sabi-africa-logo.jpg"
                alt="Sabi Africa Innovations Limited Logo"
                className="admin-header-sabi-logo"
                width="42"
                height="42"
              />
              <div className="admin-header-brand-text">
                <div className="admin-header-title">
                  <span className="admin-header-brand-name">FinAuditEase</span>
                  <span className="admin-header-platform-pill">{t('admin.header.platformPill', 'Admin')}</span>
                </div>
                <span className="admin-header-subtitle">
                  {t('admin.header.subtitle', 'Powered by Sabi Africa Innovations Limited')}
                </span>
              </div>
            </Link>
          </div>

          {/* Right: Security Status, Language, User Badge & Logout */}
          <div className="admin-header-right">
            <div className="admin-header-status-badge" role="status" aria-label="System status: live administrative session">
              <span className="admin-header-status-dot" aria-hidden="true" />
              <span>{t('admin.header.liveSession', 'Admin Live Session')}</span>
            </div>

            <LanguageSwitcher variant="compact" />

            {adminUser && (
              <div className="admin-header-user-badge" title={`${adminUser.fullName} (${adminUser.email})`}>
                <div className="admin-header-avatar" aria-hidden="true">
                  {userInitials}
                </div>
                <div className="admin-header-user-meta">
                  <span className="admin-header-user-name">{adminUser.fullName}</span>
                  <span className="admin-header-user-role">{t('admin.header.systemAdmin', 'System Administrator')}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className="admin-header-logout-btn"
              onClick={() => setShowSignOutConfirm(true)}
              aria-label={t('admin.header.signOut', 'Sign out of Administration Platform')}
              title={t('admin.header.signOut', 'Sign out of Administration Platform')}
            >
              <LogOut size={15} aria-hidden="true" />
              <span>{t('admin.header.signOut', 'Sign Out')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Admin Sign-Out Confirmation Modal */}
      {showSignOutConfirm && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-signout-title"
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              maxWidth: '440px',
              width: '100%',
              padding: '24px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  backgroundColor: '#fee2e2',
                  color: '#b91c1c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <ShieldAlert size={22} />
              </div>
              <h2 id="admin-signout-title" style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                {t('admin.auth.confirmSignOutTitle', 'Terminate Administrative Session?')}
              </h2>
            </div>
            <p style={{ fontSize: '13px', color: '#475569', lineHeight: 1.5, marginBottom: '24px' }}>
              {t(
                'admin.auth.confirmSignOutMessage',
                'You are about to sign out of the FinAuditEase Administration Platform. Your active administrative session token will be invalidated and you will be returned to the Admin Login portal.'
              )}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setShowSignOutConfirm(false)}
                disabled={isSigningOut}
                className="btn btn-secondary btn-sm"
              >
                {t('common.cancel', 'Cancel')}
              </button>
              <button
                type="button"
                onClick={handleConfirmSignOut}
                disabled={isSigningOut}
                className="btn btn-primary btn-sm"
                style={{ backgroundColor: '#b91c1c', borderColor: '#b91c1c' }}
              >
                {isSigningOut ? t('common.signingOut', 'Terminating...') : t('admin.header.confirmSignOut', 'Terminate Session')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

