import React, { useState } from 'react'
import {
  Lock,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  UserCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/utils/dateUtils'
import type { ReviewFeedback } from '../../types'

export interface PrivateAuditorNotesCardProps {
  readonly feedbackNotes: readonly ReviewFeedback[]
  readonly isSaving: boolean
  readonly onSaveNote: (comment: string) => Promise<void>
}

export const PrivateAuditorNotesCard: React.FC<PrivateAuditorNotesCardProps> = ({
  feedbackNotes,
  isSaving,
  onSaveNote,
}) => {
  const { t } = useTranslation()
  const [commentText, setCommentText] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const MAX_CHAR_COUNT = 2000

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = commentText.trim()
    if (!trimmed || isSaving) return

    try {
      setSaveError(null)
      await onSaveNote(trimmed)
      setCommentText('')
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 4000)
    } catch {
      setSaveError(t('review.noteSaveError', 'Failed to save note. Please retry.'))
    }
  }

  return (
    <section
      className="review-section-card review-notes-card"
      aria-labelledby="private-auditor-notes-heading"
    >
      <div className="review-section-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
          <Lock size={18} style={{ color: 'var(--color-primary-700)' }} aria-hidden="true" />
          <h2 id="private-auditor-notes-heading" className="review-section-title">
            {t('review.privateAuditorNotes', 'Private Auditor Notes')}
          </h2>
          <span className="review-badge-count">
            {feedbackNotes.length}
          </span>
        </div>

        <span className="review-confidential-badge" title={t('review.auditorConfidentialBadge', 'Auditor Confidential — Hidden from Accounting Team')}>
          <Lock size={12} aria-hidden="true" />
          <span>{t('review.auditorConfidentialBadge', 'Auditor Confidential — Hidden from Accounting Team')}</span>
        </span>
      </div>

      <p className="review-section-subtitle">
        {t(
          'review.privateAuditorNotesSubtitle',
          'Internal auditor observations, working papers, and notes. Confidentially hidden from the client Accounting Team.'
        )}
      </p>

      {/* Previous Notes List */}
      {feedbackNotes.length === 0 ? (
        <div className="review-empty-notes" role="status">
          <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            {t('review.noPrivateNotes', 'No private auditor notes recorded yet.')}
          </p>
        </div>
      ) : (
        <div className="review-notes-list" role="feed" aria-label={t('review.privateAuditorNotes', 'Private Auditor Notes')}>
          {feedbackNotes.map((note) => (
            <article key={note.id} className="review-note-entry">
              <div className="review-note-entry-header">
                <span className="review-note-author">
                  <UserCheck size={13} aria-hidden="true" />
                  {note.reviewerName}
                </span>
                <span className="review-note-time">
                  <Clock size={12} aria-hidden="true" />
                  {formatDate(note.createdAt)}
                </span>
              </div>
              <p className="review-note-comment">{note.comment}</p>
            </article>
          ))}
        </div>
      )}

      {/* Add New Private Note Form */}
      <form onSubmit={handleSave} className="review-note-form">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--spacing-1)' }}>
          <label htmlFor="private-auditor-note-input" className="review-note-label">
            {t('review.addPrivateNote', 'Add Private Auditor Note')}
          </label>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {commentText.length} / {MAX_CHAR_COUNT}
          </span>
        </div>

        <textarea
          id="private-auditor-note-input"
          className="review-note-textarea"
          maxLength={MAX_CHAR_COUNT}
          placeholder={t(
            'review.privateNotePlaceholder',
            'Record internal review observations, calculations, or audit working notes...'
          )}
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          disabled={isSaving}
          rows={3}
        />

        {saveSuccess && (
          <div className="review-success-banner" role="status">
            <CheckCircle size={15} />
            <span>{t('review.noteSavedSuccess', 'Private note saved successfully.')}</span>
          </div>
        )}

        {saveError && (
          <div className="review-error-banner" role="alert">
            <AlertCircle size={15} />
            <span>{saveError}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--spacing-3)' }}>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSaving || !commentText.trim()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="spin-animation" aria-hidden="true" />
                <span>{t('review.savingNote', 'Saving Note...')}</span>
              </>
            ) : (
              <>
                <Send size={14} aria-hidden="true" />
                <span>{t('review.saveNote', 'Save Note')}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  )
}
