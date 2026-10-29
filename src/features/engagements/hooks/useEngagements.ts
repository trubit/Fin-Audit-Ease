import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { engagementService, type EngagementListParams } from '../services/engagementService'
import type { CreateEngagementPayload, InviteEngagementMemberPayload } from '../types'

export const useEngagements = (
  params?: EngagementListParams,
  options?: { enabled?: boolean }
) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['engagements', params],
    queryFn: async () => {
      const response = await engagementService.getEngagements(params)
      return response.data || []
    },
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useEngagement = (id?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['engagement', id],
    queryFn: async () => {
      if (!id) throw new Error('Engagement ID is required')
      const response = await engagementService.getEngagementById(id)
      return response.data
    },
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
  })
}

export const useCreateEngagement = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateEngagementPayload) => engagementService.createEngagement(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['engagements'] })
    },
  })
}

export const useEngagementMilestones = (id?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['engagement', id, 'milestones'],
    queryFn: async () => {
      if (!id) throw new Error('Engagement ID is required')
      const response = await engagementService.getEngagementMilestones(id)
      return response.data || []
    },
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
  })
}

export const useEngagementMembers = (engagementId?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['engagement', engagementId, 'members'],
    queryFn: async () => {
      if (!engagementId) throw new Error('Engagement ID is required')
      const response = await engagementService.getEngagementMembers(engagementId)
      return response.data || []
    },
    enabled: Boolean(engagementId) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
  })
}

export const useInviteEngagementMember = (engagementId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: InviteEngagementMemberPayload) => {
      if (!engagementId) throw new Error('Engagement ID is required')
      return engagementService.inviteMember(engagementId, payload)
    },
    onSuccess: () => {
      if (engagementId) {
        void queryClient.invalidateQueries({ queryKey: ['engagement', engagementId, 'members'] })
      }
    },
  })
}

