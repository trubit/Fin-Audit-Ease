import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { reviewService } from '../services/reviewService'
import type { ReviewListParams, SubmitFeedbackPayload, ReviewActionPayload } from '../types'

export const useReviews = (
  params?: ReviewListParams,
  options?: { enabled?: boolean }
) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['reviews', params],
    queryFn: () => reviewService.getReviews(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useReview = (id: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['review', id],
    queryFn: () => reviewService.getReviewById(id),
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
    staleTime: 5 * 60 * 1000,
  })
}

export const useSubmitFeedback = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: SubmitFeedbackPayload }) =>
      reviewService.submitFeedback(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
    },
  })
}

export const useApproveReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ReviewActionPayload }) =>
      reviewService.approveReview(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['auditRequests'] })
      queryClient.invalidateQueries({ queryKey: ['auditRequest'] })
      queryClient.invalidateQueries({ queryKey: ['engagements'] })
      queryClient.invalidateQueries({ queryKey: ['engagement'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export const useRejectReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload?: ReviewActionPayload }) =>
      reviewService.rejectReview(id, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['review', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['reviews'] })
      queryClient.invalidateQueries({ queryKey: ['documents'] })
      queryClient.invalidateQueries({ queryKey: ['auditRequests'] })
      queryClient.invalidateQueries({ queryKey: ['auditRequest'] })
      queryClient.invalidateQueries({ queryKey: ['engagements'] })
      queryClient.invalidateQueries({ queryKey: ['engagement'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

