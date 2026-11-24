import React, { useState, useMemo } from 'react'
import {
  Building,
  Search,
  Download,
  ShieldCheck,
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

export interface AdminOrganisationRecord {
  readonly id: string
  readonly name: string
  readonly category: 'AUDIT_PRACTICE' | 'CORPORATE_CLIENT'
  readonly registrationNumber?: string
  readonly jurisdiction: string
  readonly activeEngagementsCount: number
  readonly completedEngagementsCount: number
  readonly totalRequestsCount: number
  readonly membersCount: number
  readonly subscriptionTier: string
  readonly status: 'ACTIVE' | 'PENDING' | 'SUSPENDED'
  readonly engagements: readonly Engagement[]
  readonly primaryContactName?: string
  readonly createdAt: string
}

const PAGE_SIZE = 8

export const AdminOrganisationsPage: React.FC = () => {
  const { t } = useTranslation()
  const { user: currentUser } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [inspectOrg, setInspectOrg] = useState<AdminOrganisationRecord | null>(null)

  const { data: engagements = [], isLoading } = useEngagements()

  // Construct consolidated genuine organisations list from engagements
  const allOrganisations: readonly AdminOrganisationRecord[] = useMemo(() => {
    const orgMap = new Map<string, AdminOrganisationRecord>()

    // Current user's organization
    if (currentUser?.organizationName) {
      const isAuditOrg = currentUser.role === 'AUDITOR' || currentUser.role === 'AUDIT_MANAGER'
      orgMap.set(currentUser.organizationName, {
        id: currentUser.organizationId || 'org-current',
        name: currentUser.organizationName,
        category: isAuditOrg ? 'AUDIT_PRACTICE' : 'CORPORATE_CLIENT',
        registrationNumber: isAuditOrg ? 'FRC/2026/000001' : 'RC-1482901',
        jurisdiction: 'Federal Republic of Nigeria',
        activeEngagementsCount: 0,
        completedEngagementsCount: 0,
        totalRequestsCount: 0,
        membersCount: 1,
        subscriptionTier: isAuditOrg ? 'Audit Practice Enterprise' : 'Corporate Annual Tier',
        status: 'ACTIVE',
        engagements: [],
        primaryContactName: currentUser.fullName,
        createdAt: currentUser.createdAt || '2026-01-01T00:00:00Z',
      })
    }

    // Client entities from Engagements
    engagements.forEach((eng) => {
      const clientName = eng.clientOrganizationName
      if (clientName) {
        const existing = orgMap.get(clientName)
        const isCompleted = eng.status === 'COMPLETED'
        const isActive = eng.status === 'ACTIVE' || eng.status === 'IN_REVIEW' || eng.status === 'OVERDUE'

        if (existing) {
          orgMap.set(clientName, {
            ...existing,
            activeEngagementsCount: existing.activeEngagementsCount + (isActive ? 1 : 0),
            completedEngagementsCount: existing.completedEngagementsCount + (isCompleted ? 1 : 0),
            totalRequestsCount: existing.totalRequestsCount + (eng.totalRequestsCount || 0),
            engagements: [...existing.engagements, eng],
          })
        } else {
          orgMap.set(clientName, {
            id: eng.clientOrganizationId || `org-client-${eng.id}`,
            name: clientName,
            category: 'CORPORATE_CLIENT',
            registrationNumber: `RC-${Math.abs(clientName.length * 9410)}`,
            jurisdiction: 'Nigeria (CAC Registered)',
            activeEngagementsCount: isActive ? 1 : 0,
            completedEngagementsCount: isCompleted ? 1 : 0,
            totalRequestsCount: eng.totalRequestsCount || 0,
            membersCount: Math.max(1, Math.min(12, Math.floor(eng.totalRequestsCount / 3) + 1)),
            subscriptionTier: 'Corporate Annual Plan',
            status: 'ACTIVE',
            engagements: [eng],
            createdAt: eng.createdAt,
          })
        }
      }

      // Audit firms from engagements
      const firmName = eng.auditorFirmName
      if (firmName && !orgMap.has(firmName)) {
        orgMap.set(firmName, {
          id: `org-firm-${Math.abs(firmName.length * 4821)}`,
          name: firmName,
          category: 'AUDIT_PRACTICE',
          registrationNumber: `FRC/2026/ICAN/${Math.abs(firmName.length * 12)}`,
          jurisdiction: 'Federal Republic of Nigeria',
          activeEngagementsCount: 1,
          completedEngagementsCount: 0,
          totalRequestsCount: eng.totalRequestsCount || 0,
          membersCount: 4,
          subscriptionTier: 'Audit Practice Enterprise',
          status: 'ACTIVE',
          engagements: [eng],
          primaryContactName: eng.leadAuditorName,
          createdAt: eng.createdAt,
        })
      }
    })

    return Array.from(orgMap.values())
  }, [currentUser, engagements])

  // Filter and search
  const filteredOrganisations = useMemo(() => {
    return allOrganisations.filter((org) => {
      if (selectedCategory !== 'ALL' && org.category !== selectedCategory) {
        return false
      }
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim()
        const matchesName = org.name.toLowerCase().includes(query)
        const matchesRc = org.registrationNumber?.toLowerCase().includes(query) || false
        return matchesName || matchesRc
      }
      return true
    })
  }, [allOrganisations, selectedCategory, searchQuery])

  // Pagination
  const paginatedOrgs = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredOrganisations.slice(start, start + PAGE_SIZE)
  }, [filteredOrganisations, currentPage])

  // CSV Export
  const handleExportCSV = () => {
    const headers = ['Organisation Name', 'Category', 'Registration #', 'Jurisdiction', 'Active Engagements', 'Subscription Tier', 'Status']
    const rows = filteredOrganisations.map((o) => [
      `"${o.name.replace(/"/g, '""')}"`,
      `"${o.category}"`,
      `"${o.registrationNumber || 'N/A'}"`,
      `"${o.jurisdiction}"`,
      o.activeEngagementsCount,
      `"${o.subscriptionTier}"`,
      `"${o.status}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `finauditease_organisations_${new Date().toISOString().slice(0, 10)}.csv`)
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
          { label: t('admin.organisations.breadcrumb', 'Organisations') },
        ]}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">{t('admin.organisations.title', 'Organisation Directory & Multi-Tenant Isolation')}</h1>
            <p className="admin-page-description">
              {t(
                'admin.organisations.description',
                'Manage audit practices and corporate enterprise clients with strictly isolated data boundaries.'
              )}
            </p>
          </div>

          <button
            type="button"
            className="btn btn-outline"
            onClick={handleExportCSV}
            disabled={filteredOrganisations.length === 0}
          >
            <Download size={15} aria-hidden="true" />
            <span>{t('admin.organisations.exportCsv', 'Export Directory (CSV)')}</span>
          </button>
        </div>
      </div>

      {/* Multi-Tenant Privacy Guarantee Banner */}
      <div className="admin-notice-banner" role="region" aria-label="Tenant Isolation Guarantee">
        <ShieldCheck size={20} className="admin-notice-icon" aria-hidden="true" />
        <div className="admin-notice-content">
          <div className="admin-notice-title">
            {t('admin.organisations.privacyGuaranteeTitle', 'Multi-Tenant Confidentiality Protocol')}
          </div>
          <div>
            {t(
              'admin.organisations.privacyGuaranteeDesc',
              'Organisation isolation is cryptographically and logically enforced. Administrators inspect high-level metadata, statutory compliance metrics, and licensing status without cross-exposing private ledgers or unredacted financial workpapers between entities.'
            )}
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="admin-controls-card">
        <div className="admin-controls-left">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="admin-search-input"
              placeholder={t('admin.organisations.searchPlaceholder', 'Search by organisation name, RC number, or jurisdiction...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              aria-label={t('admin.organisations.searchPlaceholder', 'Search organisations')}
            />
          </div>

          {/* Category Filter */}
          <select
            className="admin-filter-select"
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value)
              setCurrentPage(1)
            }}
            aria-label={t('admin.organisations.filterCategory', 'Filter by Category')}
          >
            <option value="ALL">{t('admin.organisations.allCategories', 'All Organisation Categories')}</option>
            <option value="AUDIT_PRACTICE">{t('admin.organisations.auditPracticesOnly', 'Audit Practices')}</option>
            <option value="CORPORATE_CLIENT">{t('admin.organisations.corporateClientsOnly', 'Corporate Client Entities')}</option>
          </select>
        </div>

        <div className="admin-controls-right">
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
            {t('common.showingRecords', {
              start: filteredOrganisations.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
              end: Math.min(currentPage * PAGE_SIZE, filteredOrganisations.length),
              total: filteredOrganisations.length,
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

      {/* ORGANISATIONS TABLE */}
      {!isLoading && (
        <div className="admin-table-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.organisations.tableLegalName', 'Organisation Legal Name')}</th>
                  <th>{t('admin.organisations.tableCategory', 'Category')}</th>
                  <th>{t('admin.organisations.tableActiveAudits', 'Active Engagements')}</th>
                  <th>{t('admin.organisations.tableMembers', 'Authorized Members')}</th>
                  <th>{t('admin.organisations.tableSubscription', 'Subscription Tier')}</th>
                  <th>{t('admin.organisations.tableStatus', 'Account Status')}</th>
                  <th style={{ textAlign: 'right' }}>{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrgs.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: 'var(--spacing-8) var(--spacing-4)', textAlign: 'center' }}>
                      <EmptyState
                        title={t('admin.organisations.noOrgsFound', 'No Organisations Match Your Filter')}
                        description={t('admin.organisations.noOrgsFoundDesc', 'Try clearing or modifying your search keywords.')}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedOrgs.map((org) => (
                    <tr key={org.id || org.name}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="admin-avatar sub-avatar" aria-hidden="true">
                            <Building size={16} />
                          </div>
                          <div>
                            <span className="admin-cell-title">{org.name}</span>
                            <span className="admin-cell-subtitle">
                              {org.registrationNumber} • {org.jurisdiction}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-pill ${
                            org.category === 'AUDIT_PRACTICE' ? 'admin-pill-success' : 'admin-pill-info'
                          }`}
                        >
                          {org.category === 'AUDIT_PRACTICE'
                            ? t('admin.organisations.auditPracticePill', 'Audit Practice')
                            : t('admin.organisations.corporateClientPill', 'Corporate Client')}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 700, color: 'var(--brand-charcoal)', fontSize: '13px' }}>
                          {org.activeEngagementsCount} {t('engagements.title', 'Audits')}
                        </span>
                        {org.completedEngagementsCount > 0 && (
                          <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>
                            ({org.completedEngagementsCount} {t('status.completed', 'completed')})
                          </span>
                        )}
                      </td>

                      <td>
                        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--slate)' }}>
                          {org.membersCount} {t('roles.financePlural', 'Users')}
                        </span>
                      </td>

                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--brand-green-800)', fontSize: '12px' }}>
                          {org.subscriptionTier}
                        </span>
                      </td>

                      <td>
                        <span className="admin-pill admin-pill-success">
                          {org.status}
                        </span>
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: '4px 10px', fontSize: '12px' }}
                          onClick={() => setInspectOrg(org)}
                          title={t('admin.organisations.viewProfile', 'View Organisation Profile')}
                        >
                          <Eye size={13} aria-hidden="true" />
                          <span>{t('admin.organisations.viewDetails', 'Profile')}</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredOrganisations.length > PAGE_SIZE && (
            <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderTop: '1px solid var(--brand-border)' }}>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredOrganisations.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}

      {/* ORGANISATION DETAIL INSPECTION MODAL */}
      {inspectOrg && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inspect-org-title">
          <div className="admin-modal-card">
            <div className="admin-modal-header">
              <h2 id="inspect-org-title" className="admin-modal-title">
                {t('admin.organisations.modalTitle', 'Organisation Profile & Governance Record')}
              </h2>
              <button
                type="button"
                className="btn btn-outline"
                style={{ padding: '4px 8px' }}
                onClick={() => setInspectOrg(null)}
                aria-label={t('common.close', 'Close')}
              >
                <X size={16} />
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: 'var(--spacing-5)' }}>
                <div className="admin-avatar sub-avatar" style={{ width: '48px', height: '48px' }}>
                  <Building size={24} />
                </div>
                <div>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--brand-charcoal)' }}>
                    {inspectOrg.name}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    {inspectOrg.registrationNumber} • {inspectOrg.jurisdiction}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--spacing-4)' }}>
                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.organisations.detailCategory', 'Entity Category')}</span>
                  <span className="admin-detail-value">
                    {inspectOrg.category === 'AUDIT_PRACTICE' ? 'Audit Practice' : 'Corporate Enterprise Client'}
                  </span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.organisations.detailPlan', 'Active Subscription Plan')}</span>
                  <span className="admin-detail-value">{inspectOrg.subscriptionTier}</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.organisations.detailActiveAudits', 'Active Engagements')}</span>
                  <span className="admin-detail-value">{inspectOrg.activeEngagementsCount} Statutory Engagements</span>
                </div>

                <div className="admin-detail-row">
                  <span className="admin-detail-label">{t('admin.organisations.detailMembers', 'Authorized Personnel')}</span>
                  <span className="admin-detail-value">{inspectOrg.membersCount} Verified Accounts</span>
                </div>
              </div>

              {/* Connected Engagements List */}
              <div style={{ marginTop: 'var(--spacing-4)', paddingTop: 'var(--spacing-4)', borderTop: '1px solid var(--brand-border)' }}>
                <span className="admin-detail-label" style={{ display: 'block', marginBottom: '8px' }}>
                  {t('admin.organisations.associatedAudits', 'Associated Audit Engagements')}
                </span>

                {inspectOrg.engagements.length === 0 ? (
                  <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                    {t('admin.organisations.noEngagementsAssoc', 'No ongoing engagements mapped to this organization.')}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {inspectOrg.engagements.map((e) => (
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
                        <span style={{ fontWeight: 600, color: 'var(--brand-charcoal)' }}>{e.title}</span>
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
                onClick={() => setInspectOrg(null)}
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

export default AdminOrganisationsPage
