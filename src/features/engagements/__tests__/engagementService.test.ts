import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api/apiClient'
import { engagementService } from '../services/engagementService'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { Engagement, EngagementMember } from '../types'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('Engagement Service (Phase 4 Auditor Experience)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getEngagements', () => {
    it('calls the canonical engagements list endpoint with query parameters', async () => {
      const mockEngagements: Engagement[] = [
        {
          id: 'eng_001',
          title: 'Statutory Financial Audit 2026',
          fiscalYear: 2026,
          clientOrganizationId: 'org_client_001',
          clientOrganizationName: 'Dangote Industries Limited',
          leadAuditorId: 'usr_auditor_001',
          leadAuditorName: 'Lead Auditor ICAN',
          status: 'ACTIVE',
          startDate: '2026-10-01',
          targetCompletionDate: '2026-12-31',
          totalRequestsCount: 10,
          completedRequestsCount: 6,
          createdAt: '2026-10-01T08:00:00Z',
          updatedAt: '2026-10-05T12:00:00Z',
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockEngagements })

      const result = await engagementService.getEngagements({ status: 'ACTIVE' })

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ENGAGEMENTS.LIST, {
        params: { status: 'ACTIVE' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].id).toBe('eng_001')
    })
  })

  describe('getEngagementById', () => {
    it('calls detail endpoint for an authorized engagement', async () => {
      const mockEngagement: Engagement = {
        id: 'eng_001',
        title: 'Statutory Financial Audit 2026',
        fiscalYear: 2026,
        clientOrganizationId: 'org_client_001',
        clientOrganizationName: 'Dangote Industries Limited',
        leadAuditorId: 'usr_auditor_001',
        leadAuditorName: 'Lead Auditor ICAN',
        status: 'ACTIVE',
        startDate: '2026-10-01',
        targetCompletionDate: '2026-12-31',
        totalRequestsCount: 10,
        completedRequestsCount: 6,
        createdAt: '2026-10-01T08:00:00Z',
        updatedAt: '2026-10-05T12:00:00Z',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockEngagement })

      const result = await engagementService.getEngagementById('eng_001')

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ENGAGEMENTS.DETAIL('eng_001'))
      expect(result.data.title).toBe('Statutory Financial Audit 2026')
    })
  })

  describe('createEngagement', () => {
    it('dispatches creation payload to backend without faking client-side data', async () => {
      const payload = {
        title: 'Annual Statutory Audit 2026',
        clientOrganizationName: 'Nigerian Breweries Plc',
        fiscalYear: 2026,
        startDate: '2026-10-01',
        targetCompletionDate: '2026-12-15',
      }

      const createdEngagement: Engagement = {
        id: 'eng_002',
        ...payload,
        clientOrganizationId: 'org_nb_002',
        leadAuditorId: 'usr_lead_01',
        leadAuditorName: 'Senior Partner',
        status: 'ACTIVE',
        totalRequestsCount: 0,
        completedRequestsCount: 0,
        createdAt: '2026-10-05T14:00:00Z',
        updatedAt: '2026-10-05T14:00:00Z',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true, data: createdEngagement })

      const result = await engagementService.createEngagement(payload)

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.ENGAGEMENTS.CREATE, payload)
      expect(result.data.id).toBe('eng_002')
    })
  })

  describe('getEngagementMembers', () => {
    it('fetches members connected to an engagement workspace', async () => {
      const mockMembers: EngagementMember[] = [
        {
          id: 'mem_01',
          engagementId: 'eng_001',
          userId: 'usr_acc_01',
          fullName: 'Chidinma Okafor',
          email: 'chidinma@clientcompany.com',
          role: 'ACCOUNTING_MEMBER',
          status: 'ACTIVE',
          joinedAt: '2026-10-02T10:00:00Z',
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockMembers })

      const result = await engagementService.getEngagementMembers('eng_001')

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.ENGAGEMENTS.MEMBERS('eng_001'))
      expect(result.data).toHaveLength(1)
      expect(result.data[0].fullName).toBe('Chidinma Okafor')
    })
  })

  describe('inviteMember', () => {
    it('dispatches invitation payload using confirmed backend contract', async () => {
      const payload = {
        email: 'adeola@clientcompany.com',
        role: 'ACCOUNTING_MEMBER',
      }

      const mockResponse = {
        message: 'Invitation issued successfully',
        invitationToken: 'inv_token_987654321',
      }

      vi.mocked(apiClient.post).mockResolvedValueOnce({ success: true, data: mockResponse })

      const result = await engagementService.inviteMember('eng_001', payload)

      expect(apiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.ENGAGEMENTS.INVITATIONS('eng_001'),
        payload
      )
      expect(result.data.invitationToken).toBe('inv_token_987654321')
    })
  })
})
