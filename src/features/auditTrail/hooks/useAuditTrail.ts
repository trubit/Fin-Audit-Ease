import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { auditTrailService } from '../services/auditTrailService'
import type { AuditTrailFilterParams, AuditTrailExportParams } from '../types'

export const auditTrailQueryKeys = {
  all: ['auditTrail'] as const,
  list: (params?: AuditTrailFilterParams) =>
    ['auditTrail', 'list', params?.engagementId, params] as const,
}

export const useAuditTrail = (
  params?: AuditTrailFilterParams,
  options?: { enabled?: boolean }
) => {
  const { isAuthenticated } = useAuth()
  const baseEnabled = params === undefined || Boolean(params?.engagementId)
  return useQuery({
    queryKey: auditTrailQueryKeys.list(params),
    queryFn: () => auditTrailService.getAuditTrail(params),
    // Query is active when authenticated and (engagementId is specified or fetching overall authorized records)
    enabled:
      options?.enabled !== undefined
        ? options.enabled
        : isAuthenticated && baseEnabled,
    staleTime: 60 * 1000,
  })
}

export const useExportAuditTrail = () => {
  return useMutation({
    mutationFn: (params: AuditTrailExportParams) =>
      auditTrailService.exportAuditTrail(params),
  })
}
