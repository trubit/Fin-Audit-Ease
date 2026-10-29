import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { assetService } from '../services/assetService'
import type {
  AssetFilterParams,
  CreateAssetPayload,
  VerifyAssetPayload,
  AssetAccessRequestPayload,
} from '../types'

export const useAssets = (params?: AssetFilterParams, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['assets', params],
    queryFn: () => assetService.getAssets(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useAsset = (id: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetService.getAssetById(id),
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
    staleTime: 5 * 60 * 1000,
  })
}

export const useCreateAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateAssetPayload) => assetService.createAsset(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export const useVerifyAsset = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: VerifyAssetPayload }) =>
      assetService.verifyAsset(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['asset', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['assets'] })
    },
  })
}

export const useRequestAssetAccess = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload?: AssetAccessRequestPayload) => assetService.requestAccess(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assetAccessRequests'] })
    },
  })
}
