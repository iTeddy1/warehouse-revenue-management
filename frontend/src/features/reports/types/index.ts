// ─── Shared ───────────────────────────────────────────────────────────────────

export type GroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year'

// ─── Request Params ───────────────────────────────────────────────────────────

export interface SalesReportParams {
  startDate: string // ISO date string e.g. "2026-02-01"
  endDate: string
  groupBy: GroupBy
}

// ─── Response Types ───────────────────────────────────────────────────────────

/**
 * Real-time dashboard overview (FR-24, FR-25, FR-26)
 */
export interface DashboardResponse {
  revenueToday: number
  profitToday: number
  salesCountToday: number
  totalStockQuantity: number
}

/**
 * One aggregated row in the sales report
 */
export interface SalesReportRow {
  /** ISO string of the bucket start (e.g. "2026-02-01T00:00:00.000Z") */
  period: string
  totalRevenue: number
  totalProfit: number
  totalItemsSold: number
}

/**
 * Full response for GET /reports/sales (FR-17 → FR-23)
 */
export interface SalesReportResponse {
  groupBy: GroupBy
  startDate: string
  endDate: string
  summary: {
    totalRevenue: number
    totalProfit: number
    totalItemsSold: number
  }
  rows: SalesReportRow[]
}
