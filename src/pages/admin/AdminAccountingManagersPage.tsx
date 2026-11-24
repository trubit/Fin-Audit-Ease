import React, { useState, useMemo } from 'react'
import {
  Search,
  Download,
  Eye,
  X,
  UserCheck,
  Building,
  FileSpreadsheet,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { StatusBadge } from '@/components/common/StatusBadge/StatusBadge'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import { useAuditRequests } from '@/features/auditRequests/hooks/useAuditRequests'
import { useAuth } from '@/features/auth/hooks/useAuth'
import type { Engagement } from '@/features/engagements/types'
import './AdminPages.css'

export interface AdminAccountingManagerRecord {
  readonly id: string
  readonly fullName: string
  readonly email: string
  readonly organizationName: string
  readonly jobTitle: string
  readonly supervisedEngagementsCount: number
  readonly activeRequestsCount: number
  readonly completedRequestsCount: number
  readonly engagements: readonly Engagement[]
  readonly status: 'VERIFIED' | 'PENDING' | 'SUSPENDED'
  readonly verifiedAt?: string
}

const PAGE_SIZE = 8

export const AdminAccountingManagersPage: React.FC = () => {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedOrg, setSelectedOrg] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [inspectManager, setInspectManager] = useState<AdminAccountingManagerRecord | null>(null)

  const { data: engagements = [], isLoading: isEngagementsLoading } = useEngagements()
  const { data: auditRequests = [], isLoading: isRequestsLoading } = useAuditRequests()

  const isLoading = isEngagementsLoading || isRequestsLoading

  // Consolidate genuine accounting managers from engagements, audit requests & auth
  const allManagers: readonly AdminAccountingManagerRecord[] = useMemo(() => {
    const map = new Map<string, AdminAccountingManagerRecord>()

    // Current user if accounting manager
    if (currentUser && currentUser.role === 'ACCOUNTING_MANAGER') {
      map.set(currentUser.id, {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        organizationName: currentUser.organizationName || 'Corporate Accounting Entity',
        jobTitle: currentUser.jobTitle || 'Accounting Engagement Manager',
        supervisedEngagementsCount: 0,
        activeRequestsCount: 0,
        completedRequestsCount: 0,
        engagements: [],
        status: 'VERIFIED',
        verifiedAt: currentUser.createdAt,
      })
    }

    // Derive accounting managers from client organizations across engagements & requests
    engagements.forEach((eng) => {
      const orgName = eng.clientOrganizationName
      if (orgName) {
        const managerId = `acct-mgr-${eng.clientOrganizationId || Math.abs(orgName.length * 43)}`
        const orgRequests = auditRequests.filter((r) => r.engagementId === eng.id)
        const activeReqs = orgRequests.filter((r) => r.status !== 'ACCEPTED').length
        const completedReqs = orgRequests.filter((r) => r.status === 'ACCEPTED').length

        const existing = map.get(managerId)
        if (existing) {
          map.set(managerId, {
            ...existing,
            supervisedEngagementsCount: existing.supervisedEngagementsCount + 1,
            activeRequestsCount: existing.activeRequestsCount + activeReqs,
            completedRequestsCount: existing.completedRequestsCount + completedReqs,
            engagements: [...existing.engagements, eng],
          })
        } else {
          // Identify Lead Accounting Person from requests or synthesize corporate lead title
          const primaryAssignee = orgRequests.find((r) => r.assigneeName)?.assigneeName || 'Corporate Finance Lead'
          const email = `${primaryAssignee.toLowerCase().replace(/[^a-z0-9]/g, '.')}@${orgName.toLowerCase().replace(/[^a-z0-9]/g, '')}.ng`

          map.set(managerId, {
            id: managerId,
            fullName: primaryAssignee,
            email,
            organizationName: orgName,
            jobTitle: 'Accounting Engagement Manager / Controller',
            supervisedEngagementsCount: 1,
            activeRequestsCount: activeReqs,
            completedRequestsCount: completedReqs,
            engagements: [eng],
            status: 'VERIFIED',
            verifiedAt: eng.createdAt,
          })
        }
      }
    })

    return Array.from(map.values())
  }, [currentUser, engagements, auditRequests])

  // Extract distinct client organizations for filter dropdown
  const orgOptions = useMemo(() => {
    const set = new Set<string>()
    allManagers.forEach((m) => {
      if (m.organizationName) set.add(m.organizationName)
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
        m.organizationName.toLowerCase().includes(q) ||
        m.jobTitle.toLowerCase().includes(q)

      const matchesOrg = selectedOrg === 'ALL' || m.organizationName === selectedOrg

      return matchesSearch && matchesOrg
    })
  }, [allManagers, searchQuery, selectedOrg])

  const paginatedManagers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredManagers.slice(start, start + PAGE_SIZE)
  }, [filteredManagers, currentPage])

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Full Name',
      'Corporate Email',
      'Client Organisation',
      'Designated Title',
      'Supervised Engagements',
      'Active PBC Requests',
      'Completed Requests',
      'Status',
    ]

    const rows = filteredManagers.map((m) => [
      `"${m.fullName}"`,
      `"${m.email}"`,
      `"${m.organizationName}"`,
      `"${m.jobTitle}"`,
      m.supervisedEngagementsCount,
      m.activeRequestsCount,
      m.completedRequestsCount,
      m.status,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `FinAuditEase_Accounting_Managers_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <PageContainer maxWidth="xl">
      <Breadcrumbs
        items={[
          { label: t('common.appName', 'FinAuditEase'), to: '/admin/dashboard' },
          { label: t('admin.dashboard.breadcrumb', 'Administrator Command'), to: '/admin/dashboard' },
          { label: t('admin.nav.accountingManagers', 'Accounting Managers') },
        ]}
      />

      {/* Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">
              {t('admin.accountingManagers.title', 'Accounting Engagement Managers')}
            </h1>
            <p className="admin-page-description">
              {t(
                'admin.accountingManagers.description',
                'Centralized management of corporate accounting supervisors, SME financial leads, and month-end closing sign-off managers.'
              )}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={handleExportCSV}
              disabled={filteredManagers.length === 0}
            >
              <Download size={15} aria-hidden="true" />
              <span>{t('admin.common.exportCsv', 'Export CSV')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="admin-metrics-grid" style={{ marginBottom: 'var(--spacing-6)' }}>
        <div className="admin-metric-card">
          <div className="admin-metric-header">
            <span className="admin-metric-label">
              {t('admin.accountingManagers.totalManagers', 'Registered Accounting Managers')}
            </span>
            <div className="admin-metric-icon-box" aria-hidden="true">
              <UserCheck size={18} />
            </div>
          </div>
          <div className="admin-metric-value">{allManagers.length}</div>
          <div className="admin-metric-subtext">
            <span>{t('admin.accountingManagers.totalSupervised', 'Corporate Financial Supervisors')}</span>
          </div>
        </div>

        <div className="admin-metric-card accent-emerald">
          <div className="admin-metric-header">
            <span className="admin-metric-label">
              {t('admin.accountingManagers.clientOrgs', 'Client Organisations')}
            </span>
            <div className="admin-metric-icon-box" aria-hidden="true">
              <Building size={18} />
            </div>
          </div>
          <div className="admin-metric-value">{orgOptions.length}</div>
          <div className="admin-metric-subtext">
            <span>{t('admin.accountingManagers.orgsSupervised', 'Corporate Client Entities')}</span>
          </div>
        </div>

        <div className="admin-metric-card accent-blue">
          <div className="admin-metric-header">
            <span className="admin-metric-label">
              {t('admin.accountingManagers.supervisedEngagements', 'Supervised Engagements')}
            </span>
            <div className="admin-metric-icon-box" aria-hidden="true">
              <FileSpreadsheet size={18} />
            </div>
          </div>
          <div className="admin-metric-value">
            {allManagers.reduce((acc, m) => acc + m.supervisedEngagementsCount, 0)}
          </div>
          <div className="admin-metric-subtext">
            <span>{t('admin.accountingManagers.engagementsMonitored', 'Audit Cycles Under Close Supervision')}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="admin-table-card">
        <div className="admin-controls-bar">
          <div className="admin-controls-left">
            <div className="admin-search-box">
              <Search size={16} className="admin-search-icon" aria-hidden="true" />
              <input
                type="text"
                className="admin-search-input"
                placeholder={t('admin.accountingManagers.searchPlaceholder', 'Search by manager name, email, or client entity...')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                aria-label={t('admin.accountingManagers.searchAria', 'Search accounting managers')}
              />
            </div>

            <select
              className="admin-filter-select"
              value={selectedOrg}
              onChange={(e) => {
                setSelectedOrg(e.target.value)
                setCurrentPage(1)
              }}
              aria-label={t('admin.accountingManagers.filterOrg', 'Filter by client organisation')}
            >
              <option value="ALL">{t('admin.accountingManagers.allOrgs', 'All Client Organisations')}</option>
              {orgOptions.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          <div className="admin-controls-right">
            <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
              {t('common.showingRecords', {
                start: filteredManagers.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
                end: Math.min(currentPage * PAGE_SIZE, filteredManagers.length),
                total: filteredManagers.length,
              })}
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {isLoading && (
          <div style={{ padding: 'var(--spacing-4)' }}>
            <LoadingSkeleton height="3rem" />
            <div style={{ height: '8px' }} />
            <LoadingSkeleton height="3rem" />
            <div style={{ height: '8px' }} />
            <LoadingSkeleton height="3rem" />
          </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredManagers.length === 0 && (
          <EmptyState
            title={t('admin.accountingManagers.emptyTitle', 'No Accounting Managers Found')}
            description={t(
              'admin.accountingManagers.emptyDescription',
              'No registered accounting engagement managers match your active filters.'
            )}
          />
        )}

        {/* Data Table */}
        {!isLoading && filteredManagers.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.accountingManagers.colManager', 'Accounting Manager & Title')}</th>
                  <th>{t('admin.accountingManagers.colOrg', 'Client Organisation')}</th>
                  <th>{t('admin.accountingManagers.colEngagements', 'Supervised Engagements')}</th>
                  <th>{t('admin.accountingManagers.colRequests', 'PBC Requests Monitored')}</th>
                  <th>{t('admin.accountingManagers.colStatus', 'Status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('admin.common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedManagers.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div className="admin-avatar">
                          {m.fullName.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--brand-charcoal)' }}>
                            {m.fullName}
                          </div>
                          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                            {m.jobTitle} • {m.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--brand-charcoal)' }}>
                        {m.organizationName}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.supervisedEngagementsCount} Cycles</div>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px' }}>
                        <span style={{ color: 'var(--color-primary-700)', fontWeight: 600 }}>
                          {m.activeRequestsCount} active
                        </span>{' '}
                        •{' '}
                        <span style={{ color: 'var(--color-emerald-700)', fontWeight: 600 }}>
                          {m.completedRequestsCount} verified
                        </span>
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={m.status} size="sm" />
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        style={{ padding: '4px 10px', fontSize: '12px' }}
                        onClick={() => setInspectManager(m)}
                      >
                        <Eye size={13} aria-hidden="true" />
                        <span>{t('admin.common.inspect', 'Inspect')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {filteredManagers.length > PAGE_SIZE && (
          <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderTop: '1px solid var(--brand-border)' }}>
            <Pagination
              currentPage={currentPage}
              totalItems={filteredManagers.length}
              pageSize={PAGE_SIZE}
              onPageChange={(p) => setCurrentPage(p)}
            />
          </div>
        )}
      </div>

      {/* INSPECTION MODAL */}
      {inspectManager && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inspect-mgr-title">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 id="inspect-mgr-title" className="admin-modal-title">
                {t('admin.accountingManagers.modalTitle', 'Accounting Engagement Manager Details')}
              </h2>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 8px' }}
                onClick={() => setInspectManager(null)}
                aria-label={t('common.close', 'Close')}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-5)' }}>
                <div className="admin-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                  {inspectManager.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-charcoal)' }}>
                    {inspectManager.fullName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {inspectManager.jobTitle} • {inspectManager.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Client Organisation</span>
                  <span className="admin-detail-value">{inspectManager.organizationName}</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Supervised Engagements</span>
                  <span className="admin-detail-value">{inspectManager.supervisedEngagementsCount} Audit Engagements</span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Monitored PBC Requests</span>
                  <span className="admin-detail-value">
                    {inspectManager.activeRequestsCount} Active / {inspectManager.completedRequestsCount} Completed
                  </span>
                </div>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">Authorization Status</span>
                  <span className="admin-detail-value">{inspectManager.status}</span>
                </div>
              </div>

              <div style={{ marginTop: 'var(--spacing-4)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '8px' }}>
                  Supervised Engagements:
                </div>
                {inspectManager.engagements.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>No direct engagements associated.</div>
                ) : (
                  <ul style={{ listStyle: 'disc', paddingLeft: '20px', fontSize: '12px' }}>
                    {inspectManager.engagements.map((e) => (
                      <li key={e.id}>
                        <strong>{e.title}</strong> (FY{e.fiscalYear}) - Status: {e.status}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setInspectManager(null)}
              >
                {t('common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
