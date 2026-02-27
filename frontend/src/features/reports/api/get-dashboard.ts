import { apiClient } from '@/lib/api-client'
import type { ApiResponse } from '@/types/api'
import { useQuery } from '@tanstack/react-query'
import type { DashboardResponse } from '../types'
import { reportKeys } from './keys'

/**
 * GET /api/reports/dashboard
 * Returns real-time stats: revenueToday, profitToday, salesCountToday,
 * totalStockQuantity (FR-24, FR-25, FR-26)
 */
export const getDashboard = async (): Promise<
  ApiResponse<DashboardResponse>
> => {
  const response = await apiClient.get('/reports/dashboard')
  return response.data
}

export const useDashboard = () =>
  useQuery({
    queryKey: reportKeys.dashboard(),
    queryFn: getDashboard,
    // Dashboard data changes frequently — keep fresh for 60 s
    staleTime: 1000 * 60,
    // Refetch automatically every 2 min while the tab is open
    refetchInterval: 1000 * 60 * 2,
  })
