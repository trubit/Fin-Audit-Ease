import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  documentService,
  type DocumentListParams,
  type DocumentUploadMeta,
} from '../services/documentService'

export const useDocuments = (
  params?: DocumentListParams,
  options?: { enabled?: boolean }
) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['documents', params],
    queryFn: async () => {
      const response = await documentService.getDocuments(params)
      return response.data || []
    },
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useDocument = (id?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      if (!id) throw new Error('Document ID is required')
      const response = await documentService.getDocumentById(id)
      return response.data
    },
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
  })
}

export const useDocumentVersions = (id?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['documentVersions', id],
    queryFn: async () => {
      if (!id) return []
      const response = await documentService.getDocumentVersions(id)
      return response.data || []
    },
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
  })
}

export const useUploadDocument = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      file,
      meta,
      options,
    }: {
      file: File
      meta: DocumentUploadMeta
      options?: { signal?: AbortSignal }
    }) => documentService.uploadDocument(file, meta, options),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      if (variables.meta.engagementId) {
        queryClient.invalidateQueries({ queryKey: ['engagement', variables.meta.engagementId] })
      }
      if (variables.meta.auditRequestId) {
        queryClient.invalidateQueries({ queryKey: ['auditRequest', variables.meta.auditRequestId] })
        queryClient.invalidateQueries({ queryKey: ['auditRequests'] })
      }
    },
  })
}
