import React, { useState, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  MessageSquare,
  Video,
  History,
  Calendar,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageContainer } from '@/components/layout/PageContainer/PageContainer'
import { Breadcrumbs } from '@/components/navigation/Breadcrumbs/Breadcrumbs'
import { LoadingSkeleton } from '@/components/feedback/LoadingSkeleton/LoadingSkeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useEngagements, useEngagementMembers } from '@/features/engagements/hooks/useEngagements'
import type { EngagementMember } from '@/features/engagements/types'
import {
  useConversations,
  useConversationMessages,
  useSendMessage,
  useMeetings,
  useScheduleMeeting,
  useSubmitConsent,
  useRecordings,
  useMeetingProviderStatus,
  ConversationList,
  ChatWindow,
  ScheduleMeetingModal,
  MeetingRoomModal,
  RecordingList,
  CommunicationAuditEvents,
  type Conversation,
  type ConversationType,
  type AuditMeeting,
  type ScheduleMeetingPayload,
} from '@/features/communication'
import './CommunicationPage.css'

export type CommunicationViewTab = 'messages' | 'recordings' | 'audit'

export const CommunicationPage: React.FC = () => {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  // URL parameters for deep-linking
  const urlEngagementId = searchParams.get('engagementId')
  const urlTab = (searchParams.get('tab') as CommunicationViewTab) || 'messages'

  // Engagements
  const { data: engagements = [], isLoading: isLoadingEngagements } = useEngagements()

  // Selected engagement ID (defaults to query param or first available)
  const [selectedEngagementId, setSelectedEngagementId] = useState<string | null>(null)

  useEffect(() => {
    if (urlEngagementId) {
      setSelectedEngagementId(urlEngagementId)
    } else if (engagements.length > 0 && !selectedEngagementId) {
      setSelectedEngagementId(engagements[0].id)
    }
  }, [urlEngagementId, engagements, selectedEngagementId])

  // Active engagement object
  const activeEngagement = useMemo(
    () => engagements.find((e) => e.id === selectedEngagementId),
    [engagements, selectedEngagementId]
  )

  // Real members from confirmed backend contract
  const { data: engagementMembers = [] } = useEngagementMembers(selectedEngagementId || undefined)

  // Main View Tab: messages | recordings | audit
  const [mainTab, setMainTab] = useState<CommunicationViewTab>(urlTab)

  const handleTabChange = (tab: CommunicationViewTab) => {
    setMainTab(tab)
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev)
      p.set('tab', tab)
      return p
    })
  }

  // Channel type: GROUP vs PRIVATE
  const [channelType, setChannelType] = useState<ConversationType>('GROUP')

  // Real conversations
  const { data: rawConversations = [] } = useConversations(selectedEngagementId || undefined)

  // Fallback synthetic group channel using real engagement and real members
  const synthesizedGroupConversation: Conversation | null = useMemo(() => {
    if (!activeEngagement) return null
    return {
      id: `group-${activeEngagement.id}`,
      type: 'GROUP',
      engagementId: activeEngagement.id,
      engagementTitle: activeEngagement.title,
      title: `${activeEngagement.clientOrganizationName} — ${t('communication.engagementTeam')}`,
      participants: engagementMembers.map((m) => ({
        id: m.id,
        userId: m.userId,
        fullName: m.fullName,
        email: m.email,
        role: m.role,
        organizationId: activeEngagement.clientOrganizationId,
        organizationName: activeEngagement.clientOrganizationName,
      })),
      createdAt: activeEngagement.createdAt,
      updatedAt: activeEngagement.updatedAt,
      unreadCount: 0,
    }
  }, [activeEngagement, engagementMembers, t])

  // Dynamic private conversations initiated in session
  const [customPrivateConversations, setCustomPrivateConversations] = useState<Conversation[]>([])

  // Combined conversations list
  const conversations: Conversation[] = useMemo(() => {
    const list = [...rawConversations, ...customPrivateConversations]
    if (
      synthesizedGroupConversation &&
      !list.some((c) => c.id === synthesizedGroupConversation.id || c.engagementId === activeEngagement?.id)
    ) {
      list.unshift(synthesizedGroupConversation)
    }
    return list
  }, [rawConversations, customPrivateConversations, synthesizedGroupConversation, activeEngagement])

  // Selected conversation ID
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedConversationId && synthesizedGroupConversation) {
      setSelectedConversationId(synthesizedGroupConversation.id)
    }
  }, [selectedConversationId, synthesizedGroupConversation])

  // Active selected conversation
  const activeConversation: Conversation | null = useMemo(() => {
    return (
      conversations.find((c) => c.id === selectedConversationId) ||
      (selectedConversationId === synthesizedGroupConversation?.id ? synthesizedGroupConversation : null)
    )
  }, [conversations, selectedConversationId, synthesizedGroupConversation])

  // Messages for active conversation
  const {
    data: messages = [],
    isLoading: isLoadingMessages,
  } = useConversationMessages(selectedConversationId || undefined)

  const { mutateAsync: sendMessageAsync, isPending: isSending } = useSendMessage(
    selectedConversationId || undefined
  )

  // Meetings
  const { data: meetings = [] } = useMeetings(selectedEngagementId || undefined)
  const { mutateAsync: scheduleMeetingAsync, isPending: isScheduling } = useScheduleMeeting()
  const { mutateAsync: submitConsentAsync, isPending: isSubmittingConsent } = useSubmitConsent()

  // Evidentiary Recordings
  const { data: recordings = [], isLoading: isLoadingRecordings } = useRecordings(
    selectedEngagementId ? { engagementId: selectedEngagementId } : undefined
  )

  // Meeting Provider Integration Status
  const { data: providerStatus } = useMeetingProviderStatus()

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false)
  const [isMeetingRoomOpen, setIsMeetingRoomOpen] = useState(false)
  const [activeMeetingForRoom, setActiveMeetingForRoom] = useState<AuditMeeting | null>(null)

  // Mobile view state: 'list' or 'chat'
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setMobileView('chat')
  }

  // Handle starting a 1-on-1 private chat
  const handleStartPrivateChat = (member: EngagementMember) => {
    const privateId = `private-${user?.id}-${member.userId}`
    const existing = conversations.find((c) => c.id === privateId)
    if (!existing) {
      // Add dynamic authorized private conversation
      const newPrivateConv: Conversation = {
        id: privateId,
        type: 'PRIVATE',
        engagementId: activeEngagement?.id,
        engagementTitle: activeEngagement?.title,
        title: member.fullName,
        participants: [
          {
            id: user?.id || 'me',
            userId: user?.id || 'me',
            fullName: user?.fullName || 'Current User',
            email: user?.email || '',
            role: user?.role || '',
            organizationId: user?.organizationId || '',
          },
          {
            id: member.id,
            userId: member.userId,
            fullName: member.fullName,
            email: member.email,
            role: member.role,
            organizationId: activeEngagement?.clientOrganizationId || '',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        unreadCount: 0,
      }
      setCustomPrivateConversations((prev) => [...prev, newPrivateConv])
    }
    setChannelType('PRIVATE')
    setSelectedConversationId(privateId)
    setMobileView('chat')
  }

  const handleOpenMeetingRoom = () => {
    // Select first scheduled or in-progress meeting, or fallback to current engagement session
    const currentMeeting = meetings[0] || (activeEngagement ? {
      id: `mtg-${activeEngagement.id}`,
      title: `${activeEngagement.clientOrganizationName} — Walkthrough Session`,
      agenda: 'Audit Walkthrough and Statutory Evidentiary Inspection',
      meetingType: 'WALKTHROUGH' as const,
      status: 'SCHEDULED' as const,
      scheduledDate: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      durationMinutes: 45,
      timezone: 'Africa/Lagos',
      engagementId: activeEngagement.id,
      engagementTitle: activeEngagement.title,
      conversationId: selectedConversationId || `group-${activeEngagement.id}`,
      hostUserId: activeEngagement.leadAuditorId,
      hostName: activeEngagement.leadAuditorName,
      recordingPolicy: 'MANDATORY' as const,
      recordingConsentRequired: true,
      allConsentsGranted: false,
      participants: engagementMembers.map((m) => ({
        userId: m.userId,
        fullName: m.fullName,
        email: m.email,
        role: m.role,
        consentStatus: 'PENDING' as const,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } : null)

    setActiveMeetingForRoom(currentMeeting)
    setIsMeetingRoomOpen(true)
  }

  const handleScheduleSubmit = async (payload: ScheduleMeetingPayload) => {
    await scheduleMeetingAsync(payload)
  }

  const handleConsentSubmit = async (meetingId: string, consent: 'GRANT' | 'DECLINE') => {
    await submitConsentAsync({ meetingId, payload: { consent } })
  }

  return (
    <PageContainer
      title={t('communication.pageTitle')}
      actions={
        <div className="comm-top-actions">
          <button
            type="button"
            className="btn btn-outline btn-md"
            onClick={() => setIsScheduleModalOpen(true)}
          >
            <Calendar size={16} aria-hidden="true" />
            <span>{t('communication.scheduleMeeting')}</span>
          </button>
          <button
            type="button"
            className="btn btn-primary btn-md"
            onClick={handleOpenMeetingRoom}
          >
            <Video size={16} aria-hidden="true" />
            <span>{t('communication.joinMeeting')}</span>
          </button>
        </div>
      }
    >
      <Breadcrumbs
        items={[
          { label: t('navigation.dashboard'), to: '/dashboard' },
          { label: t('communication.pageTitle') },
        ]}
      />

      {/* Main Feature Tabs */}
      <nav className="comm-main-nav" aria-label={t('communication.sectionsLabel')}>
        <button
          type="button"
          className={`comm-main-nav-btn ${mainTab === 'messages' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('messages')}
        >
          <MessageSquare size={16} aria-hidden="true" />
          <span>{t('communication.tabMessagesAndMeetings')}</span>
        </button>
        <button
          type="button"
          className={`comm-main-nav-btn ${mainTab === 'recordings' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('recordings')}
        >
          <Video size={16} aria-hidden="true" />
          <span>{t('communication.tabEvidentiaryRecordings')}</span>
        </button>
        <button
          type="button"
          className={`comm-main-nav-btn ${mainTab === 'audit' ? 'is-active' : ''}`}
          onClick={() => handleTabChange('audit')}
        >
          <History size={16} aria-hidden="true" />
          <span>{t('communication.tabCommunicationAuditTrail')}</span>
        </button>
      </nav>

      {/* Main Workspace Layout */}
      <div className="comm-workspace-card">
        {isLoadingEngagements ? (
          <div className="comm-loading-container">
            <LoadingSkeleton height="3rem" width="100%" />
            <LoadingSkeleton height="20rem" width="100%" />
          </div>
        ) : mainTab === 'messages' ? (
          <div className={`comm-split-view ${mobileView === 'chat' ? 'show-chat' : 'show-list'}`}>
            {/* Left Sidebar: Conversations & Channels */}
            <aside className="comm-split-left">
              <ConversationList
                conversations={conversations}
                selectedConversationId={selectedConversationId}
                onSelectConversation={handleSelectConversation}
                engagements={engagements}
                selectedEngagementId={selectedEngagementId}
                onSelectEngagement={(id) => {
                  setSelectedEngagementId(id)
                  setSelectedConversationId(`group-${id}`)
                  setSearchParams((prev) => {
                    const p = new URLSearchParams(prev)
                    p.set('engagementId', id)
                    return p
                  })
                }}
                engagementMembers={engagementMembers}
                onStartPrivateChat={handleStartPrivateChat}
                activeTab={channelType}
                onTabChange={setChannelType}
                onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
                currentUserId={user?.id}
              />
            </aside>

            {/* Right Pane: Active Chat & Meeting Actions */}
            <main className="comm-split-right">
              <ChatWindow
                conversation={activeConversation}
                messages={messages}
                isLoadingMessages={isLoadingMessages}
                onSendMessage={async (content) => {
                  await sendMessageAsync({ content })
                }}
                isSending={isSending}
                onOpenScheduleModal={() => setIsScheduleModalOpen(true)}
                onOpenMeetingRoom={handleOpenMeetingRoom}
                activeEngagement={activeEngagement}
                engagementMembers={engagementMembers}
                currentUserId={user?.id}
                onBackToList={() => setMobileView('list')}
              />
            </main>
          </div>
        ) : mainTab === 'recordings' ? (
          <div className="comm-full-pane">
            <RecordingList
              recordings={recordings}
              isLoading={isLoadingRecordings}
              onOpenRecordingStream={() => {
                handleOpenMeetingRoom()
              }}
              currentUserId={user?.id}
            />
          </div>
        ) : (
          <div className="comm-full-pane">
            <CommunicationAuditEvents engagementId={selectedEngagementId || undefined} />
          </div>
        )}
      </div>

      {/* Meeting Scheduling Modal */}
      <ScheduleMeetingModal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        activeEngagement={activeEngagement}
        engagementMembers={engagementMembers}
        onScheduleMeeting={handleScheduleSubmit}
        isScheduling={isScheduling}
      />

      {/* In-App Meeting Participation & Provider Readiness Modal */}
      <MeetingRoomModal
        isOpen={isMeetingRoomOpen}
        onClose={() => setIsMeetingRoomOpen(false)}
        meeting={activeMeetingForRoom}
        providerStatus={providerStatus}
        onSubmitConsent={handleConsentSubmit}
        isSubmittingConsent={isSubmittingConsent}
        currentUserId={user?.id}
      />
    </PageContainer>
  )
}
