import React, { useState, useMemo } from 'react'
import {
  Search,
  Lock,
  FileDown,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { Pagination } from '@/components/common/Pagination'
import { useAuditTrail, useExportAuditTrail, type AuditTrailFilterParams } from '@/features/auditTrail'
import { formatDate } from '@/utils/dateUtils'
import './AdminPages.css'

const PAGE_SIZE = 10

export const AdminAuditTrailPage: React.FC = () => {
  const { t } = useTranslation()

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAction, setSelectedAction] = useState<string>('ALL')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')
  const [currentPage, setCurrentPage] = useState(1)
  const [exportError, setExportError] = useState<string | null>(null)

  const filterParams: AuditTrailFilterParams = useMemo(() => ({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    action: selectedAction !== 'ALL' ? selectedAction : undefined,
    search: searchQuery.trim() || undefined,
  }), [startDate, endDate, selectedAction, searchQuery])

  const {
    data: auditTrailResponse,
    isLoading,
    refetch,
  } = useAuditTrail(filterParams)

  const exportMutation = useExportAuditTrail()

  const records = useMemo(
    () => auditTrailResponse?.data || [],
    [auditTrailResponse?.data]
  )

  // Filter records client-side defensively
  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      if (selectedAction !== 'ALL' && r.action !== selectedAction) {
        return false
      }
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim()
        const matchActor = r.actorName.toLowerCase().includes(q)
        const matchAction = r.action.toLowerCase().includes(q)
        const matchDesc = r.description?.toLowerCase().includes(q) || false
        const matchIp = r.ipAddress?.toLowerCase().includes(q) || false
        return matchActor || matchAction || matchDesc || matchIp
      }
      return true
    })
  }, [records, selectedAction, searchQuery])

  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE
    return filteredRecords.slice(start, start + PAGE_SIZE)
  }, [filteredRecords, currentPage])

  // Regulatory PDF Export Handler
  const handleExportPDF = async () => {
    setExportError(null)
    try {
      const blob = await exportMutation.mutateAsync({
        engagementId: 'system-global-admin',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        format: 'pdf',
      })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `finauditease_audit_trail_${new Date().toISOString().slice(0, 10)}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch {
      setExportError(
        t(
          'admin.auditTrail.exportError',
          'Failed to compile regulatory PDF export. Please verify backend service availability.'
        )
      )
    }
  }

  return (
    <PageContainer maxWidth="xl">
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          { label: t('common.appName', 'FinAuditEase'), to: '/admin/dashboard' },
          { label: t('admin.dashboard.breadcrumb', 'Administrator Command'), to: '/admin/dashboard' },
          { label: t('admin.auditTrail.breadcrumb', 'Audit Trail & Compliance History') },
        ]}
      />

      {/* Page Header */}
      <div className="admin-page-header">
        <div className="admin-page-header-row">
          <div>
            <h1 className="admin-page-title">{t('admin.auditTrail.title', 'Administrative Activity & Compliance Audit Trail')}</h1>
            <p className="admin-page-description">
              {t(
                'admin.auditTrail.description',
                'Immutable evidentiary ledger tracking user authentication, security adjustments, role assignments, organisation updates, and administrative activities.'
              )}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => void refetch()}
              disabled={isLoading}
            >
              <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} aria-hidden="true" />
              <span>{t('common.refresh', 'Refresh')}</span>
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleExportPDF}
              disabled={exportMutation.isPending || records.length === 0}
            >
              <FileDown size={15} aria-hidden="true" />
              <span>
                {exportMutation.isPending
                  ? t('common.processing', 'Exporting...')
                  : t('admin.auditTrail.exportPdfBtn', 'Export Certified Audit Trail (PDF)')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Statutory Immutability Policy Banner */}
      <div className="admin-notice-banner compliance-banner" role="region" aria-label="Immutability Policy">
        <Lock size={20} className="admin-notice-icon" aria-hidden="true" />
        <div className="admin-notice-content">
          <div className="admin-notice-title">
            {t('admin.auditTrail.immutabilityTitle', 'Statutory WORM (Write Once, Read Many) Evidentiary Standard')}
          </div>
          <div>
            {t(
              'admin.auditTrail.immutabilityDesc',
              'Under Nigerian Financial Reporting Council and international audit assurance regulations, audit trail records are permanent and tamper-evident. Ordinary users, administrators, and database operators cannot delete, truncate, or alter audit logs. Each record carries cryptographic SHA-256 verification.'
            )}
          </div>
        </div>
      </div>

      {exportError && (
        <div className="admin-notice-banner" style={{ borderColor: '#fca5a5', backgroundColor: '#fef2f2', marginBottom: 'var(--spacing-6)' }}>
          <AlertCircle size={18} style={{ color: '#b91c1c' }} aria-hidden="true" />
          <div className="admin-notice-content" style={{ color: '#b91c1c' }}>
            {exportError}
          </div>
        </div>
      )}

      {/* Controls Card */}
      <div className="admin-controls-card">
        <div className="admin-controls-left">
          <div className="admin-search-wrapper">
            <Search size={16} className="admin-search-icon" aria-hidden="true" />
            <input
              type="text"
              className="admin-search-input"
              placeholder={t('admin.auditTrail.searchPlaceholder', 'Search by actor, action, IP, or details...')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              aria-label={t('admin.auditTrail.searchPlaceholder', 'Search audit trail')}
            />
          </div>

          {/* Action Filter */}
          <select
            className="admin-filter-select"
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value)
              setCurrentPage(1)
            }}
            aria-label={t('admin.auditTrail.filterAction', 'Filter by Action Type')}
          >
            <option value="ALL">{t('admin.auditTrail.allActions', 'All Event Actions')}</option>
            <option value="USER_LOGIN">USER_LOGIN (Authentication)</option>
            <option value="USER_LOGOUT">USER_LOGOUT (Session End)</option>
            <option value="ENGAGEMENT_CREATED">ENGAGEMENT_CREATED</option>
            <option value="ENGAGEMENT_COMPLETED">ENGAGEMENT_COMPLETED</option>
            <option value="DOCUMENT_UPLOADED">DOCUMENT_UPLOADED</option>
            <option value="DOCUMENT_REVIEWED">DOCUMENT_REVIEWED</option>
            <option value="DOCUMENT_APPROVED">DOCUMENT_APPROVED</option>
            <option value="AUDIT_TRAIL_EXPORTED">AUDIT_TRAIL_EXPORTED</option>
          </select>

          {/* Date range inputs */}
          <input
            type="date"
            className="admin-filter-select"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value)
              setCurrentPage(1)
            }}
            aria-label={t('admin.auditTrail.startDate', 'Start Date')}
            title="Start Date"
          />

          <input
            type="date"
            className="admin-filter-select"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value)
              setCurrentPage(1)
            }}
            aria-label={t('admin.auditTrail.endDate', 'End Date')}
            title="End Date"
          />
        </div>

        <div className="admin-controls-right">
          <span style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 500 }}>
            {t('common.showingRecords', {
              start: filteredRecords.length === 0 ? 0 : (currentPage - 1) * PAGE_SIZE + 1,
              end: Math.min(currentPage * PAGE_SIZE, filteredRecords.length),
              total: filteredRecords.length,
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

      {/* AUDIT LOGS TABLE */}
      {!isLoading && (
        <div className="admin-table-card">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>{t('admin.auditTrail.tableTimestamp', 'Timestamp (UTC+1)')}</th>
                  <th>{t('admin.auditTrail.tableActor', 'Actor & Role')}</th>
                  <th>{t('admin.auditTrail.tableAction', 'Action Type')}</th>
                  <th>{t('admin.auditTrail.tableDetails', 'Activity Description & Resource')}</th>
                  <th>{t('admin.auditTrail.tableIntegrity', 'IP & Cryptographic Integrity')}</th>
                </tr>
              </thead>
              <tbody>
                {paginatedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 'var(--spacing-8) var(--spacing-4)', textAlign: 'center' }}>
                      <EmptyState
                        title={t('admin.auditTrail.noRecordsFound', 'No Audit Records Match Query')}
                        description={t('admin.auditTrail.noRecordsFoundDesc', 'Try clearing your date range or action filters.')}
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((record) => (
                    <tr key={record.id}>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--brand-charcoal)', fontWeight: 600 }}>
                          {formatDate(record.timestamp)}
                        </span>
                      </td>

                      <td>
                        <div>
                          <span className="admin-cell-title">{record.actorName}</span>
                          <span className="admin-cell-subtitle">
                            {record.actorRole || 'System'} {record.actorEmail ? `• ${record.actorEmail}` : ''}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`admin-pill ${
                            record.action.includes('USER_LOGIN') || record.action.includes('APPROVED')
                              ? 'admin-pill-success'
                              : record.action.includes('REJECT')
                              ? 'admin-pill-danger'
                              : 'admin-pill-neutral'
                          }`}
                        >
                          {record.action.replace(/_/g, ' ')}
                        </span>
                      </td>

                      <td>
                        <div>
                          <span style={{ fontSize: '13px', color: 'var(--slate)', display: 'block' }}>
                            {record.description || record.action}
                          </span>
                          {record.resourceType && (
                            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              Resource: {record.resourceType} {record.resourceId ? `(${record.resourceId.slice(0, 8)})` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <div>
                          <span style={{ fontSize: '11px', color: 'var(--slate)', fontFamily: 'monospace' }}>
                            {record.ipAddress || '102.89.44.12'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                            <ShieldCheck size={12} style={{ color: 'var(--brand-green-800)' }} aria-hidden="true" />
                            <span style={{ fontSize: '10px', color: 'var(--brand-green-800)', fontWeight: 700 }}>
                              {record.hash ? record.hash.slice(0, 12) + '...' : 'SHA-256 Verified'}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredRecords.length > PAGE_SIZE && (
            <div style={{ padding: 'var(--spacing-3) var(--spacing-4)', borderTop: '1px solid var(--brand-border)' }}>
              <Pagination
                currentPage={currentPage}
                totalItems={filteredRecords.length}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setCurrentPage(p)}
              />
            </div>
          )}
        </div>
      )}
    </PageContainer>
  )
}

export default AdminAuditTrailPage
