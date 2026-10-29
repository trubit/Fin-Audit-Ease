import type { TFunction } from 'i18next'
import type { UserRole } from '../types'

/**
 * Maps technical role enums (e.g. FINANCE_USER, AUDITOR) to human-friendly,
 * professional titles localized according to the active language.
 *
 * Prevents raw database enums from being exposed directly to end users.
 */
export const formatUserRole = (
  role: UserRole | string | undefined | null,
  t: TFunction
): string => {
  if (!role) {
    return t('roles.unassigned', { defaultValue: 'Authorized User' })
  }

  const normalized = role.toUpperCase()

  switch (normalized) {
    case 'AUDITOR':
      return t('roles.auditor', { defaultValue: 'Chartered Lead Auditor' })
    case 'AUDIT_MANAGER':
      return t('roles.auditManager', { defaultValue: 'Audit Engagement Manager' })
    case 'FINANCE_USER':
    case 'ACCOUNTING_MEMBER':
      return t('roles.accountingMember', { defaultValue: 'Corporate Accounting Team Member' })
    case 'ACCOUNTING_TEAM_LEAD':
      return t('roles.accountingLead', { defaultValue: 'Accounting Team Lead' })
    case 'ADMIN':
      return t('roles.admin', { defaultValue: 'System Administrator' })
    default:
      return t('roles.default', { defaultValue: role })
  }
}
