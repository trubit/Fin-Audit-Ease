/**
 * Statutory Tax Deadline and Weekend Suggestion Utilities.
 * Enforces Nigerian tax compliance requirements (Section 9):
 * - Monthly PAYE: 10th of following month
 * - Monthly VAT: 21st of following month
 * - Monthly WHT: 21st of following month
 * - Annual PAYE: 31st January of following year
 *
 * CRITICAL INVARIANT:
 * Statutory deadlines are legally fixed and MUST NEVER automatically move on weekends.
 * Internal target dates ("Complete by") are separate and configurable.
 * An item is ONLY overdue after its statutory deadline has passed.
 */

import { parseDateSafe } from '@/utils/dateUtils'

export type StatutoryTaxType = 'PAYE' | 'VAT' | 'WHT' | 'ANNUAL_PAYE'

export interface StatutoryDeadlineResult {
  readonly statutoryDate: string // YYYY-MM-DD
  readonly defaultTargetDate: string // YYYY-MM-DD
  readonly isWeekend: boolean
  readonly dayOfWeek: 'Saturday' | 'Sunday' | 'Weekday'
  readonly suggestedEarlierDate?: string // YYYY-MM-DD (e.g. preceding Friday)
  readonly weekendPrompt?: string
}

export interface TaxDeadlineStatus {
  readonly isOverdue: boolean
  readonly isInternalTargetPassed: boolean
  readonly daysUntilStatutory: number
  readonly daysUntilTarget: number
  readonly displayStatus: 'OVERDUE' | 'TARGET_PASSED' | 'DUE_SOON' | 'ON_TRACK'
  readonly label: string
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

export interface SuggestedFridayResult {
  readonly dayName: 'Saturday' | 'Sunday'
  readonly fridayIso: string
  readonly fridayFormatted: string
  readonly statutoryFormatted: string
}

/**
 * Checks if a statutory date falls on a weekend and computes the suggested preceding Friday.
 */
export const calculateSuggestedFriday = (statutoryDateIso: string): SuggestedFridayResult | null => {
  const dateObj = parseDateSafe(statutoryDateIso)
  if (!dateObj) return null

  const dayOfWeekIndex = dateObj.getDay()
  if (dayOfWeekIndex !== 0 && dayOfWeekIndex !== 6) {
    return null
  }

  const dayName: 'Saturday' | 'Sunday' = dayOfWeekIndex === 0 ? 'Sunday' : 'Saturday'
  const daysToSubtract = dayOfWeekIndex === 0 ? 2 : 1
  const precedingFriday = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate() - daysToSubtract,
    12,
    0,
    0
  )

  const friYear = precedingFriday.getFullYear()
  const friMonth = String(precedingFriday.getMonth() + 1).padStart(2, '0')
  const friDay = String(precedingFriday.getDate()).padStart(2, '0')
  const fridayIso = `${friYear}-${friMonth}-${friDay}`

  const friMonthName = MONTH_NAMES[precedingFriday.getMonth()]
  const statMonthName = MONTH_NAMES[dateObj.getMonth()]

  return {
    dayName,
    fridayIso,
    fridayFormatted: `${precedingFriday.getDate()} ${friMonthName}`,
    statutoryFormatted: `${dateObj.getDate()} ${statMonthName}`,
  }
}

/**
 * Calculates the exact statutory deadline for a reporting month/period.
 * Accepts either:
 * - (taxType, periodYear: number, periodMonth: number) // 0-indexed month
 * - (taxType, periodMonthString: string) // e.g. "2026-05"
 */
export const calculateStatutoryDeadline = (
  taxType: StatutoryTaxType,
  periodYearOrMonthString: number | string,
  periodMonthArg?: number
): StatutoryDeadlineResult => {
  let periodYear: number
  let periodMonth: number

  if (typeof periodYearOrMonthString === 'string') {
    const parts = periodYearOrMonthString.split('-')
    periodYear = parseInt(parts[0], 10)
    periodMonth = parseInt(parts[1], 10) - 1 // convert 1-indexed (05) to 0-indexed (4)
  } else {
    periodYear = periodYearOrMonthString
    periodMonth = periodMonthArg ?? 0
  }

  let deadlineYear = periodYear
  let deadlineMonth = periodMonth + 1 // Following month
  let deadlineDay = 10

  if (deadlineMonth > 11) {
    deadlineMonth = 0
    deadlineYear += 1
  }

  if (taxType === 'PAYE') {
    deadlineDay = 10
  } else if (taxType === 'VAT' || taxType === 'WHT') {
    deadlineDay = 21
  } else if (taxType === 'ANNUAL_PAYE') {
    // Annual Employer Return is due 31 January of following year
    deadlineYear = periodYear + 1
    deadlineMonth = 0 // January
    deadlineDay = 31
  }

  const statutoryDateObj = new Date(deadlineYear, deadlineMonth, deadlineDay, 12, 0, 0)
  const dayOfWeekIndex = statutoryDateObj.getDay() // 0 = Sun, 6 = Sat

  const isWeekend = dayOfWeekIndex === 0 || dayOfWeekIndex === 6
  const dayOfWeek: 'Saturday' | 'Sunday' | 'Weekday' =
    dayOfWeekIndex === 0 ? 'Sunday' : dayOfWeekIndex === 6 ? 'Saturday' : 'Weekday'

  const formattedMonth = String(deadlineMonth + 1).padStart(2, '0')
  const formattedDay = String(deadlineDay).padStart(2, '0')
  const statutoryDate = `${deadlineYear}-${formattedMonth}-${formattedDay}`

  let suggestedEarlierDate: string | undefined
  let weekendPrompt: string | undefined

  if (isWeekend) {
    const daysToSubtract = dayOfWeekIndex === 0 ? 2 : 1
    const precedingFriday = new Date(deadlineYear, deadlineMonth, deadlineDay - daysToSubtract, 12, 0, 0)
    const friYear = precedingFriday.getFullYear()
    const friMonth = String(precedingFriday.getMonth() + 1).padStart(2, '0')
    const friDay = String(precedingFriday.getDate()).padStart(2, '0')
    suggestedEarlierDate = `${friYear}-${friMonth}-${friDay}`

    const friMonthName = MONTH_NAMES[precedingFriday.getMonth()]
    const statutoryMonthName = MONTH_NAMES[deadlineMonth]

    weekendPrompt = `The statutory due date (${deadlineDay} ${statutoryMonthName}) falls on a ${dayOfWeek}. Would you like to set an earlier internal target date, such as Friday, ${precedingFriday.getDate()} ${friMonthName}?`
  }

  return {
    statutoryDate,
    defaultTargetDate: statutoryDate,
    isWeekend,
    dayOfWeek,
    suggestedEarlierDate,
    weekendPrompt,
  }
}

/**
 * Evaluates whether an item is overdue or whether internal target has passed.
 * RULE: An item is ONLY overdue if today > statutoryDueDate.
 * If today > internalTargetDate but today <= statutoryDueDate, the status is TARGET_PASSED (NOT overdue).
 * If item status is COMPLETED or REVIEWED or NOT_APPLICABLE, it is never marked overdue.
 */
export const evaluateTaxDeadlineStatus = (
  statutoryDateIso: string,
  internalTargetDateIso?: string,
  statusOrReferenceNow?: string | Date | number,
  referenceNowArg?: Date | string | number
): TaxDeadlineStatus => {
  let itemStatus: string | undefined
  let referenceNow: Date | string | number | undefined

  if (typeof statusOrReferenceNow === 'string' && ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'DONE', 'REVIEWED', 'NOT_APPLICABLE'].includes(statusOrReferenceNow)) {
    itemStatus = statusOrReferenceNow
    referenceNow = referenceNowArg
  } else {
    referenceNow = statusOrReferenceNow as Date | string | number | undefined
  }

  if (itemStatus === 'COMPLETED' || itemStatus === 'DONE' || itemStatus === 'REVIEWED' || itemStatus === 'NOT_APPLICABLE') {
    return {
      isOverdue: false,
      isInternalTargetPassed: false,
      daysUntilStatutory: 0,
      daysUntilTarget: 0,
      displayStatus: 'ON_TRACK',
      label: itemStatus === 'REVIEWED' ? 'Reviewed' : 'Completed',
    }
  }

  const now = referenceNow
    ? typeof referenceNow === 'number'
      ? new Date(referenceNow)
      : typeof referenceNow === 'string'
      ? parseDateSafe(referenceNow) || new Date()
      : referenceNow
    : new Date()

  const statutoryObj = parseDateSafe(statutoryDateIso)
  if (!statutoryObj) {
    return {
      isOverdue: false,
      isInternalTargetPassed: false,
      daysUntilStatutory: 0,
      daysUntilTarget: 0,
      displayStatus: 'ON_TRACK',
      label: statutoryDateIso,
    }
  }

  const targetObj = internalTargetDateIso
    ? parseDateSafe(internalTargetDateIso) || statutoryObj
    : statutoryObj

  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const statutoryStart = new Date(statutoryObj.getFullYear(), statutoryObj.getMonth(), statutoryObj.getDate()).getTime()
  const targetStart = new Date(targetObj.getFullYear(), targetObj.getMonth(), targetObj.getDate()).getTime()

  const msPerDay = 1000 * 60 * 60 * 24
  const daysUntilStatutory = Math.round((statutoryStart - todayStart) / msPerDay)
  const daysUntilTarget = Math.round((targetStart - todayStart) / msPerDay)

  const isOverdue = daysUntilStatutory < 0
  const isInternalTargetPassed = daysUntilTarget < 0 && !isOverdue

  let displayStatus: 'OVERDUE' | 'TARGET_PASSED' | 'DUE_SOON' | 'ON_TRACK' = 'ON_TRACK'
  let label = ''

  if (isOverdue) {
    displayStatus = 'OVERDUE'
    label = 'Overdue'
  } else if (isInternalTargetPassed) {
    displayStatus = 'TARGET_PASSED'
    label = 'Internal target passed'
  } else if (daysUntilStatutory === 0) {
    displayStatus = 'DUE_SOON'
    label = 'Statutory deadline is today'
  } else if (daysUntilTarget === 0) {
    displayStatus = 'DUE_SOON'
    label = 'Internal target is today'
  } else if (daysUntilStatutory <= 3) {
    displayStatus = 'DUE_SOON'
    label = `${daysUntilStatutory} days until statutory deadline`
  } else {
    displayStatus = 'ON_TRACK'
    label = `${daysUntilStatutory} days until statutory deadline`
  }

  return {
    isOverdue,
    isInternalTargetPassed,
    daysUntilStatutory,
    daysUntilTarget,
    displayStatus,
    label,
  }
}
