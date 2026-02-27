import { apiClient } from '@/lib/api-client'
import { useQuery } from '@tanstack/react-query'
import type { SaleApiResponse, SalesQueryParams, SalesResponse } from '../types'
import { saleKeys } from './keys'

/**
 * GET /api/sales — paginated list of sale invoices
 */
export const getSales = async (
  params: SalesQueryParams = {},
): Promise<SalesResponse> => {
  const response = await apiClient.get('/sales', { params })
  return response.data
}

export const useSales = (params: SalesQueryParams = {}) =>
  useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => getSales(params),
    staleTime: 1000 * 60 * 2,
  })

/**
 * GET /api/sales/:id — full invoice with nested details
 */
export const getSale = async (id: string): Promise<SaleApiResponse> => {
  const response = await apiClient.get(`/sales/${id}`)
  return response.data
}

export const useSale = (id: string) =>
  useQuery({
    queryKey: saleKeys.detail(id),
    queryFn: () => getSale(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  })
