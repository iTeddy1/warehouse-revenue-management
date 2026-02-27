import { FilterState, TableState } from '@/types/table'

// URL parameter serialization/deserialization utilities
export const serializeTableState = (
  state: Partial<TableState>,
): URLSearchParams => {
  const params = new URLSearchParams()

  if (state.pagination) {
    params.set('page', state.pagination.page.toString())
    params.set('pageSize', state.pagination.pageSize.toString())
  }

  if (state.sorting && state.sorting.length > 0) {
    const sortString = state.sorting
      .map((s) => `${s.field}:${s.order}`)
      .join(',')
    params.set('sort', sortString)
  }

  if (state.search && state.search.query) {
    params.set('search', state.search.query)
    if (state.search.fields.length > 0) {
      params.set('searchFields', state.search.fields.join(','))
    }
  }

  if (state.filters) {
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params.set(`filter_${key}`, String(value))
      }
    })
  }

  return params
}

export const deserializeTableState = (
  searchParams: URLSearchParams,
): Partial<TableState> => {
  const state: Partial<TableState> = {}

  // Parse pagination
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  if (page || pageSize) {
    state.pagination = {
      page: page ? parseInt(page, 10) : 1,
      pageSize: pageSize ? parseInt(pageSize, 10) : 10,
    }
  }

  // Parse sorting
  const sortParam = searchParams.get('sort')
  if (sortParam) {
    state.sorting = sortParam.split(',').map((sortStr) => {
      const [field, order] = sortStr.split(':')
      return { field, order: order as 'asc' | 'desc' }
    })
  }

  // Parse search
  const searchQuery = searchParams.get('search')
  const searchFields = searchParams.get('searchFields')
  if (searchQuery) {
    state.search = {
      query: searchQuery,
      inputValue: searchQuery,
      fields: searchFields ? searchFields.split(',') : [],
    }
  }

  // Parse filters
  const filters: FilterState = {}
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('filter_')) {
      const filterKey = key.replace('filter_', '')
      filters[filterKey] = value
    }
  }
  if (Object.keys(filters).length > 0) {
    state.filters = filters
  }

  return state
}

export const buildQueryParams = (state: Partial<TableState>) => {
  const params: Record<string, unknown> = {}

  if (state.pagination) {
    params.page = state.pagination.page
    params.pageSize = state.pagination.pageSize
  }

  if (state.sorting && state.sorting.length > 0) {
    params.sortBy = state.sorting[0].field
    params.sortOrder = state.sorting[0].order
  }

  if (state.search && state.search.query) {
    params.search = state.search.query
  }

  if (state.filters) {
    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        params[key] = value
      }
    })
  }

  return params
}

// Debounce utility for search inputs
export const debounce = <T extends (..._args: unknown[]) => void>(
  func: T,
  wait: number,
): ((...funcArgs: Parameters<T>) => void) => {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...funcArgs: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => func(...funcArgs), wait)
  }
}

// Deep merge utility for state updates
export const deepMerge = <T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>,
): T => {
  const result = { ...target }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key]
    const targetValue = target[key]

    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      ;(result as Record<string, unknown>)[key] = deepMerge(
        targetValue as Record<string, unknown>,
        sourceValue as Record<string, unknown>,
      )
    } else {
      ;(result as Record<string, unknown>)[key] = sourceValue
    }
  })

  return result
}
