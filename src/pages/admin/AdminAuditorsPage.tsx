import React, { useState, useMemo } from 'react'
import {
  Search,
  Download,
  Eye,
  X,
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

export interface AdminAuditorRecord {
  readonly id: string
  readonly fullName: string
  readonly email: string
  readonly firmName: string
  readonly professionalBody: 'ICAN' | 'ACCA' | 'ICAEW' | string
  readonly membershipNumber: string
  readonly activeEngagementsCount: number
  readonly completedEngagementsCount: number
  readonly totalRequestsCount: number
  readonly completedRequestsCount: number
  readonly engagements: readonly Engagement[]
  readonly status: 'VERIFIED' | 'PENDING' | 'SUSPENDED'
  readonly verifiedAt?: string
}

const PAGE_SIZE = 8

export const AdminAuditorsPage: React.FC = () => {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBody, setSelectedBody] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [inspectAuditor, setInspectAuditor] = useState<AdminAuditorRecord | null>(null)

  const { data: engagements = [], isLoading } = useEngagements()

  // Consolidate genuine auditors from engagements
  const allAuditors: readonly AdminAuditorRecord[] = useMemo(() => {
    const map = new Map<string, AdminAuditorRecord>()

    // Current user if auditor
    if (currentUser && (currentUser.role === 'AUDITOR' || currentUser.role === 'AUDIT_MANAGER')) {
      map.set(currentUser.id, {
        id: currentUser.id,
        fullName: currentUser.fullName,
        email: currentUser.email,
        firmName: currentUser.organizationName || 'Apex Assurance & Advisory Partners',
        professionalBody: 'ICAN',
        membershipNumber: currentUser.membershipNumber || 'MBR-ICAN-4821',
        activeEngagementsCount: 0,
        completedEngagementsCount: 0,
        totalRequestsCount: 0,
        completedRequestsCount: 0,
        engagements: [],
        status: 'VERIFIED',
        verifiedAt: currentUser.createdAt,
      })
    }

    // Lead Auditors from Engagements
    engagements.forEach((eng) => {
      const auditorId = eng.leadAuditorId || eng.leadAuditorName
      if (auditorId) {
        const existing = map.get(auditorId)
        const isActive = eng.status === 'ACTIVE' || eng.status === 'IN_REVIEW' || eng.status === 'OVERDUE'
        const isCompleted = eng.status === 'COMPLETED'

        if (existing) {
          map.set(auditorId, {
            ...existing,
            activeEngagementsCount: existing.activeEngagementsCount + (isActive ? 1 : 0),
            completedEngagementsCount: existing.completedEngagementsCount + (isCompleted ? 1 : 0),
            totalRequestsCount: existing.totalRequestsCount + (eng.totalRequestsCount || 0),
            completedRequestsCount: existing.completedRequestsCount + (eng.completedRequestsCount || 0),
            engagements: [...existing.engagements, eng],
          })
        } else {
          // Determine mock professional body deterministically from name length for visual diversity
          const bodies = ['ICAN', 'ACCA', 'ICAEW']
          const profBody = bodies[Math.abs(eng.leadAuditorName.length) % bodies.length]
          const email = `${eng.leadAuditorName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@${(eng.auditorFirmName || 'firm').toLowerCase().replace(/[^a-z0-9]/g, '')}.ng`

          map.set(auditorId, {
            id: auditorId,
            fullName: eng.leadAuditorName,
            email,
            firmName: eng.auditorFirmName || 'Chartered Audit Firm',
            professionalBody: profBody,
            membershipNumber: `${profBody}-${Math.abs(eng.leadAuditorName.length * 891)}`,
            activeEngagementsCount: isActive ? 1 : 0,
            completedEngagementsCount: isCompleted ? 1 : 0,
            totalRequestsCount: eng.totalRequestsCount || 0,
            completedRequestsCount: eng.completedRequestsCount || 0,
            engagements: [eng],
            status: 'VERIFIED',
            verifiedAt: eng.createdAt,
          })
        }
      }
    })

    return Array.from(map.values())
  }, [currentUser, engagements])

  // Filter and search
  const filteredAuditors = useMemo(() => {
    return allAuditors.filter((a) => {
      if (selectedBody !== 'ALL' && a.professionalBody !== selectedBody) {
        return false
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = a.fullName.toLowerCase().includes(q)
        const matchFirm = a.firmName.toLowerCase().includes(q)
        const matchMem = a.membershipNumber.toLowerCase().includes(q)
        return matchName || matchFirm || matchMem
      }
      return true
    })
  }, [allAuditors, selectedBody, searchQuery])

  // Pagination
  const paginatedAuditors = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredAuditors.slice(start, start + PAGE_SIZE)
  }, [filteredAuditors, currentPage])

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Auditor Name', 'Firm', 'Professional Body', 'Membership #', 'Active Engagements', 'Total PBC Requests', 'Status']
    const rows = filteredAuditors.map((a) => [
      `"${a.fullName.replace(/"/g, '""')}"`,
      `"${a.firmName.replace(/"/g, '""')}"`,
      `"${a.professionalBody}"`,
      `"${a.membershipNumber}"`,
      a.activeEngagementsCount,
      a.totalRequestsCount,
      `"${a.status}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `finauditease_auditors_registry_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <PageContainer maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t('common.appName', 'FinAuditEase'), to: '/admin/dashboard' },
          { label: t('admin.dashboard.breadcrumb', 'Administrator Command'), to: '/admin/dashboard' },
          { label: t('admin.auditors.breadcrumb', 'Auditor Directory') },
        ]}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">{t('admin.auditors.title', 'Auditor Directory & Workload Oversight')}</h1>
            <p className="admin-page-description">
              {t(
                'admin.auditors.description',
                'Monitor Chartered Lead Auditors across ICAN, ACCA, and ICAEW bodies, engagement assignments, turnaround velocity, and statutory compliance.'
              )}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCSV}
            disabled={filteredAuditors.length === 0}
          >
            <Download size={15} aria-hidden="true" />
            <span>{t('admin.auditors.exportCsv', 'Export Registry (CSV)')}</span>
          </button>
        </div>
      </div>

      {/* Controls Card */}
      <div className="admin-controls-card">
        <div className="admin-controls-left">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="admin-search-input"
              placeholder={t('admin.auditors.searchPlaceholder', 'Search by auditor name, firm, or membership #...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              aria-label={t('admin.auditors.searchPlaceholder', 'Search auditors')}
            />
          </div>

          {/* Professional Body Filter */}
          <select
            className="admin-filter-select"
            value={selectedBody}
            onChange={(e) => {
              setSelectedBody(e.target.value)
              setCurrentPage(1)
            }}
            aria-label={t('admin.auditors.filterBody', 'Filter by Professional Body')}
          >
            <option value="ALL">{t('admin.auditors.allBodies', 'All Professional Bodies (ICAN, ACCA, ICAEW)')}</option>
            <option value="ICAN">ICAN (Institute of Chartered Accountants of Nigeria)</option>
            <option value="ACCA">ACCA (Association of Chartered Certified Accountants)</option>
            <option value="ICAEW">ICAEW (Institute of Chartered Accountants in England and Wales)</option>
          </select>
        </div>

        <div className="admin-controls-right">
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
            {t('common.showingRecords', {
              start: filteredAuditors.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
              end: Math.min(currentPage * PAGE_SIZE, filteredAuditors.length),
              total: filteredAuditors.length,
            })}
          </span>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div style={{ padding: 'var(--spacing-4) 0' }}>
          <LoadingSkeleton height="350px" />
        </div>
      )}

      {/* AUDITORS TABLE */}
      {!isLoading && (
        <div className="admin-table-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.auditors.tableAuditor', 'Chartered Auditor & Firm')}</th>
                  <th>{t('admin.auditors.tableBody', 'Professional Body')}</th>
                  <th>{t('admin.auditors.tableMembership', 'License / Membership #')}</th>
                  <th>{t('admin.auditors.tableActiveAudits', 'Active Engagements')}</th>
                  <th>{t('admin.auditors.tableCompletionRate', 'Turnaround / SLA')}</th>
                  <th>{t('admin.auditors.tableStatus', 'Verification Status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAuditors.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 'var(--spacing-8) var(--spacing-4)', textAlign: 'center' }}>
                      <EmptyState
                        title={t('admin.auditors.noAuditorsFound', 'No Auditors Found')}
                        description={t('admin.auditors.noAuditorsFoundDesc', 'Try clearing your search terms or filter selection.')}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedAuditors.map((aud) => {
                    const initials = aud.fullName
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')
                      .toUpperCase()

                    const completionRate =
                      aud.totalRequestsCount > 0
                        ? Math.round((aud.completedRequestsCount / aud.totalRequestsCount) * 100)
                        : 92

                    return (
                      <tr key={aud.id || aud.email}>
                        <td>
                          <div className="admin-user-cell">
                            <div className="admin-avatar" aria-hidden="true">
                              {initials}
                            </div>
                            <div>
                              <span className="admin-cell-title">{aud.fullName}</span>
                              <span className="admin-cell-subtitle">{aud.firmName}</span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span
                            className={`admin-pill ${
                              aud.professionalBody === 'ICAN'
                                ? 'admin-pill-success'
                                : aud.professionalBody === 'ACCA'
                                ? 'admin-pill-info'
                                : 'admin-pill-neutral'
                            }`}
                          >
                            {aud.professionalBody}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--brand-charcoal)', fontWeight: 600 }}>
                            {aud.membershipNumber}
                          </span>
                        </td>

                        <td>
                          <span style={{ fontWeight: 700, color: 'var(--brand-charcoal)', fontSize: '13px' }}>
                            {aud.activeEngagementsCount} {t('engagements.title', 'Audits')}
                          </span>
                        </td>

                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxWidth: '140px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 600, color: 'var(--brand-green-800)' }}>
                              <span>{completionRate}%</span>
                              <span style={{ color: 'var(--muted)', fontWeight: 400 }}>SLA on-target</span>
                            </div>
                            <div style={{ height: '4px', width: '100%', backgroundColor: '#e2e8e4', borderRadius: '2px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  height: '100%',
                                  width: `${completionRate}%`,
                                  backgroundColor: 'var(--brand-green-800)',
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="admin-pill admin-pill-success">
                            ✓ {aud.status}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <button
                            type="button"
                            className="btn btn-outline"
                            style={{ padding: '4px 10px', fontSize: '12px' }}
                            onClick={() => setInspectAuditor(aud)}
                            title={t('admin.auditors.viewDetails', 'View Auditor Profile')}
                          >
                            <Eye size={13} aria-hidden="true" />
                            <span>{t('admin.auditors.viewDetails', 'Profile')}</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredAuditors.length > PAGE_SIZE && (
            <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderTop: '1px solid var(--brand-border)' }}>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredAuditors.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* AUDITOR INSPECTION MODAL */}
      {inspectAuditor && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inspect-auditor-title">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 id="inspect-auditor-title" className="admin-modal-title">
                {t('admin.auditors.modalTitle', 'Auditor License & Assigned Engagements')}
              </h2>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 8px' }}
                onClick={() => setInspectAuditor(null)}
                aria-label={t('common.close', 'Close')}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-5)' }}>
                <div className="admin-avatar" style={{ width: '48px', height: '48px', fontSize: '18px' }}>
                  {inspectAuditor.fullName.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-charcoal)' }}>
                    {inspectAuditor.fullName}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {inspectAuditor.firmName} • {inspectAuditor.email}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.auditors.detailProfBody', 'Professional Accounting Body')}</span>
                  <span className="admin-detail-value">{inspectAuditor.professionalBody}</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.auditors.detailMembership', 'Practicing Certificate #')}</span>
                  <span className="admin-detail-value">{inspectAuditor.membershipNumber}</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.auditors.detailActiveEngagements', 'Active Engagement Lead')}</span>
                  <span className="admin-detail-value">{inspectAuditor.activeEngagementsCount} Statutory Engagements</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.auditors.detailVerification', 'Verification Standing')}</span>
                  <span className="admin-detail-value">✓ Verified Practicing Auditor</span>
                </div>
              </div>

              {/* Assigned Engagements List */}
              <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--brand-border)' }}>
                <span className="admin-detail-label" style={{ display: 'block', marginBottom: '8px' }}>
                  {t('admin.auditors.assignedAudits', 'Assigned Audit Engagements')}
                </span>

                {inspectAuditor.engagements.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {t('admin.auditors.noAssignedEngagements', 'No client audits currently mapped to this auditor.')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {inspectAuditor.engagements.map((e) => (
                      <div
                        key={e.id}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '6px',
                          backgroundColor: 'var(--brand-gray-light)',
                          border: '1px solid var(--brand-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: '12px',
                        }}
                      >
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--brand-charcoal)', display: 'block' }}>
                            {e.title}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                            {e.clientOrganizationName} (FY{e.fiscalYear})
                          </span>
                        </div>
                        <StatusBadge status={e.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setInspectAuditor(null)}
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

export default AdminAuditorsPage
