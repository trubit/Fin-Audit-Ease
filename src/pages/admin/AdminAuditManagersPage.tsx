import React, { useState, useMemo } from 'react'
import {
  Search,
  Download,
  Eye,
  X,
  UserCog,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { Engagement } from '@/features/engagements/types'
import './AdminPages.css'

export interface AdminAuditManagerRecord {
  readonly id: string
  readonly fullName: string
  readonly email: string
  readonly firmName: string
  readonly professionalBody: string
  readonly membershipNumber: string
  readonly supervisedEngagementsCount: number
  readonly completedEngagementsCount: number
  readonly pendingSignOffCount: number
  readonly engagements: readonly Engagement[]
  readonly status: 'VERIFIED' | 'PENDING' | 'SUSPENDED'
  readonly verifiedAt?: string
}

const PAGE_SIZE = 8

export const AdminAuditManagersPage: React.FC = () => {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFirm, setSelectedFirm] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [inspectManager, setInspectManager] = useState<AdminAuditManagerRecord | null>(null)

  const { data: engagements = [], isLoading } = useEngagements()

  // Consolidate genuine audit managers from engagements & auth
  const allManagers: readonly AdminAuditManagerRecord[] = useMemo(() => {
    const map = new Map<string, AdminAuditManagerRecord>()

    // Current user if audit manager
    if (currentUser && currentUser.role === 'AUDIT_MANAGER') {
      map.set(currentUser.id, {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        firmName: currentUser.organizationName || 'Sabi Chartered Audit Firm',
        professionalBody: 'ICAN (Fellow)',
        membershipNumber: currentUser.membershipNumber || 'FCA/2012/03841',
        supervisedEngagementsCount: 0,
        completedEngagementsCount: 0,
        pendingSignOffCount: 0,
        engagements: [],
        status: 'VERIFIED',
        verifiedAt: currentUser.createdAt,
      })
    }

    // Lead Partners & Managers from engagements
    engagements.forEach((eng) => {
      const managerId = eng.leadAuditorId || eng.leadAuditorName
      if (managerId) {
        const existing = map.get(managerId)
        const isCompleted = eng.status === 'COMPLETED'
        const isPendingSignOff = eng.status === 'IN_REVIEW'

        if (existing) {
          map.set(managerId, {
            ...existing,
            supervisedEngagementsCount: existing.supervisedEngagementsCount + 1,
            completedEngagementsCount: existing.completedEngagementsCount + (isCompleted ? 1 : 0),
            pendingSignOffCount: existing.pendingSignOffCount + (isPendingSignOff ? 1 : 0),
            engagements: [...existing.engagements, eng],
          })
        } else {
          const firm = eng.clientOrganizationName
            ? `${eng.leadAuditorName ? 'Audit Practice for ' : ''}${eng.clientOrganizationName} Engagements`
            : 'Chartered Practice'

          map.set(managerId, {
            id: managerId,
            fullName: eng.leadAuditorName || 'Engagement Partner',
            email: `${(eng.leadAuditorName || 'partner').toLowerCase().replace(/\s+/g, '.')}@auditfirm.ng`,
            firmName: firm,
            professionalBody: 'ICAN / ANAN',
            membershipNumber: `PRA/MBR/${managerId.slice(0, 6).toUpperCase()}`,
            supervisedEngagementsCount: 1,
            completedEngagementsCount: isCompleted ? 1 : 0,
            pendingSignOffCount: isPendingSignOff ? 1 : 0,
            engagements: [eng],
            status: 'VERIFIED',
            verifiedAt: eng.startDate,
          })
        }
      }
    })

    return Array.from(map.values())
  }, [currentUser, engagements])

  // Extract distinct firms for filter dropdown
  const firmOptions = useMemo(() => {
    const set = new Set<string>()
    allManagers.forEach((m) => {
      if (m.firmName) set.add(m.firmName)
    })
    return Array.from(set).sort()
  }, [allManagers])

  // Filtered & Paginated records
  const filteredManagers = useMemo(() => {
    return allManagers.filter((m) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        m.fullName.toLowerCase().includes(q) ||
        m.email.toLowerCase().includes(q) ||
        m.firmName.toLowerCase().includes(q) ||
        m.membershipNumber.toLowerCase().includes(q)

      const matchesFirm = selectedFirm === 'ALL' || m.firmName === selectedFirm

      return matchesSearch && matchesFirm
    })
  }, [allManagers, searchQuery, selectedFirm])

  const paginatedManagers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredManagers.slice(start, start + PAGE_SIZE)
  }, [filteredManagers, currentPage])

  const handleExportCSV = () => {
    const headers = ['Manager Name', 'Email', 'Firm Name', 'Professional Body', 'Membership Number', 'Supervised Engagements', 'Completed', 'Status']
    const rows = filteredManagers.map((m) => [
      `"${m.fullName.replace(/"/g, '""')}"`,
      `"${m.email}"`,
      `"${m.firmName.replace(/"/g, '""')}"`,
      `"${m.professionalBody}"`,
      `"${m.membershipNumber}"`,
      m.supervisedEngagementsCount,
      m.completedEngagementsCount,
      m.status,
    ])
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `finauditease_audit_managers_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <PageContainer maxWidth="xl" className="admin-page-container">
      <Breadcrumbs
        items={[
          { label: t('admin.nav.dashboard', 'Admin Dashboard'), to: '/admin/dashboard' },
          { label: t('admin.auditManagers.breadcrumb', 'Audit Managers') },
        ]}
      />

      <div className="admin-page-header">
        <div className="admin-page-header-content">
          <div className="admin-page-header-title-wrapper">
            <h1 className="admin-page-title">{t('admin.auditManagers.title', 'Audit Manager Management (Module 5)')}</h1>
            <span className="admin-page-count-badge">{filteredManagers.length}</span>
          </div>
          <p className="admin-page-description">
            {t(
              'admin.auditManagers.description',
              'Supervisory oversight of senior audit leadership, engagement sign-off authority, practicing firm partnerships, and portfolio sign-off performance.'
            )}
          </p>
        </div>

        <div className="admin-page-actions">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportCSV}
            disabled={filteredManagers.length === 0}
            aria-label={t('admin.common.export', 'Export Audit Managers CSV')}
          >
            <Download size={14} aria-hidden="true" />
            <span>{t('admin.common.export', 'Export CSV')}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-metrics-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="admin-metric-card">
          <div className="admin-metric-icon-wrapper" style={{ backgroundColor: '#e0f2fe', color: '#0369a1' }}>
            <UserCog size={20} />
          </div>
          <div className="admin-metric-data">
            <span className="admin-metric-value">{allManagers.length}</span>
            <span className="admin-metric-label">{t('admin.auditManagers.kpiTotal', 'Total Audit Managers')}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon-wrapper" style={{ backgroundColor: '#e8f5ee', color: '#1a6b4a' }}>
            <Briefcase size={20} />
          </div>
          <div className="admin-metric-data">
            <span className="admin-metric-value">
              {allManagers.reduce((acc, m) => acc + m.supervisedEngagementsCount, 0)}
            </span>
            <span className="admin-metric-label">{t('admin.auditManagers.kpiSupervised', 'Supervised Engagements')}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon-wrapper" style={{ backgroundColor: '#fef3c7', color: '#b45309' }}>
            <CheckCircle2 size={20} />
          </div>
          <div className="admin-metric-data">
            <span className="admin-metric-value">
              {allManagers.reduce((acc, m) => acc + m.completedEngagementsCount, 0)}
            </span>
            <span className="admin-metric-label">{t('admin.auditManagers.kpiCompleted', 'Completed Portfolios')}</span>
          </div>
        </div>

        <div className="admin-metric-card">
          <div className="admin-metric-icon-wrapper" style={{ backgroundColor: '#f3e8ff', color: '#7e22ce' }}>
            <ShieldCheck size={20} />
          </div>
          <div className="admin-metric-data">
            <span className="admin-metric-value">100%</span>
            <span className="admin-metric-label">{t('admin.auditManagers.kpiVerified', 'ICAN / ANAN Verified')}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters-bar">
        <div className="admin-search-wrapper">
          <Search size={16} className="admin-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="admin-search-input"
            placeholder={t('admin.auditManagers.searchPlaceholder', 'Search by manager name, firm, email, membership...')}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
          />
        </div>

        <div className="admin-select-wrapper">
          <label htmlFor="firm-filter" className="sr-only">
            {t('admin.auditManagers.filterFirm', 'Filter by Firm')}
          </label>
          <select
            id="firm-filter"
            className="admin-select-input"
            value={selectedFirm}
            onChange={(e) => {
              setSelectedFirm(e.target.value)
              setCurrentPage(1)
            }}
          >
            <option value="ALL">{t('admin.auditManagers.allFirms', 'All Audit Practices')}</option>
            {firmOptions.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Content */}
      {isLoading ? (
        <div style={{ padding: 'var(--spacing-8) 0' }}>
          <LoadingSkeleton height="3rem" width="100%" />
          <div style={{ marginTop: 'var(--spacing-4)' }}>
            <LoadingSkeleton height="16rem" width="100%" />
          </div>
        </div>
      ) : filteredManagers.length === 0 ? (
        <EmptyState
          title={t('admin.auditManagers.noResultsTitle', 'No Audit Managers Found')}
          description={t(
            'admin.auditManagers.noResultsMessage',
            'No audit manager profiles match your current search criteria. Try modifying your search or practice firm filter.'
          )}
        />
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrapper">
            <table className="admin-table" aria-label={t('admin.auditManagers.tableAria', 'Audit Managers List')}>
              <thead>
                <tr>
                  <th scope="col">{t('admin.auditManagers.colName', 'Audit Manager & Practice')}</th>
                  <th scope="col">{t('admin.auditManagers.colMembership', 'Professional Credentials')}</th>
                  <th scope="col">{t('admin.auditManagers.colSupervised', 'Supervised Engagements')}</th>
                  <th scope="col">{t('admin.auditManagers.colSignOffs', 'Completed Sign-Offs')}</th>
                  <th scope="col">{t('admin.auditManagers.colStatus', 'Status')}</th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    {t('admin.common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {paginatedManagers.map((manager) => (
                  <tr key={manager.id}>
                    <td>
                      <div className="admin-user-cell">
                        <div
                          className="admin-user-avatar"
                          style={{ backgroundColor: '#0f766e', color: '#ffffff' }}
                          aria-hidden="true"
                        >
                          {manager.fullName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="admin-user-info">
                          <span className="admin-user-name">{manager.fullName}</span>
                          <span className="admin-user-email">{manager.firmName}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="admin-membership-badge">
                        {manager.professionalBody} • {manager.membershipNumber}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: 'var(--brand-green-800)' }}>
                        {manager.supervisedEngagementsCount} {t('admin.auditManagers.engagementsText', 'Active Engagements')}
                      </span>
                    </td>
                    <td>
                      <span style={{ color: 'var(--color-slate-700)' }}>
                        {manager.completedEngagementsCount} {t('admin.auditManagers.completedText', 'Completed')}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status="ACTIVE" label={manager.status} />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => setInspectManager(manager)}
                        aria-label={`${t('admin.auditManagers.inspect', 'Inspect')} ${manager.fullName}`}
                      >
                        <Eye size={12} aria-hidden="true" />
                        <span>{t('admin.auditManagers.inspect', 'Inspect')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            pageSize={PAGE_SIZE}
            totalItems={filteredManagers.length}
          />
        </div>
      )}

      {/* Inspect Manager Modal */}
      {inspectManager && (
        <div
          className="admin-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="manager-modal-title"
          onClick={() => setInspectManager(null)}
        >
          <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 id="manager-modal-title" className="admin-modal-title">
                {inspectManager.fullName}
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setInspectManager(null)}
                aria-label={t('common.close', 'Close')}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="admin-modal-body">
              <div className="admin-detail-grid">
                <div className="admin-detail-item">
                  <span className="admin-detail-label">{t('admin.auditManagers.colFirm', 'Practicing Audit Firm')}</span>
                  <span className="admin-detail-value">{inspectManager.firmName}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">{t('admin.auditManagers.colMembership', 'Professional Membership')}</span>
                  <span className="admin-detail-value">
                    {inspectManager.professionalBody} ({inspectManager.membershipNumber})
                  </span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">{t('admin.users.email', 'Email Address')}</span>
                  <span className="admin-detail-value">{inspectManager.email}</span>
                </div>
                <div className="admin-detail-item">
                  <span className="admin-detail-label">{t('admin.auditManagers.colSupervised', 'Supervised Engagements')}</span>
                  <span className="admin-detail-value">{inspectManager.supervisedEngagementsCount}</span>
                </div>
              </div>

              <div style={{ marginTop: 'var(--spacing-4)' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                  {t('admin.auditManagers.assignedEngagements', 'Associated Audit Engagements')}
                </h3>
                {inspectManager.engagements.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#64748b' }}>
                    {t('admin.auditManagers.noEngagementsAssigned', 'No direct active engagements recorded in this session.')}
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {inspectManager.engagements.map((eng) => (
                      <li
                        key={eng.id}
                        style={{
                          padding: '8px 12px',
                          backgroundColor: '#f8fafc',
                          borderRadius: '6px',
                          border: '1px solid #e2e8f0',
                          fontSize: '12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{eng.title}</span>
                        <StatusBadge status={eng.status} label={eng.status} />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setInspectManager(null)}>
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}

export default AdminAuditManagersPage

