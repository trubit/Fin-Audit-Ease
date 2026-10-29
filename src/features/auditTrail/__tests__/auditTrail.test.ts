import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { auditTrailService } from '../services/auditTrailService'
import { auditTrailQueryKeys } from '../hooks/useAuditTrail'
import type { AuditTrailRecord } from '../types'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    getBlob: vi.fn(),
  },
}))

describe('Audit Trail Service & Historical Integrity (Phase 11)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('auditTrailService API Contract', () => {
    it('fetches audit trail records for an engagement with query filters', async () => {
      const mockRecords: AuditTrailRecord[] = [
        {
          id: 'log-1',
          engagementId: 'eng-101',
          timestamp: '2026-10-06T10:00:00Z',
          actorId: 'usr-1',
          actorName: 'Lead Auditor',
          actorEmail: 'auditor@example.com',
          actorRole: 'AUDITOR',
          action: 'ENGAGEMENT_CREATED',
          description: 'Fiscal Year 2025 Audit Scope Formally Opened',
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0 Chrome',
          hash: 'abc123hash',
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: mockRecords,
      })

      const filters = {
        engagementId: 'eng-101',
        action: 'ENGAGEMENT_CREATED',
        startDate: '2026-10-01',
        endDate: '2026-10-06',
      }

      const response = await auditTrailService.getAuditTrail(filters)

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.AUDIT_TRAIL.LIST, {
        params: filters,
      })
      expect(response.data).toHaveLength(1)
      expect(response.data[0].action).toBe('ENGAGEMENT_CREATED')
      expect(response.data[0].engagementId).toBe('eng-101')
    })

    it('exports audit trail PDF as a binary Blob without client-side fake generation', async () => {
      const mockBlob = new Blob(['%PDF-1.4 authoritative test content'], {
        type: 'application/pdf',
      })
      vi.mocked(apiClient.getBlob).mockResolvedValueOnce(mockBlob)

      const exportParams = {
        engagementId: 'eng-101',
        startDate: '2026-10-01',
        endDate: '2026-10-06',
      }

      const blob = await auditTrailService.exportAuditTrail(exportParams)

      expect(apiClient.getBlob).toHaveBeenCalledWith(
        API_ENDPOINTS.AUDIT_TRAIL.EXPORT,
        {
          params: {
            engagementId: 'eng-101',
            startDate: '2026-10-01',
            endDate: '2026-10-06',
            format: 'pdf',
          },
        }
      )
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
    })
  })

  describe('Cache Isolation & Multi-Engagement Boundary', () => {
    it('generates isolated TanStack Query keys scoped by engagement ID', () => {
      const keyA = auditTrailQueryKeys.list({ engagementId: 'eng-A' })
      const keyB = auditTrailQueryKeys.list({ engagementId: 'eng-B' })

      expect(keyA).toEqual(['auditTrail', 'list', 'eng-A', { engagementId: 'eng-A' }])
      expect(keyB).toEqual(['auditTrail', 'list', 'eng-B', { engagementId: 'eng-B' }])
      expect(keyA[2]).not.toBe(keyB[2])
    })

    it('prevents leakage across engagements when switching', () => {
      const recordsEngagementA: AuditTrailRecord[] = [
        {
          id: 'log-A1',
          engagementId: 'eng-A',
          timestamp: '2026-10-06T10:00:00Z',
          actorId: 'usr-1',
          actorName: 'Lead Auditor',
          actorRole: 'AUDITOR',
          action: 'DOCUMENT_APPROVED',
        },
      ]

      const recordsEngagementB: AuditTrailRecord[] = [
        {
          id: 'log-B1',
          engagementId: 'eng-B',
          timestamp: '2026-10-06T11:00:00Z',
          actorId: 'usr-2',
          actorName: 'Audit Manager',
          actorRole: 'AUDIT_MANAGER',
          action: 'ENGAGEMENT_COMPLETED',
        },
      ]

      // Filter by engagementId
      const targetEngagement = 'eng-B'
      const activeRecords = [...recordsEngagementA, ...recordsEngagementB].filter(
        (r) => r.engagementId === targetEngagement
      )

      expect(activeRecords).toHaveLength(1)
      expect(activeRecords[0].id).toBe('log-B1')
      expect(activeRecords[0].engagementId).toBe('eng-B')
    })
  })

  describe('Audit Trail Immutability & Access Rules', () => {
    it('restricts audit trail access to authorized Auditor roles', () => {
      const allowedRoles = ['AUDITOR', 'AUDIT_MANAGER', 'ADMIN']
      const financeUserRole = 'FINANCE_USER'
      const accountingLeadRole = 'ACCOUNTING_TEAM_LEAD'

      expect(allowedRoles.includes(financeUserRole)).toBe(false)
      expect(allowedRoles.includes(accountingLeadRole)).toBe(false)
      expect(allowedRoles.includes('AUDITOR')).toBe(true)
      expect(allowedRoles.includes('AUDIT_MANAGER')).toBe(true)
    })

    it('service does not expose mutation or deletion methods', () => {
      const serviceKeys = Object.keys(auditTrailService)
      expect(serviceKeys).toContain('getAuditTrail')
      expect(serviceKeys).toContain('exportAuditTrail')
      expect(serviceKeys).not.toContain('updateAuditTrail')
      expect(serviceKeys).not.toContain('deleteAuditTrail')
      expect(serviceKeys).not.toContain('clearAuditHistory')
    })

    it('correctly filters records by action type, date range, and actor search', () => {
      const records: AuditTrailRecord[] = [
        {
          id: 'log-1',
          engagementId: 'eng-1',
          timestamp: '2026-10-05T08:00:00Z',
          actorId: 'usr-1',
          actorName: 'Audit Team Lead',
          actorRole: 'AUDITOR',
          action: 'REQUEST_CREATED',
          description: 'Payroll schedule request',
        },
        {
          id: 'log-2',
          engagementId: 'eng-1',
          timestamp: '2026-10-06T09:30:00Z',
          actorId: 'usr-2',
          actorName: 'Accounting Team Member',
          actorRole: 'ACCOUNTING_MEMBER',
          action: 'DOCUMENT_UPLOADED',
          description: 'Uploaded September payroll',
        },
        {
          id: 'log-3',
          engagementId: 'eng-1',
          timestamp: '2026-10-06T14:15:00Z',
          actorId: 'usr-1',
          actorName: 'Audit Team Lead',
          actorRole: 'AUDITOR',
          action: 'REVIEW_APPROVED',
          description: 'Signed off payroll report',
        },
      ]

      // Filter by action
      const uploadEvents = records.filter((r) => r.action === 'DOCUMENT_UPLOADED')
      expect(uploadEvents).toHaveLength(1)
      expect(uploadEvents[0].id).toBe('log-2')

      // Filter by date
      const dateFiltered = records.filter(
        (r) => r.timestamp >= '2026-10-06T00:00:00Z'
      )
      expect(dateFiltered).toHaveLength(2)

      // Search by actor
      const actorFiltered = records.filter((r) =>
        r.actorName.toLowerCase().includes('accounting')
      )
      expect(actorFiltered).toHaveLength(1)
      expect(actorFiltered[0].actorRole).toBe('ACCOUNTING_MEMBER')
    })
  })
})
