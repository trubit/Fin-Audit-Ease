import React, { useState, useRef, useEffect } from 'react'
import {
  Send,
  Paperclip,
  Users,
  User,
  Calendar,
  Video,
  FileCheck,
  Briefcase,
  ShieldCheck,
  AlertCircle,
  Clock,
  Check,
  CheckCheck,
  Loader2,
  Lock,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { Conversation, ChatMessage } from '../../types'
import type { Engagement, EngagementMember } from '@/features/engagements/types'
import { formatUserRole } from '@/features/auth/utils/roleUtils'
import { formatDate } from '@/utils/dateUtils'
import { AppApiError } from '@/services/api/apiErrors'
import './ChatWindow.css'

export interface ChatWindowProps {
  readonly conversation: Conversation | null
  readonly messages: readonly ChatMessage[]
  readonly isLoadingMessages: boolean
  readonly onSendMessage: (content: string) => Promise<void>
  readonly isSending: boolean
  readonly onOpenScheduleModal: () => void
  readonly onOpenMeetingRoom: () => void
  readonly activeEngagement?: Engagement
  readonly engagementMembers: readonly EngagementMember[]
  readonly currentUserId?: string
  readonly onBackToList?: () => void
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversation,
  messages,
  isLoadingMessages,
  onSendMessage,
  isSending,
  onOpenScheduleModal,
  onOpenMeetingRoom,
  activeEngagement,
  engagementMembers: _engagementMembers,
  currentUserId,
  onBackToList,
}) => {
  const { t } = useTranslation()
  const [inputText, setInputText] = useState('')
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Auto scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim() || isSending) return

    setSubmissionError(null)
    try {
      await onSendMessage(inputText.trim())
      setInputText('')
    } catch (err: unknown) {
      if (err instanceof AppApiError && (err.status === 404 || err.status === 501)) {
        setSubmissionError(
          t(
            'communication.messageEndpointPending',
            'Backend message dispatch endpoint is awaiting backend deployment. Message cannot be delivered until backend service is live.'
          )
        )
      } else if (err instanceof Error) {
        setSubmissionError(err.message)
      } else {
        setSubmissionError(t('errors.generic', 'Unable to send message at this time.'))
      }
    }
  }

  if (!conversation) {
    return (
      <div className="chat-window-empty" role="region" aria-label={t('communication.chatWindow')}>
        <div className="chat-empty-illustration">
          <ShieldCheck size={48} className="chat-empty-icon" aria-hidden="true" />
          <h2 className="chat-empty-title">{t('communication.selectToStart')}</h2>
          <p className="chat-empty-desc">{t('communication.selectToStartDesc')}</p>
        </div>
      </div>
    )
  }

  const isGroup = conversation.type === 'GROUP'
  const partnerParticipant = !isGroup
    ? conversation.participants.find((p) => p.userId !== currentUserId) || conversation.participants[0]
    : null

  return (
    <div className="chat-window-container" role="region" aria-label={conversation.title}>
      {/* Conversation Top Header */}
      <header className="chat-header">
        <div className="chat-header-left">
          {onBackToList && (
            <button
              type="button"
              className="chat-back-btn"
              onClick={onBackToList}
              aria-label={t('common.previous', 'Back')}
            >
              ←
            </button>
          )}
          <div className="chat-header-avatar">
            {isGroup ? <Users size={20} aria-hidden="true" /> : <User size={20} aria-hidden="true" />}
          </div>
          <div className="chat-header-info">
            <div className="chat-header-title-row">
              <h2 className="chat-header-title">
                {partnerParticipant ? partnerParticipant.fullName : conversation.title}
              </h2>
              <span className={`chat-type-badge ${isGroup ? 'is-group' : 'is-private'}`}>
                {isGroup ? t('communication.groupBadge') : t('communication.privateBadge')}
              </span>
            </div>
            <p className="chat-header-subtitle">
              {activeEngagement ? (
                <>
                  <Briefcase size={12} aria-hidden="true" />
                  <span>
                    {activeEngagement.clientOrganizationName} — {activeEngagement.title} (FY{activeEngagement.fiscalYear})
                  </span>
                </>
              ) : (
                conversation.engagementTitle || t('communication.engagementWorkspace')
              )}
            </p>
          </div>
        </div>

        {/* Header Action Controls */}
        <div className="chat-header-actions">
          {activeEngagement && (
            <>
              <Link
                to={`/engagements/${activeEngagement.id}`}
                className="btn btn-outline btn-xs"
                title={t('navigation.engagements')}
              >
                <Briefcase size={13} aria-hidden="true" />
                <span className="action-text">{t('navigation.engagements')}</span>
              </Link>
              <Link
                to={`/audit-requests?engagementId=${activeEngagement.id}`}
                className="btn btn-outline btn-xs"
                title={t('navigation.auditRequests')}
              >
                <FileCheck size={13} aria-hidden="true" />
                <span className="action-text">{t('navigation.auditRequests')}</span>
              </Link>
            </>
          )}

          <button
            type="button"
            className="btn btn-outline btn-xs"
            onClick={onOpenScheduleModal}
            title={t('communication.scheduleMeeting')}
          >
            <Calendar size={13} aria-hidden="true" />
            <span className="action-text">{t('communication.schedule')}</span>
          </button>

          <button
            type="button"
            className="btn btn-primary btn-xs"
            onClick={onOpenMeetingRoom}
            title={t('communication.inAppMeeting')}
          >
            <Video size={13} aria-hidden="true" />
            <span className="action-text">{t('communication.joinMeeting')}</span>
          </button>
        </div>
      </header>

      {/* Audit Evidence Integrity Banner */}
      <div className="chat-retention-banner" role="note">
        <Lock size={15} className="chat-banner-icon" aria-hidden="true" />
        <div className="chat-banner-text">
          <strong>{t('communication.evidenceRetentionTitle')}</strong>:{' '}
          {t('communication.evidenceRetentionDescription')}
        </div>
      </div>

      {/* Message Feed Stream */}
      <div className="chat-messages-scroll" tabIndex={0} aria-label={t('communication.messageHistory')}>
        {isLoadingMessages ? (
          <div className="chat-loading-state">
            <Loader2 size={24} className="spin" aria-hidden="true" />
            <span>{t('common.processing')}</span>
          </div>
        ) : messages.length > 0 ? (
          <div className="chat-messages-list">
            {messages.map((msg) => {
              const isMine = msg.senderId === currentUserId
              return (
                <article
                  key={msg.id}
                  className={`chat-message-row ${isMine ? 'is-outgoing' : 'is-incoming'}`}
                  aria-label={`${msg.senderName} at ${formatDate(msg.createdAt)}`}
                >
                  <div className="chat-message-bubble">
                    <header className="chat-message-meta">
                      <span className="chat-sender-name">{msg.senderName}</span>
                      <span className="chat-sender-role">({formatUserRole(msg.senderRole, t)})</span>
                      <time className="chat-message-time" dateTime={msg.createdAt}>
                        {formatDate(msg.createdAt)}
                      </time>
                    </header>
                    <p className="chat-message-text">{msg.content}</p>

                    {/* Attachments if any */}
                    {msg.attachments && msg.attachments.length > 0 && (
                      <div className="chat-message-attachments">
                        {msg.attachments.map((att) => (
                          <div key={att.id} className="chat-attachment-chip">
                            <Paperclip size={12} aria-hidden="true" />
                            <span className="chat-att-name">{att.fileName}</span>
                            {att.downloadUrl && (
                              <a
                                href={att.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="chat-att-download"
                              >
                                {t('documents.download')}
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Delivery Status Indicator (Confirmed by backend only) */}
                    <footer className="chat-message-footer">
                      {msg.isEdited && (
                        <span className="chat-edited-indicator">
                          ({t('communication.edited')})
                        </span>
                      )}
                      <span className="chat-delivery-status" title={msg.deliveryStatus}>
                        {msg.deliveryStatus === 'READ' ? (
                          <CheckCheck size={14} className="is-read" aria-label="Read" />
                        ) : msg.deliveryStatus === 'DELIVERED' ? (
                          <CheckCheck size={14} aria-label="Delivered" />
                        ) : msg.deliveryStatus === 'SENT' ? (
                          <Check size={14} aria-label="Sent" />
                        ) : (
                          <Clock size={12} aria-label="Sending" />
                        )}
                      </span>
                    </footer>
                  </div>
                </article>
              )
            })}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          /* Honest Empty State: Backend messaging service awaiting deployment */
          <div className="chat-empty-state-notice">
            <AlertCircle size={28} className="chat-pending-icon" aria-hidden="true" />
            <h3 className="chat-pending-title">{t('communication.backendPendingTitle')}</h3>
            <p className="chat-pending-desc">{t('communication.backendPendingDesc')}</p>
            <div className="chat-contract-box">
              <code>GET/POST /api/v1/communication/conversations/{conversation.id}/messages</code>
              <span>{t('communication.awaitingBackendContract')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Submission Error Banner */}
      {submissionError && (
        <div className="chat-error-banner" role="alert">
          <AlertCircle size={15} aria-hidden="true" />
          <span>{submissionError}</span>
          <button
            type="button"
            className="chat-error-dismiss"
            onClick={() => setSubmissionError(null)}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
      )}

      {/* Message Composer Footer */}
      <footer className="chat-composer-area">
        <form className="chat-composer-form" onSubmit={handleSend}>
          <button
            type="button"
            className="chat-tool-btn"
            title={t('communication.attachDocument')}
            aria-label={t('communication.attachDocument')}
          >
            <Paperclip size={18} aria-hidden="true" />
          </button>
          <textarea
            className="chat-composer-input"
            rows={1}
            placeholder={
              isGroup
                ? t('communication.composerPlaceholderGroup')
                : t('communication.composerPlaceholderPrivate')
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void handleSend(e)
              }
            }}
            aria-label={t('communication.messageContent')}
          />
          <button
            type="submit"
            className="btn btn-primary chat-send-btn"
            disabled={!inputText.trim() || isSending}
            aria-label={t('communication.sendMessage')}
          >
            {isSending ? (
              <Loader2 size={16} className="spin" aria-hidden="true" />
            ) : (
              <Send size={16} aria-hidden="true" />
            )}
          </button>
        </form>
        <div className="chat-composer-hints">
          <span>{t('communication.composerRegulatoryHint')}</span>
        </div>
      </footer>
    </div>
  )
}
