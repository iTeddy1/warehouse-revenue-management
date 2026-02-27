import type { ImportsQueryParams } from '../types'

export const importKeys = {
  all: ['imports'] as const,

  lists: () => [...importKeys.all, 'list'] as const,
  list: (params: ImportsQueryParams) =>
    [...importKeys.lists(), params] as const,

  details: () => [...importKeys.all, 'detail'] as const,
  detail: (id: string) => [...importKeys.details(), id] as const,
}
