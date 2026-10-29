/**
 * Authoritative Canonical Checklist Templates.
 * Derived strictly from Section 5 (Weekly) and Section 6 (Month-End Close).
 * Used when rendering official items, creating templates, and validating structure.
 */

import type { ChecklistItem } from '../types'
import { calculateStatutoryDeadline } from '../utils/taxDeadlineUtils'

export interface CanonicalItemDefinition {
  readonly idSuffix: string
  readonly itemNumber: number
  readonly title: string
  readonly description: string
  readonly category: string
  readonly categoryCode: 'CASH' | 'RECEIVABLES' | 'PAYABLES' | 'ACCRUALS_ASSETS' | 'TAX_PAYROLL' | 'FINANCING' | 'REVIEW_LOCK' | 'WEEKLY_OPERATIONS'
  readonly requiresEvidence?: boolean
  readonly allowsNotApplicable?: boolean
  readonly isTaxStatutory?: boolean
  readonly taxType?: 'PAYE' | 'VAT' | 'WHT' | 'ANNUAL_PAYE'
  readonly isAnnual?: boolean
  readonly isReviewAndLock?: boolean
}

/**
 * 9 Canonical Weekly Checklist Items (Prompt Section 5)
 */
export const CANONICAL_WEEKLY_ITEMS: CanonicalItemDefinition[] = [
  {
    idSuffix: 'wk-trans',
    itemNumber: 1,
    title: 'Record Financial Transactions',
    description: 'Record all sales, purchases, expenses, receipts, and payments. Ensure invoices and receipts are attached, and identify transactions with missing evidence.',
    category: 'Transactions & Posting',
    categoryCode: 'WEEKLY_OPERATIONS',
    requiresEvidence: true,
  },
  {
    idSuffix: 'wk-bank',
    itemNumber: 2,
    title: 'Bank Reconciliation',
    description: 'Reconcile all operational bank accounts to daily bank feeds and sub-ledgers. Clear or explain unmatched reconciling items and variance differences.',
    category: 'Reconciliations',
    categoryCode: 'WEEKLY_OPERATIONS',
  },
  {
    idSuffix: 'wk-gateway-pos',
    itemNumber: 3,
    title: 'Payment Gateway and POS Reconciliation',
    description: 'Reconcile payment gateway (Paystack, Flutterwave) and POS terminal settlements to bank deposits. Mark Not Applicable with reason if not utilized.',
    category: 'Reconciliations',
    categoryCode: 'WEEKLY_OPERATIONS',
    allowsNotApplicable: true,
  },
  {
    idSuffix: 'wk-petty-cash',
    itemNumber: 4,
    title: 'Petty Cash Reconciliation',
    description: 'Count physical petty cash on hand and reconcile against approved imprest balance. Record explanations for any cash drawer discrepancy.',
    category: 'Reconciliations',
    categoryCode: 'WEEKLY_OPERATIONS',
  },
  {
    idSuffix: 'wk-supplier-inv',
    itemNumber: 5,
    title: 'Supplier Invoice Matching',
    description: 'Perform three-way match on supplier invoices against approved purchase orders and goods received notes (GRN) prior to posting ledger commitments.',
    category: 'Supporting Documents',
    categoryCode: 'WEEKLY_OPERATIONS',
    requiresEvidence: true,
  },
  {
    idSuffix: 'wk-receivables',
    itemNumber: 6,
    title: 'Receivables Review',
    description: 'Review weekly accounts receivable ageing schedule, identify overdue customer balances, and record collections follow-up actions.',
    category: 'Reviews & Approvals',
    categoryCode: 'WEEKLY_OPERATIONS',
  },
  {
    idSuffix: 'wk-payables',
    itemNumber: 7,
    title: 'Payables Review',
    description: 'Review accounts payable ageing, verify vendor credit terms, and schedule upcoming weekly vendor disbursements.',
    category: 'Reviews & Approvals',
    categoryCode: 'WEEKLY_OPERATIONS',
  },
  {
    idSuffix: 'wk-missing-docs',
    itemNumber: 8,
    title: 'Missing Documents',
    description: 'Flag missing evidentiary documentation including unposted invoices, vendor payments without receipts, and undocumented expense claims.',
    category: 'Supporting Documents',
    categoryCode: 'WEEKLY_OPERATIONS',
    requiresEvidence: true,
  },
  {
    idSuffix: 'wk-supervisor-rev',
    itemNumber: 9,
    title: 'Supervisor Review',
    description: 'Submit completed weekly postings and reconciliations for supervisor inspection, review comments, and authorized sign-off.',
    category: 'Reviews & Approvals',
    categoryCode: 'WEEKLY_OPERATIONS',
    isReviewAndLock: true,
  },
]

/**
 * 21 Canonical Month-End Close Items across Categories A through F (Prompt Section 6)
 */
export const CANONICAL_MONTH_END_ITEMS: CanonicalItemDefinition[] = [
  // CATEGORY A: CASH
  {
    idSuffix: 'me-bank-rec',
    itemNumber: 1,
    title: 'Bank Reconciliation',
    description: 'Reconcile every commercial bank account and cash book to month-end bank statements and obtain supervisor sign-off.',
    category: 'Cash & Bank',
    categoryCode: 'CASH',
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-pos-rec',
    itemNumber: 2,
    title: 'Payment Gateway and POS Reconciliation',
    description: 'Reconcile merchant payment gateway and POS terminal settlement accounts to general ledger. Allow Not Applicable with mandatory explanation.',
    category: 'Cash & Bank',
    categoryCode: 'CASH',
    allowsNotApplicable: true,
  },

  // CATEGORY B: RECEIVABLES
  {
    idSuffix: 'me-ar-ctrl',
    itemNumber: 3,
    title: 'Receivables Control Account',
    description: 'Reconcile total accounts receivable sub-ledger balances against general ledger control account (Trade Debtors).',
    category: 'Receivables',
    categoryCode: 'RECEIVABLES',
  },
  {
    idSuffix: 'me-cust-stmt',
    itemNumber: 4,
    title: 'Customer Statements',
    description: 'Reconcile customer statement balances to sales ledger balances, identify disputed items, and explain reconciliation differences.',
    category: 'Receivables',
    categoryCode: 'RECEIVABLES',
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-ar-ageing',
    itemNumber: 5,
    title: 'Receivables Ageing and Impairment',
    description: 'Review accounts receivable ageing report and assess the need for specific impairment or ECL bad debt provisions.',
    category: 'Receivables',
    categoryCode: 'RECEIVABLES',
  },

  // CATEGORY C: PAYABLES
  {
    idSuffix: 'me-ap-ctrl',
    itemNumber: 6,
    title: 'Payables Control Account',
    description: 'Reconcile trade creditors sub-ledger accounts against general ledger trade payables control account.',
    category: 'Payables',
    categoryCode: 'PAYABLES',
  },
  {
    idSuffix: 'me-vendor-stmt',
    itemNumber: 7,
    title: 'Vendor Statements',
    description: 'Reconcile third-party vendor monthly statement balances to accounts payable ledger and clear variances.',
    category: 'Payables',
    categoryCode: 'PAYABLES',
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-unrecorded-liab',
    itemNumber: 8,
    title: 'Unrecorded Liabilities and Cut-Off',
    description: 'Review goods and services received near month-end without corresponding vendor invoices to identify unrecorded liabilities and accruals.',
    category: 'Payables',
    categoryCode: 'PAYABLES',
  },

  // CATEGORY D: ACCRUALS AND ASSETS
  {
    idSuffix: 'me-accruals-prep',
    itemNumber: 9,
    title: 'Accruals and Prepayments',
    description: 'Update accrual and prepayment amortisation schedules, calculate monthly portions, and verify journal postings.',
    category: 'Accruals & Assets',
    categoryCode: 'ACCRUALS_ASSETS',
  },
  {
    idSuffix: 'me-deprec-fa',
    itemNumber: 10,
    title: 'Depreciation and Fixed Assets',
    description: 'Run monthly depreciation computations, update the fixed asset register for acquisitions, disposals, and write-offs.',
    category: 'Accruals & Assets',
    categoryCode: 'ACCRUALS_ASSETS',
  },
  {
    idSuffix: 'me-inventory',
    itemNumber: 11,
    title: 'Inventory',
    description: 'Perform physical count or reconcile perpetual inventory reports to the general ledger and review stock valuation. Mark N/A with reason if no inventory.',
    category: 'Accruals & Assets',
    categoryCode: 'ACCRUALS_ASSETS',
    allowsNotApplicable: true,
    requiresEvidence: true,
  },

  // CATEGORY E: PAYROLL, TAX AND FINANCING
  {
    idSuffix: 'me-payroll-paye',
    itemNumber: 12,
    title: 'Payroll and PAYE',
    description: 'Verify payroll summary reconciliation, gross-to-net postings, and PAYE statutory tax computation and remittance. Statutory due date: 10th of following month.',
    category: 'Tax & Payroll',
    categoryCode: 'TAX_PAYROLL',
    isTaxStatutory: true,
    taxType: 'PAYE',
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-vat-return',
    itemNumber: 13,
    title: 'VAT Return',
    description: 'Verify monthly Value Added Tax (VAT) return computation, input/output VAT net-off, filing, and payment receipt archiving. Statutory due date: 21st of following month.',
    category: 'Tax & Payroll',
    categoryCode: 'TAX_PAYROLL',
    isTaxStatutory: true,
    taxType: 'VAT',
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-wht-return',
    itemNumber: 14,
    title: 'Withholding Tax (WHT)',
    description: 'Verify Withholding Tax deducted on vendor payments, schedule preparation, remittance, and tax credit note receipts. Statutory due date: 21st of following month.',
    category: 'Tax & Payroll',
    categoryCode: 'TAX_PAYROLL',
    isTaxStatutory: true,
    taxType: 'WHT',
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-annual-paye',
    itemNumber: 15,
    title: 'Annual PAYE Return',
    description: 'Separate annual compliance requirement: Prepare and file employer annual return (Form H1) by 31 January. Note: Compliance deadline guide is non-binding and does not constitute formal legal counsel.',
    category: 'Tax & Payroll',
    categoryCode: 'TAX_PAYROLL',
    isTaxStatutory: true,
    taxType: 'ANNUAL_PAYE',
    isAnnual: true,
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-loans-interest',
    itemNumber: 16,
    title: 'Loans and Interest',
    description: 'Agree outstanding term loan balances, overdraft facilities, finance leases, and accrued interest against official lender bank statements.',
    category: 'Financing & Intercompany',
    categoryCode: 'FINANCING',
  },
  {
    idSuffix: 'me-intercompany',
    itemNumber: 17,
    title: 'Intercompany and Related-Party Balances',
    description: 'Reconcile bilateral intercompany loan, trade, and shared service balances against counterparty statements. Mark N/A with reason if no related entities.',
    category: 'Financing & Intercompany',
    categoryCode: 'FINANCING',
    allowsNotApplicable: true,
  },

  // CATEGORY F: REVIEW AND LOCK
  {
    idSuffix: 'me-suspense-accts',
    itemNumber: 18,
    title: 'Suspense and Unallocated Accounts',
    description: 'Investigate, clear, and reallocate all balances in clearing, suspense, and omnibus ledger accounts to zero.',
    category: 'Review & Lock',
    categoryCode: 'REVIEW_LOCK',
  },
  {
    idSuffix: 'me-adjusting-journals',
    itemNumber: 19,
    title: 'Adjusting Journals',
    description: 'Ensure all manual adjusting, reclassification, and correcting journals have written business justification and managerial approval.',
    category: 'Review & Lock',
    categoryCode: 'REVIEW_LOCK',
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-trial-balance',
    itemNumber: 20,
    title: 'Trial Balance Review',
    description: 'Review pre-closing trial balance, compare against prior month and budget, and provide variance explanations for unusual account movements.',
    category: 'Review & Lock',
    categoryCode: 'REVIEW_LOCK',
  },
  {
    idSuffix: 'me-mgmt-accounts',
    itemNumber: 21,
    title: 'Management Accounts',
    description: 'Prepare executive monthly management accounts comprising Statement of Financial Position, Profit or Loss, and Cash Flow notes.',
    category: 'Review & Lock',
    categoryCode: 'REVIEW_LOCK',
    requiresEvidence: true,
  },
  {
    idSuffix: 'me-period-lock',
    itemNumber: 22,
    title: 'Period Lock and Sign-Off',
    description: 'Record dual preparer and reviewer sign-offs and execute permanent general ledger period locking to prevent backdated entries.',
    category: 'Review & Lock',
    categoryCode: 'REVIEW_LOCK',
    isReviewAndLock: true,
  },
]

/**
 * Generate standard checklist items for a given period with statutory date enrichment.
 */
export const buildMonthEndItemsForPeriod = (
  checklistId: string,
  periodYearOrMonthString: number | string,
  periodMonthArg?: number
): ChecklistItem[] => {
  let periodYear: number
  let periodMonth: number

  if (typeof periodYearOrMonthString === 'string') {
    const parts = periodYearOrMonthString.split('-')
    periodYear = parseInt(parts[0], 10)
    periodMonth = parseInt(parts[1], 10) - 1
  } else {
    periodYear = periodYearOrMonthString
    periodMonth = periodMonthArg ?? 0
  }

  return CANONICAL_MONTH_END_ITEMS.map((def) => {
    let statutoryDueDate: string | undefined
    let internalTargetDate: string | undefined

    if (def.isTaxStatutory && def.taxType) {
      const calc = calculateStatutoryDeadline(def.taxType, periodYear, periodMonth)
      statutoryDueDate = calc.statutoryDate
      internalTargetDate = calc.defaultTargetDate
    }

    return {
      id: `${checklistId}-${def.idSuffix}`,
      checklistId,
      itemNumber: def.itemNumber,
      title: def.title,
      description: def.description,
      category: def.category,
      status: 'NOT_STARTED',
      statutoryDueDate,
      internalTargetDate,
      dueDate: statutoryDueDate || `${periodYear}-${String(periodMonth + 1).padStart(2, '0')}-28`,
      attachedDocumentCount: 0,
      requiresEvidence: def.requiresEvidence,
      hasMissingEvidence: Boolean(def.requiresEvidence),
    }
  })
}

/**
 * Generate standard weekly checklist items for a given reporting week.
 */
export const buildWeeklyItemsForWeek = (
  checklistId: string,
  _weekNumber: number,
  weekEndDate: string
): ChecklistItem[] => {
  return CANONICAL_WEEKLY_ITEMS.map((def) => {
    return {
      id: `${checklistId}-${def.idSuffix}`,
      checklistId,
      itemNumber: def.itemNumber,
      title: def.title,
      description: def.description,
      category: def.category,
      status: 'NOT_STARTED',
      dueDate: weekEndDate,
      internalTargetDate: weekEndDate,
      attachedDocumentCount: 0,
      requiresEvidence: def.requiresEvidence,
      hasMissingEvidence: Boolean(def.requiresEvidence),
    }
  })
}
