import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { checklistService } from '../services/checklistService'
import type {
  ChecklistListParams,
  UpdateChecklistItemPayload,
  SignOffChecklistPayload,
} from '../types'

export const useWeeklyChecklist = (
  params?: ChecklistListParams,
  options?: { enabled?: boolean }
) => {
  const { user, isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['checklists', 'weekly', user?.organizationId, params],
    queryFn: () => checklistService.getWeeklyChecklist(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useMonthEndChecklist = (
  params?: ChecklistListParams,
  options?: { enabled?: boolean }
) => {
  const { user, isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['checklists', 'month-end', user?.organizationId, params],
    queryFn: () => checklistService.getMonthEndChecklist(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const usePreAuditChecklist = (
  params?: ChecklistListParams,
  options?: { enabled?: boolean }
) => {
  const { user, isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['checklists', 'pre-audit', user?.organizationId, params],
    queryFn: () => checklistService.getPreAuditChecklist(params),
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useUpdateChecklistItem = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      checklistId,
      itemId,
      payload,
    }: {
      checklistId: string
      itemId: string
      payload: UpdateChecklistItemPayload
    }) => checklistService.updateChecklistItem(checklistId, itemId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}

export const useSubmitChecklistForReview = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (checklistId: string) =>
      checklistService.submitChecklistForReview(checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}

export const useSignOffChecklist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      checklistId,
      payload,
    }: {
      checklistId: string
      payload?: SignOffChecklistPayload
    }) => checklistService.signOffChecklist(checklistId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}

export const useLockChecklist = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (checklistId: string) => checklistService.lockChecklist(checklistId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] })
    },
  })
}
