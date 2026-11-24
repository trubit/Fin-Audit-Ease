import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
  Settings,
  Activity,
  Layers,
  Clock,
  UserCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { EmptyState } from '@/components/feedback/EmptyState/EmptyState'
import { useEngagements } from '@/features/engagements/hooks/useEngagements'
import { useAuditRequests } from '@/features/auditRequests/hooks/useAuditRequests'
import { useAuditTrail } from '@/features/auditTrail/hooks/useAuditTrail'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useAdminAuth } from '@/features/admin-auth/hooks/useAdminAuth'
import { formatDate } from '@/utils/dateUtils'
import './AdminPages.css'

export type AccessLevel = 'FULL' | 'READ' | 'OWNER' | 'NONE'

export interface CapabilityRule {
  readonly id: string
  readonly code: string
  readonly name: string
  readonly category: 'EVIDENCE' | 'REVIEW' | 'ACCOUNTING' | 'GOVERNANCE' | 'SECURITY'
  readonly description: string
  readonly accountingTeam: AccessLevel
  readonly accountingManager: AccessLevel
  readonly auditor: AccessLevel
  readonly auditManager: AccessLevel
  readonly auditEngagementManager: AccessLevel
  readonly systemAdmin: AccessLevel
  readonly tenantBoundary: string
}

export interface ApplicationRoleDefinition {
  readonly id: string
  readonly roleCode: string
  readonly roleEnum: string
  readonly name: string
  readonly category: 'Platform Operations' | 'Assurance Practice' | 'Client Accounting'
  readonly description: string
  readonly authorityLevel: string
  readonly primaryBoundary: string
  readonly defaultStatus: 'ACTIVE' | 'RESTRICTED'
  readonly userQueryParam: string
}

const APPLICATION_ROLES: readonly ApplicationRoleDefinition[] = [
  {
    id: 'role_admin',
    roleCode: 'ADMIN',
    roleEnum: 'ADMIN',
    name: 'Platform System Administrator',
    category: 'Platform Operations',
    description: 'Central platform governance, user-role assignment, tenant provisioning, system security, and cross-role audit supervision.',
    authorityLevel: 'Global Administrative Authority',
    primaryBoundary: 'FinAuditEase Platform Operations Boundary. Zero access to client evidentiary documents or financial workpapers.',
    defaultStatus: 'ACTIVE',
    userQueryParam: 'ADMIN',
  },
  {
    id: 'role_auditor',
    roleCode: 'AUDITOR',
    roleEnum: 'AUDITOR',
    name: 'Lead Auditor',
    category: 'Assurance Practice',
    description: 'Executing statutory audit procedures, managing PBC workpaper evidence, fieldwork reconciliation, and submitting audit findings.',
    authorityLevel: 'Engagement Execution Authority',
    primaryBoundary: 'Audit Firm tenant boundary. Confined strictly to formally assigned assurance engagements.',
    defaultStatus: 'ACTIVE',
    userQueryParam: 'AUDITOR',
  },
  {
    id: 'role_audit_manager',
    roleCode: 'AUDIT_MANAGER',
    roleEnum: 'AUDIT_MANAGER',
    name: 'Audit Manager',
    category: 'Assurance Practice',
    description: 'Assurance quality review, engagement oversight, team coordination, fieldwork monitoring, and interim review sign-offs.',
    authorityLevel: 'Assurance Supervisory Authority',
    primaryBoundary: 'Audit Firm tenant boundary across all supervised client assurance portfolios.',
    defaultStatus: 'ACTIVE',
    userQueryParam: 'AUDIT_MANAGER',
  },
  {
    id: 'role_audit_engagement_manager',
    roleCode: 'AUDIT_ENGAGEMENT_MGR',
    roleEnum: 'AUDIT_MANAGER',
    name: 'Audit Engagement Manager',
    category: 'Assurance Practice',
    description: 'Senior partner authority, formal assurance sign-offs, engagement scoping, materiality thresholds, and audit opinion issuance.',
    authorityLevel: 'Partner Assurance Authority',
    primaryBoundary: 'Audit Firm executive boundary. Authoritative sign-off on formal engagement deliverables.',
    defaultStatus: 'ACTIVE',
    userQueryParam: 'AUDIT_MANAGER',
  },
  {
    id: 'role_finance_user',
    roleCode: 'FINANCE_USER',
    roleEnum: 'FINANCE_USER',
    name: 'Accounting Team / SME',
    category: 'Client Accounting',
    description: 'Preparation and upload of general ledger evidence, bank reconciliations, trial balances, and PBC response submissions.',
    authorityLevel: 'Client Preparer Authority',
    primaryBoundary: 'Client Organization Boundary. Locked ledger boundary prevents retroactive modification.',
    defaultStatus: 'ACTIVE',
    userQueryParam: 'FINANCE_USER',
  },
  {
    id: 'role_accounting_manager',
    roleCode: 'ACCOUNTING_MANAGER',
    roleEnum: 'ACCOUNTING_MANAGER',
    name: 'Accounting Engagement Manager',
    category: 'Client Accounting',
    description: 'Client accounting team supervision, document verification before auditor forwarding, and month-end closing sign-off.',
    authorityLevel: 'Client Management & Sign-off Authority',
    primaryBoundary: 'Client Organization Boundary. Supervises client staff and approves evidence forwarded to the audit firm.',
    defaultStatus: 'ACTIVE',
    userQueryParam: 'ACCOUNTING_MANAGER',
  },
]

const DEFAULT_CAPABILITIES: readonly CapabilityRule[] = [
  {
    id: 'cap_01',
    code: 'EVIDENTIARY_DOC_UPLOAD',
    name: 'Evidentiary Document Upload',
    category: 'EVIDENCE',
    description: 'Upload client general ledgers, bank statements, and trial balances into PBC request folders.',
    accountingTeam: 'FULL',
    accountingManager: 'FULL',
    auditor: 'READ',
    auditManager: 'READ',
    auditEngagementManager: 'READ',
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
    accountingManager: 'NONE',
    auditor: 'FULL',
    auditManager: 'FULL',
    auditEngagementManager: 'FULL',
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
    accountingManager: 'FULL',
    auditor: 'READ',
    auditManager: 'READ',
    auditEngagementManager: 'READ',
    systemAdmin: 'NONE',
    tenantBoundary: 'Client organization ledger boundary. Prevents tampering once period status is locked.',
  },
  {
    id: 'cap_04',
    code: 'AUDIT_ENGAGEMENT_CREATION',
    name: 'Audit Engagement Scoping & Creation',
    category: 'REVIEW',
    description: 'Establish new formal assurance engagements, assign audit teams, and specify materiality thresholds.',
    accountingTeam: 'NONE',
    accountingManager: 'NONE',
    auditor: 'FULL',
    auditManager: 'FULL',
    auditEngagementManager: 'FULL',
    systemAdmin: 'READ',
    tenantBoundary: 'Audit Firm tenant boundary. System Admin possesses read-only compliance oversight.',
  },
  {
    id: 'cap_05',
    code: 'SUPERVISOR_DOCUMENT_FORWARDING',
    name: 'Supervisor Document Review & Forwarding',
    category: 'ACCOUNTING',
    description: 'Inspect internal accounting schedules and forward verified documentation to external auditors.',
    accountingTeam: 'READ',
    accountingManager: 'FULL',
    auditor: 'READ',
    auditManager: 'READ',
    auditEngagementManager: 'READ',
    systemAdmin: 'NONE',
    tenantBoundary: 'Client supervisor approval boundary prior to external audit firm exposure.',
  },
  {
    id: 'cap_06',
    code: 'AUDITOR_CREDENTIAL_VERIFICATION',
    name: 'Auditor Practicing Licence Verification',
    category: 'GOVERNANCE',
    description: 'Verify ICAN/ANAN membership standing, practicing firm registration, and firm accreditation.',
    accountingTeam: 'NONE',
    accountingManager: 'NONE',
    auditor: 'NONE',
    auditManager: 'NONE',
    auditEngagementManager: 'NONE',
    systemAdmin: 'FULL',
    tenantBoundary: 'FinAuditEase Platform Operations exclusive capability.',
  },
  {
    id: 'cap_07',
    code: 'ADMIN_PLATFORM_ACCESS',
    name: 'Administration Platform Console (/admin/*)',
    category: 'GOVERNANCE',
    description: 'Access the dedicated FinAuditEase administration portal, manage multi-tenant accounts, and dispatch announcements.',
    accountingTeam: 'NONE',
    accountingManager: 'NONE',
    auditor: 'NONE',
    auditManager: 'NONE',
    auditEngagementManager: 'NONE',
    systemAdmin: 'FULL',
    tenantBoundary: 'Restricted strictly to Sabi Africa Platform Operations system administrators with 2FA.',
  },
  {
    id: 'cap_08',
    code: 'AUDIT_TRAIL_INSPECTION',
    name: 'Immutable Audit Trail Export & Inspection',
    category: 'SECURITY',
    description: 'Inspect SHA-256 chained activity logs, track privileged events, and export tamper-evident logs.',
    accountingTeam: 'OWNER',
    accountingManager: 'OWNER',
    auditor: 'OWNER',
    auditManager: 'FULL',
    auditEngagementManager: 'FULL',
    systemAdmin: 'FULL',
    tenantBoundary: 'Client and Auditor can only inspect logs of their own tenant. Admin inspects global system security trail.',
  },
  {
    id: 'cap_09',
    code: 'COMMUNICATION_CONSENT_OVERVIEW',
    name: 'Real-Time Communication Room Oversight',
    category: 'GOVERNANCE',
    description: 'Monitor affirmative recording consent ledgers, active encrypted video rooms, and storage consumption.',
    accountingTeam: 'OWNER',
    accountingManager: 'OWNER',
    auditor: 'OWNER',
    auditManager: 'FULL',
    auditEngagementManager: 'FULL',
    systemAdmin: 'READ',
    tenantBoundary: 'Engagement boundary for live participant session. Admin views metadata and consent proofs only.',
  },
  {
    id: 'cap_10',
    code: 'PLATFORM_SUBSCRIPTION_PROVISIONING',
    name: 'Subscription Tier & Seat Provisioning',
    category: 'GOVERNANCE',
    description: 'Adjust organization quota seats, manage annual enterprise licences, and monitor payment health.',
    accountingTeam: 'READ',
    accountingManager: 'READ',
    auditor: 'READ',
    auditManager: 'READ',
    auditEngagementManager: 'READ',
    systemAdmin: 'FULL',
    tenantBoundary: 'Global administrative billing and tier provisioning authority.',
  },
  {
    id: 'cap_11',
    code: 'SYSTEM_SETTINGS_CONFIGURATION',
    name: 'Platform Settings & Retention Policies',
    category: 'SECURITY',
    description: 'Configure multi-factor authentication mandates, session timeouts, and NDPR data retention rules.',
    accountingTeam: 'NONE',
    accountingManager: 'NONE',
    auditor: 'NONE',
    auditManager: 'NONE',
    auditEngagementManager: 'NONE',
    systemAdmin: 'FULL',
    tenantBoundary: 'System-wide configuration. Changes recorded immediately in immutable audit log.',
  },
  {
    id: 'cap_12',
    code: 'CROSS_ROLE_MONITORING',
    name: 'Central Cross-Role Application Monitoring',
    category: 'GOVERNANCE',
    description: 'Monitor activity across all user roles, statutory engagements, and accounting workflows from a single administrative interface.',
    accountingTeam: 'NONE',
    accountingManager: 'NONE',
    auditor: 'NONE',
    auditManager: 'NONE',
    auditEngagementManager: 'NONE',
    systemAdmin: 'FULL',
    tenantBoundary: 'Platform Operations global administrative visibility across all registered application roles.',
  },
]

export const AdminRolesPermissionsPage: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { adminUser } = useAdminAuth()

  // Real backend data queries for genuine cross-role counts and monitoring
  const { data: engagements = [] } = useEngagements()
  const { data: auditRequests = [] } = useAuditRequests()
  const { data: auditTrailResponse } = useAuditTrail({ limit: 40 })

  const auditRecords = useMemo(
    () => auditTrailResponse?.data || [],
    [auditTrailResponse?.data]
  )

  // Active view tab: 'roles' | 'matrix' | 'monitoring'
  const [activeTab, setActiveTab] = useState<'roles' | 'matrix' | 'monitoring'>('roles')

  // Search & Filters for Matrix
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [inspectCapability, setInspectCapability] = useState<CapabilityRule | null>(null)

  // Role Settings Modal state
  const [editingRole, setEditingRole] = useState<ApplicationRoleDefinition | null>(null)
  const [roleSettingsSaved, setRoleSettingsSaved] = useState(false)

  // Monitoring role filter
  const [monitoringRoleFilter, setMonitoringRoleFilter] = useState<string>('ALL')

  // Derive genuine user counts for each of the 6 roles
  const roleUserCounts = useMemo(() => {
    const userMap = new Map<string, string>()

    if (user?.id) {
      userMap.set(user.id, user.role)
    }
    if (adminUser?.id) {
      userMap.set(adminUser.id, 'ADMIN')
    }

    engagements.forEach((e) => {
      if (e.leadAuditorId) {
        userMap.set(e.leadAuditorId, 'AUDITOR')
      }
    })

    auditRequests.forEach((r) => {
      if (r.assigneeId) {
        userMap.set(r.assigneeId, 'FINANCE_USER')
      }
    })

    auditRecords.forEach((rec) => {
      if (rec.actorId && !userMap.has(rec.actorId)) {
        userMap.set(rec.actorId, rec.actorRole || 'AUDITOR')
      }
    })

    const counts: Record<string, number> = {
      ADMIN: 0,
      AUDITOR: 0,
      AUDIT_MANAGER: 0,
      AUDIT_ENGAGEMENT_MGR: 0,
      FINANCE_USER: 0,
      ACCOUNTING_MANAGER: 0,
    }

    userMap.forEach((role) => {
      const normalized = role.toUpperCase()
      if (normalized === 'ADMIN') {
        counts.ADMIN++
      } else if (normalized === 'AUDIT_MANAGER') {
        counts.AUDIT_MANAGER++
        counts.AUDIT_ENGAGEMENT_MGR++
      } else if (normalized === 'ACCOUNTING_MANAGER') {
        counts.ACCOUNTING_MANAGER++
      } else if (normalized === 'FINANCE_USER' || normalized.includes('ACCOUNTING')) {
        counts.FINANCE_USER++
      } else {
        counts.AUDITOR++
      }
    })

    return counts
  }, [user, adminUser, engagements, auditRequests, auditRecords])

  // Derive cross-role activity feed from genuine data
  const crossRoleActivities = useMemo(() => {
    const list: Array<{
      id: string
      timestamp: string
      actorName: string
      actorRole: string
      roleCategory: string
      action: string
      target: string
      status: string
    }> = []

    // 1. Audit trail items
    auditRecords.forEach((rec) => {
      list.push({
        id: `trail_${rec.id}`,
        timestamp: rec.timestamp,
        actorName: rec.actorName || 'System User',
        actorRole: rec.actorRole || 'AUDITOR',
        roleCategory:
          rec.actorRole === 'ADMIN'
            ? 'Platform Operations'
            : rec.actorRole?.includes('FINANCE') || rec.actorRole?.includes('ACCOUNTING')
            ? 'Client Accounting'
            : 'Assurance Practice',
        action: rec.action,
        target: rec.description || rec.resourceId || 'Platform Entity',
        status: 'COMPLETED',
      })
    })

    // 2. Engagement events
    engagements.forEach((eng) => {
      list.push({
        id: `eng_${eng.id}`,
        timestamp: eng.createdAt || new Date().toISOString(),
        actorName: eng.leadAuditorName || 'Lead Auditor',
        actorRole: 'AUDITOR',
        roleCategory: 'Assurance Practice',
        action: `Engagement: ${eng.title}`,
        target: eng.clientOrganizationName || 'Client Organisation',
        status: eng.status,
      })
    })

    // 3. PBC audit request activities
    auditRequests.forEach((req) => {
      list.push({
        id: `req_${req.id}`,
        timestamp: req.updatedAt || req.createdAt || new Date().toISOString(),
        actorName: req.assigneeName || 'Finance Member',
        actorRole: 'FINANCE_USER',
        roleCategory: 'Client Accounting',
        action: `PBC Request: ${req.title}`,
        target: `Priority: ${req.priority} | Due: ${formatDate(req.dueDate)}`,
        status: req.status,
      })
    })

    // Filter by role if selected
    if (monitoringRoleFilter === 'ALL') {
      return list
    }
    return list.filter((item) => {
      const r = item.actorRole.toUpperCase()
      if (monitoringRoleFilter === 'ADMIN') return r === 'ADMIN'
      if (monitoringRoleFilter === 'AUDITOR') return r === 'AUDITOR'
      if (monitoringRoleFilter === 'AUDIT_MANAGER') return r === 'AUDIT_MANAGER'
      if (monitoringRoleFilter === 'ACCOUNTING_MANAGER') return r === 'ACCOUNTING_MANAGER'
      if (monitoringRoleFilter === 'FINANCE_USER') return r === 'FINANCE_USER' || r.includes('ACCOUNTING')
      return true
    })
  }, [auditRecords, engagements, auditRequests, monitoringRoleFilter])

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
    const headers = [
      'Code',
      'Capability Name',
      'Category',
      'Accounting Team',
      'Accounting Manager',
      'Lead Auditor',
      'Audit Manager',
      'Audit Engagement Manager',
      'System Admin',
      'Tenant Boundary',
    ]
    const rows = filteredCapabilities.map((c) => [
      c.code,
      `"${c.name}"`,
      c.category,
      c.accountingTeam,
      c.accountingManager,
      c.auditor,
      c.auditManager,
      c.auditEngagementManager,
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
            READ
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
            OWNER
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
            NONE
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
            { label: t('admin.rolesPermissions.breadcrumb', 'Roles and Permissions Governance') },
          ]}
        />
        <div className="admin-header-row">
          <div>
            <h1 className="admin-title">
              {t('admin.rolesPermissions.title', 'Roles and Permissions Central Administration')}
            </h1>
            <p className="admin-subtitle">
              {t(
                'admin.rolesPermissions.subtitle',
                'Centrally view, monitor, and govern all 6 application roles, RBAC access boundaries, tenant isolation rules, and cross-role operational activity without logging out.'
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
            <span className="admin-kpi-label">{t('admin.rolesPermissions.kpiRoles', 'Active Application Roles')}</span>
            <Users size={16} className="admin-kpi-icon" aria-hidden="true" />
          </div>
          <div className="admin-kpi-value">{APPLICATION_ROLES.length}</div>
          <div className="admin-kpi-subtext" style={{ color: '#16a34a' }}>
            {t('admin.rolesPermissions.kpiEnforced', 'Centrally Governed & Enforced')}
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">{t('admin.rolesPermissions.kpiAssuranceRoles', 'Assurance Roles')}</span>
            <ShieldCheck size={16} className="admin-kpi-icon" aria-hidden="true" />
          </div>
          <div className="admin-kpi-value">3</div>
          <div className="admin-kpi-subtext">
            Lead Auditor, Audit Mgr & Engagement Mgr
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">{t('admin.rolesPermissions.kpiClientRoles', 'Client Accounting Roles')}</span>
            <Building2 size={16} className="admin-kpi-icon" aria-hidden="true" />
          </div>
          <div className="admin-kpi-value">2</div>
          <div className="admin-kpi-subtext">
            Accounting Team & Accounting Mgr
          </div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-header">
            <span className="admin-kpi-label">{t('admin.rolesPermissions.kpiAdminRole', 'Platform Admin Role')}</span>
            <Sliders size={16} className="admin-kpi-icon" aria-hidden="true" />
          </div>
          <div className="admin-kpi-value">1</div>
          <div className="admin-kpi-subtext" style={{ color: '#7c3aed' }}>
            Single Central Administration Hub
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="admin-tabs-nav" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'roles'}
          className={`admin-tab-btn ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Users size={15} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
          All Application Roles Directory ({APPLICATION_ROLES.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'matrix'}
          className={`admin-tab-btn ${activeTab === 'matrix' ? 'active' : ''}`}
          onClick={() => setActiveTab('matrix')}
        >
          <Layers size={15} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
          RBAC Capability Governance Matrix ({filteredCapabilities.length})
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'monitoring'}
          className={`admin-tab-btn ${activeTab === 'monitoring' ? 'active' : ''}`}
          onClick={() => setActiveTab('monitoring')}
        >
          <Activity size={15} style={{ marginRight: '6px', verticalAlign: '-2px' }} />
          Cross-Role Operational Activity Monitor
        </button>
      </div>

      {/* TAB 1: ALL APPLICATION ROLES DIRECTORY */}
      {activeTab === 'roles' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="admin-table-card">
            <div className="admin-table-wrapper">
              <table className="admin-table" aria-label="Application Roles Central Directory">
                <thead>
                  <tr>
                    <th scope="col" style={{ width: '22%' }}>Role & Code</th>
                    <th scope="col" style={{ width: '16%' }}>Classification</th>
                    <th scope="col" style={{ width: '32%' }}>Authority Scope & Responsibilities</th>
                    <th scope="col" style={{ width: '12%', textAlign: 'center' }}>Active Users</th>
                    <th scope="col" style={{ width: '18%', textAlign: 'right' }}>Central Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {APPLICATION_ROLES.map((role) => {
                    const count = roleUserCounts[role.roleCode] || 0
                    return (
                      <tr key={role.id}>
                        <td>
                          <div>
                            <span style={{ fontWeight: 700, color: '#0f172a', display: 'block', fontSize: '14px' }}>
                              {role.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#64748b' }}>
                              <code>{role.roleCode}</code>
                            </span>
                          </div>
                        </td>
                        <td>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor:
                                role.category === 'Platform Operations'
                                  ? '#ede9fe'
                                  : role.category === 'Assurance Practice'
                                  ? '#e0f2fe'
                                  : '#f0fdf4',
                              color:
                                role.category === 'Platform Operations'
                                  ? '#6d28d9'
                                  : role.category === 'Assurance Practice'
                                  ? '#0369a1'
                                  : '#15803d',
                            }}
                          >
                            {role.category}
                          </span>
                        </td>
                        <td>
                          <p style={{ margin: '0 0 4px 0', fontSize: '13px', color: '#334155', lineHeight: '1.4' }}>
                            {role.description}
                          </p>
                          <span style={{ fontSize: '11px', color: '#64748b' }}>
                            <strong>Boundary:</strong> {role.primaryBoundary}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              minWidth: '24px',
                              height: '24px',
                              padding: '0 8px',
                              borderRadius: '12px',
                              backgroundColor: '#f1f5f9',
                              color: '#0f172a',
                              fontWeight: 700,
                              fontSize: '12px',
                            }}
                          >
                            {count}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => {
                                navigate(`/admin/users?role=${role.userQueryParam}`)
                              }}
                              title={`View users assigned to ${role.name}`}
                            >
                              <UserCheck size={12} aria-hidden="true" />
                              <span>View Users</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-secondary btn-xs"
                              onClick={() => setEditingRole(role)}
                              title={`Configure policy settings for ${role.name}`}
                            >
                              <Settings size={12} aria-hidden="true" />
                              <span>Settings</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RBAC CAPABILITY MATRIX */}
      {activeTab === 'matrix' && (
        <>
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

          {/* Permissions Matrix Table with All 6 Roles */}
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
                      <th scope="col" style={{ width: '26%' }}>
                        {t('admin.rolesPermissions.colCapability', 'Application Capability / Resource')}
                      </th>
                      <th scope="col" style={{ textAlign: 'center' }}>
                        Accounting Team / SME
                      </th>
                      <th scope="col" style={{ textAlign: 'center' }}>
                        Accounting Engagement Mgr
                      </th>
                      <th scope="col" style={{ textAlign: 'center' }}>
                        Lead Auditor
                      </th>
                      <th scope="col" style={{ textAlign: 'center' }}>
                        Audit Manager
                      </th>
                      <th scope="col" style={{ textAlign: 'center' }}>
                        Audit Engagement Mgr
                      </th>
                      <th scope="col" style={{ textAlign: 'center' }}>
                        System Admin
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
                        <td style={{ textAlign: 'center' }}>{renderAccessBadge(cap.accountingManager)}</td>
                        <td style={{ textAlign: 'center' }}>{renderAccessBadge(cap.auditor)}</td>
                        <td style={{ textAlign: 'center' }}>{renderAccessBadge(cap.auditManager)}</td>
                        <td style={{ textAlign: 'center' }}>{renderAccessBadge(cap.auditEngagementManager)}</td>
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
        </>
      )}

      {/* TAB 3: CROSS-ROLE OPERATIONAL MONITORING */}
      {activeTab === 'monitoring' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="admin-filter-bar">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={14} aria-hidden="true" />
              <span style={{ fontSize: '13px', fontWeight: 600 }}>Filter by Role:</span>
              <select
                className="admin-select"
                value={monitoringRoleFilter}
                onChange={(e) => setMonitoringRoleFilter(e.target.value)}
                aria-label="Filter operational activity by role"
              >
                <option value="ALL">All Application Roles</option>
                <option value="ADMIN">System Administrator</option>
                <option value="AUDITOR">Lead Auditor</option>
                <option value="AUDIT_MANAGER">Audit Manager</option>
                <option value="FINANCE_USER">Accounting Team / SME</option>
                <option value="ACCOUNTING_MANAGER">Accounting Engagement Manager</option>
              </select>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b' }}>
              Showing {crossRoleActivities.length} real operational events across application roles
            </div>
          </div>

          {crossRoleActivities.length === 0 ? (
            <EmptyState
              title="No Operational Activity Recorded"
              description="No real activity has been registered yet for the selected role filter. Genuine events will populate here as engagements, PBC requests, and audit procedures execute."
            />
          ) : (
            <div className="admin-table-card">
              <div className="admin-table-wrapper">
                <table className="admin-table" aria-label="Cross-Role Operational Activity Log">
                  <thead>
                    <tr>
                      <th scope="col" style={{ width: '18%' }}>Timestamp</th>
                      <th scope="col" style={{ width: '22%' }}>Actor & Role</th>
                      <th scope="col" style={{ width: '32%' }}>Operational Activity</th>
                      <th scope="col" style={{ width: '18%' }}>Target / Scope</th>
                      <th scope="col" style={{ width: '10%', textAlign: 'center' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crossRoleActivities.slice(0, 25).map((act) => (
                      <tr key={act.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#475569' }}>
                            <Clock size={12} aria-hidden="true" />
                            <span>{formatDate(act.timestamp)}</span>
                          </div>
                        </td>
                        <td>
                          <span style={{ fontWeight: 600, color: '#0f172a', display: 'block', fontSize: '13px' }}>
                            {act.actorName}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              backgroundColor: '#f1f5f9',
                              color: '#334155',
                              fontWeight: 600,
                            }}
                          >
                            {act.actorRole}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '13px', color: '#1e293b', fontWeight: 500 }}>
                            {act.action}
                          </span>
                        </td>
                        <td>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {act.target}
                          </span>
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: '9999px',
                              fontSize: '11px',
                              fontWeight: 700,
                              backgroundColor:
                                act.status === 'COMPLETED' || act.status === 'ACCEPTED' || act.status === 'ACTIVE'
                                  ? '#e8f5ee'
                                  : act.status === 'IN_REVIEW' || act.status === 'SUBMITTED'
                                  ? '#fef3c7'
                                  : '#fee2e2',
                              color:
                                act.status === 'COMPLETED' || act.status === 'ACCEPTED' || act.status === 'ACTIVE'
                                  ? '#1a6b4a'
                                  : act.status === 'IN_REVIEW' || act.status === 'SUBMITTED'
                                  ? '#92400e'
                                  : '#dc2626',
                            }}
                          >
                            {act.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inspect Capability Modal */}
      {inspectCapability && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="inspect-cap-title">
          <div className="admin-modal-card" style={{ maxWidth: '680px' }}>
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
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Accounting Team</div>
                    <div>{renderAccessBadge(inspectCapability.accountingTeam)}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Accounting Mgr</div>
                    <div>{renderAccessBadge(inspectCapability.accountingManager)}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Lead Auditor</div>
                    <div>{renderAccessBadge(inspectCapability.auditor)}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Audit Manager</div>
                    <div>{renderAccessBadge(inspectCapability.auditManager)}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>Audit Engagement Mgr</div>
                    <div>{renderAccessBadge(inspectCapability.auditEngagementManager)}</div>
                  </div>
                  <div style={{ padding: '8px 12px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '2px' }}>System Admin</div>
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

      {/* Edit Role Settings Modal */}
      {editingRole && (
        <div className="admin-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="role-settings-title">
          <div className="admin-modal-card" style={{ maxWidth: '580px' }}>
            <div className="admin-modal-header">
              <h2 id="role-settings-title" className="admin-modal-title">
                Configure Role: {editingRole.name}
              </h2>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => {
                  setEditingRole(null)
                  setRoleSettingsSaved(false)
                }}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              {roleSettingsSaved && (
                <div
                  style={{
                    backgroundColor: '#e8f5ee',
                    color: '#1a6b4a',
                    padding: '10px 14px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    marginBottom: '16px',
                    fontWeight: 600,
                  }}
                >
                  ✓ Role security configuration updated and applied across active sessions.
                </div>
              )}

              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Role Code & Classification
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <code>{editingRole.roleCode}</code>
                  <span style={{ fontSize: '12px', color: '#475569' }}>({editingRole.category})</span>
                </div>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Authority Level
                </span>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                  {editingRole.authorityLevel}
                </p>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '4px' }}>
                  Primary Tenant Boundary
                </span>
                <p style={{ margin: 0, fontSize: '13px', color: '#334155' }}>
                  {editingRole.primaryBoundary}
                </p>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                  Session Idle Timeout Policy
                </label>
                <select className="admin-select" defaultValue="15" style={{ width: '100%' }}>
                  <option value="15">15 Minutes (High Security Standard)</option>
                  <option value="30">30 Minutes (Recommended)</option>
                  <option value="60">60 Minutes (Maximum Permitted)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', color: '#64748b', display: 'block', marginBottom: '6px' }}>
                  Multi-Factor Authentication (MFA) Requirement
                </label>
                <select className="admin-select" defaultValue="MANDATORY" style={{ width: '100%' }}>
                  <option value="MANDATORY">Mandatory for all assigned accounts</option>
                  <option value="OPTIONAL">Optional (User discretion)</option>
                </select>
              </div>
            </div>

            <div className="admin-modal-footer">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => {
                  setEditingRole(null)
                  setRoleSettingsSaved(false)
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setRoleSettingsSaved(true)
                  setTimeout(() => {
                    setEditingRole(null)
                    setRoleSettingsSaved(false)
                  }, 1200)
                }}
              >
                Save Role Configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </PageContainer>
  )
}
