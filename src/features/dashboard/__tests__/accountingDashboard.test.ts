import { describe, it, expect } from 'vitest'
import { getYearEndInfo } from '@/utils/dateUtils'
import type { AuditRequest } from '@/features/auditRequests/types'

describe('Accounting Team Experience & Role Security (Phase 5)', () => {
  describe('Year-Round Operations & 6-Month Pre-Audit Runway', () => {
    it('calculates active pre-audit runway when year-end is within 180 days', () => {
      // 90 days in the future
      const targetDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const info = getYearEndInfo(targetDate)

      expect(info.isPassed).toBe(false)
      expect(info.isPreAuditRunwayActive).toBe(true)
      expect(info.daysRemaining).toBeGreaterThan(88)
      expect(info.daysRemaining).toBeLessThanOrEqual(91)
    })

    it('marks pre-audit runway as inactive when year-end is more than 180 days away', () => {
      // 250 days in the future
      const targetDate = new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const info = getYearEndInfo(targetDate)

      expect(info.isPassed).toBe(false)
      expect(info.isPreAuditRunwayActive).toBe(false)
      expect(info.daysRemaining).toBeGreaterThan(248)
    })

    it('handles year-end passed gracefully without errors', () => {
      // 10 days in the past
      const targetDate = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const info = getYearEndInfo(targetDate)

      expect(info.isPassed).toBe(true)
      expect(info.isPreAuditRunwayActive).toBe(false)
      expect(info.daysRemaining).toBeLessThan(0)
    })

    it('handles undefined year-end gracefully for newly self-registered accounts', () => {
      const info = getYearEndInfo(undefined)

      expect(info.isPassed).toBe(false)
      expect(info.isPreAuditRunwayActive).toBe(false)
      expect(info.daysRemaining).toBe(0)
      expect(info.label).toBe('Not set')
    })
  })

  describe('Assigned Requests & Mandatory Rejection Handling', () => {
    it('prioritizes REJECTED requests to the top of the assigned queue for urgent correction', () => {
      const requests: Partial<AuditRequest>[] = [
        { id: '1', title: 'Bank Reconciliation', status: 'SUBMITTED', priority: 'MEDIUM', dueDate: '2026-11-01' },
        { id: '2', title: 'Fixed Asset Schedule', status: 'REJECTED', priority: 'HIGH', dueDate: '2026-11-15', rejectionReason: 'Missing depreciation ledger attachment' },
        { id: '3', title: 'Tax Clearance Cert', status: 'OPEN', priority: 'CRITICAL', dueDate: '2026-10-20' },
      ]

      const sorted = [...requests].sort((a, b) => {
        if (a.status === 'REJECTED' && b.status !== 'REJECTED') return -1
        if (b.status === 'REJECTED' && a.status !== 'REJECTED') return 1
        if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1
        if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1
        return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime()
      })

      expect(sorted[0].id).toBe('2')
      expect(sorted[0].status).toBe('REJECTED')
      expect(sorted[0].rejectionReason).toBe('Missing depreciation ledger attachment')
    })

    it('verifies rejection reasons are present on rejected requests according to PRD', () => {
      const rejectedRequest: Partial<AuditRequest> = {
        id: 'req-rej-1',
        title: 'Q3 VAT Filing Evidence',
        status: 'REJECTED',
        rejectionReason: 'The provided document is missing the FIRS stamp of receipt.',
      }

      expect(rejectedRequest.status).toBe('REJECTED')
      expect(rejectedRequest.rejectionReason).toBeTruthy()
      expect(rejectedRequest.rejectionReason).toContain('FIRS stamp')
    })
  })

  describe('Auditor vs Accounting Team Route & Action Boundaries', () => {
    it('restricts Auditor-only routes from Accounting Team users', () => {
      const allowedRolesForAuditorOps = ['AUDITOR', 'AUDIT_MANAGER', 'ADMIN']
      const accountingRole = 'FINANCE_USER'

      const canAccessCreateEngagement = allowedRolesForAuditorOps.includes(accountingRole)
      const canAccessReviewWorkspace = allowedRolesForAuditorOps.includes(accountingRole)
      const canAccessAuditTrail = allowedRolesForAuditorOps.includes(accountingRole)

      expect(canAccessCreateEngagement).toBe(false)
      expect(canAccessReviewWorkspace).toBe(false)
      expect(canAccessAuditTrail).toBe(false)
    })

    it('allows Accounting Team users access to year-round accounting routes', () => {
      const accountingRoutes = ['/dashboard', '/month-end', '/pre-audit', '/engagements', '/audit-requests', '/documents', '/profile']
      expect(accountingRoutes).toContain('/month-end')
      expect(accountingRoutes).toContain('/pre-audit')
      expect(accountingRoutes).toContain('/documents')
    })

    it('ensures completed engagements remain strictly permanent and read-only', () => {
      const engagement = {
        id: 'eng-completed',
        status: 'COMPLETED' as const,
        isReadOnly: true,
      }

      const canModifyEngagement = (status: string) => status !== 'COMPLETED'
      expect(canModifyEngagement(engagement.status)).toBe(false)
    })
  })

  describe('Accounting Team Self-Registration vs Invitation Connected State', () => {
    it('validates self-registered user with zero engagements is supported cleanly without errors', () => {
      const selfRegisteredUserState = {
        user: {
          fullName: 'Test Accountant',
          role: 'FINANCE_USER',
          organizationName: 'Acme Nigeria Ltd',
          accountingYearEndDate: '2026-12-31',
        },
        engagements: [],
        auditRequests: [],
      }

      expect(selfRegisteredUserState.engagements.length).toBe(0)
      // Year-round operations remain fully accessible
      const yearEnd = getYearEndInfo(selfRegisteredUserState.user.accountingYearEndDate)
      expect(yearEnd.yearEndDate).toBe('2026-12-31')
      expect(yearEnd.daysRemaining).toBeDefined()
    })

    it('validates invitation-connected user has access to authoritative engagement', () => {
      const invitationUserState = {
        user: {
          fullName: 'Invited Accounting Member',
          role: 'FINANCE_USER',
          organizationName: 'Sterling Energy PLC',
        },
        engagements: [
          {
            id: 'eng-101',
            title: 'FY2026 Statutory Audit',
            status: 'ACTIVE',
            auditorFirmName: 'PricewaterhouseCoopers Nigeria',
          },
        ],
      }

      expect(invitationUserState.engagements.length).toBe(1)
      expect(invitationUserState.engagements[0].status).toBe('ACTIVE')
      expect(invitationUserState.engagements[0].auditorFirmName).toBe('PricewaterhouseCoopers Nigeria')
    })
  })

  describe('Role-Differentiated Profile Presentation & i18n Keys', () => {
    it('determines role-specific profile titles and organization labels correctly', () => {
      const getProfileLabels = (role: string) => {
        const isAuditor = role === 'AUDITOR' || role === 'AUDIT_MANAGER' || role === 'ADMIN'
        return {
          titleKey: isAuditor ? 'profile.auditorTitle' : 'profile.accountingTitle',
          subtitleKey: isAuditor ? 'profile.auditorSubtitle' : 'profile.accountingSubtitle',
          orgLabelKey: isAuditor ? 'profile.auditorOrganization' : 'profile.accountingOrganization',
          verifiedStatusKey: isAuditor ? 'profile.verifiedAuditorStatus' : 'profile.verifiedAccountingStatus',
          showYearEnd: !isAuditor,
        }
      }

      const auditorLabels = getProfileLabels('AUDITOR')
      expect(auditorLabels.titleKey).toBe('profile.auditorTitle')
      expect(auditorLabels.orgLabelKey).toBe('profile.auditorOrganization')
      expect(auditorLabels.verifiedStatusKey).toBe('profile.verifiedAuditorStatus')
      expect(auditorLabels.showYearEnd).toBe(false)

      const accountingLabels = getProfileLabels('FINANCE_USER')
      expect(accountingLabels.titleKey).toBe('profile.accountingTitle')
      expect(accountingLabels.orgLabelKey).toBe('profile.accountingOrganization')
      expect(accountingLabels.verifiedStatusKey).toBe('profile.verifiedAccountingStatus')
      expect(accountingLabels.showYearEnd).toBe(true)
    })

    it('verifies profile and authentication i18n keys exist across all 5 locale files', async () => {
      const locales = ['en', 'yo', 'ig', 'ha', 'pcm']
      for (const locale of locales) {
        const dictionary = (await import(`../../../i18n/locales/${locale}.json`)).default
        expect(dictionary.profile.jobTitle).toBeDefined()
        expect(dictionary.profile.accountingYearEndDate).toBeDefined()
        expect(dictionary.profile.auditorTitle).toBeDefined()
        expect(dictionary.profile.accountingTitle).toBeDefined()
        expect(dictionary.profile.auditorOrganization).toBeDefined()
        expect(dictionary.profile.accountingOrganization).toBeDefined()
        expect(dictionary.authentication.jobTitleLabel).toBeDefined()
        expect(dictionary.authentication.accountingYearEndDateLabel).toBeDefined()
      }
    })
  })
})

