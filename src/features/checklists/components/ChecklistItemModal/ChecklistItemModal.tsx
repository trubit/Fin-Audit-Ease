import React, { useState, useEffect, useMemo } from 'react'
import {
  X,
  Calendar,
  AlertTriangle,
  Lock,
  FileText,
  FileCheck,
  Check,
  Loader2,
  Info,
  CalendarCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDate } from '@/utils/dateUtils'
import { useUpdateChecklistItem } from '../../hooks/useChecklists'
import { evaluateTaxDeadlineStatus } from '../../utils/taxDeadlineUtils'
import type { ChecklistItem, ChecklistItemStatus } from '../../types'
import './ChecklistItemModal.css'

export interface ChecklistItemModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly item: ChecklistItem | null
  readonly checklistId: string
  readonly isLocked?: boolean
  readonly isAuditor?: boolean
  readonly isManager?: boolean
  readonly onSaveSuccess?: () => void
}

export const ChecklistItemModal: React.FC<ChecklistItemModalProps> = ({
  isOpen,
  onClose,
  item,
  checklistId,
  isLocked = false,
  isAuditor = false,
  isManager = false,
  onSaveSuccess,
}) => {
  const { t } = useTranslation()
  const { mutate: updateItem, isPending: isUpdating } = useUpdateChecklistItem()

  const [status, setStatus] = useState<ChecklistItemStatus>('NOT_STARTED')
  const [notes, setNotes] = useState<string>('')
  const [differenceExplanation, setDifferenceExplanation] = useState<string>('')
  const [notApplicableReason, setNotApplicableReason] = useState<string>('')
  const [internalTargetDate, setInternalTargetDate] = useState<string>('')
  const [timeTakenMinutes, setTimeTakenMinutes] = useState<string>('')
  const [validationError, setValidationError] = useState<string | null>(null)

  // Synchronize initial state when modal opens
  useEffect(() => {
    if (item) {
      setStatus(item.status)
      setNotes(item.notes || '')
      setDifferenceExplanation(item.differenceExplanation || '')
      setNotApplicableReason(item.notApplicableReason || '')
      setInternalTargetDate(item.internalTargetDate || item.dueDate || '')
      setTimeTakenMinutes(
        item.timeTakenMinutes !== undefined && item.timeTakenMinutes !== null
          ? String(item.timeTakenMinutes)
          : ''
      )
      setValidationError(null)
    }
  }, [item])

  // Deadline and Weekend Evaluation
  const statutoryDueDate = item?.statutoryDueDate
  const deadlineEval = useMemo(() => {
    if (!statutoryDueDate) return null
    return evaluateTaxDeadlineStatus(statutoryDueDate, internalTargetDate || undefined)
  }, [statutoryDueDate, internalTargetDate])

  // Weekend Prompt for statutory dates
  const weekendSuggestion = useMemo(() => {
    if (!statutoryDueDate) return null
    const parts = statutoryDueDate.split('-')
    if (parts.length !== 3) return null
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)

    const dateObj = new Date(year, month, day, 12, 0, 0)
    const dayOfWeek = dateObj.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Falls on Saturday (6) or Sunday (0)
      const daysToSubtract = dayOfWeek === 0 ? 2 : 1
      const precedingFriday = new Date(year, month, day - daysToSubtract, 12, 0, 0)
      const friYear = precedingFriday.getFullYear()
      const friMonth = String(precedingFriday.getMonth() + 1).padStart(2, '0')
      const friDay = String(precedingFriday.getDate()).padStart(2, '0')
      const fridayIso = `${friYear}-${friMonth}-${friDay}`
      const dayName = dayOfWeek === 0 ? 'Sunday' : 'Saturday'

      return {
        isWeekend: true,
        dayName,
        fridayIso,
        fridayFormatted: formatDate(fridayIso),
        statutoryFormatted: formatDate(statutoryDueDate),
      }
    }
    return null
  }, [statutoryDueDate])

  if (!isOpen || !item) return null

  const isReadOnly = isLocked || isAuditor

  const handleApplyFridaySuggestion = () => {
    if (weekendSuggestion) {
      setInternalTargetDate(weekendSuggestion.fridayIso)
    }
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (isReadOnly) return

    // Validate Not Applicable mandatory reason (Prompt Section 12)
    if (status === 'NOT_APPLICABLE' && !notApplicableReason.trim()) {
      setValidationError(
        t('checklists.naReasonRequired', 'A mandatory reason is required when marking an item Not Applicable.')
      )
      return
    }

    setValidationError(null)

    const parsedTime = timeTakenMinutes.trim() ? parseInt(timeTakenMinutes.trim(), 10) : undefined

    updateItem(
      {
        checklistId,
        itemId: item.id,
        payload: {
          status,
          notes: notes.trim() || undefined,
          differenceExplanation: differenceExplanation.trim() || undefined,
          notApplicableReason: status === 'NOT_APPLICABLE' ? notApplicableReason.trim() : undefined,
          internalTargetDate: internalTargetDate.trim() || undefined,
          timeTakenMinutes: isNaN(Number(parsedTime)) ? undefined : parsedTime,
        },
      },
      {
        onSuccess: () => {
          onSaveSuccess?.()
          onClose()
        },
        onError: (err: unknown) => {
          setValidationError(
            err instanceof Error ? err.message : 'Failed to update checklist item.'
          )
        },
      }
    )
  }

  return (
    <div
      className="checklist-item-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-item-title"
    >
      <div className="checklist-item-modal">
        {/* Modal Header */}
        <div className="checklist-item-modal-header">
          <div className="checklist-item-modal-header-info">
            <div className="checklist-item-modal-badges">
              {item.itemNumber && (
                <span className="badge badge-neutral">Item #{item.itemNumber}</span>
              )}
              {item.category && (
                <span className="badge badge-neutral">{item.category}</span>
              )}
              {item.isCarriedOver && (
                <span className="badge badge-warning">
                  Carried over from {item.originalReportingPeriod || 'prior period'}
                </span>
              )}
            </div>
            <h3 id="modal-item-title" className="checklist-item-modal-title">
              {item.title}
            </h3>
          </div>
          <button
            type="button"
            className="checklist-item-modal-close"
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSave} className="checklist-item-modal-body">
          {/* Read-Only Notice */}
          {isReadOnly && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: 'var(--spacing-3) var(--spacing-4)',
                backgroundColor: 'var(--color-slate-100)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-slate-700)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
              }}
            >
              <Lock size={15} />
              <span>
                {isLocked
                  ? t('checklists.periodLockedNotice', 'This period is locked. Edits are disabled.')
                  : t('checklists.auditorReadOnlyNotice', 'Auditors have read-only access to checklists.')}
              </span>
            </div>
          )}

          {/* Description */}
          {item.description && (
            <p className="checklist-item-modal-desc">{item.description}</p>
          )}

          {/* Statutory Tax Deadline & Internal Target Date Banner (Section 9) */}
          {item.statutoryDueDate && (
            <div className="checklist-statutory-banner">
              <div className="checklist-statutory-grid">
                <div className="checklist-date-box">
                  <span className="checklist-date-label">
                    {t('checklists.statutoryDueDate', 'Statutory Due Date (Fixed)')}
                  </span>
                  <span className="checklist-date-value">
                    <Calendar size={15} style={{ color: 'var(--color-emerald-700)' }} />
                    <span>{formatDate(item.statutoryDueDate)}</span>
                  </span>
                </div>

                <div className="checklist-date-box">
                  <span className="checklist-date-label">
                    {t('checklists.completeByLabel', 'Complete by (Internal Target Date)')}
                  </span>
                  <span className="checklist-date-value">
                    <CalendarCheck size={15} style={{ color: 'var(--color-primary-600)' }} />
                    <span>{internalTargetDate ? formatDate(internalTargetDate) : formatDate(item.statutoryDueDate)}</span>
                  </span>
                </div>
              </div>

              {/* Status indicator (Overdue vs Internal Target Passed) */}
              {deadlineEval && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  {deadlineEval.displayStatus === 'OVERDUE' && (
                    <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} />
                      <span>{deadlineEval.label}</span>
                    </span>
                  )}
                  {deadlineEval.displayStatus === 'TARGET_PASSED' && (
                    <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <Info size={12} />
                      <span>{deadlineEval.label}</span>
                    </span>
                  )}
                  {deadlineEval.displayStatus === 'DUE_SOON' && (
                    <span className="badge badge-warning">
                      <span>{deadlineEval.label}</span>
                    </span>
                  )}
                  {deadlineEval.displayStatus === 'ON_TRACK' && (
                    <span className="badge badge-neutral">
                      <span>{deadlineEval.label}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Weekend Prompt Suggestion */}
              {weekendSuggestion && !isReadOnly && (
                <div className="checklist-weekend-prompt">
                  <p className="checklist-weekend-prompt-text">
                    The statutory due date ({weekendSuggestion.statutoryFormatted}) falls on a {weekendSuggestion.dayName}.
                    Would you like to set an earlier internal target date, such as Friday, {weekendSuggestion.fridayFormatted}?
                  </p>
                  <button
                    type="button"
                    className="btn btn-outline btn-xs"
                    onClick={handleApplyFridaySuggestion}
                    style={{ alignSelf: 'flex-start', marginTop: '4px' }}
                  >
                    <span>Set Complete by to Friday ({weekendSuggestion.fridayFormatted})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status Selection */}
          <div className="checklist-form-group">
            <label htmlFor="item-status-select" className="checklist-form-label">
              <span>{t('checklists.status', 'Status')}</span>
            </label>
            <select
              id="item-status-select"
              className="checklist-select"
              value={status}
              disabled={isReadOnly}
              onChange={(e) => setStatus(e.target.value as ChecklistItemStatus)}
            >
              <option value="NOT_STARTED">{t('checklists.statusNotStarted', 'Not started')}</option>
              <option value="IN_PROGRESS">{t('checklists.statusInProgress', 'In progress')}</option>
              <option value="COMPLETED">{t('checklists.statusDone', 'Done')}</option>
              {isManager && (
                <option value="REVIEWED">{t('checklists.statusReviewed', 'Reviewed')}</option>
              )}
              <option value="NOT_APPLICABLE">{t('checklists.statusNotApplicable', 'Not Applicable')}</option>
            </select>
          </div>

          {/* Not Applicable Mandatory Reason (Section 12) */}
          {status === 'NOT_APPLICABLE' && (
            <div className="checklist-form-group">
              <label htmlFor="item-na-reason" className="checklist-form-label">
                <span>{t('checklists.naReasonLabel', 'Reason for Not Applicable')} *</span>
              </label>
              <textarea
                id="item-na-reason"
                className="checklist-textarea"
                value={notApplicableReason}
                disabled={isReadOnly}
                onChange={(e) => setNotApplicableReason(e.target.value)}
                placeholder={t(
                  'checklists.naReasonPlaceholder',
                  'Explain why this checklist item does not apply to this organization (e.g., "Company does not operate POS terminals").'
                )}
                required
              />
            </div>
          )}

          {/* Difference / Variance Explanation Field (Section 5 Items 2, 4 & Section 16) */}
          <div className="checklist-form-group">
            <label htmlFor="item-diff-explanation" className="checklist-form-label">
              <span>{t('checklists.diffExplanationLabel', 'Reconciliation Variance / Difference Explanation')}</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {t('common.optional', 'Optional')}
              </span>
            </label>
            <textarea
              id="item-diff-explanation"
              className="checklist-textarea"
              value={differenceExplanation}
              disabled={isReadOnly}
              onChange={(e) => setDifferenceExplanation(e.target.value)}
              placeholder={t(
                'checklists.diffExplanationPlaceholder',
                'Explain any unmatched items, cash differences, or discrepancies.'
              )}
            />
          </div>

          {/* Internal Target Date Input (if not locked and user wants to edit date) */}
          {!isReadOnly && (
            <div className="checklist-form-group">
              <label htmlFor="item-target-date" className="checklist-form-label">
                <span>{t('checklists.completeByLabel', 'Complete by (Internal Target Date)')}</span>
              </label>
              <input
                id="item-target-date"
                type="date"
                className="checklist-input"
                value={internalTargetDate}
                onChange={(e) => setInternalTargetDate(e.target.value)}
              />
            </div>
          )}

          {/* Preparer Notes */}
          <div className="checklist-form-group">
            <label htmlFor="item-notes" className="checklist-form-label">
              <span>{t('checklists.notes', 'Notes & Explanations')}</span>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {notes.length}/500
              </span>
            </label>
            <textarea
              id="item-notes"
              className="checklist-textarea"
              value={notes}
              disabled={isReadOnly}
              maxLength={500}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('checklists.notesPlaceholder', 'Add verification notes or context...')}
            />
          </div>

          {/* Operational Metrics: Time Taken (Section 16) */}
          <div className="checklist-form-group">
            <label htmlFor="item-time-taken" className="checklist-form-label">
              <span>{t('checklists.timeTakenLabel', 'Time Taken to Complete (Minutes)')}</span>
            </label>
            <input
              id="item-time-taken"
              type="number"
              min="0"
              className="checklist-input"
              value={timeTakenMinutes}
              disabled={isReadOnly}
              onChange={(e) => setTimeTakenMinutes(e.target.value)}
              placeholder="e.g. 45"
            />
          </div>

          {/* Supporting Documents & Evidence Section (Section 14) */}
          <div className="checklist-evidence-section">
            <div className="checklist-evidence-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FileCheck size={16} style={{ color: 'var(--color-primary-700)' }} />
                <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-slate-900)' }}>
                  {t('checklists.supportingEvidence', 'Supporting Evidence & Documents')}
                </span>
              </div>
              <span className="badge badge-neutral">
                {item.attachedDocumentCount || 0} attached
              </span>
            </div>

            {item.requiresEvidence && (item.attachedDocumentCount || 0) === 0 && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'var(--color-amber-800)',
                  fontSize: 'var(--font-size-xs)',
                  backgroundColor: 'var(--color-amber-50)',
                  padding: '6px 10px',
                  borderRadius: '6px',
                }}
              >
                <AlertTriangle size={14} />
                <span>{t('checklists.missingEvidenceWarning', 'This item requires supporting invoices, statements, or schedules.')}</span>
              </div>
            )}

            {item.attachedDocuments && item.attachedDocuments.length > 0 ? (
              <ul className="checklist-evidence-list">
                {item.attachedDocuments.map((doc) => (
                  <li key={doc.id} className="checklist-evidence-item">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileText size={14} style={{ color: 'var(--color-primary-600)' }} />
                      <span style={{ fontWeight: 600 }}>{doc.name}</span>
                    </div>
                    {doc.uploadedAt && (
                      <span style={{ color: 'var(--text-muted)' }}>
                        {formatDate(doc.uploadedAt)}
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                {t('checklists.noAttachedDocs', 'No documents attached yet. Upload invoices or schedules via the Documents repository or engagement uploads.')}
              </p>
            )}
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div
              style={{
                padding: 'var(--spacing-3)',
                backgroundColor: 'var(--color-rose-50)',
                color: 'var(--color-rose-700)',
                borderRadius: 'var(--radius-md)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
              }}
              role="alert"
            >
              {validationError}
            </div>
          )}

          {/* Modal Footer */}
          <div className="checklist-item-modal-footer">
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={onClose}
              disabled={isUpdating}
            >
              <span>{isReadOnly ? t('common.close', 'Close') : t('common.cancel', 'Cancel')}</span>
            </button>
            {!isReadOnly && (
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={isUpdating}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                {isUpdating ? (
                  <Loader2 size={14} className="spin-animation" aria-hidden="true" />
                ) : (
                  <Check size={14} aria-hidden="true" />
                )}
                <span>{t('common.save', 'Save Changes')}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
