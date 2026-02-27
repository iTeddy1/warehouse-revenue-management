// Core types for pagination and filtering system
import { ReactNode } from 'react'

export interface PaginationState {
  page: number
  pageSize: number
}

export interface SortingState {
  field: string
  order: 'asc' | 'desc'
}

export interface FilterState {
  [key: string]: unknown
}

export interface SearchState {
  query: string
  fields: string[]
  inputValue?: string // For storing the input value before applying search
}

export interface TableState {
  pagination: PaginationState
  sorting: SortingState[]
  filters: FilterState
  search: SearchState
}

// Filter field configuration
export interface FilterField {
  key: string
  label: string
  type: 'text' | 'select' | 'date' | 'dateRange' | 'number' | 'boolean'
  options?: Array<{ label: string; value: string | number }>
  placeholder?: string
}

// Column configuration for dynamic tables
export interface TableColumn<T = unknown> {
  id: string
  header: string
  accessorKey?: keyof T
  cell?: (props: { row: { original: T } }) => ReactNode
  sortable?: boolean
  filterable?: boolean
  width?: number | string
}

// Hook options
export interface UseTableOptions {
  initialPageSize?: number
  enableSorting?: boolean
  enableFiltering?: boolean
  enableSearch?: boolean
  searchFields?: string[]
  filterFields?: FilterField[]
  syncWithUrl?: boolean
}
