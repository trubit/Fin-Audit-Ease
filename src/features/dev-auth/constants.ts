import type { DevRole, DevUserConfig } from './types'

/**
 * Temporary Development User Presets.
 *
 * NOTE:
 * - Uses .invalid top-level domain (RFC 2606) to ensure no real internet routing.
 * - Zero tokens, passwords, or secrets exist here.
 * - For frontend UI inspection only.
 */
export const DEV_USERS: Record<DevRole, DevUserConfig> = {
  AUDITOR: {
    id: 'dev-auditor-id',
    email: 'audit.lead@finauditease.ng',
    fullName: 'Lead Auditor',
    role: 'AUDITOR',
    organizationId: 'org-audit-firm',
    organizationName: 'Audit Firm',
    isTwoFactorEnabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  FINANCE_USER: {
    id: 'dev-finance-id',
    email: 'accounting@clientcompany.ng',
    fullName: 'Corporate Accounting Lead',
    role: 'FINANCE_USER',
    organizationId: 'org-client-company',
    organizationName: 'Corporate Accounting Entity',
    jobTitle: 'Corporate Accounting Lead',
    accountingYearEndDate: '2026-12-31',
    isTwoFactorEnabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  ADMIN: {
    id: 'dev-admin-id',
    email: 'admin.platform@finauditease.ng',
    fullName: 'System Administrator',
    role: 'ADMIN',
    organizationId: 'org-sabi-africa-innovations',
    organizationName: 'Sabi Africa Innovations Limited',
    jobTitle: 'Principal Platform Administrator',
    isTwoFactorEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  AUDIT_MANAGER: {
    id: 'dev-audit-manager-id',
    email: 'manager.assurance@finauditease.ng',
    fullName: 'Audit Engagement Manager',
    role: 'AUDIT_MANAGER',
    organizationId: 'org-audit-firm',
    organizationName: 'Audit Firm',
    jobTitle: 'Audit Engagement Manager',
    isTwoFactorEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  ACCOUNTING_MANAGER: {
    id: 'dev-accounting-manager-id',
    email: 'accounting.manager@clientcompany.ng',
    fullName: 'Accounting Engagement Manager',
    role: 'ACCOUNTING_MANAGER',
    organizationId: 'org-client-company',
    organizationName: 'Corporate Accounting Entity',
    jobTitle: 'Accounting Engagement Manager',
    accountingYearEndDate: '2026-12-31',
    isTwoFactorEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
}
