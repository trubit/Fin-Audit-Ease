/**
 * Temporary Development Authentication Types.
 * Strictly for local UI inspection in development mode (import.meta.env.DEV).
 */

export type DevRole = 'AUDITOR' | 'FINANCE_USER'

export interface DevUserConfig {
  readonly id: string
  readonly email: string
  readonly fullName: string
  readonly role: DevRole
  readonly organizationId: string
  readonly organizationName: string
  readonly isTwoFactorEnabled: boolean
  readonly jobTitle?: string
  readonly accountingYearEndDate?: string
  readonly createdAt: string
}
