import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { auditRequestService, type AuditRequestListParams } from '../services/auditRequestService'
import type { CreateAuditRequestPayload, UpdateAuditRequestStatusPayload } from '../types'

export const useAuditRequests = (
  params?: AuditRequestListParams,
  options?: { enabled?: boolean }
) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['auditRequests', params],
    queryFn: async () => {
      const response = await auditRequestService.getAuditRequests(params)
      return response.data || []
    },
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useAuditRequest = (id?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['auditRequest', id],
    queryFn: async () => {
      if (!id) throw new Error('Audit Request ID is required')
      const response = await auditRequestService.getAuditRequestById(id)
      return response.data
    },
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
  })
}

export const useCreateAuditRequest = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateAuditRequestPayload) => auditRequestService.createAuditRequest(payload),
    onSuccess: (response) => {
      // Invalidate audit requests list and the parent engagement
      queryClient.invalidateQueries({ queryKey: ['auditRequests'] })
      if (response.data?.engagementId) {
        queryClient.invalidateQueries({ queryKey: ['engagement', response.data.engagementId] })
      }
    },
  })
}

export const useUpdateAuditRequestStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAuditRequestStatusPayload }) =>
      auditRequestService.updateAuditRequestStatus(id, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auditRequest', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['auditRequests'] })
      if (response.data?.engagementId) {
        queryClient.invalidateQueries({ queryKey: ['engagement', response.data.engagementId] })
      }
    },
  })
}

export const useAddAuditRequestComment = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, content }: { id: string; content: string }) =>
      auditRequestService.addComment(id, content),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['auditRequest', variables.id] })
    },
  })
}
