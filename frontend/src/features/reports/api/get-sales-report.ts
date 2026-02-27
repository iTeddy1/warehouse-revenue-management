import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import { useQuery } from '@tanstack/react-query'
import type { SalesReportParams, SalesReportResponse } from '../types'
import { reportKeys } from './keys'

/**
 * GET /api/reports/sales
 * Returns aggregated rows + summary totals for the given date range
 * and groupBy bucket (FR-17 → FR-23)
 */
export const getSalesReport = async (
  params: SalesReportParams,
): Promise<ApiResponse<SalesReportResponse>> => {
  const response = await apiClient.get('/reports/sales', {
    params: {
      startDate: params.startDate,
      endDate: params.endDate,
      groupBy: params.groupBy,
    },
  })
  return response.data
}

/**
 * `bundle-conditional`: the query is only enabled when all three required
 * filter values are present so we never fire a request with an empty payload.
 */
export const useSalesReport = (params: Partial<SalesReportParams>) => {
  const enabled = !!(params.startDate && params.endDate && params.groupBy)

  return useQuery({
    queryKey: reportKeys.salesReport(params as SalesReportParams),
    queryFn: () => getSalesReport(params as SalesReportParams),
    enabled,
    // Report data is not real-time — cache for 5 min
    staleTime: 1000 * 60 * 5,
  })
}
