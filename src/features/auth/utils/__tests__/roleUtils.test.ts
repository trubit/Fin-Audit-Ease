import { describe, it, expect } from 'vitest'
import { formatUserRole } from '../roleUtils'

describe('formatUserRole', () => {
  const mockT = ((key: string, options?: { defaultValue?: string }) => {
    const translations: Record<string, string> = {
      'roles.auditor': 'Chartered Lead Auditor',
      'roles.auditManager': 'Audit Engagement Manager',
      'roles.accountingMember': 'Corporate Accounting Team Member',
      'roles.accountingLead': 'Accounting Team Lead',
      'roles.admin': 'System Administrator',
      'roles.unassigned': 'Authorized User',
    }
    return translations[key] || options?.defaultValue || key
  }) as any

  it('formats AUDITOR role professionally', () => {
    expect(formatUserRole('AUDITOR', mockT)).toBe('Chartered Lead Auditor')
  })

  it('formats AUDIT_MANAGER role professionally', () => {
    expect(formatUserRole('AUDIT_MANAGER', mockT)).toBe('Audit Engagement Manager')
  })

  it('formats technical FINANCE_USER enum to Corporate Accounting Team Member', () => {
    expect(formatUserRole('FINANCE_USER', mockT)).toBe('Corporate Accounting Team Member')
  })

  it('formats ACCOUNTING_MEMBER to Corporate Accounting Team Member', () => {
    expect(formatUserRole('ACCOUNTING_MEMBER', mockT)).toBe('Corporate Accounting Team Member')
  })

  it('formats ACCOUNTING_TEAM_LEAD correctly', () => {
    expect(formatUserRole('ACCOUNTING_TEAM_LEAD', mockT)).toBe('Accounting Team Lead')
  })

  it('handles null or undefined gracefully without crashing', () => {
    expect(formatUserRole(null, mockT)).toBe('Authorized User')
    expect(formatUserRole(undefined, mockT)).toBe('Authorized User')
  })
})
