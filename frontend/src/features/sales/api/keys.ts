import type { SalesQueryParams } from '../types'

export const saleKeys = {
  all: ['sales'] as const,

  lists: () => [...saleKeys.all, 'list'] as const,
  list: (params: SalesQueryParams) => [...saleKeys.lists(), params] as const,

  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
}
