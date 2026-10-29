import React, { useMemo } from 'react'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import './Pagination.css'

export interface PaginationProps {
  readonly currentPage: number
  readonly totalItems: number
  readonly pageSize: number
  readonly onPageChange: (page: number) => void
  readonly size?: 'sm' | 'md'
  readonly showSummary?: boolean
  readonly summaryLabel?: string
  readonly showFirstLast?: boolean
  readonly className?: string
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  size = 'sm',
  showSummary = true,
  summaryLabel,
  showFirstLast = false,
  className = '',
}) => {
  const { t } = useTranslation()

  const safePageSize = Math.max(1, pageSize)
  const safeTotalItems = Math.max(0, totalItems)
  const totalPages = Math.max(1, Math.ceil(safeTotalItems / safePageSize))
  const safeCurrentPage = Math.max(1, Math.min(totalPages, Math.floor(currentPage) || 1))

  const startItem = safeTotalItems === 0 ? 0 : (safeCurrentPage - 1) * safePageSize + 1
  const endItem = Math.min(safeTotalItems, safeCurrentPage * safePageSize)

  const isFirstPage = safeCurrentPage <= 1
  const isLastPage = safeCurrentPage >= totalPages

  const pageNumbers = useMemo<(number | 'ellipsis-left' | 'ellipsis-right')[]>(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (safeCurrentPage <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis-right', totalPages]
    }

    if (safeCurrentPage >= totalPages - 3) {
      return [1, 'ellipsis-left', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [
      1,
      'ellipsis-left',
      safeCurrentPage - 1,
      safeCurrentPage,
      safeCurrentPage + 1,
      'ellipsis-right',
      totalPages,
    ]
  }, [totalPages, safeCurrentPage])

  const handlePageClick = (page: number) => {
    if (page !== safeCurrentPage && page >= 1 && page <= totalPages) {
      onPageChange(page)
    }
  }

  // If there are no items or only 1 page and summary is disabled, do not render controls
  if (safeTotalItems === 0) {
    return null
  }

  return (
    <nav
      role="navigation"
      aria-label="Pagination Navigation"
      className={`pagination-container pagination-${size} ${className}`}
    >
      {showSummary && (
        <div className="pagination-summary" aria-live="polite">
          {summaryLabel ||
            t('common.showingRecords', {
              start: startItem,
              end: endItem,
              total: safeTotalItems,
            })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination-controls">
          {showFirstLast && (
            <button
              type="button"
              className="pagination-btn pagination-nav-btn"
              onClick={() => handlePageClick(1)}
              disabled={isFirstPage}
              aria-label={t('common.first')}
              title={t('common.first')}
            >
              <ChevronsLeft size={16} aria-hidden="true" />
            </button>
          )}

          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => handlePageClick(safeCurrentPage - 1)}
            disabled={isFirstPage}
            aria-label={t('common.previous')}
            title={t('common.previous')}
          >
            <ChevronLeft size={16} aria-hidden="true" />
          </button>

          <div className="pagination-pages-group">
            {pageNumbers.map((item, idx) => {
              if (item === 'ellipsis-left' || item === 'ellipsis-right') {
                return (
                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis" aria-hidden="true">
                    &hellip;
                  </span>
                )
              }

              const isCurrent = item === safeCurrentPage

              return (
                <button
                  key={`page-${item}`}
                  type="button"
                  className={`pagination-btn pagination-page-btn ${isCurrent ? 'is-current' : ''}`}
                  onClick={() => handlePageClick(item)}
                  aria-current={isCurrent ? 'page' : undefined}
                  aria-label={`${t('common.pageOf', { current: item, total: totalPages })}`}
                >
                  {item}
                </button>
              )
            })}
          </div>

          <button
            type="button"
            className="pagination-btn pagination-nav-btn"
            onClick={() => handlePageClick(safeCurrentPage + 1)}
            disabled={isLastPage}
            aria-label={t('common.next')}
            title={t('common.next')}
          >
            <ChevronRight size={16} aria-hidden="true" />
          </button>

          {showFirstLast && (
            <button
              type="button"
              className="pagination-btn pagination-nav-btn"
              onClick={() => handlePageClick(totalPages)}
              disabled={isLastPage}
              aria-label={t('common.last')}
              title={t('common.last')}
            >
              <ChevronsRight size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </nav>
  )
}
