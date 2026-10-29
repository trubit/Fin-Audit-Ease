import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api/apiClient'
import { notificationService } from '../services/notificationService'
import { sanitizeInternalUrl, getNotificationDestination } from '../utils/navigation'
import { formatRelativeTime } from '@/utils/dateUtils'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { AppNotification } from '../types'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

describe('Notification Service & Safe Navigation (Phase 10)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('notificationService', () => {
    it('fetches notifications with unreadOnly parameter if specified', async () => {
      const mockNotifications: AppNotification[] = [
        {
          id: 'notif-1',
          userId: 'usr-1',
          title: 'New Document Uploaded',
          message: 'Q3 Trial Balance has been attached.',
          severity: 'INFO',
          isRead: false,
          createdAt: '2026-10-02T10:00:00Z',
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockNotifications })

      const response = await notificationService.getNotifications({ unreadOnly: true })

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.LIST, {
        params: { unreadOnly: true },
      })
      expect(response.data).toHaveLength(1)
    })

    it('marks an individual notification as read', async () => {
      const mockUpdated: AppNotification = {
        id: 'notif-1',
        userId: 'usr-1',
        title: 'New Document Uploaded',
        message: 'Q3 Trial Balance has been attached.',
        severity: 'INFO',
        isRead: true,
        createdAt: '2026-10-02T10:00:00Z',
      }

      vi.mocked(apiClient.put).mockResolvedValueOnce({ success: true, data: mockUpdated })

      const response = await notificationService.markAsRead('notif-1')

      expect(apiClient.put).toHaveBeenCalledWith(
        API_ENDPOINTS.NOTIFICATIONS.MARK_AS_READ('notif-1')
      )
      expect(response.data.isRead).toBe(true)
    })

    it('marks all notifications as read', async () => {
      vi.mocked(apiClient.put).mockResolvedValueOnce({ success: true, data: undefined })

      const response = await notificationService.markAllRead()

      expect(apiClient.put).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ)
      expect(response.success).toBe(true)
    })
  })

  describe('sanitizeInternalUrl Security Protection', () => {
    it('allows valid internal paths', () => {
      expect(sanitizeInternalUrl('/dashboard')).toBe('/dashboard')
      expect(sanitizeInternalUrl('/review/rev-101')).toBe('/review/rev-101')
      expect(sanitizeInternalUrl('/checklists')).toBe('/checklists')
      expect(sanitizeInternalUrl('/notifications')).toBe('/notifications')
    })

    it('rejects external absolute URLs to prevent open redirects', () => {
      expect(sanitizeInternalUrl('https://malicious.example.com')).toBeNull()
      expect(sanitizeInternalUrl('http://phishing.site/login')).toBeNull()
      expect(sanitizeInternalUrl('//evil.org/steal-session')).toBeNull()
    })

    it('rejects dangerous script schemes', () => {
      expect(sanitizeInternalUrl('javascript:alert(1)')).toBeNull()
      expect(sanitizeInternalUrl('JAVASCRIPT:void(0)')).toBeNull()
      expect(sanitizeInternalUrl('data:text/html,<script>alert(1)</script>')).toBeNull()
      expect(sanitizeInternalUrl('vbscript:msgbox("hacked")')).toBeNull()
    })

    it('returns null for undefined, null, or empty string', () => {
      expect(sanitizeInternalUrl(undefined)).toBeNull()
      expect(sanitizeInternalUrl(null)).toBeNull()
      expect(sanitizeInternalUrl('')).toBeNull()
      expect(sanitizeInternalUrl('   ')).toBeNull()
    })
  })

  describe('getNotificationDestination Deep Linking', () => {
    it('routes directly to review workspace when reviewId is present', () => {
      const notif: AppNotification = {
        id: 'n-1',
        title: 'Review Requested',
        message: 'Please review submission',
        severity: 'INFO',
        isRead: false,
        createdAt: '2026-10-06T10:00:00Z',
        reviewId: 'rev-456',
      }
      expect(getNotificationDestination(notif)).toBe('/review/rev-456')
    })

    it('routes to documents repository when documentId is present', () => {
      const notif: AppNotification = {
        id: 'n-2',
        title: 'Document Uploaded',
        message: 'Accounting team uploaded bank statement',
        severity: 'INFO',
        isRead: false,
        createdAt: '2026-10-06T10:00:00Z',
        type: 'DOCUMENT_UPLOADED',
        documentId: 'doc-789',
      }
      expect(getNotificationDestination(notif)).toBe('/documents')
    })

    it('routes directly to audit request detail when auditRequestId is present', () => {
      const notif: AppNotification = {
        id: 'n-3',
        title: 'Request Deadline Approaching',
        message: 'Outstanding PBC request #req-12',
        severity: 'WARNING',
        isRead: false,
        createdAt: '2026-10-06T10:00:00Z',
        auditRequestId: 'req-12',
      }
      expect(getNotificationDestination(notif)).toBe('/audit-requests/req-12')
    })

    it('routes to engagement when engagementId is present', () => {
      const notif: AppNotification = {
        id: 'n-4',
        title: 'Engagement Completed',
        message: 'FY2025 Audit locked and finalized',
        severity: 'SUCCESS',
        isRead: true,
        createdAt: '2026-10-06T10:00:00Z',
        engagementId: 'eng-99',
      }
      expect(getNotificationDestination(notif)).toBe('/engagements/eng-99')
    })

    it('routes to sanitized linkUrl when specific IDs are absent', () => {
      const notif: AppNotification = {
        id: 'n-5',
        title: 'Checklist updated',
        message: 'Pre-audit checklist ready',
        severity: 'INFO',
        isRead: false,
        createdAt: '2026-10-06T10:00:00Z',
        linkUrl: '/checklists/pre-audit',
      }
      expect(getNotificationDestination(notif)).toBe('/checklists/pre-audit')
    })

    it('prevents external redirect if linkUrl is malicious', () => {
      const notif: AppNotification = {
        id: 'n-6',
        title: 'Malicious notification',
        message: 'Click here',
        severity: 'CRITICAL',
        isRead: false,
        createdAt: '2026-10-06T10:00:00Z',
        linkUrl: 'https://attacker.com/malware',
      }
      expect(getNotificationDestination(notif)).toBeNull()
    })
  })

  describe('formatRelativeTime', () => {
    it('returns "—" for missing timestamp', () => {
      expect(formatRelativeTime(undefined)).toBe('—')
      expect(formatRelativeTime('')).toBe('—')
    })

    it('formats times under 60 seconds as "Just now"', () => {
      const justNow = new Date(Date.now() - 20 * 1000).toISOString()
      expect(formatRelativeTime(justNow)).toBe('Just now')
    })

    it('formats minutes ago properly', () => {
      const fifteenMinsAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString()
      expect(formatRelativeTime(fifteenMinsAgo)).toBe('15m ago')
    })

    it('formats hours ago properly', () => {
      const threeHoursAgo = new Date(Date.now() - 3 * 3600 * 1000).toISOString()
      expect(formatRelativeTime(threeHoursAgo)).toBe('3h ago')
    })

    it('formats 1 day ago as "Yesterday"', () => {
      const yesterday = new Date(Date.now() - 25 * 3600 * 1000).toISOString()
      expect(formatRelativeTime(yesterday)).toBe('Yesterday')
    })

    it('formats several days ago as "Xd ago"', () => {
      const fourDaysAgo = new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
      expect(formatRelativeTime(fourDaysAgo)).toBe('4d ago')
    })
  })

  describe('Notification State and Filtering Logic', () => {
    const sampleNotifications: AppNotification[] = [
      {
        id: 'notif-1',
        title: 'New Audit Request Created',
        message: 'Fixed asset register required',
        type: 'REQUEST_CREATED',
        severity: 'INFO',
        isRead: false,
        createdAt: '2026-10-06T10:00:00Z',
      },
      {
        id: 'notif-2',
        title: 'Review Determination: Approved',
        message: 'Bank reconciliation signed off',
        type: 'DOCUMENT_APPROVED',
        severity: 'SUCCESS',
        isRead: true,
        createdAt: '2026-10-05T10:00:00Z',
      },
      {
        id: 'notif-3',
        title: '3-Day Deadline Reminder',
        message: 'Payroll schedule due soon',
        type: 'DEADLINE_3_DAYS',
        severity: 'WARNING',
        isRead: false,
        createdAt: '2026-10-06T08:00:00Z',
      },
      {
        id: 'notif-4',
        title: 'Escalation Notice',
        message: 'Tax compliance overdue by 5 days',
        type: 'ESCALATED',
        severity: 'CRITICAL',
        isRead: false,
        createdAt: '2026-10-06T07:00:00Z',
      },
    ]

    it('calculates unread count accurately', () => {
      const unreadCount = sampleNotifications.filter((n) => !n.isRead).length
      expect(unreadCount).toBe(3)
    })

    it('filters unread items only', () => {
      const unread = sampleNotifications.filter((n) => !n.isRead)
      expect(unread).toHaveLength(3)
      expect(unread.map((n) => n.id)).toEqual(['notif-1', 'notif-3', 'notif-4'])
    })

    it('filters request notifications', () => {
      const requests = sampleNotifications.filter((n) => {
        const typeStr = n.type?.toUpperCase() || ''
        const text = `${n.title} ${n.message}`.toLowerCase()
        return typeStr.includes('REQUEST') || text.includes('request') || text.includes('schedule')
      })
      expect(requests).toHaveLength(2)
      expect(requests.map((n) => n.id)).toEqual(['notif-1', 'notif-3'])
    })

    it('filters review notifications', () => {
      const reviews = sampleNotifications.filter((n) => {
        const typeStr = n.type?.toUpperCase() || ''
        const text = `${n.title} ${n.message}`.toLowerCase()
        return (
          typeStr.includes('REVIEW') ||
          typeStr.includes('DOCUMENT') ||
          text.includes('review') ||
          text.includes('document')
        )
      })
      expect(reviews).toHaveLength(1)
      expect(reviews[0].id).toBe('notif-2')
    })

    it('filters urgent & escalation notifications', () => {
      const urgent = sampleNotifications.filter((n) => {
        const typeStr = n.type?.toUpperCase() || ''
        const text = `${n.title} ${n.message}`.toLowerCase()
        return (
          n.severity === 'CRITICAL' ||
          typeStr.includes('ESCALAT') ||
          typeStr.includes('OVERDUE') ||
          text.includes('escalat') ||
          text.includes('overdue')
        )
      })
      expect(urgent).toHaveLength(1)
      expect(urgent[0].id).toBe('notif-4')
    })
  })
})
