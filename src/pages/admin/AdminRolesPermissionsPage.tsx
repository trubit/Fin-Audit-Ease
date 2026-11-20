import React, { useState, useMemo } from 'react'
import {
  ShieldCheck,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Eye as EyeIcon,
  Lock,
  Users,
  Building2,
  Sliders,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import './AdminPages.css'

export type AccessLevel = 'FULL' | 'READ' | 'OWNER' | 'NONE'

export interface CapabilityRule {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly category: 'EVIDENCE' | 'REVIEW' | 'ACCOUNTING' | 'GOVERNANCE' | 'SECURITY'
  readonly description: string
  readonly accountingTeam: AccessLevel
  readonly auditor: AccessLevel
  readonly auditManager: AccessLevel
  readonly systemAdmin: AccessLevel
  readonly tenantBoundary: string
}

const DEFAULT_CAPABILITIES: readonly CapabilityRule[] = [
  {
    id: 'cap_01',
    code: 'EVIDENTIARY_DOC_UPLOAD',
    name: 'Evidentiary Document Upload',
    category: 'EVIDENCE',
    description: 'Upload client general ledgers, bank statements, and trial balances into PBC request folders.',
    accountingTeam: 'FULL',
    auditor: 'READ',
    auditManager: 'READ',
    systemAdmin: 'NONE',
    tenantBoundary: 'Client Organization Boundary strictly enforced. System Admin has zero file read access.',
  },
  {
    id: 'cap_02',
    code: 'WORKPAPER_REVIEW_DECISION',
    name: 'Workpaper Review & Decision',
    category: 'REVIEW',
    description: 'Submit formal audit decisions (Accepted, Revision Requested, Rejected) with private working paper notes.',
    accountingTeam: 'NONE',
    auditor: 'FULL',
    auditManager: 'FULL',
    systemAdmin: 'NONE',
    tenantBoundary: 'Restricted exclusively to assigned engagement audit firm members.',
  },
  {
    id: 'cap_03',
    code: 'PERIOD_CLOSE_LOCK',
    name: 'Period Close & Checklist Sign-Off',
    category: 'ACCOUNTING',
    description: 'Complete weekly and month-end accounting checklists, locking financial periods from further modification.',
    accountingTeam: 'FULL',
    auditor: 'READ',
    auditManager: 'READ',
    systemAdmin: 'NONE',
    tenantBoundary: 'Client organization ledger boundary. Prevents tampering once period status is locked.',
  },
  {
    id: 'cap_04',
    code: 'AUDIT_ENGAGEMENT_CREATION',
    name: 'Audit Engagement Scoping & Creation',
    category: 'REVIEW',
    description: 'Establish new formal assurance engagements, assign chartered audit teams, and specify materiality thresholds.',
    accountingTeam: 'NONE',
    auditor: 'FULL',
    auditManager: 'FULL',
    systemAdmin: 'READ',
    tenantBoundary: 'Audit Firm tenant boundary. System Admin possesses read-only compliance oversight.',
  },
  {
    id: 'cap_05',
    code: 'AUDITOR_CREDENTIAL_VERIFICATION',
    name: 'Auditor Practicing Licence Verification',
    category: 'GOVERNANCE',
    description: 'Verify ICAN/ANAN membership standing, practicing firm registration, and firm accreditation.',
    accountingTeam: 'NONE',
    auditor: 'NONE',
    auditManager: 'NONE',
    systemAdmin: 'FULL',
    tenantBoundary: 'FinAuditEase Platform Operations exclusive capability.',
  },
  {
    id: 'cap_06',
    code: 'ADMIN_PLATFORM_ACCESS',
    name: 'Administration Platform Console (/admin/*)',
    category: 'GOVERNANCE',
    description: 'Access the dedicated FinAuditEase administration portal, manage multi-tenant accounts, and dispatch announcements.',
    accountingTeam: 'NONE',
    auditor: 'NONE',
    auditManager: 'NONE',
    systemAdmin: 'FULL',
    tenantBoundary: 'Restricted strictly to Sabi Africa Platform Operations system administrators with 2FA.',
  },
  {
    id: 'cap_07',
    code: 'AUDIT_TRAIL_INSPECTION',
    name: 'Immutable Audit Trail Export & Inspection',
    category: 'SECURITY',
    description: 'Inspect SHA-256 chained activity logs, track privileged events, and export tamper-evident logs.',
    accountingTeam: 'OWNER',
    auditor: 'OWNER',
    auditManager: 'FULL',
    systemAdmin: 'FULL',
    tenantBoundary: 'Client and Auditor can only inspect logs of their own tenant. Admin inspects global system security trail.',
  },
  {
    id: 'cap_08',
    code: 'COMMUNICATION_CONSENT_OVERVIEW',
    name: 'Real-Time Communication Room Oversight',
    category: 'GOVERNANCE',
    description: 'Monitor affirmative recording consent ledgers, active encrypted video rooms, and storage consumption.',
    accountingTeam: 'OWNER',
    auditor: 'OWNER',
    auditManager: 'FULL',
    systemAdmin: 'READ',
    tenantBoundary: 'Engagement boundary for live participant session. Admin views metadata and consent proofs only.',
  },
  {
    id: 'cap_09',
    code: 'PLATFORM_SUBSCRIPTION_PROVISIONING',
    name: 'Subscription Tier & Seat Provisioning',
    category: 'GOVERNANCE',
    description: 'Adjust organization quota seats, manage annual enterprise licences, and monitor payment health.',
    accountingTeam: 'READ',
    auditor: 'READ',
    auditManager: 'READ',
    systemAdmin: 'FULL',
    tenantBoundary: 'Global administrative billing and tier provisioning authority.',
  },
  {
    id: 'cap_10',
    code: 'SYSTEM_SETTINGS_CONFIGURATION',
    name: 'Platform Settings & Retention Policies',
    category: 'SECURITY',
    description: 'Configure multi-factor authentication mandates, session timeouts, and NDPR data retention rules.',
    accountingTeam: 'NONE',
    auditor: 'NONE',
    auditManager: 'NONE',
    systemAdmin: 'FULL',
    tenantBoundary: 'System-wide configuration. Changes recorded immediately in immutable audit log.',
  },
]

export const AdminRolesPermissionsPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [inspectCapability, setInspectCapability] = useState<CapabilityRule | null>(null)

  const filteredCapabilities = useMemo(() => {
    const q = searchQuery.toLowerCase().trim()
    return DEFAULT_CAPABILITIES.filter((cap) => {
      const matchesSearch =
        !q ||
        cap.name.toLowerCase().includes(q) ||
        cap.code.toLowerCase().includes(q) ||
        cap.description.toLowerCase().includes(q)

      const matchesCat = selectedCategory === 'ALL' || cap.category === selectedCategory
      return matchesSearch && matchesCat
    })
  }, [searchQuery, selectedCategory])

  const handleExportPolicy = () => {
    const headers = ['Code', 'Capability Name', 'Category', 'Accounting Team', 'Auditor', 'Audit Manager', 'System Admin', 'Tenant Boundary']
    const rows = filteredCapabilities.map((c) => [
      c.code,
      `"${c.name}"`,
      c.category,
      c.accountingTeam,
      c.auditor,
      c.auditManager,
      c.systemAdmin,
      `"${c.tenantBoundary.replace(/"/g, '""')}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `FinAuditEase_RBAC_Governance_Matrix_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const renderAccessBadge = (level: AccessLevel) => {
    switch (level) {
      case 'FULL':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: '#e8f5ee',
              color: '#1a6b4a',
            }}
          >
            <CheckCircle2 size={12} aria-hidden="true" />
            FULL
          </span>
        )
      case 'READ':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
            }}
          >
            <EyeIcon size={12} aria-hidden="true" />
            READ ONLY
          </span>
        )
      case 'OWNER':
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: '#f0fdf4',
              color: '#15803d',
              border: '1px solid #bbf7d0',
            }}
          >
            <Lock size={12} aria-hidden="true" />
            OWNER ONLY
          </span>
        )
      case 'NONE':
      default:
        return (
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 700,
              backgroundColor: '#fee2e2',
              color: '#dc2626',
            }}
          >
            <XCircle size={12} aria-hidden="true" />
            NO ACCESS
          </span>
        )
    }
  }

  return (
    <PageContainer maxWidth="xl">
      <div className="admin-page-header">
        <Breadcrumbs
          items={[
            { label: t('admin.dashboard.title', 'Admin Platform'), to: '/admin/dashboard' },
            { label: t('admin.rolesPermissions.breadcrumb', 'Roles and Permissions') },
          ]}
        />
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">
              {t('admin.rolesPermissions.title', 'Roles and Permissions Governance')}
            </h1>
            <p className="admin-subtitle">
              {t(
                'admin.rolesPermissions.subtitle',
                'Authoritative Role-Based Access Control (RBAC) matrices, cross-role privilege boundaries, and tenant isolation policies'
              )}
            </p>
          </div>
          <div className="admin-header-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportPolicy}
              aria-label={t('admin.rolesPermissions.export', 'Export Permissions Matrix')}
            >
              <Download size={14} aria-hidden="true" />
              <span>{t('admin.rolesPermissions.export', 'Export Policy CSV')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="admin-kpi-grid">
        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">{t('admin.rolesPermissions.kpiRoles', 'Defined Core Roles')}</span>
            <Users size={16} className="admin-kpi-icon" aria-hidden="true" />
          </div>
          <div className="admin-kpi-value">4</div>
          <div className="admin-kpi-subtext" style={{ color: '#16a34a' }}>
            {t('admin.rolesPermissions.kpiEnforced', 'Strict RBAC Enforcement')}
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">{t('admin.rolesPermissions.kpiAuditorRoles', 'Auditor Firm Roles')}</span>
            <ShieldCheck size={16} className="admin-kpi-icon" aria-hidden="true" />
          </div>
          <div className="admin-kpi-value">2</div>
          <div className="admin-kpi-subtext">
            {t('admin.rolesPermissions.kpiAuditorSub', 'Chartered Auditor & Audit Manager')}
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">{t('admin.rolesPermissions.kpiClientRoles', 'Client Accounting Roles')}</span>
            <Building2 size={16} className="admin-kpi-icon" aria-hidden="true" />
          </div>
          <div className="admin-kpi-value">2</div>
          <div className="admin-kpi-subtext">
            {t('admin.rolesPermissions.kpiClientSub', 'Accounting Lead & Member')}
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">{t('admin.rolesPermissions.kpiAdminRole', 'System Admin Role')}</span>
            <Sliders size={16} className="admin-kpi-icon" aria-hidden="true" />
          </div>
          <div className="admin-kpi-value">1</div>
          <div className="admin-kpi-subtext" style={{ color: '#7c3aed' }}>
            {t('admin.rolesPermissions.kpiAdminSub', 'Platform Operations Only')}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-filter-bar">
        <div className="admin-search-wrapper">
          <Search size={14} className="admin-search-icon" aria-hidden="true" />
          <input
            type="text"
            className="admin-search-input"
            placeholder={t('admin.rolesPermissions.searchPlaceholder', 'Search capability name, code, or description...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('admin.rolesPermissions.searchAria', 'Search permissions')}
          />
        </div>

        <div className="admin-filter-group">
          <Filter size={14} aria-hidden="true" />
          <select
            className="admin-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            aria-label={t('admin.rolesPermissions.filterCategory', 'Filter by capability category')}
          >
            <option value="ALL">{t('admin.rolesPermissions.allCategories', 'All Capabilities')}</option>
            <option value="EVIDENCE">{t('admin.rolesPermissions.catEvidence', 'Evidence & Documents')}</option>
            <option value="REVIEW">{t('admin.rolesPermissions.catReview', 'Audits & Reviews')}</option>
            <option value="ACCOUNTING">{t('admin.rolesPermissions.catAccounting', 'Accounting Operations')}</option>
            <option value="GOVERNANCE">{t('admin.rolesPermissions.catGovernance', 'Platform Governance')}</option>
            <option value="SECURITY">{t('admin.rolesPermissions.catSecurity', 'Security & Controls')}</option>
          </select>
        </div>
      </div>

      {/* Permissions Matrix Table */}
      {filteredCapabilities.length === 0 ? (
        <EmptyState
          title={t('admin.rolesPermissions.noResultsTitle', 'No Capabilities Found')}
          description={t(
            'admin.rolesPermissions.noResultsDesc',
            'No access capabilities match your current search criteria. Try modifying your search query or category filter.'
          )}
        />
      ) : (
        <div className="admin-table-card">
          <div className="admin-table-wrapper">
            <table className="admin-table" aria-label={t('admin.rolesPermissions.tableAria', 'RBAC Permissions Matrix')}>
              <thead>
                <tr>
                  <th scope="col" style={{ width: '30%' }}>
                    {t('admin.rolesPermissions.colCapability', 'Application Capability / Resource')}
                  </th>
                  <th scope="col" style={{ textAlign: 'center' }}>
                    {t('admin.rolesPermissions.colAccounting', 'Accounting Team')}
                  </th>
                  <th scope="col" style={{ textAlign: 'center' }}>
                    {t('admin.rolesPermissions.colAuditor', 'Chartered Auditor')}
                  </th>
                  <th scope="col" style={{ textAlign: 'center' }}>
                    {t('admin.rolesPermissions.colManager', 'Audit Manager')}
                  </th>
                  <th scope="col" style={{ textAlign: 'center' }}>
                    {t('admin.rolesPermissions.colAdmin', 'System Admin')}
                  </th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    {t('admin.common.actions', 'Actions')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCapabilities.map((cap) => (
                  <tr key={cap.id}>
                    <td>
                      <div>
                        <span style={{ fontWeight: 600, color: '#0f172a', display: 'block' }}>{cap.name}</span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          <code>{cap.code}</code> • {cap.description}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>{renderAccessBadge(cap.accountingTeam)}</td>
                    <td style={{ textAlign: 'center' }}>{renderAccessBadge(cap.auditor)}</td>
                    <td style={{ textAlign: 'center' }}>{renderAccessBadge(cap.auditManager)}</td>
                    <td style={{ textAlign: 'center' }}>{renderAccessBadge(cap.systemAdmin)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="btn btn-secondary btn-xs"
                        onClick={() => setInspectCapability(cap)}
                        aria-label={`${t('admin.rolesPermissions.inspect', 'Inspect')} ${cap.name}`}
                      >
                        <Eye size={12} aria-hidden="true" />
                        <span>{t('admin.rolesPermissions.inspect', 'Inspect')}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inspect Capability Modal */}
      {inspectCapability && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inspect-cap-title">
          <div className="admin-modal-card" style={{ maxWidth: '640px' }}>
            <div className="admin-modal-header">
              <h2 id="inspect-cap-title" className="admin-modal-title">
                {inspectCapability.name}
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setInspectCapability(null)}
                aria-label={t('admin.common.close', 'Close')}
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  {t('admin.rolesPermissions.policyCode', 'Authoritative Backend Policy Code')}
                </span>
                <code
                  style={{
                    backgroundColor: '#f1f5f9',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0f172a',
                    display: 'inline-block',
                  }}
                >
                  {inspectCapability.code}
                </code>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  {t('admin.rolesPermissions.description', 'Functional Scope')}
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                  {inspectCapability.description}
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  {t('admin.rolesPermissions.tenantBoundary', 'Tenant Isolation & Cryptographic Boundary')}
                </span>
                <div
                  style={{
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    padding: '10px 12px',
                    fontSize: '12px',
                    color: '#1e293b',
                  }}
                >
                  <ShieldCheck size={14} style={{ color: '#0f766e', marginRight: '6px', verticalAlign: '-2px' }} />
                  {inspectCapability.tenantBoundary}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '8px' }}>
                  {t('admin.rolesPermissions.roleAssignment', 'Role Entitlement Levels')}
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Accounting Team</div>
                    <div>{renderAccessBadge(inspectCapability.accountingTeam)}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Chartered Auditor</div>
                    <div>{renderAccessBadge(inspectCapability.auditor)}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Audit Manager</div>
                    <div>{renderAccessBadge(inspectCapability.auditManager)}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>System Administrator</div>
                    <div>{renderAccessBadge(inspectCapability.systemAdmin)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setInspectCapability(null)}
              >
                {t('admin.common.close', 'Close')}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
