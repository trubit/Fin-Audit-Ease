import React, { useState, useMemo } from 'react'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
  Lock,
  X,
  Loader2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  useAssets,
  useVerifyAsset,
  useRequestAssetAccess,
  type AssetRecord,
  type AssetCategory,
  type AssetVerificationStatus,
} from '@/features/assets'
import './AssetVerificationPage.css'

const getTodayIsoString = (): string => new Date().toISOString().split('T')[0]

export const AssetVerificationPage: React.FC = () => {
  const { t } = useTranslation()
  const { user } = useAuth()

  const [selectedCategory, setSelectedCategory] = useState<AssetCategory | 'ALL'>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<AssetVerificationStatus | 'ALL'>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [verifyingAsset, setVerifyingAsset] = useState<AssetRecord | null>(null)
  const [physicalBalanceInput, setPhysicalBalanceInput] = useState<string>('')
  const [verificationDateInput, setVerificationDateInput] = useState<string>(getTodayIsoString)
  const [commentsInput, setCommentsInput] = useState<string>('')
  const [accessRequestStatus, setAccessRequestStatus] = useState<
    'IDLE' | 'PENDING' | 'ERROR' | 'UNSUPPORTED'
  >('IDLE')
  const [accessRequestMessage, setAccessRequestMessage] = useState<string | null>(null)

  const isAuditor =
    user?.role === 'AUDITOR' || user?.role === 'AUDIT_MANAGER' || user?.role === 'ADMIN'

  // Fetch real assets from backend
  const {
    data: assetsResponse,
    isLoading,
    refetch,
  } = useAssets({
    category: selectedCategory !== 'ALL' ? selectedCategory : undefined,
    status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
    search: searchQuery.trim() || undefined,
  })

  const { mutate: verifyAsset, isPending: isVerifying } = useVerifyAsset()
  const { mutate: requestAccess, isPending: isRequestingAccess } = useRequestAssetAccess()

  const rawAssets = assetsResponse?.data

  // Client-side filtering when backend returns general list
  const filteredAssets = useMemo(() => {
    if (!rawAssets) return []
    return rawAssets.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false
      if (selectedStatus !== 'ALL' && item.verificationStatus !== selectedStatus) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesName = item.name.toLowerCase().includes(q)
        const matchesTag = item.assetTag.toLowerCase().includes(q)
        const matchesType = item.assetType.toLowerCase().includes(q)
        const matchesPerson = item.responsiblePerson?.toLowerCase().includes(q)
        if (!matchesName && !matchesTag && !matchesType && !matchesPerson) return false
      }
      return true
    })
  }, [rawAssets, selectedCategory, selectedStatus, searchQuery])

  // Handle Auditor Access Request
  const handleAuditorRequestAccess = () => {
    if (accessRequestStatus === 'PENDING') return
    setAccessRequestStatus('PENDING')
    setAccessRequestMessage(null)

    requestAccess(
      { reason: 'Statutory verification audit engagement' },
      {
        onSuccess: () => {
          setAccessRequestStatus('PENDING')
          setAccessRequestMessage(
            t(
              'assets.accessRequestSubmitted',
              'Access request submitted to client organization lead. Awaiting authorization.'
            )
          )
        },
        onError: () => {
          setAccessRequestStatus('UNSUPPORTED')
          setAccessRequestMessage(
            t(
              'assets.accessRequestBackendPending',
              'Backend API endpoint POST /api/v1/assets/access-requests has not yet been deployed. Formal access request cannot be stored until backend support is completed.'
            )
          )
        },
      }
    )
  }

  // Handle Verification Modal Open
  const handleOpenVerification = (asset: AssetRecord) => {
    setVerifyingAsset(asset)
    setPhysicalBalanceInput(asset.physicalBalance !== undefined && asset.physicalBalance !== null ? String(asset.physicalBalance) : '')
    setVerificationDateInput(asset.verificationDate || getTodayIsoString())
    setCommentsInput(asset.comments || '')
  }

  // Handle Verification Submit
  const handleConfirmVerification = (e: React.FormEvent) => {
    e.preventDefault()
    if (!verifyingAsset) return

    const parsedPhysical = parseFloat(physicalBalanceInput)
    if (isNaN(parsedPhysical)) return

    const variance = parsedPhysical - verifyingAsset.systemBalance
    const status: AssetVerificationStatus =
      variance === 0 ? 'VERIFIED' : 'DISCREPANCY'

    verifyAsset(
      {
        id: verifyingAsset.id,
        payload: {
          physicalBalance: parsedPhysical,
          verificationDate: verificationDateInput,
          verificationStatus: status,
          comments: commentsInput.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setVerifyingAsset(null)
          refetch()
        },
      }
    )
  }

  // Calculate live variance in modal
  const liveVariance = useMemo(() => {
    if (!verifyingAsset) return null
    const parsed = parseFloat(physicalBalanceInput)
    if (isNaN(parsed)) return null
    return parsed - verifyingAsset.systemBalance
  }, [verifyingAsset, physicalBalanceInput])

  const renderStatusBadge = (status: AssetVerificationStatus) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} />
            <span>{t('assets.verified', 'Verified')}</span>
          </span>
        )
      case 'DISCREPANCY':
        return (
          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <AlertTriangle size={12} />
            <span>{t('assets.discrepancy', 'Discrepancy')}</span>
          </span>
        )
      case 'PENDING_REVIEW':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>{t('assets.pendingReview', 'Pending Review')}</span>
          </span>
        )
      default:
        return (
          <span className="badge badge-neutral">
            <span>{t('assets.unverified', 'Unverified')}</span>
          </span>
        )
    }
  }

  return (
    <PageContainer
      title={t('assets.registerTitle', 'Asset Verification Register')}
      subtitle={t(
        'assets.registerSubtitle',
        'Finance Module — Compare accounting-system balances against physical verification results and record discrepancies.'
      )}
      maxWidth="xl"
      actions={
        <div style={{ display: 'flex', gap: 'var(--spacing-2)', alignItems: 'center' }}>
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={() => void refetch()}
            disabled={isLoading}
            aria-label={t('common.refresh', 'Refresh')}
          >
            <RefreshCw size={16} className={isLoading ? 'spin-animation' : ''} aria-hidden="true" />
            <span>{t('common.refresh', 'Refresh')}</span>
          </button>

          {isAuditor ? (
            <button
              type="button"
              className="btn btn-primary btn-md"
              onClick={handleAuditorRequestAccess}
              disabled={isRequestingAccess || accessRequestStatus === 'PENDING'}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Lock size={16} aria-hidden="true" />
              <span>
                {accessRequestStatus === 'PENDING'
                  ? t('assets.accessRequestPending', 'Access Request Pending')
                  : t('assets.requestAccess', 'Request Access')}
              </span>
            </button>
          ) : null}
        </div>
      }
    >
      <div style={{ marginBottom: 'var(--spacing-5)' }}>
        <Breadcrumbs
          items={[
            { label: t('navigation.dashboard', 'Dashboard'), to: '/dashboard' },
            { label: t('financeModule.title', 'Finance Module') },
            { label: t('assets.registerTitle', 'Asset Verification Register') },
          ]}
        />
      </div>

      {/* Module Identity Banner */}
      <div className="asset-module-pill">
        <span className="asset-module-pill-dot" aria-hidden="true" />
        <span>{t('financeModule.badge', 'Finance Module')}</span>
      </div>

      {/* Auditor Notice Banner */}
      {isAuditor && (
        <div
          className="card"
          style={{
            padding: 'var(--spacing-4) var(--spacing-5)',
            marginBottom: 'var(--spacing-5)',
            borderLeft: '4px solid var(--color-primary-600)',
            backgroundColor: 'var(--color-primary-50)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
            <ShieldCheck size={22} style={{ color: 'var(--color-primary-700)' }} />
            <div>
              <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-primary-900)' }}>
                {t('assets.auditorNoticeTitle', 'Auditor Verification Inspection')}
              </h4>
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-800)' }}>
                {t(
                  'assets.auditorNoticeDesc',
                  'Auditors can inspect confirmed client asset registers for audit sampling. If access has not been granted by the client organization, use "Request Access" above.'
                )}
              </p>
            </div>
          </div>
          {accessRequestMessage && (
            <p
              style={{
                marginTop: 'var(--spacing-2)',
                marginBottom: 0,
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: accessRequestStatus === 'UNSUPPORTED' ? 'var(--color-rose-700)' : 'var(--color-primary-900)',
              }}
            >
              {accessRequestMessage}
            </p>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="asset-filter-bar">
        <div className="asset-category-tabs" role="tablist" aria-label={t('assets.categoryTabsLabel', 'Asset Categories')}>
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'ALL'}
            className={`btn btn-sm ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            {t('common.all', 'All Categories')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'FIXED'}
            className={`btn btn-sm ${selectedCategory === 'FIXED' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory('FIXED')}
          >
            {t('assets.fixedAssets', 'Fixed Assets')}
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'CURRENT'}
            className={`btn btn-sm ${selectedCategory === 'CURRENT' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory('CURRENT')}
          >
            {t('assets.currentAssets', 'Current Assets')}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 'var(--spacing-3)', alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as AssetVerificationStatus | 'ALL')}
            aria-label={t('assets.filterByStatus', 'Filter by verification status')}
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            <option value="ALL">{t('common.allStatuses', 'All Statuses')}</option>
            <option value="UNVERIFIED">{t('assets.unverified', 'Unverified')}</option>
            <option value="VERIFIED">{t('assets.verified', 'Verified')}</option>
            <option value="DISCREPANCY">{t('assets.discrepancy', 'Discrepancy')}</option>
            <option value="PENDING_REVIEW">{t('assets.pendingReview', 'Pending Review')}</option>
          </select>

          <div className="asset-search-input">
            <Search size={16} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
            <input
              type="text"
              placeholder={t('assets.searchPlaceholder', 'Search by name, tag, or assignee...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label={t('assets.searchPlaceholder', 'Search assets')}
            />
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
          <LoadingSkeleton height="3.5rem" />
          <LoadingSkeleton height="12rem" />
        </div>
      )}

      {/* Empty State (Honest & Genuine) */}
      {!isLoading && filteredAssets.length === 0 && (
        <EmptyState
          title={t('assets.emptyTitle', 'No Asset Records in Register')}
          description={t(
            'assets.emptyDescription',
            'No asset verification records match your filter criteria or have been returned by the backend general ledger. Genuine records will appear here once saved.'
          )}
        />
      )}

      {/* Desktop Data Table */}
      {!isLoading && filteredAssets.length > 0 && (
        <>
          <div className="asset-table-wrapper">
            <table className="asset-table">
              <thead>
                <tr>
                  <th>{t('assets.assetTag', 'Tag / ID')}</th>
                  <th>{t('assets.assetName', 'Asset Name & Type')}</th>
                  <th>{t('assets.category', 'Category')}</th>
                  <th>{t('assets.systemFigure', 'System Figure')}</th>
                  <th>{t('assets.physicalBalance', 'Physical Balance')}</th>
                  <th>{t('assets.variance', 'Variance')}</th>
                  <th>{t('assets.verificationDate', 'Verification Date')}</th>
                  <th>{t('assets.status', 'Status')}</th>
                  {!isAuditor && <th>{t('common.actions', 'Action')}</th>}
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map((asset) => {
                  const hasPhysical =
                    asset.physicalBalance !== undefined && asset.physicalBalance !== null
                  const variance = hasPhysical
                    ? (asset.physicalBalance as number) - asset.systemBalance
                    : null

                  return (
                    <tr key={asset.id}>
                      <td>
                        <span className="asset-tag-badge">{asset.assetTag}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600, color: 'var(--color-slate-900)' }}>
                            {asset.name}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {asset.assetType}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-neutral">
                          {asset.category === 'FIXED'
                            ? t('assets.fixedAssets', 'Fixed Assets')
                            : t('assets.currentAssets', 'Current Assets')}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                        ₦{asset.systemBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {hasPhysical
                          ? `₦${(asset.physicalBalance as number).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                          : '—'}
                      </td>
                      <td style={{ fontFamily: 'monospace' }}>
                        {variance !== null ? (
                          <span
                            className={
                              variance === 0
                                ? 'asset-variance-neutral'
                                : 'asset-variance-positive'
                            }
                          >
                            {variance > 0 ? `+₦${variance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : variance < 0 ? `-₦${Math.abs(variance).toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '₦0.00'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>{asset.verificationDate || '—'}</td>
                      <td>{renderStatusBadge(asset.verificationStatus)}</td>
                      {!isAuditor && (
                        <td>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            onClick={() => handleOpenVerification(asset)}
                          >
                            {t('assets.recordVerificationBtn', 'Verify')}
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards Grid */}
          <div className="asset-cards-grid">
            {filteredAssets.map((asset) => {
              const hasPhysical =
                asset.physicalBalance !== undefined && asset.physicalBalance !== null
              const variance = hasPhysical
                ? (asset.physicalBalance as number) - asset.systemBalance
                : null

              return (
                <div key={asset.id} className="asset-card">
                  <div className="asset-card-header">
                    <div>
                      <span className="asset-tag-badge" style={{ marginBottom: '4px', display: 'inline-block' }}>
                        {asset.assetTag}
                      </span>
                      <h3 className="asset-card-title">{asset.name}</h3>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {asset.assetType} • {asset.category === 'FIXED' ? t('assets.fixedAssets') : t('assets.currentAssets')}
                      </span>
                    </div>
                    {renderStatusBadge(asset.verificationStatus)}
                  </div>

                  <div className="asset-card-meta">
                    <div className="asset-card-meta-item">
                      <span className="asset-card-meta-label">{t('assets.systemFigure')}</span>
                      <span className="asset-card-meta-val">
                        ₦{asset.systemBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="asset-card-meta-item">
                      <span className="asset-card-meta-label">{t('assets.physicalBalance')}</span>
                      <span className="asset-card-meta-val">
                        {hasPhysical
                          ? `₦${(asset.physicalBalance as number).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`
                          : '—'}
                      </span>
                    </div>
                    <div className="asset-card-meta-item">
                      <span className="asset-card-meta-label">{t('assets.variance')}</span>
                      <span className="asset-card-meta-val">
                        {variance !== null ? `₦${variance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : '—'}
                      </span>
                    </div>
                    <div className="asset-card-meta-item">
                      <span className="asset-card-meta-label">{t('assets.verificationDate')}</span>
                      <span className="asset-card-meta-val">{asset.verificationDate || '—'}</span>
                    </div>
                  </div>

                  {!isAuditor && (
                    <button
                      type="button"
                      className="btn btn-outline btn-sm"
                      style={{ marginTop: 'var(--spacing-2)' }}
                      onClick={() => handleOpenVerification(asset)}
                    >
                      {t('assets.recordVerificationBtn', 'Verify / Record Balance')}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Verification Modal (Accounting Team) */}
      {verifyingAsset && (
        <div
          className="review-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="asset-modal-title"
        >
          <div className="review-modal-card" style={{ maxWidth: '32rem' }}>
            <div className="review-modal-header">
              <h2 id="asset-modal-title" className="review-modal-title">
                {t('assets.recordVerificationTitle', 'Record Physical Verification')}
              </h2>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setVerifyingAsset(null)}
                aria-label={t('common.close', 'Close')}
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleConfirmVerification}>
              <div style={{ marginBottom: 'var(--spacing-4)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: 'var(--spacing-3)' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    {verifyingAsset.assetTag} • {verifyingAsset.category === 'FIXED' ? t('assets.fixedAssets') : t('assets.currentAssets')}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 700, color: 'var(--color-slate-900)' }}>
                    {verifyingAsset.name}
                  </span>
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-slate-700)' }}>
                    {t('assets.systemFigure')}:{' '}
                    <strong>₦{verifyingAsset.systemBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}</strong>
                  </span>
                </div>

                {/* Physical Balance Input */}
                <div style={{ marginBottom: 'var(--spacing-3)' }}>
                  <label
                    htmlFor="physical-balance-input"
                    style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '4px' }}
                  >
                    {t('assets.physicalBalance')} (₦)*
                  </label>
                  <input
                    id="physical-balance-input"
                    type="number"
                    step="0.01"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                    placeholder="Enter physically counted balance..."
                    value={physicalBalanceInput}
                    onChange={(e) => setPhysicalBalanceInput(e.target.value)}
                  />
                </div>

                {/* Calculated Live Variance */}
                {liveVariance !== null && (
                  <div
                    style={{
                      padding: 'var(--spacing-2) var(--spacing-3)',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: liveVariance === 0 ? 'var(--color-emerald-50)' : 'var(--color-rose-50)',
                      border: `1px solid ${liveVariance === 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                      marginBottom: 'var(--spacing-3)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: liveVariance === 0 ? 'var(--color-emerald-800)' : 'var(--color-rose-800)' }}>
                      {t('assets.variance')}:
                    </span>
                    <span style={{ fontFamily: 'monospace', fontWeight: 700, color: liveVariance === 0 ? 'var(--color-emerald-800)' : 'var(--color-rose-800)' }}>
                      {liveVariance > 0 ? `+₦${liveVariance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}` : `₦${liveVariance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}`}
                    </span>
                  </div>
                )}

                {/* Verification Date */}
                <div style={{ marginBottom: 'var(--spacing-3)' }}>
                  <label
                    htmlFor="verification-date-input"
                    style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '4px' }}
                  >
                    {t('assets.verificationDate')}*
                  </label>
                  <input
                    id="verification-date-input"
                    type="date"
                    required
                    className="form-input"
                    style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}
                    value={verificationDateInput}
                    onChange={(e) => setVerificationDateInput(e.target.value)}
                  />
                </div>

                {/* Discrepancy Comments */}
                <div style={{ marginBottom: 'var(--spacing-3)' }}>
                  <label
                    htmlFor="asset-comments-input"
                    style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-slate-700)', marginBottom: '4px' }}
                  >
                    {t('assets.commentsLabel', 'Explanations & Discrepancy Notes')}
                  </label>
                  <textarea
                    id="asset-comments-input"
                    rows={3}
                    className="review-modal-textarea"
                    placeholder={t(
                      'assets.commentsPlaceholder',
                      'Explain physical count method, location, discrepancy root cause, or audit notes...'
                    )}
                    value={commentsInput}
                    onChange={(e) => setCommentsInput(e.target.value)}
                  />
                </div>
              </div>

              <div className="review-modal-actions">
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => setVerifyingAsset(null)}
                  disabled={isVerifying}
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={isVerifying || !physicalBalanceInput}
                >
                  {isVerifying ? (
                    <>
                      <Loader2 size={14} className="spin-animation" aria-hidden="true" />
                      <span>{t('common.saving', 'Saving...')}</span>
                    </>
                  ) : (
                    <span>{t('assets.saveVerification', 'Save Verification')}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
