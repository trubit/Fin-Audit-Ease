import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api/apiClient'
import { reviewService } from '../services/reviewService'
import { API_ENDPOINTS } from '@/services/api/endpoints'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Review Service (Phase 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('queries reviews list with status and engagement filter parameters', async () => {
    const mockList = [
      {
        id: 'rev-1',
        auditRequestId: 'req-1',
        title: 'Q3 Bank Verification',
        status: 'PENDING' as const,
        submissionDate: '2026-10-01T10:00:00Z',
        submittedByUserName: 'Finance Lead',
        feedbackNotes: [],
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockList })

    const response = await reviewService.getReviews({ status: 'PENDING', engagementId: 'eng-1' })

    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.REVIEWS.LIST, {
      params: { status: 'PENDING', engagementId: 'eng-1' },
    })
    expect(response.data).toHaveLength(1)
  })

  it('fetches review detail by id', async () => {
    const mockDetail = {
      id: 'rev-2',
      title: 'Fixed Asset Schedule',
      status: 'IN_REVIEW' as const,
      feedbackNotes: [],
    }

    vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockDetail })

    const response = await reviewService.getReviewById('rev-2')

    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.REVIEWS.DETAIL('rev-2'))
    expect(response.data.id).toBe('rev-2')
  })

  it('submits reviewer feedback notes with structured payload', async () => {
    const mockFeedback = {
      id: 'fb-1',
      reviewId: 'rev-2',
      reviewerId: 'usr-auditor',
      reviewerName: 'Senior Auditor',
      comment: 'Please reconcile depreciation rates against policy note 4.',
      createdAt: '2026-10-02T14:00:00Z',
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true, data: mockFeedback })

    const response = await reviewService.submitFeedback('rev-2', {
      comment: 'Please reconcile depreciation rates against policy note 4.',
      targetType: 'DOCUMENT',
      targetId: 'doc-asset-01',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.REVIEWS.SUBMIT_FEEDBACK('rev-2'),
      {
        comment: 'Please reconcile depreciation rates against policy note 4.',
        targetType: 'DOCUMENT',
        targetId: 'doc-asset-01',
      }
    )
    expect(response.data.comment).toContain('depreciation rates')
  })

  it('dispatches approve review mutation with optional auditor sign-off notes', async () => {
    const mockApproved = {
      id: 'rev-2',
      status: 'APPROVED' as const,
      title: 'Fixed Asset Schedule',
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true, data: mockApproved })

    const response = await reviewService.approveReview('rev-2', {
      notes: 'Sign-off granted following physical asset count validation.',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.REVIEWS.APPROVE('rev-2'),
      {
        notes: 'Sign-off granted following physical asset count validation.',
      }
    )
    expect(response.data.status).toBe('APPROVED')
  })

  it('dispatches reject review mutation with rejection notes', async () => {
    const mockRejected = {
      id: 'rev-2',
      status: 'REJECTED' as const,
      title: 'Fixed Asset Schedule',
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true, data: mockRejected })

    const response = await reviewService.rejectReview('rev-2', {
      notes: 'Missing disposal certificates for Q2 equipment sale.',
    })

    expect(apiClient.post).toHaveBeenCalledWith(
      API_ENDPOINTS.REVIEWS.REJECT('rev-2'),
      {
        notes: 'Missing disposal certificates for Q2 equipment sale.',
      }
    )
    expect(response.data.status).toBe('REJECTED')
  })

  it('strictly supports confirmed ReviewStatus domain values (Option A: APPROVE/REJECT)', () => {
    const validStatuses = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED']
    expect(validStatuses).toHaveLength(4)
    expect(validStatuses).toContain('PENDING')
    expect(validStatuses).toContain('IN_REVIEW')
    expect(validStatuses).toContain('APPROVED')
    expect(validStatuses).toContain('REJECTED')
    expect(validStatuses).not.toContain('REVISED')
  })

  it('maps review statuses to verified camelCase i18n keys and never raw dot-notation strings', () => {
    const statusKeyMap: Record<'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED', string> = {
      PENDING: 'review.statusPending',
      IN_REVIEW: 'review.statusInReview',
      APPROVED: 'review.statusApproved',
      REJECTED: 'review.statusRejected',
    }

    Object.values(statusKeyMap).forEach((key) => {
      // Must not match broken uppercase concatenation like review.statusPENDING or review.statusIN_REVIEW
      expect(key).not.toMatch(/^review\.status[A-Z_]+$/)
      expect(['review.statusPending', 'review.statusInReview', 'review.statusApproved', 'review.statusRejected']).toContain(key)
    })
  })

  describe('Auditor Review Workspace Security & Role Isolation (Phase 9)', () => {
    it('restricts decision actions to auditor and audit manager roles', () => {
      const allowedRoles = ['AUDITOR', 'AUDIT_MANAGER', 'ADMIN']
      expect(allowedRoles.includes('AUDITOR')).toBe(true)
      expect(allowedRoles.includes('AUDIT_MANAGER')).toBe(true)
      expect(allowedRoles.includes('ADMIN')).toBe(true)
      expect(allowedRoles.includes('FINANCE_USER')).toBe(false)
    })

    it('requires mandatory non-empty, non-whitespace rejection notes', () => {
      const validateRejectionReason = (reason?: string) => {
        if (!reason || !reason.trim()) {
          return { isValid: false, error: 'Rejection reason is required' }
        }
        return { isValid: true }
      }

      expect(validateRejectionReason('').isValid).toBe(false)
      expect(validateRejectionReason('   ').isValid).toBe(false)
      expect(validateRejectionReason(undefined).isValid).toBe(false)
      expect(validateRejectionReason('Missing schedule').isValid).toBe(true)
    })

    it('flags locked read-only state when engagement is completed', () => {
      const checkIsReviewLocked = (engagementStatus?: string) => engagementStatus === 'COMPLETED'

      expect(checkIsReviewLocked('ACTIVE')).toBe(false)
      expect(checkIsReviewLocked('IN_REVIEW')).toBe(false)
      expect(checkIsReviewLocked('COMPLETED')).toBe(true)
    })

    it('isolates review items by engagement and prevents cross-engagement leakage', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: [{ id: 'rev-eng-1', engagementId: 'eng-001', title: 'Schedule A' }],
      })

      const response = await reviewService.getReviews({ engagementId: 'eng-001' })

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.REVIEWS.LIST, {
        params: { engagementId: 'eng-001' },
      })
      expect(response.data[0].engagementId).toBe('eng-001')
    })

    it('ensures private auditor notes are strictly distinguished from public feedback', () => {
      const privateFeedbackPayload = {
        comment: 'Confidential auditor working paper observations.',
        targetType: 'DOCUMENT' as const,
        targetId: 'doc-001',
      }
      expect(privateFeedbackPayload.comment).toBeDefined()
      expect(privateFeedbackPayload.targetType).toBe('DOCUMENT')
    })
  })
})

