import { describe, it, expect, vi, beforeEach } from 'vitest'
import { assetService } from '../services/assetService'
import { apiClient } from '@/services/api/apiClient'
import { AppApiError } from '@/services/api/apiErrors'
import type { AssetRecord, CreateAssetPayload, VerifyAssetPayload } from '../types'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe('Asset Verification Register — Finance Module', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches assets from the confirmed API endpoint', async () => {
    const mockAssets: AssetRecord[] = [
      {
        id: 'ast-001',
        name: 'HP EliteBook Laptops Batch A',
        assetTag: 'AST-FA-2026-001',
        category: 'FIXED',
        assetType: 'Computer Hardware',
        systemBalance: 4500000,
        physicalBalance: 4500000,
        variance: 0,
        verificationDate: '2026-10-15',
        verificationStatus: 'VERIFIED',
      },
    ]

    vi.mocked(apiClient.get).mockResolvedValueOnce({
      success: true,
      data: mockAssets,
    })

    const result = await assetService.getAssets({ category: 'FIXED' })
    expect(apiClient.get).toHaveBeenCalledWith('/api/v1/assets', {
      params: { category: 'FIXED' },
    })
    expect(result.data).toHaveLength(1)
    expect(result.data?.[0].verificationStatus).toBe('VERIFIED')
  })

  it('gracefully handles un-provisioned backend endpoint returning genuine empty state without fabricating fake assets', async () => {
    const error404 = new AppApiError({
      code: 'NOT_FOUND',
      status: 404,
      userMessage: 'Not Found',
    })
    vi.mocked(apiClient.get).mockRejectedValueOnce(error404)

    const result = await assetService.getAssets()
    expect(result.success).toBe(true)
    expect(result.data).toEqual([])
    expect(result.message).toContain('awaiting backend deployment')
  })

  it('creates a new asset record when submitted by Accounting Team', async () => {
    const payload: CreateAssetPayload = {
      name: 'Generator 500kVA Perkins',
      assetTag: 'AST-FA-002',
      category: 'FIXED',
      assetType: 'Plant & Machinery',
      acquisitionDate: '2024-01-15',
      systemBalance: 18500000,
      responsiblePerson: 'Lead Plant Engineer',
    }

    const createdAsset: AssetRecord = {
      id: 'ast-002',
      ...payload,
      verificationStatus: 'UNVERIFIED',
    }

    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: createdAsset,
    })

    const result = await assetService.createAsset(payload)
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/assets', payload)
    expect(result.data?.id).toBe('ast-002')
    expect(result.data?.systemBalance).toBe(18500000)
  })

  it('records physical verification balance and calculates discrepancy accurately', async () => {
    const verifyPayload: VerifyAssetPayload = {
      physicalBalance: 4200000,
      verificationDate: '2026-10-20',
      verificationStatus: 'DISCREPANCY',
      comments: '1 unit damaged during transit to Abuja facility',
    }

    const updatedRecord: AssetRecord = {
      id: 'ast-001',
      name: 'HP EliteBook Laptops Batch A',
      assetTag: 'AST-FA-2026-001',
      category: 'FIXED',
      assetType: 'Computer Hardware',
      systemBalance: 4500000,
      physicalBalance: 4200000,
      variance: -300000,
      verificationDate: '2026-10-20',
      verificationStatus: 'DISCREPANCY',
      comments: '1 unit damaged during transit to Abuja facility',
    }

    vi.mocked(apiClient.put).mockResolvedValueOnce({
      success: true,
      data: updatedRecord,
    })

    const result = await assetService.verifyAsset('ast-001', verifyPayload)
    expect(apiClient.put).toHaveBeenCalledWith('/api/v1/assets/ast-001/verify', verifyPayload)
    expect(result.data?.verificationStatus).toBe('DISCREPANCY')
    expect(result.data?.variance).toBe(-300000)
  })

  it('dispatches auditor access request without auto-granting access', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce({
      success: true,
      data: {
        requestId: 'req-acc-001',
        status: 'PENDING',
        requestedAt: '2026-10-20T12:00:00Z',
      },
    })

    const result = await assetService.requestAccess({ reason: 'Year-End statutory audit' })
    expect(apiClient.post).toHaveBeenCalledWith('/api/v1/assets/access-requests', {
      reason: 'Year-End statutory audit',
    })
    expect(result.data?.status).toBe('PENDING')
  })
})
