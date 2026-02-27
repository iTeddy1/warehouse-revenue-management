import {
  buildQueryParams,
  deserializeTableState,
  serializeTableState,
} from '@/lib/table-utils'
import type {
  FilterState,
  PaginationState,
  SearchState,
  SortingState,
  TableState,
  UseTableOptions,
} from '@/types/table'
import { useCallback, useEffect, useMemo, useState } from 'react'

const DEFAULT_PAGE_SIZE = 10

export const useTableState = (options: UseTableOptions = {}) => {
  const {
    initialPageSize = DEFAULT_PAGE_SIZE,
    enableSorting = true,
    enableFiltering = true,
    enableSearch = true,
    searchFields = [],
    syncWithUrl = true,
  } = options

  // Initialize state from URL if syncWithUrl is enabled
  const initialState = useMemo(() => {
    const baseState = {
      pagination: { page: 1, pageSize: initialPageSize },
      sorting: [] as SortingState[],
      filters: {} as FilterState,
      search: {
        query: '',
        fields: searchFields,
        inputValue: '',
      } as SearchState,
    }

    if (syncWithUrl && typeof window !== 'undefined') {
      const urlSearchParams = new URLSearchParams(window.location.search)
      const urlState = deserializeTableState(urlSearchParams)

      return {
        pagination: { ...baseState.pagination, ...urlState.pagination },
        sorting: urlState.sorting || baseState.sorting,
        filters: { ...baseState.filters, ...urlState.filters },
        search: { ...baseState.search, ...urlState.search },
      }
    }

    return baseState
  }, [initialPageSize, searchFields, syncWithUrl])

  const [tableState, setTableState] = useState<TableState>(initialState)

  // Listen for URL changes (browser back/forward navigation)
  useEffect(() => {
    if (!syncWithUrl || typeof window === 'undefined') return

    const handlePopState = () => {
      const urlSearchParams = new URLSearchParams(window.location.search)
      const urlState = deserializeTableState(urlSearchParams)

      if (urlState) {
        setTableState((prev) => ({
          pagination: { ...prev.pagination, ...urlState.pagination },
          sorting: urlState.sorting || prev.sorting,
          filters: { ...prev.filters, ...urlState.filters },
          search: { ...prev.search, ...urlState.search },
        }))
      }
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [syncWithUrl])

  // Sync state changes to URL
  const syncToUrl = useCallback(
    (newState: TableState) => {
      if (!syncWithUrl || typeof window === 'undefined') return

      const urlParams = serializeTableState(newState)
      const newSearch = urlParams.toString()

      // Only update URL if search params have actually changed
      const currentSearch = window.location.search.slice(1)
      if (newSearch !== currentSearch) {
        const newUrl = `${window.location.pathname}${newSearch ? `?${newSearch}` : ''}`
        window.history.replaceState({}, '', newUrl)
      }
    },
    [syncWithUrl],
  )

  // State update functions with URL sync
  const updateTableState = useCallback(
    (updates: Partial<TableState>) => {
      setTableState((prev) => {
        const newState = { ...prev, ...updates }
        syncToUrl(newState)
        return newState
      })
    },
    [syncToUrl],
  )

  const setPagination = useCallback(
    (pagination: Partial<PaginationState>) => {
      updateTableState({
        pagination: { ...tableState.pagination, ...pagination },
      })
    },
    [tableState.pagination, updateTableState],
  )

  const setSorting = useCallback(
    (sorting: SortingState[]) => {
      if (!enableSorting) return
      updateTableState({ sorting })
    },
    [enableSorting, updateTableState],
  )

  const setFilters = useCallback(
    (filters: FilterState) => {
      if (!enableFiltering) return
      updateTableState({
        filters,
        pagination: { ...tableState.pagination, page: 1 }, // Reset to first page
      })
    },
    [enableFiltering, tableState.pagination, updateTableState],
  )

  const setSearch = useCallback(
    (searchQuery: string) => {
      if (!enableSearch) return
      updateTableState({
        search: { ...tableState.search, query: searchQuery },
        pagination: { ...tableState.pagination, page: 1 }, // Reset to first page
      })
    },
    [enableSearch, tableState.search, tableState.pagination, updateTableState],
  )

  // Manual search - updates the input value without triggering API call
  const setSearchInput = useCallback((searchQuery: string) => {
    setTableState((prev) => ({
      ...prev,
      search: { ...prev.search, inputValue: searchQuery },
    }))
  }, [])

  // Apply search - triggers the actual search with API call
  const applySearch = useCallback(() => {
    const inputValue = tableState.search.inputValue || ''
    setSearch(inputValue)
  }, [tableState.search.inputValue, setSearch])

  const resetState = useCallback(() => {
    setTableState(initialState)
  }, [initialState])

  // Generate query parameters for API calls
  const queryParams = useMemo(() => {
    return buildQueryParams(tableState)
  }, [tableState])

  const tableActions = {
    setPagination,
    setSorting,
    setFilters,
    setSearchInput,
    applySearch,
  }

  return {
    // State
    tableState,
    queryParams,

    // Actions
    tableActions,
    setSearchImmediate: setSearch,
    updateTableState,
    resetState,

    // Options
    options: {
      enableSorting,
      enableFiltering,
      enableSearch,
    },
  }
}

export type UseTableStateReturn = ReturnType<typeof useTableState>
