import { ProductsQueryParams } from '../types'

export const productKeys = {
  // Base keys
  all: ['products'] as const,

  // List queries
  lists: () => [...productKeys.all, 'list'] as const,
  list: (params: ProductsQueryParams) =>
    [...productKeys.lists(), params] as const,

  // Detail queries
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,

  // Low-stock alert list
  lowStock: () => [...productKeys.all, 'low-stock'] as const,
}
