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
    fullName: 'Dr. Ibrahim Babatunde, FCA',
    role: 'AUDITOR',
    organizationId: 'org-apex-assurance-ng',
    organizationName: 'Apex Assurance & Advisory Partners',
    isTwoFactorEnabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  FINANCE_USER: {
    id: 'dev-finance-id',
    email: 'financial.reporting@zenithenergy.ng',
    fullName: 'Amina Chioma Adeleke',
    role: 'FINANCE_USER',
    organizationId: 'org-zenith-energy-plc',
    organizationName: 'Zenith Energy & Infrastructure Plc',
    jobTitle: 'Corporate Accounting Lead',
    accountingYearEndDate: '2026-12-31',
    isTwoFactorEnabled: false,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
  ADMIN: {
    id: 'dev-admin-id',
    email: 'admin.platform@finauditease.ng',
    fullName: 'Sabi Africa Platform Administrator',
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
    fullName: 'Victoria Okonkwo, ACA',
    role: 'AUDIT_MANAGER',
    organizationId: 'org-apex-assurance-ng',
    organizationName: 'Apex Assurance & Advisory Partners',
    jobTitle: 'Audit Engagement Manager',
    isTwoFactorEnabled: true,
    createdAt: '2026-01-01T00:00:00.000Z',
  },
}
