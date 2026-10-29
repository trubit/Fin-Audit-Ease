/**
 * Formatting utilities for dates, currency, and numerical audit figures.
 */

export const formatDate = (dateString?: string, locale = 'en-GB'): string => {
  if (!dateString) return '—'
  try {
    const d = new Date(dateString)
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(d)
  } catch {
    return dateString
  }
}

export const formatCurrency = (amount: number, currency = 'NGN', locale = 'en-NG'): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}
