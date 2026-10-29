/**
 * Global Common Types.
 */

export type SortOrder = 'asc' | 'desc'

export interface PaginationParams {
  readonly page: number
  readonly limit: number
}

export interface DateRange {
  readonly startDate: string
  readonly endDate: string
}

export interface SelectOption<T = string> {
  readonly value: T
  readonly label: string
  readonly disabled?: boolean
}
