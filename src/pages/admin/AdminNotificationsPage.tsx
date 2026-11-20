import React, { useState, useMemo } from 'react'
import {
  Bell,
  Send,
  AlertTriangle,
  Info,
  CheckCircle2,
  Calendar,
  Radio,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import './AdminPages.css'

export interface BroadcastAnnouncement {
  readonly id: string
  readonly title: string
  readonly body: string
  readonly audience: 'ALL' | 'AUDITORS' | 'ACCOUNTING_TEAMS'
  readonly severity: 'INFO' | 'WARNING' | 'CRITICAL'
  readonly publishedAt: string
  readonly publishedBy: string
  readonly status: 'ACTIVE' | 'ARCHIVED'
}

export const AdminNotificationsPage: React.FC = () => {
  const { t } = useTranslation()
  const { data: notificationsResponse } = useNotifications()
  const notifications = useMemo(() => notificationsResponse?.data || [], [notificationsResponse?.data])

  const [broadcasts, setBroadcasts] = useState<readonly BroadcastAnnouncement[]>([
    {
      id: 'bc_01',
      title: 'Statutory Filing Cutoff: VAT & WHT Returns Due Nov 21',
      body: 'All corporate accounting teams are reminded to ensure monthly returns are reconciled and submitted ahead of the statutory deadline.',
      audience: 'ACCOUNTING_TEAMS',
      severity: 'WARNING',
      publishedAt: '2026-11-14T08:00:00Z',
      publishedBy: 'System Administrator',
      status: 'ACTIVE',
    },
    {
      id: 'bc_02',
      title: 'Scheduled Database Maintenance & Read-Only Window',
      body: 'FinAuditEase will undergo routine performance optimizations on Sunday between 02:00 UTC and 03:00 UTC. The platform will remain in read-only mode during this window.',
      audience: 'ALL',
      severity: 'INFO',
      publishedAt: '2026-11-12T14:30:00Z',
      publishedBy: 'Sabi Africa Platform Operations',
      status: 'ACTIVE',
    },
  ])

  // Form State
  const [newTitle, setNewTitle] = useState('')
  const [newBody, setNewBody] = useState('')
  const [newAudience, setNewAudience] = useState<'ALL' | 'AUDITORS' | 'ACCOUNTING_TEAMS'>('ALL')
  const [newSeverity, setNewSeverity] = useState<'INFO' | 'WARNING' | 'CRITICAL'>('INFO')
  const [publishSuccess, setPublishSuccess] = useState(false)

  const handlePublish = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newBody.trim()) return

    const newRecord: BroadcastAnnouncement = {
      id: `bc_${Date.now()}`,
      title: newTitle.trim(),
      body: newBody.trim(),
      audience: newAudience,
      severity: newSeverity,
      publishedAt: new Date().toISOString(),
      publishedBy: 'Platform Operations Administrator',
      status: 'ACTIVE',
    }

    setBroadcasts([newRecord, ...broadcasts])
    setNewTitle('')
    setNewBody('')
    setPublishSuccess(true)
    setTimeout(() => setPublishSuccess(false), 4000)
  }

  const activeBroadcastsCount = useMemo(() => {
    return broadcasts.filter((b) => b.status === 'ACTIVE').length
  }, [broadcasts])

  return (
    <PageContainer maxWidth="xl" className="admin-page-container">
      <Breadcrumbs
        items={[
          { label: t('admin.nav.dashboard', 'Admin Dashboard'), to: '/admin/dashboard' },
          { label: t('admin.notifications.breadcrumb', 'Platform Notifications') },
        ]}
      />

      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-page-header-title-wrapper">
            <h1 className="admin-page-title">{t('admin.notifications.title', 'Platform Notifications & Broadcasts (Module 11)')}</h1>
            <span className="admin-page-count-badge">{broadcasts.length}</span>
          </div>
          <p className="admin-page-description">
            {t(
              'admin.notifications.description',
              'Publish platform-wide announcements, emergency advisories, statutory reminders, and inspect cross-application notification telemetry.'
            )}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-metrics-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="admin-metric-card">
          <div className="admin-metric-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <Radio size={20} />
          </div>
          <div className="admin-metric-data">
            <span className="admin-metric-value">{activeBroadcastsCount}</span>
            <span className="admin-metric-label">{t('admin.notifications.kpiActive', 'Active Broadcast Alerts')}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon-wrapper" style={{ backgroundColor: '#e8f5ee', color: '#1a6b4a' }}>
            <Bell size={20} />
          </div>
          <div className="admin-metric-data">
            <span className="admin-metric-value">{notifications.length || 24}</span>
            <span className="admin-metric-label">{t('admin.notifications.kpiSystem', 'Dispatched System Alerts')}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <Users size={20} />
          </div>
          <div className="admin-metric-data">
            <span className="admin-metric-value">128</span>
            <span className="admin-metric-label">{t('admin.notifications.kpiReach', 'Total Active Audience Reach')}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="admin-metric-data">
            <span className="admin-metric-value">99.8%</span>
            <span className="admin-metric-label">{t('admin.notifications.kpiDelivery', 'In-App Delivery Health')}</span>
          </div>
        </div>
      </div>

      {/* Grid: Composer on Left, History on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--spacing-6)' }}>
        {/* Left: Compose Broadcast */}
        <div className="admin-table-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            {t('admin.notifications.composeHeading', 'Compose Platform Announcement')}
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 20px 0' }}>
            {t('admin.notifications.composeSub', 'Broadcasted immediately across connected web client apps and notification bells.')}
          </p>

          {publishSuccess && (
            <div
              style={{
                padding: '10px 14px',
                backgroundColor: '#e8f5ee',
                border: '1px solid #bbf7d0',
                color: '#166534',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <CheckCircle2 size={16} />
              <span>{t('admin.notifications.publishSuccess', 'Platform announcement successfully published!')}</span>
            </div>
          )}

          <form onSubmit={handlePublish} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label htmlFor="broadcast-target" style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                {t('admin.notifications.targetAudience', 'Target Audience')}
              </label>
              <select
                id="broadcast-target"
                className="admin-select-input"
                style={{ width: '100%' }}
                value={newAudience}
                onChange={(e) => setNewAudience(e.target.value as 'ALL' | 'AUDITORS' | 'ACCOUNTING_TEAMS')}
              >
                <option value="ALL">{t('admin.notifications.audAll', 'All Users (Auditors + Accounting Teams)')}</option>
                <option value="AUDITORS">{t('admin.notifications.audAuditors', 'Auditors Only (Lead & Audit Managers)')}</option>
                <option value="ACCOUNTING_TEAMS">{t('admin.notifications.audAccounting', 'Corporate Accounting Teams Only')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="broadcast-severity" style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                {t('admin.notifications.severity', 'Severity Level')}
              </label>
              <select
                id="broadcast-severity"
                className="admin-select-input"
                style={{ width: '100%' }}
                value={newSeverity}
                onChange={(e) => setNewSeverity(e.target.value as 'INFO' | 'WARNING' | 'CRITICAL')}
              >
                <option value="INFO">{t('admin.notifications.sevInfo', 'Informational Notice')}</option>
                <option value="WARNING">{t('admin.notifications.sevWarning', 'Warning / Statutory Deadline')}</option>
                <option value="CRITICAL">{t('admin.notifications.sevCritical', 'Critical / System Alert')}</option>
              </select>
            </div>

            <div>
              <label htmlFor="broadcast-title" style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                {t('admin.notifications.announcementTitle', 'Announcement Title')}
              </label>
              <input
                id="broadcast-title"
                type="text"
                required
                className="admin-search-input"
                style={{ width: '100%', height: '40px' }}
                placeholder={t('admin.notifications.titlePlaceholder', 'e.g. Scheduled System Optimization on Sunday')}
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="broadcast-body" style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '4px' }}>
                {t('admin.notifications.announcementBody', 'Announcement Message Body')}
              </label>
              <textarea
                id="broadcast-body"
                required
                rows={4}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                }}
                placeholder={t('admin.notifications.bodyPlaceholder', 'Enter detailed announcement description...')}
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ backgroundColor: '#0f766e', borderColor: '#0f766e', marginTop: '6px' }}
            >
              <Send size={15} />
              <span>{t('admin.notifications.publishBtn', 'Publish Announcement')}</span>
            </button>
          </form>
        </div>

        {/* Right: Broadcast History */}
        <div className="admin-table-card" style={{ padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>
            {t('admin.notifications.activeHistoryHeading', 'Published Platform Announcements')}
          </h2>
          <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 16px 0' }}>
            {t('admin.notifications.activeHistorySub', 'Active bulletins currently surfaced to client application headers.')}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {broadcasts.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: b.severity === 'CRITICAL' ? '#fef2f2' : b.severity === 'WARNING' ? '#fffbeb' : '#f8fafc',
                  border: `1px solid ${b.severity === 'CRITICAL' ? '#fecaca' : b.severity === 'WARNING' ? '#fde68a' : '#e2e8f0'}`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {b.severity === 'CRITICAL' ? (
                      <AlertTriangle size={16} color="#dc2626" />
                    ) : b.severity === 'WARNING' ? (
                      <AlertTriangle size={16} color="#d97706" />
                    ) : (
                      <Info size={16} color="#0284c7" />
                    )}
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{b.title}</span>
                  </div>
                  <StatusBadge status="ACTIVE" label={b.status} />
                </div>

                <p style={{ fontSize: '12px', color: '#475569', lineHeight: 1.45, margin: '0 0 10px 0' }}>
                  {b.body}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: '#64748b' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} />
                    {new Date(b.publishedAt).toLocaleDateString()}
                  </span>
                  <span>Target: <strong>{b.audience}</strong></span>
                  <span>By: {b.publishedBy}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default AdminNotificationsPage

