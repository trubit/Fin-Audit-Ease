import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  X,
  ArrowRight,
  Layers,
  CalendarCheck,
  FileCheck,
  FileText,
  Loader2,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useToast } from '@/components/feedback/Toast'
import './ForwardFlowModal.css'

export type ForwardSourceStage = 'WEEKLY' | 'MONTH_END' | 'PRE_AUDIT' | 'DOCUMENT'
export type ForwardTargetStage = 'MONTH_END' | 'PRE_AUDIT' | 'AUDIT_REQUEST'

export interface ForwardFlowModalProps {
  readonly isOpen: boolean
  readonly onClose: () => void
  readonly itemTitle: string
  readonly itemCategory?: string
  readonly sourceStage: ForwardSourceStage
  readonly documentId?: string
  readonly documentName?: string
  readonly onForwardSuccess?: (targetStage: ForwardTargetStage, notes?: string) => void
}

export const ForwardFlowModal: React.FC<ForwardFlowModalProps> = ({
  isOpen,
  onClose,
  itemTitle,
  itemCategory,
  sourceStage,
  documentId: _documentId,
  documentName,
  onForwardSuccess,
}) => {
  const { t } = useTranslation()
  const { showToast } = useToast()
  const navigate = useNavigate()

  // Default target stage depends on source
  const defaultTarget: ForwardTargetStage =
    sourceStage === 'WEEKLY'
      ? 'MONTH_END'
      : sourceStage === 'MONTH_END'
      ? 'PRE_AUDIT'
      : 'AUDIT_REQUEST'

  const [targetStage, setTargetStage] = useState<ForwardTargetStage>(defaultTarget)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2026-10')
  const [targetCategory, setTargetCategory] = useState<string>(itemCategory || 'Property, Plant & Equipment')
  const [forwardNotes, setForwardNotes] = useState<string>('')
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)

  if (!isOpen) return null

  const getSourceStageName = (s: ForwardSourceStage): string => {
    switch (s) {
      case 'WEEKLY':
        return t('pipeline.weeklyTitle', 'Weekly Checkpoint')
      case 'MONTH_END':
        return t('pipeline.monthEndTitle', 'Month-End Close')
      case 'PRE_AUDIT':
        return t('pipeline.preAuditTitle', 'Pre-Audit Preparation')
      case 'DOCUMENT':
        return t('documents.title', 'Document Vault')
    }
  }

  const getTargetStageName = (tStage: ForwardTargetStage): string => {
    switch (tStage) {
      case 'MONTH_END':
        return t('pipeline.monthEndTitle', 'Month-End Close')
      case 'PRE_AUDIT':
        return t('pipeline.preAuditTitle', 'Pre-Audit Preparation')
      case 'AUDIT_REQUEST':
        return t('pipeline.auditRequestTitle', 'Audit Request')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Simulate frontend processing & session recording
      await new Promise((resolve) => setTimeout(resolve, 600))

      const targetName = getTargetStageName(targetStage)

      showToast({
        type: 'success',
        title: t('pipeline.forwardSuccessTitle', 'Successfully Forwarded'),
        message: t('pipeline.forwardSuccessMsg', '{{title}} was forwarded to {{target}}.', {
          title: itemTitle || documentName || 'Item',
          target: targetName,
        }),
      })

      if (onForwardSuccess) {
        onForwardSuccess(targetStage, forwardNotes)
      }

      onClose()

      // Optional smart navigation based on user action
      if (targetStage === 'AUDIT_REQUEST') {
        navigate(
          `/audit-requests/create?fromPreAudit=true&title=${encodeURIComponent(
            itemTitle
          )}&category=${encodeURIComponent(targetCategory)}`
        )
      } else if (targetStage === 'MONTH_END') {
        navigate('/month-end')
      } else if (targetStage === 'PRE_AUDIT') {
        navigate('/pre-audit')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="forward-modal-backdrop" role="dialog" aria-modal="true">
      <div className="forward-modal-content">
        {/* Header */}
        <div className="forward-modal-header">
          <div className="forward-modal-header-text">
            <h3 className="forward-modal-title">
              {t('pipeline.forwardModalTitle', 'Forward to Next Preparation Stage')}
            </h3>
            <p className="forward-modal-subtitle">
              {t('pipeline.forwardModalSubtitle', 'Progress this schedule along the continuous preparation pipeline.')}
            </p>
          </div>
          <button
            type="button"
            className="forward-modal-close"
            onClick={onClose}
            aria-label={t('common.close', 'Close')}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="forward-modal-body">
          {/* Pipeline Visual Breadcrumb */}
          <div className="forward-pipeline-indicator">
            <div className="forward-indicator-pill source">
              <span>{getSourceStageName(sourceStage)}</span>
            </div>
            <ArrowRight size={16} className="forward-arrow-icon" />
            <div className="forward-indicator-pill target">
              <span>{getTargetStageName(targetStage)}</span>
            </div>
          </div>

          {/* Item Details Box */}
          <div className="forward-item-card">
            <div className="forward-item-icon">
              <FileText size={18} />
            </div>
            <div className="forward-item-info">
              <h4 className="forward-item-name">{itemTitle || documentName}</h4>
              <div className="forward-item-meta">
                {itemCategory && <span className="forward-meta-tag">{itemCategory}</span>}
                {documentName && (
                  <span className="forward-meta-tag doc">Attachment: {documentName}</span>
                )}
              </div>
            </div>
          </div>

          {/* Select Target Stage (if Document or flexible) */}
          {sourceStage === 'DOCUMENT' && (
            <div className="forward-form-group">
              <label className="forward-form-label">
                {t('pipeline.targetStageLabel', 'Select Destination Stage')}
              </label>
              <div className="forward-stage-picker">
                <button
                  type="button"
                  className={`forward-stage-opt ${targetStage === 'MONTH_END' ? 'is-selected' : ''}`}
                  onClick={() => setTargetStage('MONTH_END')}
                >
                  <Layers size={16} />
                  <span>{t('checklists.monthEndTitle', 'Month-End Close')}</span>
                </button>
                <button
                  type="button"
                  className={`forward-stage-opt ${targetStage === 'PRE_AUDIT' ? 'is-selected' : ''}`}
                  onClick={() => setTargetStage('PRE_AUDIT')}
                >
                  <CalendarCheck size={16} />
                  <span>{t('checklists.preAuditTitle', 'Pre-Audit Preparation')}</span>
                </button>
                <button
                  type="button"
                  className={`forward-stage-opt ${targetStage === 'AUDIT_REQUEST' ? 'is-selected' : ''}`}
                  onClick={() => setTargetStage('AUDIT_REQUEST')}
                >
                  <FileCheck size={16} />
                  <span>{t('auditRequests.title', 'Audit Request')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Contextual Options depending on Target Stage */}
          {targetStage === 'MONTH_END' && (
            <div className="forward-form-group">
              <label htmlFor="forward-month-select" className="forward-form-label">
                {t('pipeline.targetMonthLabel', 'Target Month-End Period')}
              </label>
              <select
                id="forward-month-select"
                className="forward-form-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="2026-10">October 2026 (Current Close)</option>
                <option value="2026-11">November 2026</option>
                <option value="2026-12">December 2026 (Year-End)</option>
              </select>
            </div>
          )}

          {(targetStage === 'PRE_AUDIT' || targetStage === 'AUDIT_REQUEST') && (
            <div className="forward-form-group">
              <label htmlFor="forward-category-select" className="forward-form-label">
                {t('pipeline.leadScheduleCategoryLabel', 'Lead Schedule / Request Category')}
              </label>
              <select
                id="forward-category-select"
                className="forward-form-select"
                value={targetCategory}
                onChange={(e) => setTargetCategory(e.target.value)}
              >
                <option value="Property, Plant & Equipment">Property, Plant & Equipment (Fixed Assets)</option>
                <option value="Bank Documents">Bank Documents & Confirmations</option>
                <option value="Tax Documents">Tax Documents (WHT, VAT, CIT)</option>
                <option value="Payroll">Payroll & Statutory Remittances</option>
                <option value="Accounts Receivable">Accounts Receivable & Impairment</option>
                <option value="Inventory">Inventory & Valuation</option>
                <option value="Management Accounts">Management Accounts & General Ledger</option>
              </select>
            </div>
          )}

          {/* Forwarding Transmittal Note */}
          <div className="forward-form-group">
            <label htmlFor="forward-notes-input" className="forward-form-label">
              {t('pipeline.transmittalNoteLabel', 'Accounting Transmittal Note (Optional)')}
            </label>
            <textarea
              id="forward-notes-input"
              className="forward-form-textarea"
              rows={3}
              value={forwardNotes}
              onChange={(e) => setForwardNotes(e.target.value)}
              placeholder={t(
                'pipeline.transmittalNotePlaceholder',
                'e.g. Schedule verified per weekly check. Forwarded for month-end close review.'
              )}
            />
          </div>

          {/* Actions */}
          <div className="forward-modal-footer">
            <button
              type="button"
              className="btn btn-outline btn-md"
              onClick={onClose}
              disabled={isSubmitting}
            >
              <span>{t('common.cancel', 'Cancel')}</span>
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-md"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spin-animation" />
                  <span>{t('common.processing', 'Forwarding...')}</span>
                </>
              ) : (
                <>
                  <span>
                    {targetStage === 'AUDIT_REQUEST'
                      ? t('pipeline.forwardToRequestBtn', 'Forward to Audit Request')
                      : targetStage === 'PRE_AUDIT'
                      ? t('pipeline.forwardToPreAuditBtn', 'Forward to Pre-Audit')
                      : t('pipeline.forwardToMonthEndBtn', 'Forward to Month-End')}
                  </span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
