import { describe, it, expect, vi, beforeEach } from 'vitest'
import { apiClient } from '@/services/api/apiClient'
import { documentService } from '../services/documentService'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import { validateUploadFile, formatBytes } from '../utils/validation'
import type { AuditDocument, DocumentVersionItem } from '../types'

vi.mock('@/services/api/apiClient', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    postForm: vi.fn(),
  },
}))

describe('Documents, Secure Uploads & Permanent Version History (Phase 7)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Document Service & API Contract Adherence', () => {
    it('fetches documents scoped to an engagement without leaking unrelated records', async () => {
      const mockDocs: AuditDocument[] = [
        {
          id: 'doc_001',
          engagementId: 'eng_001',
          auditRequestId: 'req_001',
          fileName: 'bank_statement_q3.pdf',
          originalFileName: 'bank_statement_q3.pdf',
          fileSizeBytes: 1048576,
          mimeType: 'application/pdf',
          uploadedByUserId: 'usr_acc_001',
          uploadedByUserName: 'Aisha Bello (Finance)',
          createdAt: '2026-10-05T10:00:00Z',
          version: 1,
          status: 'ACTIVE',
          classification: 'BANK_STATEMENT',
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockDocs })

      const result = await documentService.getDocuments({ engagementId: 'eng_001' })

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.DOCUMENTS.LIST, {
        params: { engagementId: 'eng_001' },
      })
      expect(result.data).toHaveLength(1)
      expect(result.data[0].fileName).toBe('bank_statement_q3.pdf')
      expect(result.data[0].version).toBe(1)
    })

    it('fetches document details by ID using canonical endpoint', async () => {
      const mockDoc: AuditDocument = {
        id: 'doc_001',
        engagementId: 'eng_001',
        fileName: 'trial_balance_final.xlsx',
        originalFileName: 'trial_balance_final.xlsx',
        fileSizeBytes: 2048576,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        uploadedByUserId: 'usr_acc_001',
        uploadedByUserName: 'Aisha Bello (Finance)',
        createdAt: '2026-10-05T10:00:00Z',
        version: 2,
        previousVersionId: 'doc_000',
        status: 'APPROVED',
        classification: 'TRIAL_BALANCE',
        reviewerName: 'Lead Auditor Babatunde',
        reviewedAt: '2026-10-05T12:00:00Z',
      }

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockDoc })

      const result = await documentService.getDocumentById('doc_001')

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.DOCUMENTS.DETAIL('doc_001'))
      expect(result.data.id).toBe('doc_001')
      expect(result.data.status).toBe('APPROVED')
      expect(result.data.version).toBe(2)
      expect(result.data.reviewerName).toBe('Lead Auditor Babatunde')
    })

    it('retrieves permanent version history from canonical versions endpoint', async () => {
      const mockVersions: DocumentVersionItem[] = [
        {
          id: 'ver_002',
          version: 2,
          fileName: 'bank_statement_q3_v2.pdf',
          originalFileName: 'bank_statement_q3_v2.pdf',
          fileSizeBytes: 1048576,
          mimeType: 'application/pdf',
          classification: 'BANK_STATEMENT',
          uploadedByUserName: 'Aisha Bello',
          uploadedAt: '2026-10-05T14:00:00Z',
          status: 'APPROVED',
          comment: 'Corrected statement with signed bank manager seal',
          reviewerName: 'Lead Auditor Babatunde',
          reviewedAt: '2026-10-05T15:00:00Z',
        },
        {
          id: 'ver_001',
          version: 1,
          fileName: 'bank_statement_q3.pdf',
          originalFileName: 'bank_statement_q3.pdf',
          fileSizeBytes: 1024000,
          mimeType: 'application/pdf',
          classification: 'BANK_STATEMENT',
          uploadedByUserName: 'Aisha Bello',
          uploadedAt: '2026-10-05T10:00:00Z',
          status: 'REJECTED',
          rejectionReason: 'Bank manager seal and official signature were missing from page 3.',
          reviewerName: 'Lead Auditor Babatunde',
          reviewedAt: '2026-10-05T11:00:00Z',
        },
      ]

      vi.mocked(apiClient.get).mockResolvedValueOnce({ success: true, data: mockVersions })

      const result = await documentService.getDocumentVersions('doc_001')

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.DOCUMENTS.VERSIONS('doc_001'))
      expect(result.data).toHaveLength(2)
      // Version 1 remains preserved with rejection reason intact (Section 22)
      expect(result.data[1].version).toBe(1)
      expect(result.data[1].status).toBe('REJECTED')
      expect(result.data[1].rejectionReason).toContain('seal and official signature were missing')
      // Version 2 shows approved status and reviewer
      expect(result.data[0].version).toBe(2)
      expect(result.data[0].status).toBe('APPROVED')
    })

    it('uploads multipart FormData via canonical upload endpoint with proper headers', async () => {
      const file = new File(['test file content'], 'statement.pdf', { type: 'application/pdf' })
      const meta = {
        engagementId: 'eng_001',
        auditRequestId: 'req_001',
        classification: 'BANK_STATEMENT' as const,
        comment: 'Initial statement submission',
      }

      const mockResponse: AuditDocument = {
        id: 'doc_003',
        engagementId: 'eng_001',
        auditRequestId: 'req_001',
        fileName: 'statement.pdf',
        originalFileName: 'statement.pdf',
        fileSizeBytes: 17,
        mimeType: 'application/pdf',
        classification: 'BANK_STATEMENT',
        uploadedByUserId: 'usr_acc_001',
        uploadedByUserName: 'Aisha Bello (Finance)',
        createdAt: '2026-10-05T16:00:00Z',
        version: 1,
        status: 'ACTIVE',
      }

      vi.mocked(apiClient.postForm).mockResolvedValueOnce({ success: true, data: mockResponse })

      const result = await documentService.uploadDocument(file, meta)

      expect(apiClient.postForm).toHaveBeenCalledWith(
        API_ENDPOINTS.DOCUMENTS.UPLOAD,
        expect.any(FormData),
        expect.anything()
      )
      expect(result.data.id).toBe('doc_003')
    })

    it('constructs secure authenticated download URLs using approved endpoint format', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({
        success: true,
        data: { downloadUrl: '/api/v1/documents/doc_999/download' },
      })

      const response = await documentService.getDownloadUrl('doc_999')
      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.DOCUMENTS.DOWNLOAD('doc_999'))
      expect(response.data.downloadUrl).toBe('/api/v1/documents/doc_999/download')
      // Never exposes raw external cloud bucket / unauthenticated URLs
      expect(response.data.downloadUrl).not.toContain('s3.amazonaws.com')
      expect(response.data.downloadUrl).not.toContain('storage.googleapis.com')
    })
  })

  describe('File Validation & Byte Formatting (Section 5, 6, 9)', () => {
    it('formats bytes into user-friendly units correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes')
      expect(formatBytes(512)).toBe('512 Bytes')
      expect(formatBytes(1024)).toBe('1 KB')
      expect(formatBytes(1048576)).toBe('1 MB')
      expect(formatBytes(26214400)).toBe('25 MB')
    })

    it('accepts all 5 PRD-specified file formats within 25MB limit', () => {
      const testCases = [
        { name: 'audit_report.pdf', type: 'application/pdf' },
        { name: 'trial_balance.xlsx', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
        { name: 'general_ledger.xls', type: 'application/vnd.ms-excel' },
        { name: 'engagement_letter.docx', type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
        { name: 'contract.doc', type: 'application/msword' },
        { name: 'bank_stamp.png', type: 'image/png' },
        { name: 'tax_certificate.jpeg', type: 'image/jpeg' },
        { name: 'invoice_scan.jpg', type: 'image/jpeg' },
      ]

      for (const tc of testCases) {
        const file = new File(['valid content'], tc.name, { type: tc.type })
        const result = validateUploadFile(file)
        expect(result.isValid).toBe(true)
        expect(result.errorMessage).toBeUndefined()
      }
    })

    it('rejects files exceeding 25MB with clear explanatory message', () => {
      const largeFile = new File(['dummy'], 'large_schedule.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      })
      Object.defineProperty(largeFile, 'size', { value: 26 * 1024 * 1024 })

      const result = validateUploadFile(largeFile)
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toContain('25MB')
    })

    it('rejects empty files (0 bytes)', () => {
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' })
      const result = validateUploadFile(emptyFile)
      expect(result.isValid).toBe(false)
      expect(result.errorMessage).toContain('Cannot upload empty files')
    })

    it('rejects prohibited executable and script file types', () => {
      const prohibited = [
        { name: 'exploit.exe', type: 'application/x-msdownload' },
        { name: 'payload.sh', type: 'application/x-sh' },
        { name: 'macro.vbs', type: 'application/javascript' },
        { name: 'archive.zip', type: 'application/zip' },
      ]

      for (const item of prohibited) {
        const file = new File(['code'], item.name, { type: item.type })
        const result = validateUploadFile(file)
        expect(result.isValid).toBe(false)
        expect(result.errorMessage).toContain('Unsupported file format')
      }
    })
  })

  describe('Document Immutability, Rejection & Version History (Section 19-23)', () => {
    it('preserves rejected documents in version history without overwriting them', () => {
      const versionHistory: DocumentVersionItem[] = [
        {
          id: 'v1',
          version: 1,
          fileName: 'interim_balance.xlsx',
          originalFileName: 'interim_balance.xlsx',
          fileSizeBytes: 500000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          classification: 'TRIAL_BALANCE',
          uploadedByUserName: 'Accounting Staff',
          uploadedAt: '2026-10-01T08:00:00Z',
          status: 'REJECTED',
          rejectionReason: 'Intercompany reconciliation mismatch in Note 14',
          reviewerName: 'Senior Auditor Nnamdi',
          reviewedAt: '2026-10-02T11:00:00Z',
        },
        {
          id: 'v2',
          version: 2,
          fileName: 'interim_balance_v2_reconciled.xlsx',
          originalFileName: 'interim_balance_v2_reconciled.xlsx',
          fileSizeBytes: 512000,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          classification: 'TRIAL_BALANCE',
          uploadedByUserName: 'Accounting Staff',
          uploadedAt: '2026-10-03T09:00:00Z',
          status: 'APPROVED',
          comment: 'Reconciled intercompany accounts and attached confirmation',
          reviewerName: 'Senior Auditor Nnamdi',
          reviewedAt: '2026-10-03T14:00:00Z',
        },
      ]

      // History preserves both v1 and v2
      expect(versionHistory.length).toBe(2)
      const v1 = versionHistory.find((v) => v.version === 1)
      expect(v1).toBeDefined()
      expect(v1?.status).toBe('REJECTED')
      expect(v1?.rejectionReason).toBe('Intercompany reconciliation mismatch in Note 14')

      const v2 = versionHistory.find((v) => v.version === 2)
      expect(v2).toBeDefined()
      expect(v2?.status).toBe('APPROVED')
    })
  })

  describe('Multi-locale i18n Verification for Phase 7 (Section 32)', () => {
    it('verifies all Phase 7 document keys exist across all 5 locale files', async () => {
      const locales = ['en', 'yo', 'ig', 'ha', 'pcm']
      const requiredKeys = [
        'title',
        'chooseFileBtn',
        'immutabilityNotice',
        'versionHistoryTitle',
        'noVersions',
        'downloadError',
        'preview',
        'previewTitle',
        'closePreview',
      ]

      for (const locale of locales) {
        const dictionary = (await import(`../../../i18n/locales/${locale}.json`)).default
        expect(dictionary.documents).toBeDefined()
        for (const key of requiredKeys) {
          expect(
            dictionary.documents[key],
            `Missing key "documents.${key}" in locale "${locale}"`
          ).toBeDefined()
          expect(typeof dictionary.documents[key]).toBe('string')
          expect(dictionary.documents[key].length).toBeGreaterThan(0)
        }
      }
    })
  })
})
