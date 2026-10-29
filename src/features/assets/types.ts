export type AssetCategory = 'FIXED' | 'CURRENT'

export type AssetVerificationStatus =
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'DISCREPANCY'
  | 'PENDING_REVIEW'

export interface AssetRecord {
  readonly id: string
  readonly name: string
  readonly assetTag: string
  readonly category: AssetCategory
  readonly assetType: string
  readonly description?: string
  readonly acquisitionDate?: string
  readonly additions?: number
  readonly depreciation?: number
  readonly amortisation?: number
  readonly systemBalance: number
  readonly physicalBalance?: number | null
  readonly variance?: number | null
  readonly verificationDate?: string | null
  readonly verificationStatus: AssetVerificationStatus
  readonly comments?: string
  readonly supportingDocumentIds?: readonly string[]
  readonly responsiblePerson?: string
  readonly organizationId?: string
  readonly createdAt?: string
  readonly updatedAt?: string
}

export interface AssetFilterParams {
  readonly category?: AssetCategory | 'ALL'
  readonly status?: AssetVerificationStatus | 'ALL'
  readonly search?: string
  readonly page?: number
  readonly limit?: number
}

export interface CreateAssetPayload {
  readonly name: string
  readonly assetTag: string
  readonly category: AssetCategory
  readonly assetType: string
  readonly description?: string
  readonly acquisitionDate?: string
  readonly additions?: number
  readonly depreciation?: number
  readonly amortisation?: number
  readonly systemBalance: number
  readonly physicalBalance?: number | null
  readonly comments?: string
  readonly responsiblePerson?: string
}

export interface VerifyAssetPayload {
  readonly physicalBalance: number
  readonly verificationDate: string
  readonly verificationStatus: AssetVerificationStatus
  readonly comments?: string
  readonly supportingDocumentIds?: readonly string[]
}

export interface AssetAccessRequestPayload {
  readonly engagementId?: string
  readonly reason?: string
}

export interface AssetAccessRequestResponse {
  readonly requestId: string
  readonly status: 'PENDING' | 'APPROVED' | 'REJECTED'
  readonly requestedAt: string
}
