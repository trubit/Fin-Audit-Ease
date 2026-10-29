import { apiClient } from '@/services/api/apiClient'
import { API_ENDPOINTS } from '@/services/api/endpoints'
import type { ApiResponse } from '@/types/api.types'
import type { AuditDocument, DocumentVersionItem } from '../types'

export interface DocumentListParams {
  readonly engagementId?: string
  readonly auditRequestId?: string
  readonly classification?: string
  readonly page?: number
  readonly limit?: number
}

export interface DocumentUploadMeta {
  readonly engagementId: string
  readonly auditRequestId?: string
  readonly classification?: string
  readonly comment?: string
}

export const documentService = {
  /**
   * Fetch documents associated with an engagement or specific audit request from the backend.
   */
  async getDocuments(params?: DocumentListParams): Promise<ApiResponse<AuditDocument[]>> {
    return apiClient.get<AuditDocument[]>(API_ENDPOINTS.DOCUMENTS.LIST, { params })
  },

  /**
   * Fetch single document metadata from the backend.
   */
  async getDocumentById(id: string): Promise<ApiResponse<AuditDocument>> {
    return apiClient.get<AuditDocument>(API_ENDPOINTS.DOCUMENTS.DETAIL(id))
  },

  /**
   * Fetch version history for a specific document from the backend.
   */
  async getDocumentVersions(id: string): Promise<ApiResponse<DocumentVersionItem[]>> {
    return apiClient.get<DocumentVersionItem[]>(API_ENDPOINTS.DOCUMENTS.VERSIONS(id))
  },

  /**
   * Upload an evidentiary document using multipart/form-data to the backend upload endpoint.
   * Sends actual file content with authenticated engagement and request metadata.
   * Supports cancellation via AbortSignal.
   */
  async uploadDocument(
    file: File,
    meta: DocumentUploadMeta,
    options?: { signal?: AbortSignal }
  ): Promise<ApiResponse<AuditDocument>> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('engagementId', meta.engagementId)

    if (meta.auditRequestId) {
      formData.append('auditRequestId', meta.auditRequestId)
    }
    if (meta.classification) {
      formData.append('classification', meta.classification)
    }
    if (meta.comment) {
      formData.append('comment', meta.comment.trim())
    }

    return apiClient.postForm<AuditDocument>(API_ENDPOINTS.DOCUMENTS.UPLOAD, formData, {
      signal: options?.signal,
    })
  },

  /**
   * Obtain authorized secure download URL for a document from the backend service.
   */
  async getDownloadUrl(id: string): Promise<ApiResponse<{ downloadUrl: string }>> {
    return apiClient.get<{ downloadUrl: string }>(API_ENDPOINTS.DOCUMENTS.DOWNLOAD(id))
  },

  /**
   * Remove a draft or unverified document from the backend.
   */
  async deleteDocument(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.DOCUMENTS.DELETE(id))
  },
}
