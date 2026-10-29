import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api/apiClient'
import { checklistService } from '../services/checklistService'
import { API_ENDPOINTS } from '@/services/api/endpoints'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    put: vi.fn(),
  },
}))

describe('Checklist Service (Phase 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches pre-audit checklist using canonical endpoint', async () => {
    const mockChecklist = {
      id: 'chk-pre-1',
      type: 'PRE_AUDIT_READINESS' as const,
      title: 'Pre-Audit Readiness',
      periodLabel: 'FY2026',
      completedItemsCount: 5,
      totalItemsCount: 10,
      items: [],
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    }

    vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockChecklist })

    const response = await checklistService.getPreAuditChecklist({ engagementId: 'eng-123' })

    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CHECKLISTS.PRE_AUDIT, {
      params: { engagementId: 'eng-123' },
    })
    expect(response.data?.id).toBe('chk-pre-1')
  })

  it('fetches month-end checklist using canonical endpoint', async () => {
    const mockChecklist = {
      id: 'chk-month-1',
      type: 'MONTH_END_CLOSE' as const,
      title: 'Month-End Close',
      periodLabel: 'September 2026',
      completedItemsCount: 8,
      totalItemsCount: 8,
      items: [],
      createdAt: '2026-10-01T00:00:00Z',
      updatedAt: '2026-10-01T00:00:00Z',
    }

    vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockChecklist })

    const response = await checklistService.getMonthEndChecklist()

    expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.CHECKLISTS.MONTH_END, {
      params: undefined,
    })
    expect(response.data?.completedItemsCount).toBe(8)
  })

  it('updates a checklist item status with patch request to confirmed backend endpoint', async () => {
    const mockUpdatedItem = {
      id: 'item-101',
      checklistId: 'chk-pre-1',
      title: 'Bank Reconciliation Schedule',
      status: 'COMPLETED' as const,
      attachedDocumentCount: 2,
    }

    vi.mocked(apiClient.put).mockResolvedValueOnce({ success: true, data: mockUpdatedItem })

    const response = await checklistService.updateChecklistItem('chk-pre-1', 'item-101', {
      status: 'COMPLETED',
      notes: 'Verified against bank feed',
    })

    expect(apiClient.put).toHaveBeenCalledWith(
      API_ENDPOINTS.CHECKLISTS.UPDATE_ITEM('chk-pre-1', 'item-101'),
      {
        status: 'COMPLETED',
        notes: 'Verified against bank feed',
      }
    )
    expect(response.data.status).toBe('COMPLETED')
  })
})
