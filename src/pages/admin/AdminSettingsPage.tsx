import React, { useState } from 'react'
import {
  Lock,
  CheckCircle2,
  Save,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LanguageSwitcher } from '@/components/navigation/LanguageSwitcher/LanguageSwitcher'
import { LANGUAGE_OPTIONS } from '@/i18n'
import './AdminPages.css'

export const AdminSettingsPage: React.FC = () => {
  const { t } = useTranslation()

  const [activeTab, setActiveTab] = useState<'general' | 'roles' | 'security' | 'languages' | 'notifications'>('general')
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Settings form state
  const [sessionTimeoutMinutes, setSessionTimeoutMinutes] = useState('15')
  const [enforce2FA, setEnforce2FA] = useState(true)
  const [retentionYears, setRetentionYears] = useState('7')
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [statutoryEscalations, setStatutoryEscalations] = useState(true)

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault()
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(false)
    }, 4000)
  }

  return (
    <PageContainer maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t('common.appName', 'FinAuditEase'), to: '/admin/dashboard' },
          { label: t('admin.dashboard.breadcrumb', 'Administrator Command'), to: '/admin/dashboard' },
          { label: t('admin.settings.breadcrumb', 'Platform Settings') },
        ]}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">{t('admin.settings.title', 'Platform Settings & Governance Policies')}</h1>
            <p className="admin-page-description">
              {t(
                'admin.settings.description',
                'Configure enterprise platform parameters, role permissions, statutory security policies, multi-lingual engines, and regulatory compliance standards.'
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Secrets Shield Policy Banner */}
      <div className="admin-notice-banner compliance-banner" role="region" aria-label="Security Shield Notice">
        <Lock size={20} className="admin-notice-icon" aria-hidden="true" />
        <div className="admin-notice-content">
          <div className="admin-notice-title">
            {t('admin.settings.secretsShieldTitle', 'Enterprise Configuration Security Boundary')}
          </div>
          <div>
            {t(
              'admin.settings.secretsShieldDesc',
              'Under statutory security guidelines, zero environment variables, backend secrets, cryptographic private keys, or server credentials are exposed through the administration interface.'
            )}
          </div>
        </div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="admin-tabs-nav" role="tablist">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
          role="tab"
          aria-selected={activeTab === 'general'}
        >
          🏢 {t('admin.settings.tabGeneral', 'General & Statutory Identity')}
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
          role="tab"
          aria-selected={activeTab === 'roles'}
        >
          👥 {t('admin.settings.tabRoles', 'Roles & Permissions Matrix')}
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
          role="tab"
          aria-selected={activeTab === 'security'}
        >
          🛡️ {t('admin.settings.tabSecurity', 'Security Policies')}
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'languages' ? 'active' : ''}`}
          onClick={() => setActiveTab('languages')}
          role="tab"
          aria-selected={activeTab === 'languages'}
        >
          🌐 {t('admin.settings.tabLanguages', 'Language & Locales')}
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
          role="tab"
          aria-selected={activeTab === 'notifications'}
        >
          🔔 {t('admin.settings.tabNotifications', 'Notification Channels')}
        </button>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="admin-notice-banner" style={{ marginBottom: 'var(--spacing-6)' }}>
          <CheckCircle2 size={18} className="admin-notice-icon" aria-hidden="true" />
          <div className="admin-notice-content">
            <div className="admin-notice-title">{t('admin.settings.saveSuccessTitle', 'Platform Governance Settings Saved')}</div>
            <div>
              {t(
                'admin.settings.saveSuccessDesc',
                'Updated governance preferences have been saved to local platform state and registered for next backend synchronization.'
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: GENERAL & IDENTITY */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveSettings} className="admin-table-card" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginBottom: 'var(--spacing-2)' }}>
            {t('admin.settings.generalTitle', 'Platform Identity & Holding Entity Information')}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: 'var(--spacing-6)' }}>
            Official regulatory branding and statutory operating credentials for FinAuditEase.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 'var(--spacing-5)', marginBottom: 'var(--spacing-6)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--brand-charcoal)', marginBottom: '6px' }}>
                {t('admin.settings.labelAppName', 'Platform Name')}
              </label>
              <input
                type="text"
                className="admin-search-input"
                defaultValue="FinAuditEase"
                readOnly
                aria-label="Platform Name"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--brand-charcoal)', marginBottom: '6px' }}>
                {t('admin.settings.labelOperatingEntity', 'Operating Entity')}
              </label>
              <input
                type="text"
                className="admin-search-input"
                defaultValue="Sabi Africa Innovations Limited"
                readOnly
                aria-label="Operating Entity"
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--brand-charcoal)', marginBottom: '6px' }}>
                {t('admin.settings.labelRetention', 'Statutory Evidence Retention Period')}
              </label>
              <select
                className="admin-filter-select"
                style={{ width: '100%' }}
                value={retentionYears}
                onChange={(e) => setRetentionYears(e.target.value)}
                aria-label="Statutory Evidence Retention Period"
              >
                <option value="7">7 Years (Mandatory under statutory audit regulations)</option>
                <option value="10">10 Years (Extended corporate statutory retention)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--brand-charcoal)', marginBottom: '6px' }}>
                {t('admin.settings.labelHashing', 'Cryptographic Algorithm')}
              </label>
              <input
                type="text"
                className="admin-search-input"
                defaultValue="SHA-256 (WORM Tamper-Evident Ledger)"
                readOnly
                aria-label="Cryptographic Algorithm"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={15} aria-hidden="true" />
            <span>{t('admin.settings.saveGeneralBtn', 'Save Platform Settings')}</span>
          </button>
        </form>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className="admin-table-card" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginBottom: 'var(--spacing-2)' }}>
            {t('admin.settings.rolesMatrixTitle', 'Authorised Roles & Capabilities Matrix')}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: 'var(--spacing-6)' }}>
            {t(
              'admin.settings.rolesMatrixDesc',
              'The four authoritative system roles and their assigned enterprise capabilities conforming to FinAuditEase security architecture.'
            )}
          </p>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.settings.matrixRole', 'System Role')}</th>
                  <th>{t('admin.settings.matrixTitle', 'Title')}</th>
                  <th>{t('admin.settings.matrixScope', 'Primary Domain Scope')}</th>
                  <th>{t('admin.settings.matrixDocumentAccess', 'Document Access')}</th>
                  <th>{t('admin.settings.matrixAdminAccess', 'Admin Platform Access')}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <span className="admin-pill admin-pill-neutral">ADMIN</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{t('admin.settings.matrixRoleSystemAdmin', 'System Administrator')}</td>
                  <td>{t('admin.settings.matrixDescSystemAdmin', 'Platform Administration, Users, Orgs, Security & Settings')}</td>
                  <td>{t('admin.settings.matrixDocSystemAdmin', 'Restricted (Metadata oversight only; no private workpaper download)')}</td>
                  <td style={{ color: 'var(--brand-green-800)', fontWeight: 700 }}>{t('admin.settings.matrixAdminSystemAdmin', '✓ Full Access')}</td>
                </tr>

                <tr>
                  <td>
                    <span className="admin-pill admin-pill-info">AUDIT_MANAGER</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{t('admin.settings.matrixRoleAuditManager', 'Audit Engagement Manager')}</td>
                  <td>{t('admin.settings.matrixDescAuditManager', 'Assurance planning, team assignments, milestone sign-offs')}</td>
                  <td>{t('admin.settings.matrixDocAuditManager', 'Assigned Engagements Only')}</td>
                  <td style={{ color: '#b91c1c', fontWeight: 700 }}>{t('admin.settings.matrixAdminProhibited', '✗ Prohibited')}</td>
                </tr>

                <tr>
                  <td>
                    <span className="admin-pill admin-pill-success">AUDITOR</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{t('admin.settings.matrixRoleAuditor', 'Lead Auditor')}</td>
                  <td>{t('admin.settings.matrixDescAuditor', 'PBC audit requests, document review, checklist verification, meetings')}</td>
                  <td>{t('admin.settings.matrixDocAuditManager', 'Assigned Engagements Only')}</td>
                  <td style={{ color: '#b91c1c', fontWeight: 700 }}>{t('admin.settings.matrixAdminProhibited', '✗ Prohibited')}</td>
                </tr>

                <tr>
                  <td>
                    <span className="admin-pill admin-pill-info">FINANCE_USER</span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{t('admin.settings.matrixRoleFinance', 'Corporate Accounting Team')}</td>
                  <td>{t('admin.settings.matrixDescFinance', 'Finance checklists (Weekly, Month-End, Pre-Audit), asset register, PBC upload')}</td>
                  <td>{t('admin.settings.matrixDocFinance', 'Own Organisation Engagements Only')}</td>
                  <td style={{ color: '#b91c1c', fontWeight: 700 }}>{t('admin.settings.matrixAdminProhibited', '✗ Prohibited')}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY POLICIES */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSettings} className="admin-table-card" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginBottom: 'var(--spacing-2)' }}>
            {t('admin.settings.securityTitle', 'Enterprise Security Policies & Inactivity Boundaries')}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: 'var(--spacing-6)' }}>
            {t('admin.settings.securityDesc', 'Enforce session timeouts, two-factor authentication, and account lockout thresholds.')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-5)', maxWidth: '600px', marginBottom: 'var(--spacing-6)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--brand-charcoal)', marginBottom: '6px' }}>
                {t('admin.settings.labelInactivityTimeout', 'Session Inactivity Timeout (Minutes)')}
              </label>
              <select
                className="admin-filter-select"
                style={{ width: '100%' }}
                value={sessionTimeoutMinutes}
                onChange={(e) => setSessionTimeoutMinutes(e.target.value)}
                aria-label="Session Inactivity Timeout"
              >
                <option value="15">15 Minutes (Enterprise Compliance Default)</option>
                <option value="30">30 Minutes</option>
                <option value="60">60 Minutes</option>
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <input
                type="checkbox"
                id="enforce2fa-cb"
                checked={enforce2FA}
                onChange={(e) => setEnforce2FA(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="enforce2fa-cb" style={{ fontSize: '13px', color: 'var(--brand-charcoal)', lineHeight: 1.4 }}>
                <strong>{t('admin.settings.enforce2faTitle', 'Mandatory Two-Factor Authentication (2FA)')}</strong>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>
                  Enforce TOTP authenticator app or SMS confirmation for all auditor, manager, and administrator sessions.
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={15} aria-hidden="true" />
            <span>{t('admin.settings.saveSecurityBtn', 'Apply Security Policies')}</span>
          </button>
        </form>
      )}

      {/* TAB 4: MULTI-LINGUAL SETTINGS */}
      {activeTab === 'languages' && (
        <div className="admin-table-card" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginBottom: 'var(--spacing-2)' }}>
            {t('admin.settings.languagesTitle', 'Supported Languages & Regional Localization')}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: 'var(--spacing-6)' }}>
            FinAuditEase supports five official languages across Nigeria and West Africa: English (en), Yoruba (yo), Igbo (ig), Hausa (ha), and Nigerian Pidgin (pcm).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: 'var(--spacing-6)' }}>
            {LANGUAGE_OPTIONS.map((lang) => (
              <div
                key={lang.code}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid var(--brand-border)',
                  backgroundColor: 'var(--brand-gray-light)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '24px' }}>{lang.flag}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--brand-charcoal)' }}>
                    {lang.name}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {lang.nativeName} ({lang.code})
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '16px', borderRadius: '8px', backgroundColor: 'var(--brand-green-50)', border: '1px solid var(--brand-green-200)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--brand-green-800)' }}>
                {t('admin.settings.testSwitchTitle', 'Test Language Switching')}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--slate)' }}>
                {t('admin.settings.testSwitchDesc', 'Switch the active language instantly to verify interface localization across the Admin Platform.')}
              </div>
            </div>
            <LanguageSwitcher variant="footer" />
          </div>
        </div>
      )}

      {/* TAB 5: NOTIFICATIONS */}
      {activeTab === 'notifications' && (
        <form onSubmit={handleSaveSettings} className="admin-table-card" style={{ padding: 'var(--spacing-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-charcoal)', marginBottom: 'var(--spacing-2)' }}>
            {t('admin.settings.notificationsTitle', 'Administrative Notification & Alert Channels')}
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--slate)', marginBottom: 'var(--spacing-6)' }}>
            Configure how administrative alerts, security notices, and statutory SLA escalations are delivered.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', maxWidth: '600px', marginBottom: 'var(--spacing-6)' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <input
                type="checkbox"
                id="emailnotif-cb"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="emailnotif-cb" style={{ fontSize: '13px', color: 'var(--brand-charcoal)', lineHeight: 1.4 }}>
                <strong>{t('admin.settings.emailNotifTitle', 'Email Security & System Alerts')}</strong>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>
                  Dispatch critical security incidents and administrator alerts to registered admin mailboxes.
                </span>
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <input
                type="checkbox"
                id="statutory-cb"
                checked={statutoryEscalations}
                onChange={(e) => setStatutoryEscalations(e.target.checked)}
                style={{ marginTop: '3px' }}
              />
              <label htmlFor="statutory-cb" style={{ fontSize: '13px', color: 'var(--brand-charcoal)', lineHeight: 1.4 }}>
                <strong>{t('admin.settings.statutoryEscalationsTitle', 'Statutory SLA Breach Escalations')}</strong>
                <span style={{ display: 'block', fontSize: '12px', color: 'var(--muted)' }}>
                  Automatically escalate audit engagements and PBC document requests that exceed regulatory deadlines.
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            <Save size={15} aria-hidden="true" />
            <span>{t('admin.settings.saveNotifBtn', 'Save Notification Preferences')}</span>
          </button>
        </form>
      )}
    </PageContainer>
  )
}

export default AdminSettingsPage

