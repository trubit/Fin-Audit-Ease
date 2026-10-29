/**
 * Document Domain Types & File Upload Foundation.
 */

export type DocumentClassification =
  | 'BANK_STATEMENT'
  | 'TRIAL_BALANCE'
  | 'GENERAL_LEDGER'
  | 'INVOICE'
  | 'CONTRACT'
  | 'TAX_RETURN'
  | 'RECONCILIATION_SCHEDULE'
  | 'OTHER'

export type UploadStatus = 'IDLE' | 'VALIDATING' | 'UPLOADING' | 'SUCCESS' | 'ERROR' | 'CANCELLED'

export type DocumentStatus = 'ACTIVE' | 'SUPERSEDED' | 'REJECTED' | 'APPROVED'

export interface AuditDocument {
  readonly id: string
  readonly fileName: string
  readonly originalFileName: string
  readonly fileSizeBytes: number
  readonly mimeType: string
  readonly classification: DocumentClassification
  readonly uploadedByUserId: string
  readonly uploadedByUserName: string
  readonly engagementId: string
  readonly auditRequestId?: string
  readonly checksumSha256?: string
  readonly version?: number
  readonly previousVersionId?: string
  readonly status?: DocumentStatus
  readonly rejectionReason?: string
  readonly reviewNotes?: string
  readonly reviewerName?: string
  readonly reviewedAt?: string
  readonly comment?: string
  readonly createdAt: string
}

export interface DocumentVersionItem {
  readonly id: string
  readonly version: number
  readonly fileName: string
  readonly originalFileName: string
  readonly fileSizeBytes: number
  readonly mimeType: string
  readonly classification: DocumentClassification
  readonly uploadedByUserName: string
  readonly uploadedAt: string
  readonly status: DocumentStatus
  readonly rejectionReason?: string
  readonly reviewNotes?: string
  readonly reviewerName?: string
  readonly reviewedAt?: string
  readonly comment?: string
}

export interface FileUploadQueueItem {
  readonly id: string
  readonly file: File
  readonly name: string
  readonly size: number
  readonly mimeType: string
  readonly isValid: boolean
  readonly errorMessage?: string
  readonly status: 'READY' | 'UPLOADING' | 'SUCCESS' | 'ERROR'
}

export interface FileUploadItem {
  readonly id: string
  readonly file: File
  readonly status: UploadStatus
  readonly progressPercent: number
  readonly errorMessage?: string
  readonly abortController?: AbortController
}

export interface FileValidationResult {
  readonly isValid: boolean
  readonly errorMessage?: string
}
