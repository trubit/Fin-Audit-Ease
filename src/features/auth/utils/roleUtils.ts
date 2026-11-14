import type { TFunction } from 'i18next'
import type { UserRole } from '../types'

/**
 * Maps technical role enums (e.g. FINANCE_USER, AUDITOR) to human-friendly,
 * professional titles localized according to the active language.
 *
 * Prevents raw database enums from being exposed directly to end users.
 * Guaranteed never to throw, even with malformed or non-string inputs.
 */
export const formatUserRole = (
  role: UserRole | string | undefined | null | unknown,
  t?: TFunction
): string => {
  const translate = (key: string, defaultValue: string): string => {
    if (typeof t === 'function') {
      try {
        return t(key, { defaultValue })
      } catch {
        return defaultValue
      }
    }
    return defaultValue
  }

  if (!role) {
    return translate('roles.unassigned', 'Authorized User')
  }

  let roleStr = ''
  if (typeof role === 'string') {
    roleStr = role
  } else if (typeof role === 'object' && role !== null && 'name' in role && typeof (role as { name: unknown }).name === 'string') {
    roleStr = (role as { name: string }).name
  } else {
    try {
      roleStr = String(role)
    } catch {
      return translate('roles.unassigned', 'Authorized User')
    }
  }

  const normalized = roleStr.trim().toUpperCase()

  switch (normalized) {
    case 'AUDITOR':
      return translate('roles.auditor', 'Chartered Lead Auditor')
    case 'AUDIT_MANAGER':
      return translate('roles.auditManager', 'Audit Engagement Manager')
    case 'FINANCE_USER':
    case 'ACCOUNTING_MEMBER':
      return translate('roles.accountingMember', 'Corporate Accounting Team Member')
    case 'ACCOUNTING_TEAM_LEAD':
      return translate('roles.accountingLead', 'Accounting Team Lead')
    case 'ADMIN':
      return translate('roles.admin', 'System Administrator')
    default:
      return translate('roles.default', roleStr)
  }
}

