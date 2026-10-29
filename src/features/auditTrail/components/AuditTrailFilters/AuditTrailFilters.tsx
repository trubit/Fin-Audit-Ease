import React from 'react'
import { Filter, X, Search, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { AuditTrailFilterParams } from '../../types'
import './AuditTrailFilters.css'

interface AuditTrailFiltersProps {
  readonly filters: AuditTrailFilterParams
  readonly onFilterChange: (updated: AuditTrailFilterParams) => void
  readonly onReset: () => void
}

export const AuditTrailFilters: React.FC<AuditTrailFiltersProps> = ({
  filters,
  onFilterChange,
  onReset,
}) => {
  const { t } = useTranslation()

  const hasActiveFilters = Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.action ||
      filters.search
  )

  const handleActionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      action: e.target.value ? e.target.value : undefined,
    })
  }

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      startDate: e.target.value ? e.target.value : undefined,
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      endDate: e.target.value ? e.target.value : undefined,
    })
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      search: e.target.value ? e.target.value : undefined,
    })
  }

  return (
    <div className="audit-filters-bar" role="search" aria-label={t('auditTrail.filtersLabel', 'Audit Filters')}>
      <div className="audit-filters-grid">
        {/* Search Input */}
        <div className="audit-filter-field audit-search-field">
          <label htmlFor="audit-search-input" className="audit-filter-label">
            <Search size={14} aria-hidden="true" />
            <span>{t('common.search', 'Search')}</span>
          </label>
          <input
            id="audit-search-input"
            type="search"
            className="input input-sm audit-filter-input"
            placeholder={t('auditTrail.searchPlaceholder', 'Filter by actor, action, or keyword...')}
            value={filters.search || ''}
            onChange={handleSearchChange}
          />
        </div>

        {/* Action Type Dropdown */}
        <div className="audit-filter-field">
          <label htmlFor="audit-action-select" className="audit-filter-label">
            <Filter size={14} aria-hidden="true" />
            <span>{t('auditTrail.actionType', 'Action Type')}</span>
          </label>
          <select
            id="audit-action-select"
            className="input input-sm audit-filter-input"
            value={filters.action || ''}
            onChange={handleActionChange}
          >
            <option value="">{t('auditTrail.allActions', 'All Event Actions')}</option>
            <option value="ENGAGEMENT_CREATED">{t('auditTrail.actionEngagementCreated', 'Engagement Created')}</option>
            <option value="REQUEST_CREATED">{t('auditTrail.actionRequestCreated', 'Request Created')}</option>
            <option value="DOCUMENT_UPLOADED">{t('auditTrail.actionDocumentUploaded', 'Document Uploaded')}</option>
            <option value="DOCUMENT_VIEWED">{t('auditTrail.actionDocumentViewed', 'Document Inspected')}</option>
            <option value="DOCUMENT_DOWNLOADED">{t('auditTrail.actionDocumentDownloaded', 'Document Downloaded')}</option>
            <option value="DOCUMENT_REVIEWED">{t('auditTrail.actionDocumentReviewed', 'Document Reviewed')}</option>
            <option value="REVIEW_APPROVED">{t('auditTrail.actionApproved', 'Audit Checklist and Supporting Documents Approved')}</option>
            <option value="REVIEW_REJECTED">{t('auditTrail.actionRejected', 'Audit Checklist and Supporting Documents Not Approved')}</option>
            <option value="REMINDER_SENT">{t('auditTrail.actionReminderSent', 'Deadline Reminder')}</option>
            <option value="USER_LOGIN">{t('auditTrail.actionUserLogin', 'Authorized Session Login')}</option>
            <option value="USER_LOGOUT">{t('auditTrail.actionUserLogout', 'Session Logout')}</option>
            <option value="ENGAGEMENT_COMPLETED">{t('auditTrail.actionEngagementCompleted', 'Engagement Completed')}</option>
          </select>
        </div>

        {/* Date Range: Start Date */}
        <div className="audit-filter-field">
          <label htmlFor="audit-start-date" className="audit-filter-label">
            <Calendar size={14} aria-hidden="true" />
            <span>{t('auditTrail.startDate', 'From Date')}</span>
          </label>
          <input
            id="audit-start-date"
            type="date"
            className="input input-sm audit-filter-input"
            value={filters.startDate || ''}
            max={filters.endDate}
            onChange={handleStartDateChange}
          />
        </div>

        {/* Date Range: End Date */}
        <div className="audit-filter-field">
          <label htmlFor="audit-end-date" className="audit-filter-label">
            <Calendar size={14} aria-hidden="true" />
            <span>{t('auditTrail.endDate', 'To Date')}</span>
          </label>
          <input
            id="audit-end-date"
            type="date"
            className="input input-sm audit-filter-input"
            value={filters.endDate || ''}
            min={filters.startDate}
            onChange={handleEndDateChange}
          />
        </div>

        {/* Clear Filters Button */}
        {hasActiveFilters && (
          <div className="audit-filter-action">
            <button
              type="button"
              className="btn btn-outline btn-sm audit-clear-btn"
              onClick={onReset}
              aria-label={t('auditTrail.clearFilters', 'Clear all active filters')}
            >
              <X size={14} aria-hidden="true" />
              <span>{t('auditTrail.clearFilters', 'Clear Filters')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
