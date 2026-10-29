import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { communicationService } from '../services/communicationService'
import type {
  ScheduleMeetingPayload,
  SendMessagePayload,
  SubmitConsentPayload,
} from '../types'

export const useConversations = (
  engagementId?: string,
  options?: { enabled?: boolean }
) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['communication', 'conversations', engagementId],
    queryFn: async () => {
      const response = await communicationService.getConversations(engagementId)
      return response.data || []
    },
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
    staleTime: 30000,
  })
}

export const useConversation = (id?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['communication', 'conversation', id],
    queryFn: async () => {
      if (!id) throw new Error('Conversation ID is required')
      const response = await communicationService.getConversationById(id)
      return response.data
    },
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
  })
}

export const useConversationMessages = (
  conversationId?: string,
  options?: { enabled?: boolean }
) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['communication', 'messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return []
      const response = await communicationService.getMessages(conversationId)
      return response.data || []
    },
    enabled: Boolean(conversationId) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
    refetchInterval: false, // Strict: no uncontrolled polling without confirmed WebSocket/SSE backend
  })
}

export const useSendMessage = (conversationId?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SendMessagePayload) => {
      if (!conversationId) throw new Error('Conversation ID is required')
      return communicationService.sendMessage(conversationId, payload)
    },
    onSuccess: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({
          queryKey: ['communication', 'messages', conversationId],
        })
      }
      void queryClient.invalidateQueries({
        queryKey: ['communication', 'conversations'],
      })
    },
  })
}

export const useMeetings = (engagementId?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['communication', 'meetings', engagementId],
    queryFn: async () => {
      const response = await communicationService.getMeetings(engagementId)
      return response.data || []
    },
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useMeeting = (id?: string, options?: { enabled?: boolean }) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['communication', 'meeting', id],
    queryFn: async () => {
      if (!id) throw new Error('Meeting ID is required')
      const response = await communicationService.getMeetingById(id)
      return response.data
    },
    enabled: Boolean(id) && (options?.enabled !== undefined ? options.enabled : isAuthenticated),
  })
}

export const useScheduleMeeting = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: ScheduleMeetingPayload) =>
      communicationService.scheduleMeeting(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['communication', 'meetings'] })
    },
  })
}

export const useSubmitConsent = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ meetingId, payload }: { meetingId: string; payload: SubmitConsentPayload }) =>
      communicationService.submitMeetingConsent(meetingId, payload),
    onSuccess: (_data, variables) => {
      if (variables.meetingId) {
        void queryClient.invalidateQueries({ queryKey: ['communication', 'meeting', variables.meetingId] })
      }
      void queryClient.invalidateQueries({ queryKey: ['communication', 'meetings'] })
    },
  })
}

export const useRecordings = (
  params?: { engagementId?: string; conversationId?: string },
  options?: { enabled?: boolean }
) => {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['communication', 'recordings', params],
    queryFn: async () => {
      const response = await communicationService.getRecordings(params)
      return response.data || []
    },
    enabled: options?.enabled !== undefined ? options.enabled : isAuthenticated,
  })
}

export const useMeetingProviderStatus = () => {
  return useQuery({
    queryKey: ['communication', 'providerStatus'],
    queryFn: async () => {
      const response = await communicationService.getProviderStatus()
      return response.data
    },
    staleTime: 60000,
  })
}
