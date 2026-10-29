import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api/apiClient'
import { auditRequestService } from '../services/auditRequestService'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { AuditRequest, CreateAuditRequestPayload } from '../types'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Audit Request Service (Phase 4 Auditor Experience)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAuditRequests', () => {
    it('fetches list of audit requests filtered by engagement', async () => {
      const mockRequests: AuditRequest[] = [
        {
          id: 'req_001',
          engagementId: 'eng_001',
          referenceCode: 'REQ-2026-001',
          title: 'Q3 Bank Reconciliation Schedules',
          description: 'Provide all bank reconciliation statements with bank stamp.',
          category: 'Bank Documents',
          priority: 'HIGH',
          status: 'OPEN',
          dueDate: '2026-11-20',
          attachedDocumentIds: [],
          createdAt: '2026-10-01T09:00:00Z',
          updatedAt: '2026-10-01T09:00:00Z',
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockRequests })

      const result = await auditRequestService.getAuditRequests({ engagementId: 'eng_001' })

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUDIT_REQUESTS.LIST, {
        params: { engagementId: 'eng_001' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].referenceCode).toBe('REQ-2026-001')
    })
  })

  describe('getAuditRequestById', () => {
    it('fetches audit request detail by ID', async () => {
      const mockRequest: AuditRequest = {
        id: 'req_001',
        engagementId: 'eng_001',
        referenceCode: 'REQ-2026-001',
        title: 'Q3 Bank Reconciliation Schedules',
        description: 'Provide all bank reconciliation statements with bank stamp.',
        category: 'Bank Documents',
        priority: 'HIGH',
        status: 'SUBMITTED',
        assigneeId: 'usr_acc_01',
        assigneeName: 'Chidinma Okafor',
        dueDate: '2026-11-20',
        attachedDocumentIds: ['doc_001'],
        createdAt: '2026-10-01T09:00:00Z',
        updatedAt: '2026-10-05T10:00:00Z',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockRequest })

      const result = await auditRequestService.getAuditRequestById('req_001')

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUDIT_REQUESTS.DETAIL('req_001'))
      expect(result.data.status).toBe('SUBMITTED')
      expect(result.data.assigneeName).toBe('Chidinma Okafor')
    })
  })

  describe('createAuditRequest', () => {
    it('posts audit request creation payload with assigned accounting member', async () => {
      const payload: CreateAuditRequestPayload = {
        engagementId: 'eng_001',
        title: 'Payroll Summary Register and Statutory Remittances',
        description: 'Upload certified monthly payroll sheets for Q1 through Q3.',
        category: 'Payroll',
        priority: 'HIGH',
        dueDate: '2026-11-30',
        assigneeId: 'usr_acc_01',
      }

      const createdResponse: AuditRequest = {
        id: 'req_002',
        ...payload,
        referenceCode: 'REQ-2026-002',
        status: 'OPEN',
        attachedDocumentIds: [],
        createdAt: '2026-10-05T15:00:00Z',
        updatedAt: '2026-10-05T15:00:00Z',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true, data: createdResponse })

      const result = await auditRequestService.createAuditRequest(payload)

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.AUDIT_REQUESTS.CREATE, payload)
      expect(result.data.id).toBe('req_002')
      expect(result.data.referenceCode).toBe('REQ-2026-002')
    })
  })
})
