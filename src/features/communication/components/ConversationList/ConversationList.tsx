import React, { useState, useMemo } from 'react'
import {
  Users,
  User,
  Search,
  Briefcase,
  CalendarPlus,
  MessageSquare,
  ShieldAlert,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Conversation, ConversationType } from '../../types'
import type { Engagement, EngagementMember } from '@/features/engagements/types'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { formatDate } from '@/utils/dateUtils'
import './ConversationList.css'

export interface ConversationListProps {
  readonly conversations: readonly Conversation[]
  readonly selectedConversationId: string | null
  readonly onSelectConversation: (conversationId: string) => void
  readonly engagements: readonly Engagement[]
  readonly selectedEngagementId: string | null
  readonly onSelectEngagement: (engagementId: string) => void
  readonly engagementMembers: readonly EngagementMember[]
  readonly onStartPrivateChat: (member: EngagementMember) => void
  readonly activeTab: ConversationType
  readonly onTabChange: (tab: ConversationType) => void
  readonly onOpenScheduleModal: () => void
  readonly currentUserId?: string
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversationId,
  onSelectConversation,
  engagements,
  selectedEngagementId,
  onSelectEngagement,
  engagementMembers,
  onStartPrivateChat,
  activeTab,
  onTabChange,
  onOpenScheduleModal,
  currentUserId,
}) => {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showMemberPicker, setShowMemberPicker] = useState(false)

  // Current active engagement
  const currentEngagement = useMemo(
    () => engagements.find((e) => e.id === selectedEngagementId),
    [engagements, selectedEngagementId]
  )

  // Filtered conversations based on tab and search
  const filteredConversations = useMemo(() => {
    return conversations.filter((c) => {
      if (c.type !== activeTab) return false
      if (selectedEngagementId && c.engagementId && c.engagementId !== selectedEngagementId) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchesTitle = c.title.toLowerCase().includes(q)
        const matchesParticipant = c.participants.some(
          (p) =>
            p.fullName.toLowerCase().includes(q) ||
            p.email.toLowerCase().includes(q) ||
            p.role.toLowerCase().includes(q)
        )
        return matchesTitle || matchesParticipant
      }
      return true
    })
  }, [conversations, activeTab, selectedEngagementId, searchQuery])

  // Filter members available for private 1-on-1 chat (excluding current user)
  const availableMembers = useMemo(() => {
    return engagementMembers.filter(
      (m) => m.userId !== currentUserId && m.status === 'ACTIVE'
    )
  }, [engagementMembers, currentUserId])

  return (
    <div className="conv-list-container" role="region" aria-label={t('communication.conversations')}>
      {/* Top Header & Engagement Selector */}
      <div className="conv-list-header">
        <div className="conv-list-header-row">
          <div className="conv-list-title-group">
            <h2 className="conv-list-title">{t('communication.auditCommunication')}</h2>
            <span className="conv-badge-assurance">{t('communication.regulatedEvidence')}</span>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm conv-schedule-btn"
            onClick={onOpenScheduleModal}
            title={t('communication.scheduleMeeting')}
          >
            <CalendarPlus size={15} aria-hidden="true" />
            <span className="btn-text">{t('communication.scheduleMeeting')}</span>
          </button>
        </div>

        {/* Engagement Selector dropdown for isolation boundary */}
        <div className="conv-engagement-selector">
          <label htmlFor="engagement-scope-select" className="conv-field-label">
            <Briefcase size={14} aria-hidden="true" />
            <span>{t('communication.engagementScope')}</span>
          </label>
          <select
            id="engagement-scope-select"
            className="conv-select"
            value={selectedEngagementId || ''}
            onChange={(e) => onSelectEngagement(e.target.value)}
            disabled={engagements.length === 0}
            aria-label={t('communication.engagementScope')}
          >
            {(!selectedEngagementId || !engagements.some((e) => e.id === selectedEngagementId)) && (
              <option value="" disabled>
                {engagements.length === 0
                  ? t('communication.noEngagementsFound')
                  : t('communication.selectEngagement')}
              </option>
            )}
            {engagements.map((eng) => (
              <option key={eng.id} value={eng.id}>
                {eng.clientOrganizationName} — FY{eng.fiscalYear} ({eng.title})
              </option>
            ))}
          </select>
        </div>

        {/* Channel Type Tabs: Group vs Private */}
        <div className="conv-tabs" role="tablist" aria-label={t('communication.channelTypes')}>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'GROUP'}
            className={`conv-tab-btn ${activeTab === 'GROUP' ? 'is-active' : ''}`}
            onClick={() => onTabChange('GROUP')}
          >
            <Users size={15} aria-hidden="true" />
            <span>{t('communication.groupChannels')}</span>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'PRIVATE'}
            className={`conv-tab-btn ${activeTab === 'PRIVATE' ? 'is-active' : ''}`}
            onClick={() => onTabChange('PRIVATE')}
          >
            <User size={15} aria-hidden="true" />
            <span>{t('communication.privateOneToOne')}</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="conv-search-bar">
          <Search size={14} className="conv-search-icon" aria-hidden="true" />
          <input
            type="search"
            className="conv-search-input"
            placeholder={t('communication.searchConversations')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('communication.searchConversations')}
          />
        </div>
      </div>

      {/* Main Conversation Feed / List */}
      <div className="conv-list-body">
        {activeTab === 'GROUP' ? (
          <div className="conv-items-group">
            {/* If conversations array returned from backend, show list; otherwise show engagement group container */}
            {filteredConversations.length > 0 ? (
              filteredConversations.map((c) => {
                const isSelected = c.id === selectedConversationId
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`conv-item-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => onSelectConversation(c.id)}
                    aria-selected={isSelected}
                  >
                    <div className="conv-item-icon-col">
                      <div className="conv-avatar-group">
                        <Users size={18} aria-hidden="true" />
                      </div>
                    </div>
                    <div className="conv-item-content">
                      <div className="conv-item-header">
                        <h3 className="conv-item-title">{c.title}</h3>
                        {c.lastMessage && (
                          <time className="conv-item-time" dateTime={c.lastMessage.createdAt}>
                            {formatDate(c.lastMessage.createdAt)}
                          </time>
                        )}
                      </div>
                      <p className="conv-item-subtitle">
                        {c.engagementTitle || currentEngagement?.title || t('communication.engagementWorkspace')}
                      </p>
                      {c.lastMessage ? (
                        <p className="conv-item-preview">{c.lastMessage.content}</p>
                      ) : (
                        <span className="conv-item-meta">
                          {c.participants.length} {t('communication.authorizedParticipants')}
                        </span>
                      )}
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="conv-unread-pill" aria-label={`${c.unreadCount} unread messages`}>
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })
            ) : currentEngagement ? (
              /* Genuine Engagement Group Channel (Always available for selected engagement) */
              <button
                type="button"
                className={`conv-item-card is-primary-channel ${
                  selectedConversationId === `group-${currentEngagement.id}` ? 'is-selected' : ''
                }`}
                onClick={() => onSelectConversation(`group-${currentEngagement.id}`)}
                aria-selected={selectedConversationId === `group-${currentEngagement.id}`}
              >
                <div className="conv-item-icon-col">
                  <div className="conv-avatar-group">
                    <Users size={18} aria-hidden="true" />
                  </div>
                </div>
                <div className="conv-item-content">
                  <div className="conv-item-header">
                    <h3 className="conv-item-title">
                      {currentEngagement.clientOrganizationName} — {t('communication.engagementTeam')}
                    </h3>
                  </div>
                  <p className="conv-item-subtitle">
                    {currentEngagement.title} (FY{currentEngagement.fiscalYear})
                  </p>
                  <span className="conv-item-meta">
                    {engagementMembers.length} {t('communication.authorizedMembers')}
                  </span>
                </div>
              </button>
            ) : (
              <div className="conv-empty-state">
                <MessageSquare size={24} aria-hidden="true" />
                <p>{t('communication.noEngagementsFound')}</p>
              </div>
            )}
          </div>
        ) : (
          /* Private One-to-One Tab */
          <div className="conv-items-private">
            <div className="conv-private-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm conv-new-private-btn"
                onClick={() => setShowMemberPicker(!showMemberPicker)}
              >
                <User size={14} aria-hidden="true" />
                <span>{t('communication.startPrivateChat')}</span>
              </button>
            </div>

            {/* Dropdown / list of engagement members to start a 1-on-1 */}
            {showMemberPicker && (
              <div className="conv-member-picker-box">
                <h4 className="conv-picker-title">{t('communication.selectTeamMember')}</h4>
                <p className="conv-picker-desc">{t('communication.privateIsolationNotice')}</p>
                <ul className="conv-member-picker-list">
                  {availableMembers.map((member) => (
                    <li key={member.id} className="conv-member-picker-item">
                      <button
                        type="button"
                        className="conv-member-picker-btn"
                        onClick={() => {
                          onStartPrivateChat(member)
                          setShowMemberPicker(false)
                        }}
                      >
                        <div className="conv-member-avatar">
                          {member.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="conv-member-details">
                          <span className="conv-member-name">{member.fullName}</span>
                          <span className="conv-member-role">{formatUserRole(member.role, t)}</span>
                        </div>
                      </button>
                    </li>
                  ))}
                  {availableMembers.length === 0 && (
                    <li className="conv-member-picker-empty">
                      {t('communication.noEligibleMembers')}
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* List of existing private conversations */}
            {filteredConversations.length > 0 ? (
              filteredConversations.map((c) => {
                const otherParticipant =
                  c.participants.find((p) => p.userId !== currentUserId) || c.participants[0]
                const isSelected = c.id === selectedConversationId
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`conv-item-card ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => onSelectConversation(c.id)}
                    aria-selected={isSelected}
                  >
                    <div className="conv-item-icon-col">
                      <div className="conv-avatar-private">
                        {otherParticipant?.fullName ? otherParticipant.fullName.charAt(0).toUpperCase() : 'U'}
                      </div>
                    </div>
                    <div className="conv-item-content">
                      <div className="conv-item-header">
                        <h3 className="conv-item-title">
                          {otherParticipant?.fullName || c.title}
                        </h3>
                        {c.lastMessage && (
                          <time className="conv-item-time" dateTime={c.lastMessage.createdAt}>
                            {formatDate(c.lastMessage.createdAt)}
                          </time>
                        )}
                      </div>
                      <p className="conv-item-subtitle">
                        {otherParticipant ? formatUserRole(otherParticipant.role, t) : ''}
                      </p>
                      {c.lastMessage ? (
                        <p className="conv-item-preview">{c.lastMessage.content}</p>
                      ) : (
                        <span className="conv-item-meta">{t('communication.privateChatBadge')}</span>
                      )}
                    </div>
                    {c.unreadCount > 0 && (
                      <span className="conv-unread-pill" aria-label={`${c.unreadCount} unread`}>
                        {c.unreadCount}
                      </span>
                    )}
                  </button>
                )
              })
            ) : (
              <div className="conv-empty-state">
                <User size={24} aria-hidden="true" />
                <p>{t('communication.noPrivateChatsYet')}</p>
                <span className="conv-empty-sub">{t('communication.startPrivateDesc')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Security and Non-Deletion Policy notice at bottom of sidebar */}
      <div className="conv-footer-policy">
        <ShieldAlert size={14} className="conv-policy-icon" aria-hidden="true" />
        <span className="conv-policy-text">
          {t('communication.retentionPolicyNotice')}
        </span>
      </div>
    </div>
  )
}
