/**
 * Date and Countdown Utilities for Engagements and Audit Requests.
 * Safely calculates remaining days without mutating backend timestamps.
 */
import i18n from '@/i18n'

const LOCALE_TAGS: Record<string, string> = {
  en: 'en-NG',
  yo: 'yo-NG',
  ig: 'ig-NG',
  ha: 'ha-NG',
  pcm: 'en-NG',
}

export const getActiveIntlLocale = (): string => {
  const lang = i18n?.language || 'en'
  return LOCALE_TAGS[lang] || 'en-NG'
}

export interface DeadlineInfo {
  readonly status: 'overdue' | 'due_soon' | 'on_track' | 'none'
  readonly daysRemaining: number
  readonly label: string
}

export const parseDateSafe = (dateStr?: string): Date | null => {
  if (!dateStr) return null
  // Match YYYY-MM-DD
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr)
  if (match) {
    const year = parseInt(match[1], 10)
    const month = parseInt(match[2], 10) - 1
    const day = parseInt(match[3], 10)
    return new Date(year, month, day, 12, 0, 0)
  }
  const d = new Date(dateStr)
  return isNaN(d.getTime()) ? null : d
}

export const formatDate = (isoString?: string, locale?: string): string => {
  if (!isoString) return '—'
  try {
    const d = parseDateSafe(isoString)
    if (!d) return isoString
    return d.toLocaleDateString(locale || getActiveIntlLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return isoString
  }
}

export const formatDateTime = (isoString?: string, locale?: string): string => {
  if (!isoString) return '—'
  try {
    const d = parseDateSafe(isoString)
    if (!d) return isoString
    return d.toLocaleString(locale || getActiveIntlLocale(), {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}

export const getDeadlineInfo = (dueDateIso?: string): DeadlineInfo => {
  if (!dueDateIso) {
    return { status: 'none', daysRemaining: 0, label: 'No deadline set' }
  }

  try {
    const targetDate = parseDateSafe(dueDateIso)
    if (!targetDate) {
      return { status: 'none', daysRemaining: 0, label: 'Invalid date' }
    }

    const today = new Date()
    const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

    const diffMs = targetStart - todayStart
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      const overdueDays = Math.abs(diffDays)
      return {
        status: 'overdue',
        daysRemaining: diffDays,
        label: overdueDays === 1 ? 'Overdue by 1 day' : `Overdue by ${overdueDays} days`,
      }
    }

    if (diffDays === 0) {
      return {
        status: 'due_soon',
        daysRemaining: 0,
        label: 'Due today',
      }
    }

    if (diffDays <= 3) {
      return {
        status: 'due_soon',
        daysRemaining: diffDays,
        label: diffDays === 1 ? 'Due tomorrow' : `Due in ${diffDays} days`,
      }
    }

    return {
      status: 'on_track',
      daysRemaining: diffDays,
      label: `${diffDays} days remaining`,
    }
  } catch {
    return { status: 'none', daysRemaining: 0, label: dueDateIso }
  }
}

export interface YearEndInfo {
  readonly yearEndDate?: string
  readonly daysRemaining: number
  readonly isPassed: boolean
  readonly isPreAuditRunwayActive: boolean
  readonly monthsRemaining: number
  readonly daysUntilPreAudit: number
  readonly label: string
}

export const getYearEndInfo = (yearEndDateStr?: string): YearEndInfo => {
  if (!yearEndDateStr) {
    return {
      daysRemaining: 0,
      isPassed: false,
      isPreAuditRunwayActive: false,
      monthsRemaining: 0,
      daysUntilPreAudit: 0,
      label: 'Not set',
    }
  }

  try {
    const targetDate = parseDateSafe(yearEndDateStr)
    if (!targetDate) {
      return {
        daysRemaining: 0,
        isPassed: false,
        isPreAuditRunwayActive: false,
        monthsRemaining: 0,
        daysUntilPreAudit: 0,
        label: yearEndDateStr,
      }
    }

    const today = new Date()
    const targetStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate()).getTime()
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

    const diffMs = targetStart - todayStart
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))
    const monthsRemaining = Math.max(0, Math.ceil(diffDays / 30))

    if (diffDays < 0) {
      return {
        yearEndDate: yearEndDateStr,
        daysRemaining: diffDays,
        isPassed: true,
        isPreAuditRunwayActive: false,
        monthsRemaining: 0,
        daysUntilPreAudit: 0,
        label: 'Year-end passed',
      }
    }

    if (diffDays === 0) {
      return {
        yearEndDate: yearEndDateStr,
        daysRemaining: 0,
        isPassed: false,
        isPreAuditRunwayActive: true,
        monthsRemaining: 0,
        daysUntilPreAudit: 0,
        label: 'Year-end is today',
      }
    }

    // Pre-audit preparation runway begins 6 months before year-end (~180 days)
    const isPreAuditRunwayActive = diffDays <= 180
    const daysUntilPreAudit = isPreAuditRunwayActive ? 0 : diffDays - 180

    return {
      yearEndDate: yearEndDateStr,
      daysRemaining: diffDays,
      isPassed: false,
      isPreAuditRunwayActive,
      monthsRemaining,
      daysUntilPreAudit,
      label: diffDays === 1 ? '1 day to year end' : `${diffDays} days until year end`,
    }
  } catch {
    return {
      daysRemaining: 0,
      isPassed: false,
      isPreAuditRunwayActive: false,
      monthsRemaining: 0,
      daysUntilPreAudit: 0,
      label: yearEndDateStr,
    }
  }
}

export interface MonthEndInfo {
  readonly daysRemaining: number
  readonly isPassed: boolean
  readonly isToday: boolean
  readonly label: string
  readonly monthYearLabel: string
}

export const getMonthEndInfo = (referenceDate?: Date | string | number): MonthEndInfo => {
  const ref = referenceDate
    ? typeof referenceDate === 'number'
      ? new Date(referenceDate)
      : typeof referenceDate === 'string'
      ? parseDateSafe(referenceDate) || new Date()
      : referenceDate
    : new Date()

  const year = ref.getFullYear()
  const month = ref.getMonth()
  // Day 0 of next month is the last day of this month
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date()

  const lastDayStart = new Date(lastDay.getFullYear(), lastDay.getMonth(), lastDay.getDate()).getTime()
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()

  const diffDays = Math.round((lastDayStart - todayStart) / (1000 * 60 * 60 * 24))

  const monthYearLabel = ref.toLocaleDateString(getActiveIntlLocale(), {
    month: 'long',
    year: 'numeric',
  })

  if (diffDays < 0) {
    return {
      daysRemaining: diffDays,
      isPassed: true,
      isToday: false,
      label: 'Month end has passed',
      monthYearLabel,
    }
  }

  if (diffDays === 0) {
    return {
      daysRemaining: 0,
      isPassed: false,
      isToday: true,
      label: 'Month end is today',
      monthYearLabel,
    }
  }

  return {
    daysRemaining: diffDays,
    isPassed: false,
    isToday: false,
    label: diffDays === 1 ? '1 day until month end' : `${diffDays} days until month end`,
    monthYearLabel,
  }
}

/**
 * Format timestamp into concise relative time for notifications.
 * Examples: "Just now", "15m ago", "2h ago", "Yesterday", "3d ago", or formatted date.
 */
export const formatRelativeTime = (isoString?: string): string => {
  if (!isoString) return '—'
  try {
    const d = parseDateSafe(isoString)
    if (!d) return isoString

    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    if (diffMs < 0) return formatDate(isoString) // future date

    const diffSec = Math.floor(diffMs / 1000)
    if (diffSec < 60) return 'Just now'

    const diffMin = Math.floor(diffSec / 60)
    if (diffMin < 60) return `${diffMin}m ago`

    const diffHours = Math.floor(diffMin / 60)
    if (diffHours < 24) return `${diffHours}h ago`

    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`

    return formatDate(isoString)
  } catch {
    return isoString
  }
}

