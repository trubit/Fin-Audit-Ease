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
}
