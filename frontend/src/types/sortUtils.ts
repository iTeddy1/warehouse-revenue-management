import { SortDirection } from './sortTypes'

// Utility to convert table sorting state to API query parameters
export interface TableSortingState {
  field: string
  order: 'asc' | 'desc'
}

// Convert from frontend table sorting to backend API parameters
export function mapSortingToQuery(sorting: TableSortingState[]): {
  sortBy?: string
  sortDirection?: SortDirection
} {
  if (sorting.length === 0) {
    return {}
  }

  const sort = sorting[0]
  return {
    sortBy: sort.field,
    sortDirection: sort.order,
  }
}

// Convert backend API parameters to frontend table sorting
export function mapQueryToSorting(
  sortBy?: string,
  sortDirection?: SortDirection,
): TableSortingState[] {
  if (!sortBy || !sortDirection) {
    return []
  }

  return [
    {
      field: sortBy,
      order: sortDirection,
    },
  ]
}

// Helper to build query parameters with proper sorting
export function buildQueryParams<
  T extends Record<string, any>,
  S extends string = string,
>(
  params: T,
  sorting: TableSortingState[],
): T & { sortBy?: S; sortDirection?: SortDirection } {
  const sortingParams = mapSortingToQuery(sorting)
  return {
    ...params,
    ...(sortingParams.sortBy && {
      sortBy: sortingParams.sortBy as S,
      sortDirection: sortingParams.sortDirection,
    }),
  }
}
