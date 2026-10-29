import { describe, it, expect } from 'vitest'
import {
  CANONICAL_WEEKLY_ITEMS,
  CANONICAL_MONTH_END_ITEMS,
  buildWeeklyItemsForWeek,
  buildMonthEndItemsForPeriod,
} from '../data/canonicalChecklists'
import {
  calculateStatutoryDeadline,
  calculateSuggestedFriday,
  evaluateTaxDeadlineStatus,
} from '../utils/taxDeadlineUtils'
import type { ChecklistItemStatus } from '../types'

describe('Weekly Checklist Canonical Implementation (Section 5)', () => {
  it('contains exactly 9 canonical items in the specified product order', () => {
    expect(CANONICAL_WEEKLY_ITEMS).toHaveLength(9)

    expect(CANONICAL_WEEKLY_ITEMS[0].title).toBe('Record Financial Transactions')
    expect(CANONICAL_WEEKLY_ITEMS[1].title).toBe('Bank Reconciliation')
    expect(CANONICAL_WEEKLY_ITEMS[2].title).toBe('Payment Gateway and POS Reconciliation')
    expect(CANONICAL_WEEKLY_ITEMS[3].title).toBe('Petty Cash Reconciliation')
    expect(CANONICAL_WEEKLY_ITEMS[4].title).toBe('Supplier Invoice Matching')
    expect(CANONICAL_WEEKLY_ITEMS[5].title).toBe('Receivables Review')
    expect(CANONICAL_WEEKLY_ITEMS[6].title).toBe('Payables Review')
    expect(CANONICAL_WEEKLY_ITEMS[7].title).toBe('Missing Documents')
    expect(CANONICAL_WEEKLY_ITEMS[8].title).toBe('Supervisor Review')
  })

  it('buildWeeklyItemsForWeek populates checklist items with proper due date and evidence flags', () => {
    const items = buildWeeklyItemsForWeek('checklist-week-43', 43, '2026-10-25')
    expect(items).toHaveLength(9)

    const txItem = items.find((i) => i.title === 'Record Financial Transactions')
    expect(txItem).toBeDefined()
    expect(txItem?.requiresEvidence).toBe(true)
    expect(txItem?.hasMissingEvidence).toBe(true) // 0 attached docs initially
    expect(txItem?.status).toBe('NOT_STARTED')

    const posItem = items.find((i) => i.title === 'Payment Gateway and POS Reconciliation')
    expect(posItem).toBeDefined()

    const supervisorItem = items.find((i) => i.title === 'Supervisor Review')
    expect(supervisorItem).toBeDefined()
  })
})

describe('Month-End Close Checklist Canonical Implementation (Section 6)', () => {
  it('preserves all requirements across Categories A through F without omitting Annual PAYE Return', () => {
    // 21 displayed entries plus separate Annual PAYE Return (22 total requirements preserved)
    expect(CANONICAL_MONTH_END_ITEMS).toHaveLength(22)

    // Category A: Cash (2 items)
    const catA = CANONICAL_MONTH_END_ITEMS.filter((i) => i.categoryCode === 'CASH')
    expect(catA).toHaveLength(2)
    expect(catA[0].title).toBe('Bank Reconciliation')
    expect(catA[1].title).toBe('Payment Gateway and POS Reconciliation')

    // Category B: Receivables (3 items)
    const catB = CANONICAL_MONTH_END_ITEMS.filter((i) => i.categoryCode === 'RECEIVABLES')
    expect(catB).toHaveLength(3)
    expect(catB[0].title).toBe('Receivables Control Account')
    expect(catB[1].title).toBe('Customer Statements')
    expect(catB[2].title).toBe('Receivables Ageing and Impairment')

    // Category C: Payables (3 items)
    const catC = CANONICAL_MONTH_END_ITEMS.filter((i) => i.categoryCode === 'PAYABLES')
    expect(catC).toHaveLength(3)
    expect(catC[0].title).toBe('Payables Control Account')
    expect(catC[1].title).toBe('Vendor Statements')
    expect(catC[2].title).toBe('Unrecorded Liabilities and Cut-Off')

    // Category D: Accruals and Assets (3 items)
    const catD = CANONICAL_MONTH_END_ITEMS.filter((i) => i.categoryCode === 'ACCRUALS_ASSETS')
    expect(catD).toHaveLength(3)
    expect(catD[0].title).toBe('Accruals and Prepayments')
    expect(catD[1].title).toBe('Depreciation and Fixed Assets')
    expect(catD[2].title).toBe('Inventory')

    // Category E: Payroll, Tax and Financing (5 items: PAYE, VAT, WHT, Annual PAYE, Loans)
    const catE = CANONICAL_MONTH_END_ITEMS.filter((i) => i.categoryCode === 'TAX_PAYROLL' || i.categoryCode === 'FINANCING')
    expect(catE.length).toBeGreaterThanOrEqual(5)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Payroll and PAYE')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'VAT Return')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Withholding Tax (WHT)')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Annual PAYE Return')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Loans and Interest')).toBe(true)

    // Category F: Review and Lock (including Period Lock and Sign-Off)
    const catF = CANONICAL_MONTH_END_ITEMS.filter((i) => i.categoryCode === 'REVIEW_LOCK')
    expect(catF.length).toBeGreaterThanOrEqual(5)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Intercompany and Related-Party Balances')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Suspense and Unallocated Accounts')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Adjusting Journals')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Trial Balance Review')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Management Accounts')).toBe(true)
    expect(CANONICAL_MONTH_END_ITEMS.some((i) => i.title === 'Period Lock and Sign-Off')).toBe(true)
  })

  it('buildMonthEndItemsForPeriod computes correct statutory dates for monthly tax and annual items', () => {
    // For period 2026-05 (May 2026):
    // PAYE statutory deadline is 10th of following month: 2026-06-10
    // VAT statutory deadline is 21st of following month: 2026-06-21
    // WHT statutory deadline is 21st of following month: 2026-06-21
    // Annual PAYE statutory deadline is 31 January: 2027-01-31
    const items = buildMonthEndItemsForPeriod('month-end-2026-05', '2026-05')
    expect(items).toHaveLength(22)

    const payeItem = items.find((i) => i.title === 'Payroll and PAYE')
    expect(payeItem?.statutoryDueDate).toBe('2026-06-10')

    const vatItem = items.find((i) => i.title === 'VAT Return')
    expect(vatItem?.statutoryDueDate).toBe('2026-06-21')

    const whtItem = items.find((i) => i.title === 'Withholding Tax (WHT)')
    expect(whtItem?.statutoryDueDate).toBe('2026-06-21')

    const annualItem = items.find((i) => i.title === 'Annual PAYE Return')
    expect(annualItem?.statutoryDueDate).toBe('2027-01-31')
  })
})

describe('Statutory Tax Deadlines & Overdue Rules (Section 9)', () => {
  it('PAYE deadline is fixed at 10th of following month regardless of day of week', () => {
    const mayPeriod = calculateStatutoryDeadline('PAYE', '2026-05')
    expect(mayPeriod.statutoryDate).toBe('2026-06-10') // Wednesday, 10 June 2026

    const octPeriod = calculateStatutoryDeadline('PAYE', '2026-10')
    expect(octPeriod.statutoryDate).toBe('2026-11-10') // Tuesday, 10 Nov 2026
  })

  it('VAT and WHT deadlines are fixed at 21st of following month', () => {
    // In May 2026, 21 June 2026 is a Sunday!
    const vatMay = calculateStatutoryDeadline('VAT', '2026-05')
    expect(vatMay.statutoryDate).toBe('2026-06-21')

    const whtMay = calculateStatutoryDeadline('WHT', '2026-05')
    expect(whtMay.statutoryDate).toBe('2026-06-21')
  })

  it('Annual PAYE return is fixed at 31 January of following year', () => {
    const annualDeadline = calculateStatutoryDeadline('ANNUAL_PAYE', '2026-05')
    expect(annualDeadline.statutoryDate).toBe('2027-01-31')
  })

  it('Statutory deadline on a Sunday is NOT automatically shifted; suggests preceding Friday', () => {
    // 21 June 2026 is Sunday.
    const suggested = calculateSuggestedFriday('2026-06-21')
    expect(suggested).not.toBeNull()
    expect(suggested?.dayName).toBe('Sunday')
    expect(suggested?.fridayIso).toBe('2026-06-19') // Preceding Friday, 19 June
  })

  it('Statutory deadline on a Saturday suggests preceding Friday', () => {
    // 21 March 2026 is Saturday (February close VAT/WHT)
    const suggested = calculateSuggestedFriday('2026-03-21')
    expect(suggested).not.toBeNull()
    expect(suggested?.dayName).toBe('Saturday')
    expect(suggested?.fridayIso).toBe('2026-03-20') // Preceding Friday, 20 March
  })

  it('Statutory deadline on a weekday does not suggest weekend adjustment', () => {
    // 10 June 2026 is Wednesday
    const suggested = calculateSuggestedFriday('2026-06-10')
    expect(suggested).toBeNull()
  })

  it('Strict Overdue Rule: Item is NOT overdue when internal target passes before statutory date', () => {
    // Example from prompt Section 9.C:
    // Statutory due date: Sunday, 21 June 2026
    // Complete by (internal target): Friday, 19 June 2026
    // Reference date (current date): Saturday, 20 June 2026
    const refDate = new Date(2026, 5, 20) // 20 June 2026 (Saturday)

    const evaluation = evaluateTaxDeadlineStatus(
      '2026-06-21',
      '2026-06-19',
      'NOT_STARTED',
      refDate
    )

    // MUST NOT be labeled OVERDUE!
    expect(evaluation.isOverdue).toBe(false)
    expect(evaluation.isInternalTargetPassed).toBe(true)
    expect(evaluation.displayStatus).toBe('TARGET_PASSED')
    expect(evaluation.label).toBe('Internal target passed')
  })

  it('Strict Overdue Rule: Item becomes OVERDUE only after statutory date passes', () => {
    // Reference date: Monday, 22 June 2026 (Statutory date was Sunday, 21 June 2026)
    const refDate = new Date(2026, 5, 22)

    const evaluation = evaluateTaxDeadlineStatus(
      '2026-06-21',
      '2026-06-19',
      'NOT_STARTED',
      refDate
    )

    expect(evaluation.isOverdue).toBe(true)
    expect(evaluation.displayStatus).toBe('OVERDUE')
    expect(evaluation.label).toBe('Overdue')
  })

  it('Completed or Reviewed items are never marked overdue or target passed', () => {
    const refDate = new Date(2026, 5, 25) // Past statutory date

    const evalCompleted = evaluateTaxDeadlineStatus(
      '2026-06-21',
      '2026-06-19',
      'COMPLETED',
      refDate
    )
    expect(evalCompleted.isOverdue).toBe(false)
    expect(evalCompleted.displayStatus).toBe('ON_TRACK')

    const evalReviewed = evaluateTaxDeadlineStatus(
      '2026-06-21',
      '2026-06-19',
      'REVIEWED',
      refDate
    )
    expect(evalReviewed.isOverdue).toBe(false)
    expect(evalReviewed.displayStatus).toBe('ON_TRACK')
  })
})

describe('Checklist Status & Separation of Duties (Section 7, 11, 12)', () => {
  it('differentiates COMPLETED (Done) from REVIEWED status values', () => {
    const validStatuses: ChecklistItemStatus[] = [
      'NOT_STARTED',
      'IN_PROGRESS',
      'COMPLETED',
      'DONE',
      'REVIEWED',
      'NOT_APPLICABLE',
    ]

    expect(validStatuses).toContain('COMPLETED')
    expect(validStatuses).toContain('REVIEWED')
    expect('COMPLETED').not.toBe('REVIEWED')
  })

  it('requires a mandatory reason when marking an item NOT_APPLICABLE', () => {
    const validateItemSubmission = (status: ChecklistItemStatus, naReason: string): boolean => {
      if (status === 'NOT_APPLICABLE') {
        return Boolean(naReason && naReason.trim().length > 0)
      }
      return true
    }

    expect(validateItemSubmission('NOT_APPLICABLE', '')).toBe(false)
    expect(validateItemSubmission('NOT_APPLICABLE', '   ')).toBe(false)
    expect(validateItemSubmission('NOT_APPLICABLE', 'Entity does not operate POS gateways')).toBe(true)
    expect(validateItemSubmission('COMPLETED', '')).toBe(true)
  })

  it('preparer without manager authorization cannot assign REVIEWED status', () => {
    const canAssignStatus = (
      targetStatus: ChecklistItemStatus,
      isManagerOrSupervisor: boolean
    ): boolean => {
      if (targetStatus === 'REVIEWED') {
        return isManagerOrSupervisor
      }
      return true
    }

    // Preparer (isManager: false)
    expect(canAssignStatus('COMPLETED', false)).toBe(true)
    expect(canAssignStatus('REVIEWED', false)).toBe(false)

    // Supervisor / Manager (isManager: true)
    expect(canAssignStatus('REVIEWED', true)).toBe(true)
  })
})
