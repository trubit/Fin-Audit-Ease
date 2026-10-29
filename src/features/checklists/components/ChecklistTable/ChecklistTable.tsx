import React, { useState } from 'react'
import {
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  MessageSquare,
  Tag,
  Filter,
  Check,
  X,
  Lock,
  User,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/common/Badge/Badge'
import { formatDate, formatDateTime } from '@/utils/dateUtils'
import type { Checklist, ChecklistItem, ChecklistItemStatus } from '../../types'
import { useUpdateChecklistItem } from '../../hooks/useChecklists'
import { evaluateTaxDeadlineStatus } from '../../utils/taxDeadlineUtils'
import { ChecklistItemModal } from '../ChecklistItemModal/ChecklistItemModal'
import './ChecklistTable.css'

export interface ChecklistTableProps {
  readonly checklist: Checklist
  readonly readOnly?: boolean
  readonly readOnlyReason?: 'ARCHIVED' | 'AUDITOR' | 'UNAUTHORIZED' | 'LOCKED'
  readonly isManager?: boolean
  readonly onRefresh?: () => void
}

export const ChecklistTable: React.FC<ChecklistTableProps> = ({
  checklist,
  readOnly = false,
  readOnlyReason,
  isManager = false,
  onRefresh,
}) => {
  const { t } = useTranslation()
  const { mutate: updateItem, isPending } = useUpdateChecklistItem()
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')
  const [selectedItemForModal, setSelectedItemForModal] = useState<ChecklistItem | null>(null)

  // Inline Note editing state
  const [editingNoteItemId, setEditingNoteItemId] = useState<string | null>(null)
  const [noteDraft, setNoteDraft] = useState<string>('')
  const [noteError, setNoteError] = useState<string | null>(null)

  const isChecklistLocked = !!checklist.isLocked || readOnlyReason === 'LOCKED'
  const isEffectiveReadOnly = readOnly || isChecklistLocked

  const progressPercent = Math.min(
    100,
    Math.round(
      (checklist.completedItemsCount / (checklist.totalItemsCount || 1)) * 100
    )
  )

  // Map category to PRD user-facing localized labels
  const getCategoryLabel = React.useCallback(
    (cat?: string): string => {
      if (!cat) return '—'
      const lower = cat.toLowerCase().trim()
      if (lower.includes('cash') || lower.includes('bank')) {
        return t('checklists.categoryCash', 'Category A: Cash & Bank')
      }
      if (lower.includes('receivable')) {
        return t('checklists.categoryReceivables', 'Category B: Receivables')
      }
      if (lower.includes('payable')) {
        return t('checklists.categoryPayables', 'Category C: Payables')
      }
      if (lower.includes('accrual') || lower.includes('asset')) {
        return t('checklists.categoryAccrualsAssets', 'Category D: Accruals & Assets')
      }
      if (lower.includes('payroll') || lower.includes('tax')) {
        return t('checklists.categoryTaxPayroll', 'Category E: Tax & Payroll')
      }
      if (lower.includes('financ') || lower.includes('intercompany')) {
        return t('checklists.categoryFinancing', 'Category E: Financing & Intercompany')
      }
      if (lower.includes('review') || lower.includes('lock')) {
        return t('checklists.categoryReviewLock', 'Category F: Review & Lock')
      }
      if (lower.includes('transaction') || lower === 'transactions & posting') {
        return t('checklists.transactionsPosting', 'Transactions & Posting')
      }
      if (lower.includes('reconciliation') || lower === 'reconciliations') {
        return t('checklists.reconciliations', 'Reconciliations')
      }
      if (lower.includes('supporting') || lower.includes('document')) {
        return t('checklists.supportingDocuments', 'Supporting Documents')
      }
      return cat
    },
    [t]
  )

  // Extract unique categories from actual checklist items
  const uniqueCategories = React.useMemo(() => {
    const set = new Set<string>()
    checklist.items.forEach((item) => {
      if (item.category) set.add(item.category)
    })
    return Array.from(set)
  }, [checklist.items])

  // Category progress stats
  const categoryStats = React.useMemo(() => {
    return uniqueCategories.map((cat) => {
      const catItems = checklist.items.filter((item) => item.category === cat)
      const total = catItems.length
      const completed = catItems.filter(
        (item) => item.status === 'COMPLETED' || item.status === 'DONE' || item.status === 'REVIEWED'
      ).length
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0
      return {
        category: cat,
        label: getCategoryLabel(cat),
        total,
        completed,
        pct,
      }
    })
  }, [uniqueCategories, checklist.items, getCategoryLabel])

  // Filter items by selected category
  const filteredItems = React.useMemo(() => {
    if (selectedCategory === 'ALL') return checklist.items
    return checklist.items.filter((item) => item.category === selectedCategory)
  }, [checklist.items, selectedCategory])

  const handleStatusChange = (item: ChecklistItem, newStatus: ChecklistItemStatus) => {
    if (isEffectiveReadOnly) return

    // If changing to NOT_APPLICABLE, open modal to enter mandatory reason
    if (newStatus === 'NOT_APPLICABLE') {
      setSelectedItemForModal(item)
      return
    }

    setUpdatingItemId(item.id)
    updateItem(
      {
        checklistId: checklist.id,
        itemId: item.id,
        payload: { status: newStatus },
      },
      {
        onSettled: () => {
          setUpdatingItemId(null)
          onRefresh?.()
        },
      }
    )
  }

  const handleStartEditNote = (item: ChecklistItem) => {
    if (isEffectiveReadOnly) return
    setEditingNoteItemId(item.id)
    setNoteDraft(item.notes || '')
    setNoteError(null)
  }

  const handleSaveNote = (item: ChecklistItem) => {
    if (isEffectiveReadOnly) return
    const trimmed = noteDraft.trim()
    if (trimmed.length > 500) {
      setNoteError('Note exceeds maximum length of 500 characters.')
      return
    }

    setUpdatingItemId(item.id)
    updateItem(
      {
        checklistId: checklist.id,
        itemId: item.id,
        payload: {
          status: item.status,
          notes: trimmed,
        },
      },
      {
        onSuccess: () => {
          setEditingNoteItemId(null)
          setNoteDraft('')
          setNoteError(null)
          onRefresh?.()
        },
        onSettled: () => {
          setUpdatingItemId(null)
        },
      }
    )
  }

  const handleCancelEditNote = () => {
    setEditingNoteItemId(null)
    setNoteDraft('')
    setNoteError(null)
  }

  const getStatusBadge = (status: ChecklistItemStatus) => {
    switch (status) {
      case 'REVIEWED':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ShieldCheck size={12} />
            <span>{t('checklists.statusReviewed', 'Reviewed')}</span>
          </span>
        )
      case 'COMPLETED':
      case 'DONE':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <CheckCircle2 size={12} />
            <span>{t('checklists.statusDone', 'Done')}</span>
          </span>
        )
      case 'IN_PROGRESS':
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={12} />
            <span>{t('checklists.statusInProgress', 'In progress')}</span>
          </span>
        )
      case 'NOT_APPLICABLE':
        return (
          <span className="badge badge-neutral">
            <span>{t('checklists.statusNotApplicable', 'Not Applicable')}</span>
          </span>
        )
      case 'NOT_STARTED':
      default:
        return (
          <span className="badge badge-neutral">
            <span>{t('checklists.statusNotStarted', 'Not started')}</span>
          </span>
        )
    }
  }

  return (
    <div className="checklist-view-container">
      {/* Period Locked Banner (Prompt Section 11) */}
      {isChecklistLocked && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            padding: 'var(--spacing-4)',
            backgroundColor: 'var(--color-slate-900)',
            color: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-sm)',
          }}
          role="status"
          aria-live="polite"
        >
          <Lock size={20} style={{ color: 'var(--color-emerald-400)' }} aria-hidden="true" />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
              {t('checklists.periodLockedHeading', 'Period Locked & Signed Off')}
            </p>
            <p style={{ margin: 0, fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-300)' }}>
              {checklist.lockedByUserName
                ? t('checklists.periodLockedByDetails', {
                    user: checklist.lockedByUserName,
                    time: formatDateTime(checklist.lockedAt),
                  })
                : t(
                    'checklists.periodLockedDesc',
                    'This reporting period has been permanently signed off and locked. Normal editing controls are disabled to protect general ledger cut-off integrity.'
                  )}
            </p>
          </div>
        </div>
      )}

      {/* Submitted for Review Banner (Prompt Section 11) */}
      {!isChecklistLocked && checklist.isSubmittedForReview && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-3)',
            padding: 'var(--spacing-3) var(--spacing-4)',
            backgroundColor: 'var(--color-primary-50)',
            border: '1px solid var(--color-primary-200)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-primary-900)',
            fontSize: 'var(--font-size-xs)',
          }}
          role="status"
        >
          <ShieldCheck size={18} style={{ color: 'var(--color-primary-700)' }} />
          <div>
            <span style={{ fontWeight: 700 }}>
              {t('checklists.submittedForReviewTitle', 'Submitted for Review')}:
            </span>{' '}
            <span>
              {t(
                'checklists.submittedForReviewDesc',
                'Preparer work has been submitted. Awaiting manager inspection and formal period sign-off.'
              )}
            </span>
          </div>
        </div>
      )}

      {/* Read-Only Notice Banner */}
      {!isChecklistLocked && readOnly && (
        <div className="checklist-readonly-banner" role="status" aria-live="polite">
          <Lock size={16} aria-hidden="true" />
          <span>
            {readOnlyReason === 'AUDITOR'
              ? t('checklists.auditorReadOnlyNotice', 'Auditors have read-only inspection access.')
              : t('checklists.historicalReadOnlyNotice', 'This historical checklist period is archived.')}
          </span>
        </div>
      )}

      {/* Overview & Progress Card */}
      <div className="checklist-meta-card">
        <div className="checklist-header-top">
          <div>
            <h2 className="checklist-title">{checklist.title}</h2>
            <span className="checklist-period-badge">
              {t('checklists.period', 'Period')}: {checklist.periodLabel}
            </span>
          </div>
          <Badge variant={progressPercent === 100 ? 'success' : 'info'}>
            {checklist.completedItemsCount} / {checklist.totalItemsCount} {t('checklists.completed', 'completed')}
          </Badge>
        </div>

        <div className="checklist-progress-wrapper">
          <div className="checklist-progress-labels">
            <span>{t('checklists.overallProgress', 'Overall Progress')}</span>
            <span style={{ fontWeight: 600 }}>
              {progressPercent}% ({checklist.completedItemsCount} / {checklist.totalItemsCount} {t('checklists.completed', 'completed')})
            </span>
          </div>
          <div
            className="checklist-progress-bar-bg"
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${t('checklists.overallProgress', 'Overall Progress')}: ${progressPercent}%`}
          >
            <div
              className="checklist-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Category Progress Breakdowns */}
        {categoryStats.length > 0 && (
          <div className="checklist-category-stats-grid" aria-label={t('checklists.categoryProgressBreakdown', 'Category Breakdown')}>
            {categoryStats.map((stat) => (
              <div key={stat.category} className="checklist-category-stat-pill">
                <span className="checklist-category-stat-name">{stat.label}</span>
                <span className="checklist-category-stat-count">
                  {stat.completed} / {stat.total} ({stat.pct}%)
                </span>
                <div
                  className="checklist-category-stat-bar-bg"
                  role="progressbar"
                  aria-valuenow={stat.pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${stat.label}: ${stat.completed} of ${stat.total}`}
                >
                  <div
                    className="checklist-category-stat-bar-fill"
                    style={{ width: `${stat.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter Tabs */}
      {uniqueCategories.length > 1 && (
        <div
          role="tablist"
          aria-label={t('checklists.filterByCategory', 'Filter by Category')}
          className="checklist-category-filter-tabs"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'ALL'}
            className={`btn btn-xs ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory('ALL')}
          >
            <Filter size={12} aria-hidden="true" />
            <span>{t('checklists.allCategories', 'All Categories')}</span>
            <span className="checklist-count-tag">{checklist.items.length}</span>
          </button>
          {uniqueCategories.map((cat) => {
            const isSelected = selectedCategory === cat
            const count = checklist.items.filter((i) => i.category === cat).length
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                <span>{getCategoryLabel(cat)}</span>
                <span className="checklist-count-tag">{count}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Items Table Card */}
      <div className="checklist-table-card">
        <div className="checklist-table-responsive">
          <table className="checklist-table" aria-label={checklist.title}>
            <thead>
              <tr>
                <th style={{ width: '32%' }}>{t('checklists.itemTitle', 'Item / Requirement')}</th>
                <th>{t('checklists.category', 'Category')}</th>
                <th>{t('checklists.status', 'Status')}</th>
                <th>{t('checklists.dueDate', 'Due Dates')}</th>
                <th>{t('checklists.responsiblePerson', 'Assigned')}</th>
                <th>{t('checklists.evidence', 'Evidence')}</th>
                <th style={{ textAlign: 'right' }}>{t('checklists.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => {
                const isItemUpdating = isPending && updatingItemId === item.id
                const isEditingNote = editingNoteItemId === item.id

                const deadlineEval = item.statutoryDueDate
                  ? evaluateTaxDeadlineStatus(item.statutoryDueDate, item.internalTargetDate)
                  : null

                const hasMissingEvidence =
                  item.requiresEvidence && (item.attachedDocumentCount || 0) === 0

                return (
                  <tr key={item.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                        {item.itemNumber && (
                          <span
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              fontWeight: 700,
                              color: 'var(--color-primary-700)',
                              backgroundColor: 'var(--color-primary-50)',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              flexShrink: 0,
                            }}
                          >
                            #{item.itemNumber}
                          </span>
                        )}
                        <div>
                          <p
                            className="checklist-item-title"
                            style={{ cursor: 'pointer' }}
                            onClick={() => setSelectedItemForModal(item)}
                          >
                            {item.title}
                          </p>
                          {item.description && (
                            <p className="checklist-item-desc">{item.description}</p>
                          )}
                        </div>
                      </div>

                      {/* Not Applicable Reason Display (Section 12) */}
                      {item.status === 'NOT_APPLICABLE' && item.notApplicableReason && (
                        <div
                          style={{
                            marginTop: 'var(--spacing-2)',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-slate-600)',
                            backgroundColor: 'var(--color-slate-100)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontStyle: 'italic',
                          }}
                        >
                          <strong>N/A:</strong> {item.notApplicableReason}
                        </div>
                      )}

                      {/* Reconciliation Difference Explanation Display */}
                      {item.differenceExplanation && (
                        <div
                          style={{
                            marginTop: 'var(--spacing-2)',
                            fontSize: 'var(--font-size-xs)',
                            color: 'var(--color-primary-800)',
                            backgroundColor: 'var(--color-primary-50)',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          <strong>{t('checklists.variance', 'Variance')}:</strong> {item.differenceExplanation}
                        </div>
                      )}

                      {/* Notes / Comment display */}
                      {item.notes && !isEditingNote && (
                        <div className="checklist-item-notes-box">
                          <MessageSquare size={12} aria-hidden="true" className="checklist-notes-icon" />
                          <span className="checklist-notes-text">{item.notes}</span>
                          {!isEffectiveReadOnly && (
                            <button
                              type="button"
                              className="checklist-notes-edit-link"
                              onClick={() => handleStartEditNote(item)}
                              aria-label={`Edit note for ${item.title}`}
                            >
                              {t('common.edit', 'Edit')}
                            </button>
                          )}
                        </div>
                      )}

                      {/* Inline Note Editing Form */}
                      {isEditingNote && (
                        <div className="checklist-note-editor" role="form" aria-label="Edit verification note">
                          <label htmlFor={`note-input-${item.id}`} className="sr-only">
                            {t('checklists.addNotes', 'Add Note')}
                          </label>
                          <textarea
                            id={`note-input-${item.id}`}
                            className="checklist-note-textarea"
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            placeholder={t('checklists.notesPlaceholder', 'Add note...')}
                            maxLength={500}
                            rows={2}
                          />
                          {noteError && (
                            <p className="checklist-note-error" role="alert">
                              {noteError}
                            </p>
                          )}
                          <div className="checklist-note-actions">
                            <button
                              type="button"
                              className="btn btn-primary btn-xs"
                              onClick={() => handleSaveNote(item)}
                              disabled={isItemUpdating}
                            >
                              <Check size={12} aria-hidden="true" />
                              <span>{t('common.save', 'Save')}</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              onClick={handleCancelEditNote}
                              disabled={isItemUpdating}
                            >
                              <X size={12} aria-hidden="true" />
                              <span>{t('common.cancel', 'Cancel')}</span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Completion Metadata */}
                      {item.completedAt && (
                        <p className="checklist-completion-meta">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          <span>
                            Completed on {formatDateTime(item.completedAt)}
                            {item.completedByUserName ? ` by ${item.completedByUserName}` : ''}
                          </span>
                        </p>
                      )}
                    </td>

                    <td>
                      {item.category ? (
                        <span className="checklist-category-badge">
                          <Tag size={10} aria-hidden="true" />
                          {getCategoryLabel(item.category)}
                        </span>
                      ) : (
                        <span className="checklist-empty-cell">—</span>
                      )}
                    </td>

                    <td>{getStatusBadge(item.status)}</td>

                    {/* Due Dates (Section 9: Fixed Statutory & Complete by) */}
                    <td>
                      {item.statutoryDueDate ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-slate-800)', fontWeight: 600 }}>
                            {t('checklists.statutoryDueDate', 'Statutory')}: {formatDate(item.statutoryDueDate)}
                          </span>
                          {item.internalTargetDate && (
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-primary-700)' }}>
                              {t('checklists.completeBy', 'Complete by')}: {formatDate(item.internalTargetDate)}
                            </span>
                          )}
                          {deadlineEval?.displayStatus === 'OVERDUE' && (
                            <span className="badge badge-danger" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
                              {deadlineEval.label}
                            </span>
                          )}
                          {deadlineEval?.displayStatus === 'TARGET_PASSED' && (
                            <span className="badge badge-warning" style={{ fontSize: '0.6875rem', padding: '1px 6px' }}>
                              {t('checklists.internalTargetPassed', 'Internal target passed')}
                            </span>
                          )}
                        </div>
                      ) : item.dueDate ? (
                        <span className="checklist-due-date-cell">
                          <Clock size={13} aria-hidden="true" />
                          {formatDate(item.dueDate)}
                        </span>
                      ) : (
                        <span className="checklist-empty-cell">—</span>
                      )}
                    </td>

                    {/* Responsible Person */}
                    <td>
                      {item.assignedToUserName ? (
                        <span className="checklist-assignee-cell">
                          <User size={13} aria-hidden="true" />
                          <span>{item.assignedToUserName}</span>
                        </span>
                      ) : (
                        <span className="checklist-unassigned-cell">
                          {t('checklists.notAssigned', 'Accounting Team')}
                        </span>
                      )}
                    </td>

                    {/* Supporting Evidence */}
                    <td>
                      <div className="checklist-evidence-cell">
                        <span className="checklist-evidence-count">
                          <FileText size={13} aria-hidden="true" />
                          {item.attachedDocumentCount || 0}
                        </span>
                        {hasMissingEvidence && (
                          <span
                            className="badge badge-warning"
                            style={{ fontSize: '0.6875rem', padding: '1px 6px' }}
                            title={t('checklists.missingEvidenceWarning', 'Missing supporting documentation')}
                          >
                            {t('checklists.missingEvidence', 'Missing evidence')}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="checklist-actions-cell">
                        {isEffectiveReadOnly ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-xs"
                            onClick={() => setSelectedItemForModal(item)}
                            title={t('checklists.itemDetails', 'View Item Details')}
                          >
                            <ExternalLink size={12} aria-hidden="true" />
                            <span>{t('common.view', 'View')}</span>
                          </button>
                        ) : isItemUpdating ? (
                          <Loader2 size={16} className="spin-animation" aria-hidden="true" />
                        ) : (
                          <>
                            <select
                              className="checklist-status-select"
                              value={item.status}
                              onChange={(e) =>
                                handleStatusChange(item, e.target.value as ChecklistItemStatus)
                              }
                              aria-label={t('checklists.updateStatusFor', { title: item.title })}
                            >
                              <option value="NOT_STARTED">{t('checklists.statusNotStarted', 'Not started')}</option>
                              <option value="IN_PROGRESS">{t('checklists.statusInProgress', 'In progress')}</option>
                              <option value="COMPLETED">{t('checklists.statusDone', 'Done')}</option>
                              {isManager && (
                                <option value="REVIEWED">{t('checklists.statusReviewed', 'Reviewed')}</option>
                              )}
                              <option value="NOT_APPLICABLE">{t('checklists.statusNotApplicable', 'Not Applicable')}</option>
                            </select>

                            <button
                              type="button"
                              className="btn btn-outline btn-xs"
                              onClick={() => setSelectedItemForModal(item)}
                              title={t('checklists.itemDetails', 'Open Full Details')}
                              style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                            >
                              <ExternalLink size={11} aria-hidden="true" />
                              <span>{t('common.details', 'Details')}</span>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Item Detail & Evidence Modal */}
      {selectedItemForModal && (
        <ChecklistItemModal
          isOpen={!!selectedItemForModal}
          onClose={() => setSelectedItemForModal(null)}
          item={selectedItemForModal}
          checklistId={checklist.id}
          isLocked={isChecklistLocked}
          isAuditor={readOnlyReason === 'AUDITOR'}
          isManager={isManager}
          onSaveSuccess={() => {
            onRefresh?.()
          }}
        />
      )}
    </div>
  )
}
