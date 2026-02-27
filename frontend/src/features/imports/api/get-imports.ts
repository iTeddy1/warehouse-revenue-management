import { apiClient } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import type {
  ImportResponse,
  ImportsQueryParams,
  ImportsResponse,
} from '../types'
import { importKeys } from './keys'

/**
 * GET /api/imports
 * Paginated list of import records, optionally filtered by productId.
 */
export const getImports = async (
  params: ImportsQueryParams = {},
): Promise<ImportsResponse> => {
  const response = await apiClient.get('/imports', { params })
  return response.data
}

export const useImports = (params: ImportsQueryParams = {}) => {
  return useQuery({
    queryKey: importKeys.list(params),
    queryFn: () => getImports(params),
    staleTime: 1000 * 60 * 2, // 2 minutes
  })
}

/**
 * GET /api/imports/:id
 */
export const getImport = async (id: string): Promise<ImportResponse> => {
  return apiClient.get(`/imports/${id}`)
}

export const useImport = (id: string) => {
  return useQuery({
    queryKey: importKeys.detail(id),
    queryFn: () => getImport(id),
    enabled: !!id,
  })
}
