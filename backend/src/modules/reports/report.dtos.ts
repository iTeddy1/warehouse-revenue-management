/**
 * Report DTOs - TypeScript interfaces and types for the Report module
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

/**
 * Time-period grouping options for the sales report (FR-17 → FR-21)
 */
export type GroupBy = 'day' | 'week' | 'month' | 'quarter' | 'year';

export const GROUP_BY_VALUES: GroupBy[] = ['day', 'week', 'month', 'quarter', 'year'];

// ─── Request DTOs ─────────────────────────────────────────────────────────────

/**
 * Query params for the aggregated sales report (FR-17 → FR-23)
 */
export interface SalesReportQueryDto {
  startDate: Date;
  endDate: Date;
  groupBy: GroupBy;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

/**
 * One aggregated row in the sales report.
 * `period` is the truncated date label for the bucket (day/week/month/…).
 */
export interface SalesReportRow {
  /** Truncated period label (ISO string of the bucket start) */
  period: string;
  /** Total revenue for this period = Σ (sellPrice × qty) */
  totalRevenue: number;
  /** Total profit for this period = Σ (sellPrice - costPrice) × qty */
  totalProfit: number;
  /** Total units sold across all products in this period */
  totalItemsSold: number;
}

/**
 * Full response for GET /reports/sales (FR-17 → FR-23)
 */
export interface SalesReportResponse {
  groupBy: GroupBy;
  startDate: string;
  endDate: string;
  /** Summary totals across the entire requested range (FR-22) */
  summary: {
    totalRevenue: number;
    totalProfit: number;
    totalItemsSold: number;
  };
  rows: SalesReportRow[];
}

/**
 * Real-time dashboard overview (FR-24, FR-25, FR-26)
 */
export interface DashboardResponse {
  /** Total revenue from sales placed today */
  revenueToday: number;
  /** Total profit from sales placed today */
  profitToday: number;
  /** Number of sale invoices created today */
  salesCountToday: number;
  /** Sum of stockQty across all products (current inventory level) */
  totalStockQuantity: number;
}
