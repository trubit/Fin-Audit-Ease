import { describe, it, expect, vi, beforeEach } from 'vitest'
import { auditRequestService } from '../services/auditRequestService'
import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { AuditRequest, CreateAuditRequestPayload, UpdateAuditRequestStatusPayload } from '../types'

import en from '@/i18n/locales/en.json'
import yo from '@/i18n/locales/yo.json'
import ig from '@/i18n/locales/ig.json'
import ha from '@/i18n/locales/ha.json'
import pcm from '@/i18n/locales/pcm.json'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Audit Request Workflow — Phase 6', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Service Contract Integration', () => {
    it('calls GET /api/v1/audit-requests with query params', async () => {
      const mockRequests: AuditRequest[] = [
        {
          id: 'req_1',
          engagementId: 'eng_1',
          referenceCode: 'REQ-2026-001',
          title: 'Bank Statement Q3',
          description: 'Upload stamped statements',
          category: 'Bank Documents',
          priority: 'HIGH',
          status: 'OPEN',
          dueDate: '2026-11-01',
          attachedDocumentIds: [],
          createdAt: '2026-10-01T10:00:00Z',
          updatedAt: '2026-10-01T10:00:00Z',
        },
      ]
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockRequests,
        success: true,
        message: 'Success',
      })

      const params = { engagementId: 'eng_1', status: 'OPEN' }
      const res = await auditRequestService.getAuditRequests(params)

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUDIT_REQUESTS.LIST, { params })
      expect(res.data).toEqual(mockRequests)
    })

    it('calls GET /api/v1/audit-requests/:id for single request detail', async () => {
      const mockRequest: AuditRequest = {
        id: 'req_123',
        engagementId: 'eng_1',
        referenceCode: 'REQ-2026-123',
        title: 'Tax Certificate',
        description: 'Provide WHT schedule',
        category: 'Tax Documents',
        priority: 'MEDIUM',
        status: 'SUBMITTED',
        dueDate: '2026-11-20',
        attachedDocumentIds: ['doc_1'],
        createdAt: '2026-10-01T10:00:00Z',
        updatedAt: '2026-10-02T10:00:00Z',
      }
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        data: mockRequest,
        success: true,
        message: 'Success',
      })

      const res = await auditRequestService.getAuditRequestById('req_123')

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUDIT_REQUESTS.DETAIL('req_123'))
      expect(res.data).toEqual(mockRequest)
    })

    it('calls POST /api/v1/audit-requests to create an audit request', async () => {
      const payload: CreateAuditRequestPayload = {
        engagementId: 'eng_1',
        title: 'Payroll Summary',
        description: 'Upload certified payroll ledger',
        category: 'Payroll',
        priority: 'HIGH',
        dueDate: '2026-11-30',
        assigneeId: 'usr_acc_1',
      }

      const mockCreated: AuditRequest = {
        id: 'req_new',
        engagementId: payload.engagementId,
        referenceCode: 'REQ-2026-999',
        title: payload.title,
        description: payload.description,
        category: payload.category,
        priority: payload.priority,
        status: 'OPEN',
        assigneeId: payload.assigneeId,
        dueDate: payload.dueDate,
        attachedDocumentIds: [],
        createdAt: '2026-10-05T12:00:00Z',
        updatedAt: '2026-10-05T12:00:00Z',
      }
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: mockCreated,
        success: true,
        message: 'Created',
      })

      const res = await auditRequestService.createAuditRequest(payload)

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUDIT_REQUESTS.CREATE, payload)
      expect(res.data?.status).toBe('OPEN')
    })

    it('calls PATCH /api/v1/audit-requests/:id/status for auditor approval', async () => {
      const payload: UpdateAuditRequestStatusPayload = {
        status: 'ACCEPTED',
        reviewNotes: 'All reconciliations verified against bank confirmations.',
      }

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { id: 'req_123', status: 'ACCEPTED' } as unknown as AuditRequest,
        success: true,
        message: 'Updated',
      })

      await auditRequestService.updateAuditRequestStatus('req_123', payload)

      expect(apiClient.patch).toHaveBeenCalledWith(
        API_ENDPOINTS.AUDIT_REQUESTS.UPDATE_STATUS('req_123'),
        payload
      )
    })

    it('calls PATCH /api/v1/audit-requests/:id/status with mandatory rejection reason', async () => {
      const payload: UpdateAuditRequestStatusPayload = {
        status: 'REJECTED',
        rejectionReason: 'Bank certificate missing authorized signatory stamp.',
      }

      vi.mocked(apiClient.patch).mockResolvedValueOnce({
        data: { id: 'req_123', status: 'REJECTED' } as unknown as AuditRequest,
        success: true,
        message: 'Updated',
      })

      await auditRequestService.updateAuditRequestStatus('req_123', payload)

      expect(apiClient.patch).toHaveBeenCalledWith(
        API_ENDPOINTS.AUDIT_REQUESTS.UPDATE_STATUS('req_123'),
        payload
      )
    })

    it('calls POST /api/v1/audit-requests/:id/comments to record response notes', async () => {
      const commentText = 'Uploaded replacement schedule with ledger extract.'
      vi.mocked(apiClient.post).mockResolvedValueOnce({
        data: { id: 'cmt_1', content: commentText } as unknown as AuditRequest['attachedDocumentIds'],
        success: true,
        message: 'Comment added',
      })

      await auditRequestService.addComment('req_123', commentText)

      expect(apiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.AUDIT_REQUESTS.COMMENTS('req_123'),
        { content: commentText }
      )
    })
  })

  describe('Phase 6 i18n Completeness across all 5 Locales', () => {
    const locales = [
      { code: 'en', data: en },
      { code: 'yo', data: yo },
      { code: 'ig', data: ig },
      { code: 'ha', data: ha },
      { code: 'pcm', data: pcm },
    ]

    const expectedAuditRequestKeys = [
      'submitEvidenceBtn',
      'resubmitEvidenceBtn',
      'responseCommentLabel',
      'responseCommentPlaceholder',
      'responseSubmittedSuccess',
      'responseSubmittedBannerTitle',
      'responseSubmittedBannerDesc',
      'acceptedBannerTitle',
      'acceptedBannerDesc',
      'approveRequestBtn',
      'rejectRequestBtn',
      'rejectionReasonRequired',
      'rejectionReasonPlaceholder',
      'resetFilters',
      'rejectionAlertTitle',
      'rejectionReasonTitle',
      'rejectionCorrectionNotice',
      'rejectionFallbackReason',
      'statusOpen',
      'statusSubmitted',
      'statusInReview',
      'statusAccepted',
      'statusRejected',
    ]

    const expectedReviewKeys = [
      'title',
      'subtitle',
      'detailTitle',
      'emptyTitle',
      'emptyDescription',
      'approveTitle',
      'rejectTitle',
      'approveConfirmation',
      'rejectConfirmation',
      'notesLabel',
      'rejectionReasonLabel',
      'confirmApprove',
      'confirmReject',
      'statusPending',
      'statusInReview',
      'statusApproved',
      'statusRejected',
    ]

    for (const { code, data } of locales) {
      it(`verifies all auditRequests keys in ${code}.json`, () => {
        const auditRequests = (data as unknown as Record<string, Record<string, string>>).auditRequests
        expect(auditRequests).toBeDefined()
        for (const key of expectedAuditRequestKeys) {
          expect(auditRequests[key], `Missing auditRequests.${key} in ${code}.json`).toBeDefined()
          expect(auditRequests[key].trim().length).toBeGreaterThan(0)
        }
      })

      it(`verifies all review keys in ${code}.json`, () => {
        const review = (data as unknown as Record<string, Record<string, string>>).review
        expect(review).toBeDefined()
        for (const key of expectedReviewKeys) {
          expect(review[key], `Missing review.${key} in ${code}.json`).toBeDefined()
          expect(review[key].trim().length).toBeGreaterThan(0)
        }
      })
    }
  })
})
