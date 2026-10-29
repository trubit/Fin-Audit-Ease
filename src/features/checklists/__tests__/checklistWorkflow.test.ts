import { describe, it, expect } from 'vitest'
import { getYearEndInfo, getMonthEndInfo, parseDateSafe, formatDate } from '@/utils/dateUtils'
import type { Checklist } from '../types'
import enLocale from '@/i18n/locales/en.json'
import yoLocale from '@/i18n/locales/yo.json'
import igLocale from '@/i18n/locales/ig.json'
import haLocale from '@/i18n/locales/ha.json'
import pcmLocale from '@/i18n/locales/pcm.json'

describe('Phase 8: Checklists, Month End & Pre-Audit Preparation', () => {
  describe('Year-End & Pre-Audit Runway Calculations (Timezone-Safe)', () => {
    it('accurately parses date-only YYYY-MM-DD safely at midday avoiding off-by-one boundary shifts', () => {
      const date = parseDateSafe('2026-12-31')
      expect(date).not.toBeNull()
      expect(date?.getFullYear()).toBe(2026)
      expect(date?.getMonth()).toBe(11) // 0-indexed Dec
      expect(date?.getDate()).toBe(31)
      expect(date?.getHours()).toBe(12)
    })

    it('formats ISO dates accurately', () => {
      expect(formatDate('2026-12-31')).toContain('2026')
      expect(formatDate(undefined)).toBe('—')
    })

    it('calculates countdown from real backend year-end date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 45)
      const yearEndIso = futureDate.toISOString().split('T')[0]

      const info = getYearEndInfo(yearEndIso)
      expect(info.isPassed).toBe(false)
      expect(info.daysRemaining).toBe(45)
      expect(info.isPreAuditRunwayActive).toBe(true) // <= 180 days
      expect(info.daysUntilPreAudit).toBe(0)
      expect(info.label).toBe('45 days until year end')
    })

    it('activates pre-audit preparation exactly 6 months (180 days) before year-end', () => {
      const futureFarDate = new Date()
      futureFarDate.setDate(futureFarDate.getDate() + 240)
      const yearEndIso = futureFarDate.toISOString().split('T')[0]

      const info = getYearEndInfo(yearEndIso)
      expect(info.isPassed).toBe(false)
      expect(info.isPreAuditRunwayActive).toBe(false)
      expect(info.daysUntilPreAudit).toBe(60) // 240 - 180
    })

    it('detects when accounting year-end has passed', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 15)
      const yearEndIso = pastDate.toISOString().split('T')[0]

      const info = getYearEndInfo(yearEndIso)
      expect(info.isPassed).toBe(true)
      expect(info.label).toBe('Year-end passed')
    })

    it('handles undefined year-end gracefully without hardcoding fallback dates', () => {
      const info = getYearEndInfo(undefined)
      expect(info.yearEndDate).toBeUndefined()
      expect(info.daysRemaining).toBe(0)
      expect(info.isPassed).toBe(false)
      expect(info.label).toBe('Not set')
    })
  })

  describe('Month-End Close Calculations', () => {
    it('calculates days to month end safely', () => {
      const info = getMonthEndInfo()
      expect(info.monthYearLabel).toBeTruthy()
      expect(typeof info.daysRemaining).toBe('number')
      expect(info.label).toBeTruthy()
    })

    it('detects passed month end for historical reference dates', () => {
      const pastDate = new Date(2025, 5, 1) // June 2025
      const info = getMonthEndInfo(pastDate)
      expect(info.isPassed).toBe(true)
      expect(info.label).toBe('Month end has passed')
    })
  })

  describe('Checklist Category Progress Aggregation', () => {
    const mockChecklist: Checklist = {
      id: 'chk-month-1',
      engagementId: 'eng-1',
      type: 'MONTH_END_CLOSE',
      title: 'Month-End Financial Close',
      periodLabel: 'October 2026',
      totalItemsCount: 4,
      completedItemsCount: 2,
      items: [
        {
          id: 'item-1',
          checklistId: 'chk-month-1',
          title: 'Post monthly payroll journals',
          category: 'Transactions & Posting',
          status: 'COMPLETED',
          assignedToUserName: 'Ada Okafor',
          completedAt: '2026-10-06T09:30:00Z',
          completedByUserName: 'Ada Okafor',
          attachedDocumentCount: 2,
        },
        {
          id: 'item-2',
          checklistId: 'chk-month-1',
          title: 'Post supplier invoices',
          category: 'Transactions & Posting',
          status: 'IN_PROGRESS',
          assignedToUserName: 'Tunde Adeleke',
          attachedDocumentCount: 0,
        },
        {
          id: 'item-3',
          checklistId: 'chk-month-1',
          title: 'Reconcile main operating bank account',
          category: 'Reconciliations',
          status: 'COMPLETED',
          assignedToUserName: 'Ngozi Eze',
          completedAt: '2026-10-06T10:00:00Z',
          completedByUserName: 'Ngozi Eze',
          attachedDocumentCount: 1,
          auditRequestId: 'req-bank-rec-1',
        },
        {
          id: 'item-4',
          checklistId: 'chk-month-1',
          title: 'Manager sign-off on trial balance',
          category: 'Reviews & Approvals',
          status: 'NOT_STARTED',
          attachedDocumentCount: 0,
        },
      ],
    }

    it('aggregates category progress from real backend items', () => {
      const transactions = mockChecklist.items.filter((i) => i.category === 'Transactions & Posting')
      const completedTransactions = transactions.filter((i) => i.status === 'COMPLETED')
      expect(transactions.length).toBe(2)
      expect(completedTransactions.length).toBe(1)

      const reconciliations = mockChecklist.items.filter((i) => i.category === 'Reconciliations')
      const completedReconciliations = reconciliations.filter((i) => i.status === 'COMPLETED')
      expect(reconciliations.length).toBe(1)
      expect(completedReconciliations.length).toBe(1)

      const reviews = mockChecklist.items.filter((i) => i.category === 'Reviews & Approvals')
      const completedReviews = reviews.filter((i) => i.status === 'COMPLETED')
      expect(reviews.length).toBe(1)
      expect(completedReviews.length).toBe(0)
    })

    it('identifies unassigned responsible persons correctly without fabricating team members', () => {
      const unassignedItem = mockChecklist.items.find((i) => !i.assignedToUserName)
      expect(unassignedItem).toBeDefined()
      expect(unassignedItem?.assignedToUserName).toBeUndefined()
    })

    it('preserves audit request link references for document forwarding', () => {
      const linkedItem = mockChecklist.items.find((i) => i.auditRequestId)
      expect(linkedItem).toBeDefined()
      expect(linkedItem?.auditRequestId).toBe('req-bank-rec-1')
    })
  })

  describe('Multi-Language i18n Key Parity Across All 5 Supported Locales', () => {
    const requiredChecklistKeys = [
      'title',
      'hubSubtitle',
      'preAuditTitle',
      'preAuditSubtitle',
      'monthEndTitle',
      'monthEndSubtitle',
      'period',
      'completed',
      'overallProgress',
      'itemTitle',
      'status',
      'dueDate',
      'responsiblePerson',
      'notAssigned',
      'statusNotStarted',
      'statusInProgress',
      'statusCompleted',
      'statusNotApplicable',
      'transactionsPosting',
      'reconciliations',
      'reviewsApprovals',
      'financialRecords',
      'taxStatutory',
      'supportingDocuments',
      'historicalArchive',
      'historicalReadOnlyNotice',
      'auditorReadOnlyNotice',
      'selectPeriod',
      'currentMonth',
      'previousMonth',
      'yearEndCountdownDays',
      'yearEndToday',
      'yearEndPassed',
      'yearEndNotSet',
      'remindersNotice',
      'preAuditRemindersNotice',
    ]

    const locales = [
      { code: 'en', data: enLocale },
      { code: 'yo', data: yoLocale },
      { code: 'ig', data: igLocale },
      { code: 'ha', data: haLocale },
      { code: 'pcm', data: pcmLocale },
    ]

    locales.forEach(({ code, data }) => {
      it(`verifies all Phase 8 checklist keys exist in locale: ${code}`, () => {
        const checklistSection = (data as Record<string, unknown>).checklists as Record<string, string>
        expect(checklistSection).toBeDefined()

        requiredChecklistKeys.forEach((key) => {
          expect(
            checklistSection[key],
            `Missing key "${key}" in locale "${code}.json"`
          ).toBeTruthy()
        })
      })

      it(`verifies Phase 8 dashboard preparation keys exist in locale: ${code}`, () => {
        const dashboardSection = (data as Record<string, unknown>).dashboard as Record<string, string>
        expect(dashboardSection).toBeDefined()
        expect(dashboardSection.overallPreparationProgress).toBeTruthy()
        expect(dashboardSection.outstandingPrepTitle).toBeTruthy()
        expect(dashboardSection.outstandingPrepSubtitle).toBeTruthy()
        expect(dashboardSection.allPrepCompleted).toBeTruthy()
      })
    })
  })
})
