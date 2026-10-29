/**
 * Safe Internal Application URL Validator.
 * Prevents open redirects, XSS schemes (javascript:, data:), and external hijacking.
 */
export const sanitizeInternalUrl = (rawUrl?: string | null): string | null => {
  if (!rawUrl || typeof rawUrl !== 'string') return null
  const trimmed = rawUrl.trim()

  // Must begin with a single slash '/' and not a protocol-relative '//'
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) {
    return null
  }

  // Reject dangerous schemes
  const lower = trimmed.toLowerCase()
  if (
    lower.includes('javascript:') ||
    lower.includes('data:') ||
    lower.includes('vbscript:')
  ) {
    return null
  }

  return trimmed
}

import type { AppNotification } from '../types'

/**
 * Resolve verified internal deep-link destination for a notification.
 * Uses linkUrl if valid, or safely resolves from verified backend identifiers.
 * Never guesses or fabricates links.
 */
export const getNotificationDestination = (notification: AppNotification): string | null => {
  if (notification.linkUrl) {
    const sanitized = sanitizeInternalUrl(notification.linkUrl)
    if (sanitized) return sanitized
  }

  if (notification.reviewId) {
    return `/review/${encodeURIComponent(notification.reviewId)}`
  }

  if (notification.auditRequestId) {
    return `/audit-requests/${encodeURIComponent(notification.auditRequestId)}`
  }

  if (notification.documentId) {
    return '/documents'
  }

  if (notification.engagementId) {
    return `/engagements/${encodeURIComponent(notification.engagementId)}`
  }

  return null
}

