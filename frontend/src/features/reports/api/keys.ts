import type { SalesReportParams } from '../types'

export const reportKeys = {
  all: ['reports'] as const,

  dashboard: () => [...reportKeys.all, 'dashboard'] as const,

  salesReports: () => [...reportKeys.all, 'sales'] as const,
  salesReport: (params: SalesReportParams) =>
    [...reportKeys.salesReports(), params] as const,
}
