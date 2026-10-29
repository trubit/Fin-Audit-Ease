import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Upload,
  Download,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  LogIn,
  LogOut,
  Bell,
  History,
  Shield,
  FileCheck2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Hash,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatDateTime, formatDate } from '@/utils/dateUtils'
import type { AuditTrailRecord, AuditActionType } from '../../types'
import './AuditTrailTimeline.css'

interface AuditTrailTimelineProps {
  readonly records: readonly AuditTrailRecord[]
}

export const AuditTrailTimeline: React.FC<AuditTrailTimelineProps> = ({ records }) => {
  const { t } = useTranslation()
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedRecordId((prev) => (prev === id ? null : id))
  }

  const getActionIcon = (action: AuditActionType) => {
    switch (action) {
      case 'ENGAGEMENT_CREATED':
      case 'ENGAGEMENT_COMPLETED':
      case 'ENGAGEMENT_LOCKED':
        return <Shield className="audit-icon-engagement" size={16} aria-hidden="true" />
      case 'REQUEST_CREATED':
      case 'REQUEST_ASSIGNED':
      case 'REQUEST_STATUS_CHANGED':
        return <FileText className="audit-icon-request" size={16} aria-hidden="true" />
      case 'DOCUMENT_UPLOADED':
      case 'DOCUMENT_RESUBMITTED':
        return <Upload className="audit-icon-upload" size={16} aria-hidden="true" />
      case 'DOCUMENT_VIEWED':
        return <Eye className="audit-icon-view" size={16} aria-hidden="true" />
      case 'DOCUMENT_DOWNLOADED':
        return <Download className="audit-icon-download" size={16} aria-hidden="true" />
      case 'DOCUMENT_REVIEWED':
        return <FileCheck2 className="audit-icon-review" size={16} aria-hidden="true" />
      case 'REVIEW_APPROVED':
      case 'DOCUMENT_APPROVED':
        return <CheckCircle2 className="audit-icon-approved" size={16} aria-hidden="true" />
      case 'REVIEW_REJECTED':
      case 'DOCUMENT_REJECTED':
        return <XCircle className="audit-icon-rejected" size={16} aria-hidden="true" />
      case 'REMINDER_SENT':
      case 'NOTIFICATION_READ':
        return <Bell className="audit-icon-reminder" size={16} aria-hidden="true" />
      case 'USER_LOGIN':
        return <LogIn className="audit-icon-auth" size={16} aria-hidden="true" />
      case 'USER_LOGOUT':
        return <LogOut className="audit-icon-auth" size={16} aria-hidden="true" />
      default:
        return <History className="audit-icon-default" size={16} aria-hidden="true" />
    }
  }

  const getActionLabel = (action: AuditActionType) => {
    switch (action) {
      case 'ENGAGEMENT_CREATED':
        return t('auditTrail.actionEngagementCreated', 'Engagement Created')
      case 'ENGAGEMENT_COMPLETED':
        return t('auditTrail.actionEngagementCompleted', 'Engagement Completed')
      case 'ENGAGEMENT_LOCKED':
        return t('auditTrail.actionEngagementLocked', 'Engagement Locked')
      case 'REQUEST_CREATED':
        return t('auditTrail.actionRequestCreated', 'Audit Request Created')
      case 'REQUEST_ASSIGNED':
        return t('auditTrail.actionRequestAssigned', 'Audit Request Assigned')
      case 'REQUEST_STATUS_CHANGED':
        return t('auditTrail.actionRequestStatusChanged', 'Request Status Updated')
      case 'DOCUMENT_UPLOADED':
        return t('auditTrail.actionDocumentUploaded', 'Document Uploaded')
      case 'DOCUMENT_VIEWED':
        return t('auditTrail.actionDocumentViewed', 'Document Inspected')
      case 'DOCUMENT_DOWNLOADED':
        return t('auditTrail.actionDocumentDownloaded', 'Document Downloaded')
      case 'DOCUMENT_REVIEWED':
        return t('auditTrail.actionDocumentReviewed', 'Document Reviewed')
      case 'REVIEW_APPROVED':
      case 'DOCUMENT_APPROVED':
        return t('auditTrail.actionApproved', 'Audit Checklist and Supporting Documents Approved')
      case 'REVIEW_REJECTED':
      case 'DOCUMENT_REJECTED':
        return t('auditTrail.actionRejected', 'Audit Checklist and Supporting Documents Not Approved')
      case 'DOCUMENT_RESUBMITTED':
        return t('auditTrail.actionResubmitted', 'Evidence Resubmitted')
      case 'CHECKLIST_ITEM_COMPLETED':
        return t('auditTrail.actionChecklistCompleted', 'Checklist Item Satisfied')
      case 'REMINDER_SENT':
        return t('auditTrail.actionReminderSent', 'Deadline Reminder Dispatched')
      case 'NOTIFICATION_READ':
        return t('auditTrail.actionNotificationRead', 'Notification Acknowledged')
      case 'USER_LOGIN':
        return t('auditTrail.actionUserLogin', 'Authorized Session Started')
      case 'USER_LOGOUT':
        return t('auditTrail.actionUserLogout', 'Session Terminated')
      case 'AUDIT_TRAIL_EXPORTED':
        return t('auditTrail.actionExported', 'Audit Trail Exported')
      default:
        return String(action).replace(/_/g, ' ')
    }
  }

  const formatActorRole = (role?: string) => {
    if (!role) return ''
    const upper = role.toUpperCase()
    if (upper.includes('ACCOUNTING') || upper.includes('FINANCE')) {
      return t('roles.accountingMember', 'Accounting Team Member')
    }
    if (upper.includes('AUDIT_MANAGER')) {
      return t('roles.auditManager', 'Audit Engagement Manager')
    }
    if (upper.includes('AUDITOR')) {
      return t('roles.auditor', 'Chartered Auditor')
    }
    if (upper.includes('ADMIN')) {
      return t('roles.admin', 'System Administrator')
    }
    return role
  }

  // Group records by Date (YYYY-MM-DD)
  const groupedRecords = records.reduce<Record<string, AuditTrailRecord[]>>((acc, record) => {
    const dateKey = record.timestamp ? record.timestamp.split('T')[0] : 'undated'
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(record)
    return acc
  }, {})

  const dateKeys = Object.keys(groupedRecords).sort((a, b) => (b > a ? 1 : -1))

  return (
    <div className="audit-timeline-container" role="feed" aria-label={t('auditTrail.timelineLabel', 'Audit Timeline')}>
      {dateKeys.map((dateKey) => (
        <section key={dateKey} className="audit-timeline-date-group" aria-label={formatDate(dateKey)}>
          <div className="audit-timeline-date-header">
            <span className="audit-date-pill">{formatDate(dateKey)}</span>
          </div>

          <div className="audit-timeline-items-list">
            {groupedRecords[dateKey].map((record) => {
              const isExpanded = expandedRecordId === record.id
              const hasContextLinks = Boolean(
                record.auditRequestId ||
                  record.documentId ||
                  record.reviewId ||
                  (record.resourceType === 'AUDIT_REQUEST' && record.resourceId) ||
                  (record.resourceType === 'REVIEW' && record.resourceId)
              )

              return (
                <article
                  key={record.id}
                  className={`audit-timeline-item ${isExpanded ? 'audit-timeline-item--expanded' : ''}`}
                >
                  <div className="audit-timeline-marker">
                    <div className="audit-timeline-icon-box">{getActionIcon(record.action)}</div>
                    <div className="audit-timeline-connector" aria-hidden="true" />
                  </div>

                  <div className="audit-timeline-card">
                    <div className="audit-timeline-main-row">
                      <div className="audit-event-info">
                        <div className="audit-event-title-row">
                          <h4 className="audit-event-title">{getActionLabel(record.action)}</h4>
                          <span className="audit-event-time">
                            <Clock size={12} aria-hidden="true" />
                            <time dateTime={record.timestamp}>{formatDateTime(record.timestamp)}</time>
                          </span>
                        </div>

                        {record.description && (
                          <p className="audit-event-desc">{record.description}</p>
                        )}

                        <div className="audit-event-actor-row">
                          <span className="audit-actor-name">{record.actorName}</span>
                          {record.actorRole && (
                            <span className="audit-actor-role">
                              • {formatActorRole(record.actorRole)}
                            </span>
                          )}
                          {record.actorEmail && (
                            <span className="audit-actor-email">({record.actorEmail})</span>
                          )}
                        </div>
                      </div>

                      <div className="audit-event-actions">
                        {(record.hash || record.metadata || record.ipAddress) && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm audit-expand-btn"
                            onClick={() => toggleExpand(record.id)}
                            aria-expanded={isExpanded}
                            aria-label={
                              isExpanded
                                ? t('auditTrail.hideDetails', 'Hide provenance metadata')
                                : t('auditTrail.showDetails', 'Inspect provenance metadata')
                            }
                          >
                            <span>{isExpanded ? t('common.close', 'Less') : t('auditTrail.details', 'Details')}</span>
                            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Context Links to Request / Document / Review */}
                    {hasContextLinks && (
                      <div className="audit-event-context-links">
                        {(record.auditRequestId || (record.resourceType === 'AUDIT_REQUEST' && record.resourceId)) && (
                          <Link
                            to={`/audit-requests/${encodeURIComponent(
                              record.auditRequestId || record.resourceId || ''
                            )}`}
                            className="audit-context-link"
                          >
                            <FileText size={13} aria-hidden="true" />
                            <span>{t('auditTrail.viewRequest', 'View Audit Request')}</span>
                            <ExternalLink size={11} aria-hidden="true" />
                          </Link>
                        )}

                        {(record.reviewId || (record.resourceType === 'REVIEW' && record.resourceId)) && (
                          <Link
                            to={`/review/${encodeURIComponent(
                              record.reviewId || record.resourceId || ''
                            )}`}
                            className="audit-context-link"
                          >
                            <FileCheck2 size={13} aria-hidden="true" />
                            <span>{t('auditTrail.viewReview', 'View Review Determination')}</span>
                            <ExternalLink size={11} aria-hidden="true" />
                          </Link>
                        )}

                        {(record.documentId || record.resourceType === 'DOCUMENT') && (
                          <Link to="/documents" className="audit-context-link">
                            <Upload size={13} aria-hidden="true" />
                            <span>{t('auditTrail.viewDocuments', 'Open Document Vault')}</span>
                            <ExternalLink size={11} aria-hidden="true" />
                          </Link>
                        )}
                      </div>
                    )}

                    {/* Provenance & Cryptographic Integrity Drawer */}
                    {isExpanded && (
                      <div className="audit-provenance-drawer">
                        <div className="audit-provenance-grid">
                          <div>
                            <span className="audit-meta-label">
                              {t('auditTrail.recordId', 'Audit Record ID')}:
                            </span>
                            <code className="audit-meta-val">{record.id}</code>
                          </div>

                          {record.ipAddress && (
                            <div>
                              <span className="audit-meta-label">
                                {t('auditTrail.ipAddress', 'Origin IP Address')}:
                              </span>
                              <span className="audit-meta-val">{record.ipAddress}</span>
                            </div>
                          )}

                          {record.hash && (
                            <div className="audit-hash-block">
                              <span className="audit-meta-label">
                                <Hash size={12} aria-hidden="true" />
                                {t('auditTrail.cryptographicHash', 'Tamper-Evident Hash')}:
                              </span>
                              <code className="audit-hash-code">{record.hash}</code>
                            </div>
                          )}

                          {record.previousHash && (
                            <div className="audit-hash-block">
                              <span className="audit-meta-label">
                                <Hash size={12} aria-hidden="true" />
                                {t('auditTrail.previousHash', 'Previous Block Hash')}:
                              </span>
                              <code className="audit-hash-code">{record.previousHash}</code>
                            </div>
                          )}

                          {record.userAgent && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span className="audit-meta-label">
                                {t('auditTrail.userAgent', 'Client User Agent')}:
                              </span>
                              <span className="audit-meta-val audit-ua-val">{record.userAgent}</span>
                            </div>
                          )}

                          {record.metadata && Object.keys(record.metadata).length > 0 && (
                            <div style={{ gridColumn: '1 / -1' }}>
                              <span className="audit-meta-label">
                                {t('auditTrail.metadata', 'Structured Metadata')}:
                              </span>
                              <pre className="audit-json-val">
                                {JSON.stringify(record.metadata, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  )
}
